'use client'

import { useCallback, useState } from 'react'
import { wsApi } from '@/src/api/client'
import type { components } from '@/src/api/types.gen'
import type { LangCode } from '@/hooks/use-quran-preferences'

// ─── Public types ─────────────────────────────────────────────────────────────

export type QuranSearchResponse = components['schemas']['QuranResponse']
export type ChapterResult = components['schemas']['ChapterData']
export type VerseResult = components['schemas']['VerseData']
export type TranslationResult = components['schemas']['TranslationContent']

export type VerseSearchOptions = {
  primaryLang: LangCode
  secondaryLang?: LangCode
  includeArabic: boolean
  includeWords?: boolean
}

export type UseVerseSearchReturn = {
  data: QuranSearchResponse | null
  loading: boolean
  error: string | null
  /** Total results across all pages (from info.total) */
  total: number
  /** Number of verses loaded so far across all pages */
  loadedCount: number
  hasMore: boolean
  search: (query: string, opts: VerseSearchOptions) => Promise<void>
  loadMore: () => Promise<void>
  reset: () => void
}

export const SEARCH_LIMIT = 20

// ─── Internal state ───────────────────────────────────────────────────────────

type State = {
  data: QuranSearchResponse | null
  loading: boolean
  error: string | null
  total: number
  offset: number
  lastQuery: string
  lastOpts: VerseSearchOptions | null
}

const INITIAL_STATE: State = {
  data: null,
  loading: false,
  error: null,
  total: 0,
  offset: 0,
  lastQuery: '',
  lastOpts: null,
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useVerseSearch(): UseVerseSearchReturn {
  const [state, setState] = useState<State>(INITIAL_STATE)

  /** Builds the langs array for the API, filtering out xl (transliterated — no API equivalent).
   *  Always includes 'en' so English queries work regardless of the user's display language. */
  function buildLangs(opts: VerseSearchOptions): string[] {
    const langs: string[] = ['en']
    if (opts.primaryLang !== 'xl' && !langs.includes(opts.primaryLang)) langs.push(opts.primaryLang)
    if (opts.includeArabic && !langs.includes('ar')) langs.push('ar')
    if (opts.secondaryLang && opts.secondaryLang !== 'xl') {
      if (!langs.includes(opts.secondaryLang)) langs.push(opts.secondaryLang)
    }
    return langs
  }

  const fetchPage = useCallback(
    async (query: string, opts: VerseSearchOptions, offset: number) => {
      const langs = buildLangs(opts)
      const q = query

      const { data, error } = await wsApi.GET('/search', {
        params: {
          query: {
            q,
            langs,
            scope: 'verses',
            limit: SEARCH_LIMIT,
            offset,
          },
        },
      })

      let merged = data ?? null
      if (merged && opts.includeWords) {
        merged = await hydrateWords(merged, opts)
      }

      return {
        data: merged,
        error: error ? 'Search failed. Please try again.' : null,
      }
    },
    []
  )

  const search = useCallback(
    async (query: string, opts: VerseSearchOptions) => {
      const trimmed = query.trim()
      if (!trimmed || trimmed.length < 2) return

      setState((prev) => ({ ...prev, loading: true, error: null }))

      const { data, error } = await fetchPage(trimmed, opts, 0)

      setState({
        data,
        loading: false,
        error,
        total: data?.info?.total ?? 0,
        offset: 0,
        lastQuery: trimmed,
        lastOpts: opts,
      })
    },
    [fetchPage]
  )

  const loadMore = useCallback(async () => {
    const { lastQuery, lastOpts, offset } = state
    if (!lastQuery || !lastOpts) return

    const nextOffset = offset + SEARCH_LIMIT
    setState((prev) => ({ ...prev, loading: true, error: null }))

    const { data: nextPage, error } = await fetchPage(
      lastQuery,
      lastOpts,
      nextOffset
    )

    if (error || !nextPage) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: error ?? 'Failed to load more results.',
      }))
      return
    }

    setState((prev) => ({
      ...prev,
      data: mergePages(prev.data, nextPage),
      loading: false,
      error: null,
      total: nextPage.info?.total ?? prev.total,
      offset: nextOffset,
    }))
  }, [state, fetchPage])

  const reset = useCallback(() => setState(INITIAL_STATE), [])

  const loadedCount =
    state.data?.chapters?.reduce(
      (acc, ch) => acc + (ch.verses?.length ?? 0),
      0
    ) ?? 0

  return {
    data: state.data,
    loading: state.loading,
    error: state.error,
    total: state.total,
    loadedCount,
    hasMore: state.total > 0 && loadedCount < state.total,
    search,
    loadMore,
    reset,
  }
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function mergePages(
  prev: QuranSearchResponse | null,
  next: QuranSearchResponse
): QuranSearchResponse {
  if (!prev) return next

  const chapters = [...(prev.chapters ?? [])]

  for (const newCh of next.chapters ?? []) {
    const existing = chapters.find((c) => c.cn === newCh.cn)
    if (existing) {
      const seen = new Set((existing.verses ?? []).map((v) => v.vk))
      const deduped = (newCh.verses ?? []).filter((v) => !seen.has(v.vk))
      existing.verses = [...(existing.verses ?? []), ...deduped]
    } else {
      chapters.push({ ...newCh })
    }
  }

  return { info: next.info, chapters }
}

/**
 * The `/search?scope=verses` endpoint does not populate per-word data even
 * when `include_words=true` is sent. To make word-by-word render in search
 * results, we follow up with a `/quran?verses=...` call for the matched
 * refs and merge the `w` arrays into the search response.
 */
async function hydrateWords(
  resp: QuranSearchResponse,
  opts: VerseSearchOptions
): Promise<QuranSearchResponse> {
  const refs: string[] = []
  for (const ch of resp.chapters ?? []) {
    for (const v of ch.verses ?? []) {
      if (v.vk) refs.push(v.vk)
    }
  }
  if (refs.length === 0) return resp

  const langs: string[] = []
  if (opts.primaryLang !== 'xl') langs.push(opts.primaryLang)
  if (!langs.includes('ar')) langs.push('ar')

  const { data } = await wsApi.GET('/quran', {
    params: {
      query: {
        verses: refs.join(','),
        langs,
        include_words: true,
        include_root: true,
        include_meaning: true,
        word_langs: ['ar', 'en', 'tl'],
      },
    },
  })

  if (!data) return resp

  const wordsByVk = new Map<string, VerseResult['w']>()
  for (const ch of data.chapters ?? []) {
    for (const v of ch.verses ?? []) {
      if (v.vk && v.w) wordsByVk.set(v.vk, v.w)
    }
  }
  if (wordsByVk.size === 0) return resp

  return {
    ...resp,
    chapters: resp.chapters?.map((ch) => ({
      ...ch,
      verses: ch.verses?.map((v) => {
        const w = v.vk ? wordsByVk.get(v.vk) : undefined
        return w ? { ...v, w } : v
      }),
    })),
  }
}
