import { describe, expect, it } from 'vitest'
import {
  createLibrary,
  decideLibraryHydration,
  libraryBatches,
  libraryKey,
  libraryServes,
  libraryTitles,
  mergeChapters,
  pendingBatches,
  QURAN_CHAPTER_COUNT,
  type LibraryHydrationInput,
} from '@/lib/quran-local-library'
import type { components } from '@/src/api/types.gen'

type ChapterData = components['schemas']['ChapterData']

const chapter = (cn: number, verseCount: number, text = 'word'): ChapterData =>
  ({
    cn,
    titles: { en: `Chapter ${cn}` },
    verses: Array.from({ length: verseCount }, (_, i) => ({
      vk: `${cn}:${i + 1}`,
      tr: { en: { lc: 'en', d: 'ltr', tx: `${text} ${cn} ${i + 1}` } },
    })),
  }) as ChapterData

const span = (start: number, end: number, verseCount = 3): ChapterData[] =>
  Array.from({ length: end - start + 1 }, (_, i) => chapter(start + i, verseCount))

describe('libraryKey', () => {
  it('is stable regardless of language order', () => {
    expect(libraryKey(['ar', 'en'])).toBe(libraryKey(['en', 'ar']))
  })

  it('changes when the language set changes', () => {
    expect(libraryKey(['en'])).not.toBe(libraryKey(['en', 'fr']))
  })
})

describe('libraryBatches', () => {
  it('covers every chapter exactly once, in order', () => {
    const covered = libraryBatches().flatMap((b) =>
      Array.from({ length: b.end - b.start + 1 }, (_, i) => b.start + i),
    )
    expect(covered).toEqual(
      Array.from({ length: QURAN_CHAPTER_COUNT }, (_, i) => i + 1),
    )
  })

  /** The endpoint rejects spans wider than 20 chapters. */
  it('never asks for more than the endpoint allows', () => {
    for (const batch of libraryBatches()) {
      expect(batch.end - batch.start + 1).toBeLessThanOrEqual(20)
    }
  })
})

describe('mergeChapters', () => {
  it('accumulates verses and chapters across batches', () => {
    let library = createLibrary(['en'])
    library = mergeChapters(library, span(1, 10))
    expect(library.chapters.size).toBe(10)
    expect(library.byVk.size).toBe(30)

    library = mergeChapters(library, span(11, 20))
    expect(library.chapters.size).toBe(20)
    expect(library.byVk.size).toBe(60)
    expect(library.version).toBe(2)
  })

  it('is only complete once all 114 chapters are in', () => {
    let library = createLibrary(['en'])
    for (const batch of libraryBatches()) {
      expect(library.complete).toBe(false)
      library = mergeChapters(library, span(batch.start, batch.end))
    }
    expect(library.complete).toBe(true)
    expect(library.chapters.size).toBe(QURAN_CHAPTER_COUNT)
  })

  /**
   * The index is shared across library versions rather than rebuilt, so a
   * re-merged batch must overwrite in place — otherwise a retried request would
   * score every one of its verses twice.
   */
  it('does not double-count a batch that arrives twice', () => {
    let library = createLibrary(['en'])
    library = mergeChapters(library, span(1, 3))
    const size = library.index.size
    library = mergeChapters(library, span(1, 3))
    expect(library.index.size).toBe(size)
    expect(library.byVk.size).toBe(9)
  })

  it('indexes merged verses so search finds them', () => {
    let library = createLibrary(['en'])
    library = mergeChapters(library, [chapter(27, 2, 'hoopoe')])
    const found = library.index.search('hoopoe', { primaryLang: 'en' })
    expect(found.info?.result_count).toBe(2)
    expect(found.chapters?.[0]?.cn).toBe(27)
  })

  it('leaves an older version seeing the chapter set it was given', () => {
    const first = mergeChapters(createLibrary(['en']), span(1, 5))
    const second = mergeChapters(first, span(6, 10))
    expect(first.chapters.size).toBe(5)
    expect(second.chapters.size).toBe(10)
  })
})

describe('pendingBatches', () => {
  it('lists every batch for an empty library', () => {
    expect(pendingBatches(createLibrary(['en']))).toHaveLength(libraryBatches().length)
  })

  it('skips batches already fully merged', () => {
    const library = mergeChapters(createLibrary(['en']), span(1, 10))
    const pending = pendingBatches(library)
    expect(pending).toHaveLength(libraryBatches().length - 1)
    expect(pending[0]?.start).toBe(11)
  })

  /** A partial batch has to be re-requested, or its missing chapters never arrive. */
  it('keeps a batch whose chapters only partly landed', () => {
    const library = mergeChapters(createLibrary(['en']), span(1, 4))
    expect(pendingBatches(library)[0]?.start).toBe(1)
  })
})

describe('libraryServes', () => {
  const library = mergeChapters(createLibrary(['en', 'ar']), span(1, 2))

  it('answers for a language it holds', () => {
    expect(libraryServes(library, ['en'])).toBe(true)
    expect(libraryServes(library, ['en', 'ar'])).toBe(true)
  })

  /**
   * The same rule `corpusServes` enforces: serving a language the store does not
   * hold renders blank text rather than failing loudly.
   */
  it('refuses a language it does not hold', () => {
    expect(libraryServes(library, ['fr'])).toBe(false)
  })

  it('refuses an empty library', () => {
    expect(libraryServes(createLibrary(['en']), ['en'])).toBe(false)
    expect(libraryServes(null, ['en'])).toBe(false)
  })
})

describe('libraryTitles', () => {
  it('keys titles by chapter number in the primary language', () => {
    const library = mergeChapters(createLibrary(['en']), span(1, 2))
    expect(libraryTitles(library)).toEqual({ 1: 'Chapter 1', 2: 'Chapter 2' })
  })
})

describe('decideLibraryHydration', () => {
  const base: LibraryHydrationInput = {
    saveData: false,
    deviceMemoryGb: 8,
    online: true,
    bundlesInstalled: false,
  }

  it('sweeps on a normal connection', () => {
    expect(decideLibraryHydration(base)).toBe('sweep')
  })

  /** Bundles already answer for the whole Quran through FTS5, off the heap. */
  it('skips when offline bundles already cover the languages', () => {
    expect(decideLibraryHydration({ ...base, bundlesInstalled: true })).toBe('skip')
  })

  it('skips when the user asked to conserve data', () => {
    expect(decideLibraryHydration({ ...base, saveData: true })).toBe('skip')
  })

  it('skips on low-memory devices', () => {
    expect(decideLibraryHydration({ ...base, deviceMemoryGb: 2 })).toBe('skip')
  })

  it('sweeps when memory is unreported', () => {
    expect(decideLibraryHydration({ ...base, deviceMemoryGb: undefined })).toBe('sweep')
  })

  it('skips when offline', () => {
    expect(decideLibraryHydration({ ...base, online: false })).toBe('skip')
  })
})
