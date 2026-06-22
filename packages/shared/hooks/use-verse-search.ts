'use client'

import { useCallback, useState } from 'react'
import { wsApi } from '@/src/api/client'
import type { components } from '@/src/api/types.gen'
import type { LangCode } from '@/hooks/use-quran-preferences'
import { getRegisteredOfflineContentStore } from '@/lib/offline/registry'
import { offlineQuranSearch } from '@/lib/offline/quran-adapter'

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
    if (opts.primaryLang !== 'xl' && opts.primaryLang !== 'none' && !langs.includes(opts.primaryLang)) langs.push(opts.primaryLang)
    if (opts.includeArabic && !langs.includes('ar')) langs.push('ar')
    if (opts.secondaryLang && opts.secondaryLang !== 'xl' && opts.secondaryLang !== 'none') {
      if (!langs.includes(opts.secondaryLang)) langs.push(opts.secondaryLang)
    }
    return langs
  }

  // Offline fallback: only when online search is unavailable. Single page (no
  // offset paging) and verse-scope only (word-by-word isn't bundled in v1).
  // Returns null when there is no installed content to search.
  async function tryOffline(query: string, opts: VerseSearchOptions, offset: number) {
    if (offset > 0 || opts.includeWords) return null
    const store = getRegisteredOfflineContentStore()
    if (!store) return null
    try {
      return await offlineQuranSearch(store, buildLangs(opts), query, { limit: 50 })
    } catch {
      return null
    }
  }

  const fetchPage = useCallback(
    async (query: string, opts: VerseSearchOptions, offset: number) => {
      const langs = buildLangs(opts)
      const q = query

      try {
        const { data, error } = await wsApi.GET('/search', {
          params: {
            query: {
              q,
              langs,
              scope: 'verses',
              limit: SEARCH_LIMIT,
              offset,
              include_words: opts.includeWords || undefined,
              include_root: opts.includeWords || undefined,
              include_meaning: opts.includeWords || undefined,
              word_langs: opts.includeWords ? ['ar', 'en', 'tl'] : undefined,
            },
          },
        })

        if (!error && data) {
          return { data, error: null }
        }
        // Backend reachable but returned an error envelope — try local content.
        const offline = await tryOffline(query, opts, offset)
        if (offline) return { data: offline, error: null }
        return { data: data ?? null, error: 'Search failed. Please try again.' }
      } catch {
        // Network failure (offline / timeout): fall back to installed bundles.
        const offline = await tryOffline(query, opts, offset)
        if (offline) return { data: offline, error: null }
        return { data: null, error: 'Search failed. Please try again.' }
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
