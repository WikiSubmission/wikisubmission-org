'use client'

import { useMemo } from 'react'
import { buildLocalIndex } from '@/lib/quran-local-search'
import { corpusVerses } from '@/lib/quran-local-corpus'
import { useReaderContext } from '@/hooks/use-reader-context-store'
import type { components } from '@/src/api/types.gen'

type QuranResponse = components['schemas']['QuranResponse']

/** Where a set of local results came from, so the UI can label them honestly. */
export type LocalSearchSource = 'chapter' | 'results' | 'none'

export interface UseLocalVerseSearchResult {
  data: QuranResponse | null
  source: LocalSearchSource
}

/**
 * Searches what the reader currently has, and nothing wider.
 *
 * Two tiers, and they are mutually exclusive in practice because each view
 * clears the reader context on its way out:
 *
 * 1. The open chapter — the hydrated corpus when it is there, otherwise the
 *    verses the reader has actually loaded, which is what a verse range or a
 *    device that declined hydration is left with.
 * 2. The loaded results, when a submitted search is the active view. Typing
 *    after a backend search narrows what came back rather than starting a
 *    different search.
 *
 * Deliberately not the whole Quran. Scope is what makes this honest: matches are
 * drawn from what is on screen, so an empty result means "not in this sura",
 * never "not in the Quran". Searching the book is what pressing Enter does, and
 * that goes to the backend, which has the whole index.
 *
 * Fully synchronous — no network, no worker, no debounce — which is what makes
 * it safe to run on every keystroke.
 */
export function useLocalVerseSearch(
  query: string,
  options: { primaryLang?: string; limit?: number } = {},
): UseLocalVerseSearchResult {
  const { primaryLang, limit = 8 } = options
  const trimmed = query.trim()

  // Subscribed to scalars and stored references only; the corpus itself is a Map
  // and is read through `getState()` so no selector ever builds a new object.
  const corpusVersion = useReaderContext((s) => s.corpusVersion)
  const loadedVerses = useReaderContext((s) => s.loadedVerses)
  const results = useReaderContext((s) => s.results)

  // Rebuilt when the chapter's contents change, not per keystroke. The corpus is
  // preferred because it holds the whole chapter; `loadedVerses` is only the
  // window the reader has scrolled through.
  const chapterIndex = useMemo(() => {
    const corpus = useReaderContext.getState().corpus
    if (corpus) return buildLocalIndex(corpusVerses(corpus))
    return loadedVerses.length > 0 ? buildLocalIndex(loadedVerses) : null
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [corpusVersion, loadedVerses])

  const resultsIndex = useMemo(
    () => (results && results.verses.length > 0 ? buildLocalIndex(results.verses) : null),
    [results],
  )

  return useMemo(() => {
    if (trimmed.length < 2) return { data: null, source: 'none' }

    const searchOptions = { primaryLang, limit }

    // Results first: when a submitted search is on screen it is what the user is
    // looking at, and the reader context holds no chapter behind it anyway.
    if (resultsIndex) {
      const data = resultsIndex.search(trimmed, searchOptions)
      return { data, source: 'results' }
    }

    if (chapterIndex) {
      const data = chapterIndex.search(trimmed, searchOptions)
      return { data, source: 'chapter' }
    }

    return { data: null, source: 'none' }
  }, [trimmed, chapterIndex, resultsIndex, primaryLang, limit])
}
