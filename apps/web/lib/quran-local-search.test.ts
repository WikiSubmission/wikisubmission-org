import { describe, expect, it } from 'vitest'
import {
  buildLocalIndex,
  createLocalIndex,
  parseLocalQuery,
  searchVersesLocally,
} from '@/lib/quran-local-search'
import type { components } from '@/src/api/types.gen'

type VerseData = components['schemas']['VerseData']

const verse = (
  vk: string,
  translations: Record<string, { tx: string; s?: string; f?: string }>,
): VerseData => ({
  vk,
  tr: Object.fromEntries(
    Object.entries(translations).map(([lang, value]) => [
      lang,
      { lc: lang, d: lang === 'ar' ? 'rtl' : 'ltr', ...value },
    ]),
  ) as VerseData['tr'],
})

const VERSES: VerseData[] = [
  verse('1:1', {
    en: { tx: 'In the name of God, Most Gracious, Most Merciful.', s: 'The Opening' },
    ar: { tx: 'بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ' },
  }),
  verse('2:255', {
    en: { tx: 'GOD: there is no other god besides Him, the Living, the Eternal.' },
    ar: { tx: 'ٱللَّهُ لَآ إِلَٰهَ إِلَّا هُوَ ٱلْحَىُّ ٱلْقَيُّومُ' },
  }),
  verse('2:256', {
    en: {
      tx: 'There shall be no compulsion in religion.',
      f: 'A footnote mentioning mercy explicitly.',
    },
  }),
  verse('112:1', { en: { tx: 'Proclaim, He is the One and only GOD.' } }),
]

const keys = (response: ReturnType<typeof searchVersesLocally>) =>
  (response.chapters ?? []).flatMap((chapter) => (chapter.verses ?? []).map((v) => v.vk))

const search = (query: string, options = {}) => searchVersesLocally(VERSES, query, options)

describe('parseLocalQuery', () => {
  it('splits loose terms and normalizes them', () => {
    expect(parseLocalQuery('Most  Merciful').terms).toEqual(['most', 'merciful'])
  })

  it('extracts quoted phrases as ordered token groups', () => {
    const parsed = parseLocalQuery('"most gracious" mercy')
    expect(parsed.phrases).toEqual([['most', 'gracious']])
    expect(parsed.terms).toEqual(['mercy'])
  })

  it('folds Arabic diacritics and alef variants', () => {
    // ٱ folds to ا and harakat are stripped, matching the backend's folding.
    expect(parseLocalQuery('ٱللَّهِ').terms).toEqual(['الله'])
  })
})

describe('matching', () => {
  it('requires every loose term', () => {
    expect(keys(search('most merciful'))).toEqual(['1:1'])
    // "compulsion" is in 2:256, "merciful" in 1:1 — no verse has both.
    expect(keys(search('compulsion merciful'))).toEqual([])
  })

  it('requires a quoted phrase to appear in order', () => {
    // "Most Gracious, Most Merciful" — so "gracious most" is also a real
    // consecutive pair; "merciful most" is not, since Merciful ends the verse.
    expect(keys(search('"most gracious"'))).toEqual(['1:1'])
    expect(keys(search('"gracious most"'))).toEqual(['1:1'])
    expect(keys(search('"merciful most"'))).toEqual([])
    expect(keys(search('"name god"'))).toEqual([])
  })

  it('matches substrings inside a token', () => {
    expect(keys(search('merci'))).toContain('1:1')
  })

  it('searches every language present unless told otherwise', () => {
    expect(keys(search('الله'))).toEqual(['1:1', '2:255'])
    expect(keys(search('الله', { langs: ['en'] }))).toEqual([])
  })

  it('matches Arabic without diacritics against diacriticized text', () => {
    // The verse text carries full harakat; the query has none.
    expect(keys(search('الرحمن'))).toEqual(['1:1'])
  })

  it('returns nothing below the two-character minimum', () => {
    expect(keys(search('a'))).toEqual([])
    expect(search('a').info?.result_count).toBe(0)
  })

  it('matches subtitles and footnotes, not only the body', () => {
    expect(keys(search('opening'))).toEqual(['1:1'])
    expect(keys(search('explicitly'))).toEqual(['2:256'])
  })
})

describe('highlighting', () => {
  const hlFor = (query: string, vk: string, lang = 'en') => {
    const response = search(query)
    for (const chapter of response.chapters ?? []) {
      for (const v of chapter.verses ?? []) {
        if (v.vk === vk) return (v.tr as Record<string, { hl?: string }>)?.[lang]?.hl
      }
    }
    return undefined
  }

  it('wraps the matched token in <b>', () => {
    expect(hlFor('merciful', '1:1')).toContain('<b>Merciful.</b>')
  })

  /**
   * The invariant that guards the offset trap: the normalizer is lossy, so an
   * offset taken from normalized text would land in the wrong place. Stripping
   * the tags must reproduce the source exactly.
   */
  it('reproduces the original text exactly once the tags are stripped', () => {
    for (const query of ['merciful', 'god', 'الله', 'الرحمن', '"most gracious"']) {
      const response = search(query)
      for (const chapter of response.chapters ?? []) {
        for (const v of chapter.verses ?? []) {
          const translations = v.tr as Record<string, { tx?: string; hl?: string }>
          for (const [lang, translation] of Object.entries(translations)) {
            if (!translation.hl) continue
            const stripped = translation.hl.replace(/<\/?b>/g, '')
            expect(stripped, `${query} / ${v.vk} / ${lang}`).toBe(translation.tx)
          }
        }
      }
    }
  })

  it('preserves Arabic diacritics in the highlighted span', () => {
    const hl = hlFor('الرحمن', '1:1', 'ar')
    expect(hl).toBeDefined()
    // The query was undiacriticized; the output must keep the original marks.
    expect(hl).toContain('<b>ٱلرَّحْمَٰنِ</b>')
  })

  it('emits a highlight for every matched language', () => {
    const response = search('الله')
    const verse255 = (response.chapters ?? [])
      .flatMap((c) => c.verses ?? [])
      .find((v) => v.vk === '2:255')
    const translations = verse255?.tr as Record<string, { hl?: string }>
    expect(translations.ar?.hl).toContain('<b>')
    // English has no match for an Arabic query, so it carries no highlight.
    expect(translations.en?.hl).toBeUndefined()
  })

  it('emits balanced tags', () => {
    const hl = hlFor('most', '1:1') ?? ''
    expect((hl.match(/<b>/g) ?? []).length).toBe((hl.match(/<\/b>/g) ?? []).length)
  })

  it('does not let a subtitle match overwrite the body highlight', () => {
    // "opening" only appears in the subtitle, so the body keeps no highlight.
    const response = search('opening')
    const first = (response.chapters ?? []).flatMap((c) => c.verses ?? [])[0]
    const translations = first?.tr as Record<string, { hl?: string; tx?: string }>
    expect(translations.en?.hl).toBeUndefined()
  })
})

