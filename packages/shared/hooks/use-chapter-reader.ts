'use client'

import { useCallback, useRef, useState } from 'react'
import { wsApi } from '@/src/api/client'
import type { components } from '@/src/api/types.gen'
import type { LangCode } from '@/hooks/use-quran-preferences'
import { getRegisteredOfflineContentStore } from '@/lib/offline/registry'
import { offlineQuranVerses } from '@/lib/offline/quran-adapter'

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

// The words bundle language the offline word-by-word display reads from. The
// network path hardcodes word_langs [ar, en, tl] below for the same reason:
// English is the only word-by-word translation that exists today. When more
// word languages ship, derive this from the reader preferences instead.
const WORDS_BUNDLE_LANG = 'en'

function buildLangs(opts: ChapterReaderOptions): string[] {
  const langs: string[] = []
  if (opts.primaryLang !== 'xl' && opts.primaryLang !== 'none') langs.push(opts.primaryLang)
  if (opts.includeArabic && !langs.includes('ar')) langs.push('ar')
  if (opts.secondaryLang && opts.secondaryLang !== 'xl' && opts.secondaryLang !== 'none') {
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

  // The verse_start of the last loadMore request. Guards against duplicate
  // fetches of the same page: a boolean in-flight flag isn't enough, because
  // between the fetch resolving and React committing the state update,
  // stateRef still holds the old lastVerseEnd — a loadMore call landing in
  // that window would recompute the same page. Comparing requested starts
  // closes both races (concurrent calls and the pre-commit window), since the
  // page start only changes once the state commit lands.
  const loadMoreRequestedStartRef = useRef<number | null>(null)

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

      const isOffline = typeof navigator !== 'undefined' && navigator.onLine === false
      const offlineStore = getRegisteredOfflineContentStore()

      // Serve a verse window from the installed bundles, or null on miss/error.
      // The word-by-word breakdown is attached when the words bundle is
      // installed; otherwise the verses carry text + translations only.
      const tryOffline = async (): Promise<FetchResult | null> => {
        try {
          if (!offlineStore) return null
          const offline = await offlineQuranVerses(
            offlineStore,
            langs,
            {
              chapter: chapterNumber,
              verseStart,
              verseEnd: verseEndParam,
            },
            opts.includeWords
              ? {
                  lang: WORDS_BUNDLE_LANG,
                  includeRoot: opts.includeRoot,
                  includeMeaning: opts.includeMeaning,
                }
              : undefined,
          )
          if (offline && offline.verses.length > 0) {
            return {
              verses: offline.verses,
              titles: offline.titles,
              reachedEnd: rangeEnd !== undefined ? true : offline.verses.length < PAGE_SIZE,
              error: null,
            }
          }
        } catch (e) {
          console.error('[offline-read] store error', e)
        }
        return null
      }

      // Offline-first: bundles cover verse text + translations, and the words
      // bundle covers the word-by-word breakdown. A word request only prefers
      // the network when the words bundle is missing — but even then we try the
      // bundles first when the browser reports offline, and again as a fallback
      // if the network fails, so an unreliable navigator.onLine never strands
      // the reader on a route it could serve locally (then without words).
      const wordsInstalled =
        opts.includeWords && offlineStore
          ? (await offlineStore.installedBundles()).some(
              (b) => b.id === `quran-words-${WORDS_BUNDLE_LANG}`,
            )
          : false
      if (!opts.includeWords || wordsInstalled || isOffline) {
        const hit = await tryOffline()
        if (hit) return hit
      }

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
        const hit = await tryOffline()
        if (hit) return hit
        return { verses: null, titles: null, reachedEnd: undefined, error: 'Request timed out.' }
      } finally {
        clearTimeout(timeout)
      }

      if (error || !data) {
        const hit = await tryOffline()
        if (hit) return hit
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
      loadMoreRequestedStartRef.current = null
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
    const { lastVerseEnd, lastOpts: storedOpts } = stateRef.current
    const lastOpts = storedOpts ?? fallbackOpts
    if (!lastOpts) return

    const generation = fetchGenerationRef.current
    const nextStart = lastVerseEnd + 1

    // Same page already requested (in flight, or applied but not yet
    // committed) — skip. The ref stays set on success; the next distinct
    // page start passes naturally once the state commit advances lastVerseEnd.
    if (loadMoreRequestedStartRef.current === nextStart) return
    loadMoreRequestedStartRef.current = nextStart
    setState((prev) => ({ ...prev, loading: true, error: null }))

    const result = await fetchVerses(nextStart, lastOpts)

    if (fetchGenerationRef.current !== generation) return // reload/seek superseded this

    if (result.error || !result.verses) {
      loadMoreRequestedStartRef.current = null // allow retrying the same page
      setState((prev) => ({
        ...prev,
        loading: false,
        error: result.error ?? 'Failed to load more verses.',
      }))
      return
    }

    setState((prev) => {
      // Backstop: never render the same verse twice, even if a duplicate
      // fetch slips through (e.g. StrictMode double-invocations in dev).
      const seen = new Set(prev.verses.map((v) => v.vk))
      const fresh = result.verses!.filter((v) => !seen.has(v.vk))
      return {
        ...prev,
        verses: [...prev.verses, ...fresh],
        verseCount: prev.verseCount + fresh.length,
        loading: false,
        error: null,
        lastVerseEnd: nextStart + PAGE_SIZE - 1,
        reachedEnd: result.reachedEnd ?? false,
        lastOpts,
      }
    })
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

      // Snap to a 25-verse grid so adjacent target verses (e.g. minimap drag
      // ticks) collapse to the same cache key instead of firing a fresh
      // request per pixel. The fetched window is PAGE_SIZE (50) so every
      // target verse is still covered by its bucket's window.
      const PREFETCH_GRID = 25
      const rawStart = Math.max(0, targetVerse - 5)
      const windowStart = Math.floor(rawStart / PREFETCH_GRID) * PREFETCH_GRID
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
      loadMoreRequestedStartRef.current = null
      // Match the snap used in `prefetch` so a hovered window can be reused.
      const PREFETCH_GRID = 25
      const rawStart = Math.max(0, targetVerse - 5)
      const windowStart = Math.floor(rawStart / PREFETCH_GRID) * PREFETCH_GRID
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
