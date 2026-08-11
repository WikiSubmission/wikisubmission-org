'use client'

import { create } from 'zustand'
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

  setChapter(chapterNumber: number | null): void
  setCurrentVerse(verseKey: string | null): void
  setLoadedVerses(verses: VerseData[]): void
  setResults(results: { query: string; verses: VerseData[] } | null): void
  /** Called when a reader unmounts, so stale context cannot outlive it. */
  clear(): void
}

export const useReaderContext = create<ReaderContextStore>((set) => ({
  chapterNumber: null,
  currentVerseKey: null,
  loadedVerses: [],
  results: null,

  setChapter: (chapterNumber) => set({ chapterNumber }),
  setCurrentVerse: (currentVerseKey) => set({ currentVerseKey }),
  setLoadedVerses: (loadedVerses) => set({ loadedVerses }),
  setResults: (results) => set({ results }),
  clear: () =>
    set({ chapterNumber: null, currentVerseKey: null, loadedVerses: [], results: null }),
}))

/** The verse the reader is looking at, or null. Reads without subscribing. */
export function getCurrentVerse(): VerseData | null {
  const { currentVerseKey, loadedVerses } = useReaderContext.getState()
  if (!currentVerseKey) return null
  return loadedVerses.find((verse) => verse.vk === currentVerseKey) ?? null
}
