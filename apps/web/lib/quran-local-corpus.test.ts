import { describe, expect, it } from 'vitest'
import {
  corpusCovers,
  corpusKey,
  corpusServes,
  corpusVerses,
  corpusWindow,
  createCorpus,
  decideHydration,
  mergeIntoCorpus,
  type HydrationInput,
} from '@/lib/quran-local-corpus'
import type { components } from '@/src/api/types.gen'

type VerseData = components['schemas']['VerseData']

const verses = (chapter: number, from: number, to: number): VerseData[] =>
  Array.from({ length: to - from + 1 }, (_, i) => ({ vk: `${chapter}:${from + i}` }))

const SHAPE = { langs: ['en', 'ar'], includeWords: false }

describe('corpusKey', () => {
  it('changes with the chapter, the languages, and the word flag', () => {
    const base = corpusKey(2, SHAPE)
    expect(corpusKey(3, SHAPE)).not.toBe(base)
    expect(corpusKey(2, { ...SHAPE, langs: ['en'] })).not.toBe(base)
    expect(corpusKey(2, { ...SHAPE, includeWords: true })).not.toBe(base)
  })

  it('is stable regardless of language order', () => {
    expect(corpusKey(2, { langs: ['ar', 'en'], includeWords: false })).toBe(
      corpusKey(2, { langs: ['en', 'ar'], includeWords: false }),
    )
  })
})

describe('createCorpus', () => {
  it('records the verse range and marks completeness against the expected count', () => {
    const corpus = createCorpus(2, SHAPE, verses(2, 1, 10), {}, { expected: 10 })
    expect(corpus.firstVerse).toBe(1)
    expect(corpus.lastVerse).toBe(10)
    expect(corpus.byVk.size).toBe(10)
    expect(corpus.complete).toBe(true)
  })

  it('is incomplete when fewer verses arrived than expected', () => {
    expect(createCorpus(2, SHAPE, verses(2, 1, 10), {}, { expected: 286 }).complete).toBe(false)
  })

  /**
   * Guards the trap the reader's own `reachedEnd` falls into: a full-chapter
   * response is longer than a page, so `length < PAGE_SIZE` would call it
   * incomplete. Completeness must come from the expected count.
   */
  it('calls a 286-verse chapter complete, unlike a page-size predicate would', () => {
    const corpus = createCorpus(2, SHAPE, verses(2, 1, 286), {}, { expected: 286 })
    expect(corpus.complete).toBe(true)
    expect(corpus.byVk.size).toBeGreaterThan(50)
  })

  it('is never complete when the expected count is unknown', () => {
    expect(createCorpus(2, SHAPE, verses(2, 1, 10), {}).complete).toBe(false)
  })

  it('handles verse 0, the Basmallah', () => {
    const corpus = createCorpus(2, SHAPE, verses(2, 0, 5), {}, { expected: 6 })
    expect(corpus.firstVerse).toBe(0)
    expect(corpusCovers(corpus, 2, 0, 0)).toBe(true)
  })

  it('tolerates an empty verse list', () => {
    const corpus = createCorpus(2, SHAPE, [], {})
    expect(corpus.byVk.size).toBe(0)
    expect(corpus.firstVerse).toBe(0)
    expect(corpus.lastVerse).toBe(0)
  })

  it('carries hasWords from the shape, so a text-only corpus is identifiable', () => {
    expect(createCorpus(2, SHAPE, [], {}).hasWords).toBe(false)
    expect(createCorpus(2, { ...SHAPE, includeWords: true }, [], {}).hasWords).toBe(true)
  })
})

describe('corpusCovers', () => {
  const corpus = createCorpus(2, SHAPE, verses(2, 10, 20), {}, { expected: 286 })

  it('is true only for a fully held range', () => {
    expect(corpusCovers(corpus, 2, 10, 20)).toBe(true)
    expect(corpusCovers(corpus, 2, 12, 15)).toBe(true)
    expect(corpusCovers(corpus, 2, 9, 20)).toBe(false)
    expect(corpusCovers(corpus, 2, 10, 21)).toBe(false)
  })

  it('is false for a different chapter or a null corpus', () => {
    expect(corpusCovers(corpus, 3, 10, 20)).toBe(false)
    expect(corpusCovers(null, 2, 10, 20)).toBe(false)
  })

  it('is false for an inverted range rather than vacuously true', () => {
    expect(corpusCovers(corpus, 2, 20, 10)).toBe(false)
  })

  it('detects a hole in the middle', () => {
    const holed = createCorpus(2, SHAPE, [...verses(2, 1, 5), ...verses(2, 8, 10)], {})
    expect(corpusCovers(holed, 2, 1, 5)).toBe(true)
    expect(corpusCovers(holed, 2, 1, 10)).toBe(false)
  })
})

