'use client'

import { create } from 'zustand'
import type { Corpus } from '@/lib/quran-local-corpus'
import type { Library } from '@/lib/quran-local-library'
import type { components } from '@/src/api/types.gen'

type VerseData = components['schemas']['VerseData']

/**
 * What the reader currently has on screen, published for surfaces that live
 * outside its tree.
 *
 * The command menu and the Quran search bar both need this and neither can
 * receive it as a prop: the reader is mounted from a server page, while they are
 * rendered by the app shell and the layout header. A module-level store crosses
 * that boundary the same way `useQuranNavStore` already does.
 *
 * Re-render discipline matters here. `currentVerseKey` changes as the reader
 * scrolls, so it is written on the reader's existing debounced tick, and
 * consumers should read it through `useReaderContext.getState()` inside a
 * callback rather than subscribing in render. Subscribe to scalars only.
 */
interface ReaderContextStore {
  /** Chapter currently open in the reader, or null when no reader is mounted. */
  chapterNumber: number | null
  /** Verse at the viewport centre, e.g. "2:255". */
  currentVerseKey: string | null
  /** Verses the reader has loaded, for local search and copy-by-reference. */
  loadedVerses: VerseData[]
  /** Search results currently rendered, if the search view is the active one. */
  results: { query: string; verses: VerseData[] } | null
  /**
   * The whole chapter, hydrated in the background. Held here rather than in a
   * second store so there is one place that answers "what can be searched
   * locally right now".
   *
   * Never select `corpus` itself in a render body — read it through `getState()`
   * inside a callback or memo, and subscribe to `corpusVersion` when you need to
   * recompute. A Map in a selector defeats zustand's equality check.
   */
  corpus: Corpus | null
  /** Scalar mirror of `corpus.version`, safe to subscribe to. */
  corpusVersion: number
  /**
   * The whole Quran as text, swept in behind the reader so search covers the
   * book rather than only the open chapter.
   *
   * Same access rule as `corpus`: never select it in a render body, subscribe to
   * `libraryVersion` instead. Unlike the corpus it is *not* cleared when a reader
   * unmounts — it belongs to the Quran section, not to any one chapter, and
   * re-sweeping it on every navigation would defeat the point.
   */
  library: Library | null
  /** Scalar mirror of `library.version`, safe to subscribe to. */
  libraryVersion: number
  /** Chapters swept so far, out of 114. Lets the UI say how far coverage reaches. */
  libraryChapterCount: number
  /**
   * What the user has typed in the search bar but not yet submitted.
   *
   * The results view filters its loaded results by this, so typing narrows what
   * is on screen without a request. It is deliberately separate from the
   * submitted query in the URL — only Enter promotes one to the other.
   */
  draftQuery: string

  setChapter(chapterNumber: number | null): void
  setCurrentVerse(verseKey: string | null): void
  setLoadedVerses(verses: VerseData[]): void
  setResults(results: { query: string; verses: VerseData[] } | null): void
  setCorpus(corpus: Corpus | null): void
  setLibrary(library: Library | null): void
  setDraftQuery(query: string): void
  /** Called when a reader unmounts, so stale context cannot outlive it. */
  clear(): void
}

export const useReaderContext = create<ReaderContextStore>((set) => ({
  chapterNumber: null,
  currentVerseKey: null,
  loadedVerses: [],
  results: null,
  corpus: null,
  corpusVersion: 0,
  library: null,
  libraryVersion: 0,
  libraryChapterCount: 0,
  draftQuery: '',

  setChapter: (chapterNumber) => set({ chapterNumber }),
  setCurrentVerse: (currentVerseKey) => set({ currentVerseKey }),
  setLoadedVerses: (loadedVerses) => set({ loadedVerses }),
  setResults: (results) => set({ results }),
  setCorpus: (corpus) => set({ corpus, corpusVersion: corpus?.version ?? 0 }),
  setLibrary: (library) =>
    set({
      library,
      libraryVersion: library?.version ?? 0,
      libraryChapterCount: library?.chapters.size ?? 0,
    }),
  setDraftQuery: (draftQuery) => set({ draftQuery }),
  // `draftQuery` deliberately survives: it belongs to the search bar, which
  // outlives any single reader, and Phase 0 made draft retention the contract.
  // `library` survives for the same reason — it is section-wide, and dropping it
  // on a chapter change would re-sweep the whole book on every navigation.
  clear: () =>
    set({
      chapterNumber: null,
      currentVerseKey: null,
      loadedVerses: [],
      results: null,
      corpus: null,
      corpusVersion: 0,
    }),
}))

/** The verse the reader is looking at, or null. Reads without subscribing. */
export function getCurrentVerse(): VerseData | null {
  const { currentVerseKey, loadedVerses } = useReaderContext.getState()
  if (!currentVerseKey) return null
  return loadedVerses.find((verse) => verse.vk === currentVerseKey) ?? null
}