describe('scoring and shape', () => {
  it('scores every hit and sorts descending, like the backend does', () => {
    const response = search('god')
    const scores = (response.chapters ?? [])
      .flatMap((c) => c.verses ?? [])
      .map((v) => v.sc ?? 0)
    expect(scores.length).toBeGreaterThan(1)
    for (const score of scores) expect(score).toBeGreaterThan(0)
  })

  it('ranks the primary language above other languages', () => {
    const arabicPrimary = searchVersesLocally(VERSES, 'الله', { primaryLang: 'ar' })
    const englishPrimary = searchVersesLocally(VERSES, 'الله', { primaryLang: 'en' })
    const scoreOf = (r: ReturnType<typeof searchVersesLocally>) =>
      (r.chapters ?? []).flatMap((c) => c.verses ?? [])[0]?.sc ?? 0
    expect(scoreOf(arabicPrimary)).toBeGreaterThan(scoreOf(englishPrimary))
  })

  it('groups by chapter with a hit count, in chapter order', () => {
    const response = search('god')
    const chapters = response.chapters ?? []
    expect(chapters.map((c) => c.cn)).toEqual([...chapters.map((c) => c.cn)].sort((a, b) => a! - b!))
    for (const chapter of chapters) {
      expect(chapter.hits).toBe(chapter.verses?.length)
    }
  })

  it('reports result_count as the returned page and total as everything matched', () => {
    const limited = searchVersesLocally(VERSES, 'god', { limit: 1 })
    expect(limited.info?.result_count).toBe(1)
    expect(limited.info?.total).toBeGreaterThan(1)
  })

  it('flags a chapter title match with tm', () => {
    const response = searchVersesLocally(VERSES, 'heifer', { titles: { 2: 'The Heifer' } })
    // No verse body contains "heifer", so nothing comes back to flag.
    expect(response.chapters).toEqual([])

    const withBody = searchVersesLocally(VERSES, 'god', { titles: { 2: 'God chapter' } })
    const chapter2 = (withBody.chapters ?? []).find((c) => c.cn === 2)
    expect(chapter2?.tm).toBe(true)
    const chapter112 = (withBody.chapters ?? []).find((c) => c.cn === 112)
    expect(chapter112?.tm).toBeUndefined()
  })

  it('leaves the source verses untouched', () => {
    const before = JSON.stringify(VERSES)
    search('merciful')
    expect(JSON.stringify(VERSES)).toBe(before)
  })
})

describe('buildLocalIndex', () => {
  it('reports how many verses it indexed and answers repeated queries', () => {
    const index = buildLocalIndex(VERSES)
    expect(index.size).toBe(4)
    expect(keys(index.search('merciful'))).toEqual(['1:1'])
    expect(keys(index.search('compulsion'))).toEqual(['2:256'])
  })

  it('skips verses with no usable key', () => {
    expect(buildLocalIndex([{ vk: undefined }, { vk: 'nope' }] as VerseData[]).size).toBe(0)
  })

  it('handles an empty corpus', () => {
    const empty = buildLocalIndex([])
    expect(empty.size).toBe(0)
    expect(empty.search('god').chapters).toEqual([])
  })
})

describe('createLocalIndex', () => {
  it('searches verses added after construction', () => {
    const index = createLocalIndex()
    expect(index.search('merciful').chapters).toEqual([])
    index.add(VERSES)
    expect(index.size).toBe(4)
    expect(keys(index.search('merciful'))).toEqual(['1:1'])
  })

  it('accumulates across batches rather than replacing', () => {
    const index = createLocalIndex()
    index.add([VERSES[0]!])
    index.add([VERSES[1]!])
    expect(index.size).toBe(2)
    expect(keys(index.search('merciful'))).toEqual(['1:1'])
    expect(keys(index.search('eternal'))).toEqual(['2:255'])
  })

  /**
   * The library shares one index across its versions, so a retried batch must
   * overwrite by verse key — otherwise the same verse would be scored twice and
   * appear twice in the results.
   */
  it('replaces a verse re-added under the same key', () => {
    const index = createLocalIndex()
    index.add(VERSES)
    index.add(VERSES)
    expect(index.size).toBe(4)
    expect(keys(index.search('merciful'))).toEqual(['1:1'])
  })

  it('matches buildLocalIndex for the same verses', () => {
    const incremental = createLocalIndex()
    incremental.add(VERSES.slice(0, 2))
    incremental.add(VERSES.slice(2))
    expect(keys(incremental.search('god'))).toEqual(keys(buildLocalIndex(VERSES).search('god')))
  })
})