describe('corpusServes', () => {
  const corpus = createCorpus(2, { langs: ['en', 'ar'], includeWords: true }, verses(2, 1, 5), {})

  it('serves a request for the languages it holds', () => {
    expect(corpusServes(corpus, 2, { langs: ['en'], includeWords: false })).toBe(true)
    expect(corpusServes(corpus, 2, { langs: ['en', 'ar'], includeWords: true })).toBe(true)
  })

  /**
   * The case that renders blank text rather than failing loudly: switching the
   * primary translation must refetch, not reuse a corpus without that language.
   */
  it('refuses a language it does not hold', () => {
    expect(corpusServes(corpus, 2, { langs: ['fr'], includeWords: false })).toBe(false)
    expect(corpusServes(corpus, 2, { langs: ['en', 'fr'], includeWords: false })).toBe(false)
  })

  it('refuses a word-by-word request against a text-only corpus', () => {
    const textOnly = createCorpus(2, { langs: ['en'], includeWords: false }, verses(2, 1, 5), {})
    expect(corpusServes(textOnly, 2, { langs: ['en'], includeWords: true })).toBe(false)
    expect(corpusServes(textOnly, 2, { langs: ['en'], includeWords: false })).toBe(true)
  })

  it('refuses another chapter or a null corpus', () => {
    expect(corpusServes(corpus, 3, { langs: ['en'], includeWords: false })).toBe(false)
    expect(corpusServes(null, 2, { langs: ['en'], includeWords: false })).toBe(false)
  })
})

describe('corpusWindow and corpusVerses', () => {
  it('returns the range in verse order', () => {
    const corpus = createCorpus(2, SHAPE, verses(2, 1, 10), {})
    expect(corpusWindow(corpus, 3, 6).map((v) => v.vk)).toEqual(['2:3', '2:4', '2:5', '2:6'])
  })

  it('skips missing verses rather than emitting gaps', () => {
    const holed = createCorpus(2, SHAPE, [...verses(2, 1, 2), ...verses(2, 5, 6)], {})
    expect(corpusWindow(holed, 1, 6).map((v) => v.vk)).toEqual(['2:1', '2:2', '2:5', '2:6'])
  })

  it('sorts everything numerically, not lexicographically', () => {
    // Inserted out of order, and 10 must not sort before 9.
    const corpus = createCorpus(2, SHAPE, [{ vk: '2:10' }, { vk: '2:9' }, { vk: '2:1' }], {})
    expect(corpusVerses(corpus).map((v) => v.vk)).toEqual(['2:1', '2:9', '2:10'])
  })
})

describe('mergeIntoCorpus', () => {
  it('adds verses, extends the range, and bumps the version', () => {
    const first = createCorpus(2, SHAPE, verses(2, 1, 50), {}, { expected: 286 })
    const merged = mergeIntoCorpus(first, verses(2, 51, 100))
    expect(merged.byVk.size).toBe(100)
    expect(merged.lastVerse).toBe(100)
    expect(merged.version).toBe(first.version + 1)
    expect(merged.complete).toBe(false)
  })

  it('becomes complete once the expected count is reached', () => {
    const first = createCorpus(2, SHAPE, verses(2, 1, 5), {}, { expected: 10 })
    expect(mergeIntoCorpus(first, verses(2, 6, 10)).complete).toBe(true)
  })

  it('does not mutate the corpus it merges into', () => {
    const first = createCorpus(2, SHAPE, verses(2, 1, 5), {}, { expected: 286 })
    mergeIntoCorpus(first, verses(2, 6, 10))
    expect(first.byVk.size).toBe(5)
    expect(first.lastVerse).toBe(5)
  })

  it('dedupes on the verse key, keeping the newer copy', () => {
    const first = createCorpus(2, SHAPE, [{ vk: '2:1', vi: 1 }], {})
    const merged = mergeIntoCorpus(first, [{ vk: '2:1', vi: 99 }])
    expect(merged.byVk.size).toBe(1)
    expect(merged.byVk.get('2:1')?.vi).toBe(99)
  })
})

describe('decideHydration', () => {
  const input = (overrides: Partial<HydrationInput> = {}): HydrationInput => ({
    verseCount: 286,
    includeWords: true,
    saveData: false,
    online: true,
    bundlesInstalled: false,
    ...overrides,
  })

  it('always hydrates fully from installed bundles, even offline or on saveData', () => {
    expect(decideHydration(input({ bundlesInstalled: true }))).toBe('full')
    expect(decideHydration(input({ bundlesInstalled: true, online: false }))).toBe('full')
    expect(decideHydration(input({ bundlesInstalled: true, saveData: true }))).toBe('full')
  })

  it('skips when offline with nothing installed', () => {
    expect(decideHydration(input({ online: false }))).toBe('skip')
  })

  it('honours saveData, allowing only short chapters as text', () => {
    expect(decideHydration(input({ saveData: true, verseCount: 7 }))).toBe('text-only')
    expect(decideHydration(input({ saveData: true, verseCount: 286 }))).toBe('skip')
  })

  it('drops the word payload on a low-memory device for a long chapter', () => {
    expect(decideHydration(input({ deviceMemoryGb: 2 }))).toBe('text-only')
    // Short chapters are cheap enough to keep whole.
    expect(decideHydration(input({ deviceMemoryGb: 2, verseCount: 7 }))).toBe('full')
    // Without words there is no heavy payload to drop.
    expect(decideHydration(input({ deviceMemoryGb: 2, includeWords: false }))).toBe('full')
  })

  it('hydrates fully on a capable device', () => {
    expect(decideHydration(input({ deviceMemoryGb: 8 }))).toBe('full')
    expect(decideHydration(input())).toBe('full')
  })

  it('treats unreported memory as capable rather than assuming the worst', () => {
    expect(decideHydration(input({ deviceMemoryGb: undefined }))).toBe('full')
  })
})
