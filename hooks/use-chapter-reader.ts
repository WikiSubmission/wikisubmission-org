'use client'

import { useCallback, useRef, useState } from 'react'
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
  reload: (opts: ChapterReaderOptions, seekVerse?: number) => Promise<void>
  /** Jump directly to a verse window — replaces state, no incremental loading. */
  seekToVerse: (targetVerse: number, fallbackOpts?: ChapterReaderOptions) => Promise<void>
  /** Fire-and-cache fetch around targetVerse so seekToVerse can resolve instantly. */
  prefetch: (targetVerse: number, fallbackOpts?: ChapterReaderOptions) => void
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

type FetchResult = {
  verses: VerseData[] | null
  titles: Record<string, string> | null
  reachedEnd: boolean | undefined
  error: string | null
}

export function useChapterReader(
  chapterNumber: number,
  initialData: QuranResponse | null,
  rangeStart?: number,
  rangeEnd?: number,
): UseChapterReaderReturn {
  const initialVerses = initialData?.chapters?.[0]?.verses ?? []
  const initialTitles = initialData?.chapters?.[0]?.titles ?? {}
  const initialVerseEnd = initialData?.info?.verse_end ?? (rangeStart ?? 0) + initialVerses.length - 1

  const [state, setState] = useState<State>({
    verses: initialVerses,
    chapterTitles: initialTitles,
    verseCount: initialVerses.length,
    loading: false,
    error: null,
    lastVerseEnd: initialVerseEnd,
    // In range mode the SSR data is the complete set — never auto-load more.
    reachedEnd: rangeEnd !== undefined ? true : initialVerses.length < PAGE_SIZE,
    lastOpts: null,
  })

  // Ref synced each render — lets callbacks (loadMore, prefetch, seekToVerse)
  // read current state without closing over it. Without this, each callback
  // would need `state` in its dep array, causing a new function reference on
  // every state update and making downstream useEffects re-fire constantly.
  const stateRef = useRef(state)
  // eslint-disable-next-line react-hooks/refs
  stateRef.current = state

  // Cache for in-flight prefetch promises: cacheKey → Promise<FetchResult>
  const prefetchCacheRef = useRef(new Map<string, Promise<FetchResult>>())

  // Prevents two concurrent loadMore calls from both applying their results.
  // Set synchronously before the fetch so even same-tick calls see it.
  const loadMoreInFlightRef = useRef(false)

  // Incremented by reload/seekToVerse to cancel any in-flight loadMore.
  // loadMore checks this after its await — if the number changed, the result is stale.
  const fetchGenerationRef = useRef(0)

  const fetchVerses = useCallback(
    async (verseStart: number, opts: ChapterReaderOptions): Promise<FetchResult> => {
      const langs = buildLangs(opts)
      // In range mode, fetch up to rangeEnd so the full range is loaded in one request.
      const verseEndParam = rangeEnd !== undefined
        ? rangeEnd
        : verseStart + PAGE_SIZE - 1

      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 15_000)

      let data, error
      try {
        ;({ data, error } = await wsApi.GET('/quran', {
          params: {
            query: {
              chapter_number_start: chapterNumber,
              langs,
              verse_start: verseStart,
              verse_end: verseEndParam,
              include_words: opts.includeWords || undefined,
              include_root: opts.includeRoot || undefined,
              include_meaning: opts.includeMeaning || undefined,
              word_langs: opts.includeWords ? ['ar', 'en', 'tl'] : undefined,
            },
          },
          signal: controller.signal,
        }))
      } catch {
        return { verses: null, titles: null, reachedEnd: undefined, error: 'Request timed out.' }
      } finally {
        clearTimeout(timeout)
      }

      if (error || !data) {
        return { verses: null, titles: null, reachedEnd: undefined, error: 'Failed to load verses.' }
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
    [chapterNumber, rangeEnd]
  )

  const reload = useCallback(
    async (opts: ChapterReaderOptions, seekVerse?: number) => {
      const generation = ++fetchGenerationRef.current
      loadMoreInFlightRef.current = false
      setState((prev) => ({ ...prev, loading: true, error: null }))

      // If a seek is active, reload centered on the target verse so the window
      // contains the target immediately — avoids an intermediate state where we
      // show the wrong position while waiting for load-more to reach the target.
      const start = seekVerse !== undefined
        ? Math.max(0, seekVerse - 5)
        : (rangeStart ?? 0)
      const result = await fetchVerses(start, opts)

      if (fetchGenerationRef.current !== generation) return

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
        lastVerseEnd: rangeEnd ?? (start + PAGE_SIZE - 1),
        reachedEnd: rangeEnd !== undefined ? true : (result.reachedEnd ?? false),
        lastOpts: opts,
      })
    },
    [fetchVerses, rangeStart, rangeEnd]
  )

  const loadMore = useCallback(async (fallbackOpts?: ChapterReaderOptions) => {
    if (loadMoreInFlightRef.current) return // prevent concurrent calls
    const { lastVerseEnd, lastOpts: storedOpts } = stateRef.current
    const lastOpts = storedOpts ?? fallbackOpts
    if (!lastOpts) return

    const generation = fetchGenerationRef.current
    const nextStart = lastVerseEnd + 1

    loadMoreInFlightRef.current = true
    setState((prev) => ({ ...prev, loading: true, error: null }))

    const result = await fetchVerses(nextStart, lastOpts)

    loadMoreInFlightRef.current = false

    if (fetchGenerationRef.current !== generation) return // reload/seek superseded this

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
  }, [fetchVerses]) // stable — reads state from stateRef

  /**
   * Fire-and-forget prefetch for the verse window around `targetVerse`.
   * The promise is stored in `prefetchCacheRef` so `seekToVerse` can consume
   * it immediately without waiting for a new network round-trip.
   */
  const prefetch = useCallback(
    (targetVerse: number, fallbackOpts?: ChapterReaderOptions) => {
      const { lastOpts, loading } = stateRef.current
      const opts = lastOpts ?? fallbackOpts
      if (!opts || loading) return

      const windowStart = Math.max(0, targetVerse - 5)
      const cacheKey = `${chapterNumber}:${windowStart}`

      if (prefetchCacheRef.current.has(cacheKey)) return // already in flight

      const promise = fetchVerses(windowStart, opts)
      prefetchCacheRef.current.set(cacheKey, promise)

      // Evict after 30 s to avoid holding stale data
      setTimeout(() => prefetchCacheRef.current.delete(cacheKey), 30_000)
    },
    [chapterNumber, fetchVerses] // stable — reads state from stateRef
  )

  /**
   * Replace the current verse window with a page centred on `targetVerse`.
   * Uses a cached prefetch promise if available — making the seek instant
   * if the user hovered over this verse long enough to trigger prefetch.
   */
  const seekToVerse = useCallback(
    async (targetVerse: number, fallbackOpts?: ChapterReaderOptions) => {
      const opts = stateRef.current.lastOpts ?? fallbackOpts
      if (!opts) return

      const generation = ++fetchGenerationRef.current
      loadMoreInFlightRef.current = false
      const windowStart = Math.max(0, targetVerse - 5)
      const cacheKey = `${chapterNumber}:${windowStart}`

      setState((prev) => ({ ...prev, loading: true, error: null }))

      const cached = prefetchCacheRef.current.get(cacheKey)
      const result = await (cached ?? fetchVerses(windowStart, opts))

      // Clean up the consumed cache entry
      prefetchCacheRef.current.delete(cacheKey)

      if (fetchGenerationRef.current !== generation) return // superseded by newer seek/reload

      if (result.error || !result.verses) {
        setState((prev) => ({
          ...prev,
          loading: false,
          error: result.error ?? 'Failed to seek to verse.',
        }))
        return
      }

      setState({
        verses: result.verses,
        chapterTitles: result.titles ?? {},
        verseCount: result.verses.length,
        loading: false,
        error: null,
        lastVerseEnd: windowStart + PAGE_SIZE - 1,
        reachedEnd: result.reachedEnd ?? false,
        lastOpts: opts,
      })
    },
    [chapterNumber, fetchVerses] // stable — reads state from stateRef
  )

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
    seekToVerse,
    prefetch,
  }
}
