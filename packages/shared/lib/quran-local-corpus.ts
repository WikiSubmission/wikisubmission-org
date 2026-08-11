import type { components } from '@/src/api/types.gen'

type VerseData = components['schemas']['VerseData']

/**
 * An in-memory copy of a whole chapter, held beside the reader's render state.
 *
 * The reader keeps a growing window of verses to render; this keeps the whole
 * chapter so the search bar can filter it and so a load-more or a minimap seek
 * can be answered from memory instead of the network. Rendering stays
 * virtualized either way — the corpus holds data, never components.
 *
 * Pure module: no React, no DOM, no fetching. The hook that fills it lives in
 * `hooks/use-chapter-hydration.ts`.
 */

/** Identifies a corpus by what it contains, so a preference change invalidates it. */
export type CorpusKey = string

/** The parts of the reader's options that change what a fetch returns. */
export interface CorpusShape {
  langs: string[]
  includeWords: boolean
}

export interface Corpus {
  key: CorpusKey
  chapter: number
  langs: string[]
  /** false when hydrated in the degraded text-only mode; gates word-by-word reads. */
  hasWords: boolean
  byVk: Map<string, VerseData>
  titles: Record<string, string>
  firstVerse: number
  lastVerse: number
  /** Verse count from the nav store, or 0 when unknown. */
  expected: number
  complete: boolean
  /** Bumped on every merge so consumers can memoize on a scalar. */
  version: number
}

export function corpusKey(chapter: number, shape: CorpusShape): CorpusKey {
  return `${chapter}|${[...shape.langs].sort().join(',')}|${shape.includeWords ? 'w' : 't'}`
}

/** Verse number from a "chapter:verse" key, or null when unparsable. */
function verseNumber(verseKey: string | undefined): number | null {
  if (!verseKey) return null
  const parsed = Number(verseKey.split(':')[1])
  return Number.isFinite(parsed) ? parsed : null
}

export function createCorpus(
  chapter: number,
  shape: CorpusShape,
  verses: VerseData[],
  titles: Record<string, string>,
  options: { expected?: number; lastVerse?: number } = {},
): Corpus {
  const byVk = new Map<string, VerseData>()
  let min = Number.POSITIVE_INFINITY
  let max = Number.NEGATIVE_INFINITY

  for (const verse of verses) {
    if (!verse.vk) continue
    byVk.set(verse.vk, verse)
    const n = verseNumber(verse.vk)
    if (n === null) continue
    if (n < min) min = n
    if (n > max) max = n
  }

  const firstVerse = Number.isFinite(min) ? min : 0
  const lastVerse = options.lastVerse ?? (Number.isFinite(max) ? max : 0)
  const expected = options.expected ?? 0

  return {
    key: corpusKey(chapter, shape),
    chapter,
    langs: shape.langs,
    hasWords: shape.includeWords,
    byVk,
    titles,
    firstVerse,
    lastVerse,
    expected,
    // Completeness comes from the reported range against the known verse count,
    // never from `verses.length < PAGE_SIZE` — a full-chapter response is longer
    // than a page and that predicate would call it incomplete.
    complete: expected > 0 ? byVk.size >= expected : false,
    version: 1,
  }
}

/**
 * True when the corpus can answer a request for these languages and word data.
 *
 * Two ways it can fall short, both of which would render blank text rather than
 * fail loudly: a text-only corpus cannot serve a word-by-word request, and a
 * corpus hydrated for one set of languages cannot serve a request for a language
 * it does not hold — switching the primary translation must refetch, not reuse.
 * Holding *extra* languages is fine.
 */
export function corpusServes(
  corpus: Corpus | null,
  chapter: number,
  shape: CorpusShape,
): boolean {
  if (!corpus || corpus.chapter !== chapter) return false
  if (shape.includeWords && !corpus.hasWords) return false
  const held = new Set(corpus.langs)
  return shape.langs.every((lang) => held.has(lang))
}

