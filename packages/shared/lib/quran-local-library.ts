import { createLocalIndex, type IncrementalLocalIndex } from '@/lib/quran-local-search'
import type { components } from '@/src/api/types.gen'

type VerseData = components['schemas']['VerseData']
type ChapterData = components['schemas']['ChapterData']

/**
 * The whole Quran as text, pulled in behind the reader so search can answer for
 * the entire book rather than only the chapter that happens to be open.
 *
 * This is the tier above `quran-local-corpus`. The corpus exists to serve the
 * *reader* — it carries whatever shape the reader is displaying, word-by-word
 * data included, and only ever holds one chapter, because that is what a
 * load-more or a minimap seek can be answered from. The library exists to serve
 * *search*: translations only, every chapter, no word payload. Keeping them
 * apart is deliberate — folding both into one store would force a single
 * `includeWords` answer for data fetched under two different contracts, which is
 * exactly the blank-text failure `corpusServes` was written to prevent.
 *
 * Pure module: no React, no DOM, no fetching. The hook that fills it lives in
 * `hooks/use-quran-library-hydration.ts`.
 */

/** The chapter count of the Quran, and so the sweep's finish line. */
export const QURAN_CHAPTER_COUNT = 114

/**
 * Chapters per request.
 *
 * The endpoint rejects spans wider than 20, and the first chapters are by far
 * the longest, so batching by ten keeps any single response modest and lets
 * search coverage grow in visible steps instead of one long stall.
 */
export const LIBRARY_BATCH_SIZE = 10

/** Identifies a library by the languages it holds, so a language change invalidates it. */
export type LibraryKey = string

export interface Library {
  key: LibraryKey
  langs: string[]
  byVk: Map<string, VerseData>
  /** Chapter titles by chapter number, for the `tm` title-match flag. */
  titles: Map<number, Record<string, string>>
  /** Chapters fully merged so far. */
  chapters: Set<number>
  /**
   * The search index, grown in place as batches land.
   *
   * Deliberately shared across library versions rather than rebuilt with each
   * one: tokenizing ~6,300 verses is main-thread work, and a rebuild per batch
   * would pay it twelve times over. The library object is still replaced on
   * every merge so `libraryVersion` stays a usable memo key.
   */
  index: IncrementalLocalIndex
  /** Bumped on every merge so consumers can memoize on a scalar. */
  version: number
  /** True once every chapter has been merged. */
  complete: boolean
}

export function libraryKey(langs: string[]): LibraryKey {
  return [...langs].sort().join(',')
}

export function createLibrary(langs: string[]): Library {
  return {
    key: libraryKey(langs),
    langs,
    byVk: new Map(),
    titles: new Map(),
    chapters: new Set(),
    index: createLocalIndex(),
    version: 0,
    complete: false,
  }
}

/** The inclusive chapter spans a full sweep is made of, in load order. */
export function libraryBatches(): Array<{ start: number; end: number }> {
  const batches: Array<{ start: number; end: number }> = []
  for (let start = 1; start <= QURAN_CHAPTER_COUNT; start += LIBRARY_BATCH_SIZE) {
    batches.push({ start, end: Math.min(start + LIBRARY_BATCH_SIZE - 1, QURAN_CHAPTER_COUNT) })
  }
  return batches
}

/** The batches still missing at least one chapter, so a resumed sweep skips work. */
export function pendingBatches(library: Library): Array<{ start: number; end: number }> {
  return libraryBatches().filter((batch) => {
    for (let chapter = batch.start; chapter <= batch.end; chapter++) {
      if (!library.chapters.has(chapter)) return true
    }
    return false
  })
}

/**
 * Folds a fetched span into the library, returning a new library object.
 *
 * `index` is carried over and appended to rather than rebuilt — see the note on
 * the field. Everything else is copied so consumers holding an older version
 * keep seeing what they were given.
 */
export function mergeChapters(library: Library, chapters: ChapterData[]): Library {
  const byVk = new Map(library.byVk)
  const titles = new Map(library.titles)
  const merged = new Set(library.chapters)
  const fresh: VerseData[] = []

  for (const chapter of chapters) {
    const verses = chapter.verses ?? []
    if (verses.length === 0) continue
    for (const verse of verses) {
      if (!verse.vk) continue
      byVk.set(verse.vk, verse)
      fresh.push(verse)
    }
    if (typeof chapter.cn === 'number') {
      merged.add(chapter.cn)
      if (chapter.titles) titles.set(chapter.cn, chapter.titles)
    }
  }

  library.index.add(fresh)

  return {
    ...library,
    byVk,
    titles,
    chapters: merged,
    version: library.version + 1,
    complete: merged.size >= QURAN_CHAPTER_COUNT,
  }
}

/** True when the library can answer a search asking for these languages. */
export function libraryServes(library: Library | null, langs: string[]): boolean {
  if (!library || library.byVk.size === 0) return false
  const held = new Set(library.langs)
  return langs.every((lang) => held.has(lang))
}

/** Chapter titles keyed by number, in the shape `LocalSearchOptions.titles` wants. */
export function libraryTitles(library: Library): Record<number, string> {
  const out: Record<number, string> = {}
  for (const [chapter, titles] of library.titles) {
    const title = titles[library.langs[0] ?? 'en'] ?? Object.values(titles)[0]
    if (title) out[chapter] = title
  }
  return out
}

// ─── Gating ──────────────────────────────────────────────────────────────────

export type LibraryDecision =
  /** Sweep the whole book in the background. */
  | 'sweep'
  /** Do not sweep. */
  | 'skip'

export interface LibraryHydrationInput {
  /** navigator.connection.saveData */
  saveData: boolean
  /** navigator.deviceMemory, in GB. Undefined when unreported. */
  deviceMemoryGb?: number
  online: boolean
  /** Offline bundles already cover every requested language. */
  bundlesInstalled: boolean
}

/**
 * Whether to pull the whole Quran into memory behind the reader.
 *
 * Translations only, so the sweep is a few hundred kilobytes gzipped across a
 * dozen idle-scheduled requests — the same order as the images already on the
 * page, and an order of magnitude below the word-by-word payload the chapter
 * corpus can carry. The gates below are the same ones `decideHydration` applies,
 * minus the verse-count caps, which only ever bit on the word payload.
 */
export function decideLibraryHydration(input: LibraryHydrationInput): LibraryDecision {
  // Installed bundles already answer for the whole Quran through FTS5 in a
  // worker, which is strictly better than holding it on the heap.
  if (input.bundlesInstalled) return 'skip'
  if (!input.online) return 'skip'
  // An explicit request to conserve data outranks the feature.
  if (input.saveData) return 'skip'
  // Holding ~6,300 verses in two languages is real memory; leave small devices
  // on the chapter corpus, which is a two-hundredth of the size.
  if (input.deviceMemoryGb !== undefined && input.deviceMemoryGb < 4) return 'skip'
  return 'sweep'
}
