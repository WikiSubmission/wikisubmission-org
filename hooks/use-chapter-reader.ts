'use client'

import { useCallback, useState } from 'react'
import { wsApi } from '@/src/api/client'
import type { components } from '@/src/api/types.gen'
import type { LangCode } from '@/hooks/use-quran-preferences'

export type QuranResponse = components['schemas']['QuranResponse']
export type ChapterData = components['schemas']['ChapterData']
export type VerseData = components['schemas']['VerseData']

export const PAGE_SIZE = 50

export type ChapterReaderOptions = {
  primaryLang: LangCode
  secondaryLang?: LangCode
  includeArabic: boolean
  includeWords: boolean
  includeRoot: boolean
  includeMeaning: boolean
}

export type UseChapterReaderReturn = {
  verses: VerseData[]
  chapterTitles: Record<string, string>
  verseCount: number
  loading: boolean
  error: string | null
  hasMore: boolean
  loadMore: (fallbackOpts?: ChapterReaderOptions) => Promise<void>
  reload: (opts: ChapterReaderOptions) => Promise<void>
}

type State = {
  verses: VerseData[]
  chapterTitles: Record<string, string>
  verseCount: number
  loading: boolean
  error: string | null
  lastVerseEnd: number
  reachedEnd: boolean
  lastOpts: ChapterReaderOptions | null
}

function buildLangs(opts: ChapterReaderOptions): string[] {
  const langs: string[] = []
  if (opts.primaryLang !== 'xl') langs.push(opts.primaryLang)
  if (opts.includeArabic && !langs.includes('ar')) langs.push('ar')
  if (opts.secondaryLang && opts.secondaryLang !== 'xl') {
    if (!langs.includes(opts.secondaryLang)) langs.push(opts.secondaryLang)
  }
  return langs.length > 0 ? langs : ['en']
}

export function useChapterReader(
  chapterNumber: number,
  initialData: QuranResponse | null
): UseChapterReaderReturn {
  const initialVerses = initialData?.chapters?.[0]?.verses ?? []
  const initialTitles = initialData?.chapters?.[0]?.titles ?? {}
  const initialVerseEnd = initialData?.info?.verse_end ?? initialVerses.length

  const [state, setState] = useState<State>({
    verses: initialVerses,
    chapterTitles: initialTitles,
    verseCount: initialVerses.length,
    loading: false,
    error: null,
    lastVerseEnd: initialVerseEnd,
    reachedEnd: initialVerses.length < PAGE_SIZE,
    lastOpts: null,
  })

  const fetchVerses = useCallback(
    async (verseStart: number, opts: ChapterReaderOptions) => {
      const langs = buildLangs(opts)
      const { data, error } = await wsApi.GET('/quran', {
        params: {
          query: {
            chapter_number_start: chapterNumber,
            langs,
            verse_start: verseStart,
            verse_end: verseStart + PAGE_SIZE - 1,
            include_words: opts.includeWords || undefined,
            include_root: opts.includeRoot || undefined,
            include_meaning: opts.includeMeaning || undefined,
          },
        },
      })

      if (error || !data) {
        return { verses: null, titles: null, error: 'Failed to load verses.' }
      }

      const chapter = data.chapters?.[0]
      const verses = chapter?.verses ?? []
      return {
        verses,
        titles: chapter?.titles ?? {},
        reachedEnd: verses.length < PAGE_SIZE,
        error: null,
      }
    },
    [chapterNumber]
  )

  const reload = useCallback(
    async (opts: ChapterReaderOptions) => {
      setState((prev) => ({ ...prev, loading: true, error: null }))

      const result = await fetchVerses(1, opts)

      if (result.error || !result.verses) {
        setState((prev) => ({
          ...prev,
          loading: false,
          error: result.error ?? 'Failed to load verses.',
        }))
        return
      }

      setState({
        verses: result.verses,
        chapterTitles: result.titles ?? {},
        verseCount: result.verses.length,
        loading: false,
        error: null,
        lastVerseEnd: PAGE_SIZE,
        reachedEnd: result.reachedEnd ?? false,
        lastOpts: opts,
      })
    },
    [fetchVerses]
  )

  const loadMore = useCallback(async (fallbackOpts?: ChapterReaderOptions) => {
    const { lastVerseEnd } = state
    const lastOpts = state.lastOpts ?? fallbackOpts
    if (!lastOpts) return

    const nextStart = lastVerseEnd + 1
    setState((prev) => ({ ...prev, loading: true, error: null }))

    const result = await fetchVerses(nextStart, lastOpts)

    if (result.error || !result.verses) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: result.error ?? 'Failed to load more verses.',
      }))
      return
    }

    setState((prev) => ({
      ...prev,
      verses: [...prev.verses, ...result.verses!],
      verseCount: prev.verseCount + (result.verses?.length ?? 0),
      loading: false,
      error: null,
      lastVerseEnd: nextStart + PAGE_SIZE - 1,
      reachedEnd: result.reachedEnd ?? false,
      lastOpts,
    }))
  }, [state, fetchVerses])

  const hasMore = state.verses.length > 0 && !state.reachedEnd

  return {
    verses: state.verses,
    chapterTitles: state.chapterTitles,
    verseCount: state.verseCount,
    loading: state.loading,
    error: state.error,
    hasMore,
    loadMore,
    reload,
  }
}
