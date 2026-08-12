'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { getRegisteredOfflineContentStore } from '@/lib/offline/registry'
import { offlineQuranSearch } from '@/lib/offline/quran-adapter'
import { buildLocalIndex } from '@/lib/quran-local-search'
import { corpusVerses } from '@/lib/quran-local-corpus'
import { libraryServes, libraryTitles, QURAN_CHAPTER_COUNT } from '@/lib/quran-local-library'
import { useReaderContext } from '@/hooks/use-reader-context-store'
import { useDebouncedValue } from '@/hooks/use-debounced-value'
import type { components } from '@/src/api/types.gen'

type QuranResponse = components['schemas']['QuranResponse']

/** Where a set of local results came from, so the UI can label them honestly. */
export type LocalSearchSource = 'bundle' | 'library' | 'chapter' | 'results' | 'none'

export interface UseLocalVerseSearchResult {
  data: QuranResponse | null
  source: LocalSearchSource
  /** True while the bundle query is in flight. The in-memory paths are synchronous. */
  scanning: boolean
  /** Chapters the background sweep has pulled in, out of 114. */
  libraryChapters: number
  /** True once the sweep has the whole book, so the UI can stop hedging. */
  libraryComplete: boolean
}

/** Short: this only gates a local FTS5 query in a worker, not a network call. */
const BUNDLE_DEBOUNCE_MS = 120

/** Probed once per page, not per keystroke. */
let bundleProbe: Promise<Set<string>> | null = null

function installedBundleIds(): Promise<Set<string>> {
  if (bundleProbe) return bundleProbe
  const store = getRegisteredOfflineContentStore()
  if (!store) return Promise.resolve(new Set<string>())
  bundleProbe = store
    .installedBundles()
    .then((bundles) => new Set(bundles.map((bundle) => bundle.id)))
    .catch(() => new Set<string>())
  return bundleProbe
}

/**
 * Searches what is already available locally, in descending order of coverage.
 *
 * 1. Installed offline bundles, which cover the whole Quran via FTS5 in a worker.
 * 2. The background-swept library, which covers every chapter pulled in so far.
 * 3. The hydrated chapter corpus, which covers the open chapter.
 * 4. The loaded search results, when the search view is the active one.
 *
 * On the web the bundles are an opt-in download, so the library is the common
 * path; the corpus below it still matters because it lands seconds before the
 * sweep reaches the open chapter, and because it survives the gates the sweep
 * declines (save-data, low memory). Nothing here touches the network — that is
 * what makes it safe to run on every keystroke.
 */
export function useLocalVerseSearch(
  query: string,
  options: { primaryLang?: string; limit?: number } = {},
): UseLocalVerseSearchResult {
  const { primaryLang, limit = 8 } = options
  const trimmed = query.trim()

  // Subscribed to scalars only; the corpus and library are read through getState().
  const corpusVersion = useReaderContext((s) => s.corpusVersion)
  const libraryVersion = useReaderContext((s) => s.libraryVersion)
  const libraryChapters = useReaderContext((s) => s.libraryChapterCount)
  const resultsQuery = useReaderContext((s) => s.results?.query ?? null)

  const [bundleData, setBundleData] = useState<QuranResponse | null>(null)
  const [scanning, setScanning] = useState(false)
  const debouncedQuery = useDebouncedValue(trimmed, BUNDLE_DEBOUNCE_MS)
  const runIdRef = useRef(0)

  // ── Bundle tier ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (debouncedQuery.length < 2) {
      setBundleData(null)
      return
    }

    const runId = ++runIdRef.current
    let cancelled = false

    void (async () => {
      const store = getRegisteredOfflineContentStore()
      if (!store) return

      const langs = [primaryLang ?? 'en']
      const ids = await installedBundleIds()
      if (cancelled || runIdRef.current !== runId) return
      if (!langs.every((lang) => ids.has(`quran-${lang}`))) return

      setScanning(true)
      try {
        const response = await offlineQuranSearch(store, langs, debouncedQuery, { limit })
        // Guards an out-of-order resolve, which abort cannot reach: the worker
        // reply arrives regardless of when the query changed.
        if (cancelled || runIdRef.current !== runId) return
        setBundleData(response ?? null)
      } catch {
        if (!cancelled && runIdRef.current === runId) setBundleData(null)
      } finally {
        if (!cancelled && runIdRef.current === runId) setScanning(false)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [debouncedQuery, primaryLang, limit])

  // ── In-memory tiers ───────────────────────────────────────────────────────
  // Rebuilt when the corpus grows or the result set changes, not per keystroke.
  const chapterIndex = useMemo(() => {
    const corpus = useReaderContext.getState().corpus
    return corpus ? buildLocalIndex(corpusVerses(corpus)) : null
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [corpusVersion])

  const resultsIndex = useMemo(() => {
    const results = useReaderContext.getState().results
    return results && results.verses.length > 0 ? buildLocalIndex(results.verses) : null
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resultsQuery, corpusVersion])

  // The library owns its index and grows it in place as batches land, so this
  // only re-reads the handle — it never re-tokenizes what is already held.
  const libraryIndex = useMemo(() => {
    const library = useReaderContext.getState().library
    if (!library || !libraryServes(library, [primaryCodeOf(primaryLang)])) return null
    return { index: library.index, titles: libraryTitles(library) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [libraryVersion, primaryLang])

  return useMemo(() => {
    const progress = { libraryChapters, libraryComplete: libraryChapters >= QURAN_CHAPTER_COUNT }
    if (trimmed.length < 2) {
      return { data: null, source: 'none' as const, scanning: false, ...progress }
    }

    // The bundle tier answers for the whole Quran, so it wins when present.
    const bundleHits = bundleData?.chapters?.some((chapter) => (chapter.verses?.length ?? 0) > 0)
    if (bundleHits) return { data: bundleData, source: 'bundle' as const, scanning, ...progress }

    const searchOptions = { primaryLang, limit }

    if (libraryIndex) {
      const data = libraryIndex.index.search(trimmed, {
        ...searchOptions,
        titles: libraryIndex.titles,
      })
      if ((data.info?.result_count ?? 0) > 0) {
        return { data, source: 'library' as const, scanning, ...progress }
      }
    }

    if (chapterIndex) {
      const data = chapterIndex.search(trimmed, searchOptions)
      if ((data.info?.result_count ?? 0) > 0) {
        return { data, source: 'chapter' as const, scanning, ...progress }
      }
    }

    if (resultsIndex) {
      const data = resultsIndex.search(trimmed, searchOptions)
      if ((data.info?.result_count ?? 0) > 0) {
        return { data, source: 'results' as const, scanning, ...progress }
      }
    }

    return { data: null, source: 'none' as const, scanning, ...progress }
  }, [
    trimmed,
    bundleData,
    libraryIndex,
    chapterIndex,
    resultsIndex,
    primaryLang,
    limit,
    scanning,
    libraryChapters,
  ])
}

/** The reader's display languages include codes the API has no equivalent for. */
function primaryCodeOf(primaryLang: string | undefined): string {
  return !primaryLang || primaryLang === 'xl' || primaryLang === 'none' ? 'en' : primaryLang
}