/** True when the corpus holds every verse in the inclusive range. */
export function corpusCovers(
  corpus: Corpus | null,
  chapter: number,
  start: number,
  end: number,
): boolean {
  if (!corpus || corpus.chapter !== chapter) return false
  if (end < start) return false
  for (let n = start; n <= end; n++) {
    if (!corpus.byVk.has(`${chapter}:${n}`)) return false
  }
  return true
}

/** The verses in the inclusive range, in verse order. Missing verses are skipped. */
export function corpusWindow(corpus: Corpus, start: number, end: number): VerseData[] {
  const out: VerseData[] = []
  for (let n = start; n <= end; n++) {
    const verse = corpus.byVk.get(`${corpus.chapter}:${n}`)
    if (verse) out.push(verse)
  }
  return out
}

/** Every verse held, in verse order. The haystack for local search. */
export function corpusVerses(corpus: Corpus): VerseData[] {
  return [...corpus.byVk.values()].sort(
    (a, b) => (verseNumber(a.vk) ?? 0) - (verseNumber(b.vk) ?? 0),
  )
}

export function mergeIntoCorpus(
  corpus: Corpus,
  verses: VerseData[],
  titles?: Record<string, string>,
): Corpus {
  const byVk = new Map(corpus.byVk)
  let lastVerse = corpus.lastVerse
  let firstVerse = corpus.firstVerse

  for (const verse of verses) {
    if (!verse.vk) continue
    byVk.set(verse.vk, verse)
    const n = verseNumber(verse.vk)
    if (n === null) continue
    if (n > lastVerse) lastVerse = n
    if (n < firstVerse) firstVerse = n
  }

  return {
    ...corpus,
    byVk,
    titles: titles ?? corpus.titles,
    firstVerse,
    lastVerse,
    complete: corpus.expected > 0 ? byVk.size >= corpus.expected : corpus.complete,
    version: corpus.version + 1,
  }
}

// ─── Gating ──────────────────────────────────────────────────────────────────

export type HydrationDecision =
  /** Fetch the whole chapter with whatever the reader is displaying. */
  | 'full'
  /** Fetch translations only, no word-by-word breakdown. */
  | 'text-only'
  /** Do not hydrate. */
  | 'skip'

export interface HydrationInput {
  verseCount: number
  includeWords: boolean
  /** navigator.connection.saveData */
  saveData: boolean
  /** navigator.deviceMemory, in GB. Undefined when unreported. */
  deviceMemoryGb?: number
  online: boolean
  /** Offline bundles cover every requested language. */
  bundlesInstalled: boolean
}

/**
 * Whether to pull the rest of the chapter into memory, and how much of it.
 *
 * The payload is what drives this. A chapter with word-by-word data and three
 * word languages is a couple of orders of magnitude larger than its text, and
 * only five chapters exceed 175 verses at all, so the caps below only ever bite
 * on the handful of long chapters where the cost is real.
 */
export function decideHydration(input: HydrationInput): HydrationDecision {
  // Reading from installed bundles costs no bytes and runs off the main thread.
  if (input.bundlesInstalled) return 'full'

  // Nothing to hydrate from.
  if (!input.online) return 'skip'

  // An explicit request to conserve data outranks the feature.
  if (input.saveData) return input.verseCount <= 120 ? 'text-only' : 'skip'

  // Low-memory devices still get local search, just without the word payload.
  if (
    input.deviceMemoryGb !== undefined &&
    input.deviceMemoryGb < 4 &&
    input.includeWords &&
    input.verseCount > 120
  ) {
    return 'text-only'
  }

  return 'full'
}

/** Reads the browser's data and memory hints, which are not in the default DOM lib. */
export function readDeviceHints(): { saveData: boolean; deviceMemoryGb?: number; online: boolean } {
  if (typeof navigator === 'undefined') return { saveData: false, online: true }
  const nav = navigator as Navigator & {
    connection?: { saveData?: boolean }
    deviceMemory?: number
  }
  return {
    saveData: nav.connection?.saveData === true,
    deviceMemoryGb: typeof nav.deviceMemory === 'number' ? nav.deviceMemory : undefined,
    // `onLine` false is reliable; true only means "has an interface".
    online: nav.onLine !== false,
  }
}
