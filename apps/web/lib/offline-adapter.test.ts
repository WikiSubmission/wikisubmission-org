import { describe, it, expect } from 'vitest'
import { offlineQuranVerses, offlineQuranSearch } from '@/lib/offline/quran-adapter'
import type { OfflineContentStore } from '@/lib/offline/content-store'
import type { BundleInfo, SearchRow, VerseRow, WordRow } from '@/lib/offline/types'

// A fake store backed by in-memory rows, exercising only the methods the
// adapter uses. Verses keyed by `${scripture}-${lang}`, words by the words
// bundle language.
function fakeStore(opts: {
  installedIds: string[]
  verses?: Record<string, VerseRow[]>
  words?: Record<string, WordRow[]>
  titles?: Record<string, string>
  searchRows?: SearchRow[]
  // Optional sink: records every (scripture, lang, range) getVerses was called with.
  rangeSink?: Array<{ scripture: string; lang: string; range: unknown }>
}): OfflineContentStore {
  return {
    async installedBundles() {
      return opts.installedIds.map(
        (id): BundleInfo => ({
          id,
          scripture: 'quran',
          lang: id.split('-').pop() ?? '',
          kind: id.includes('-words-') ? 'words' : 'text',
          bytes: 1,
          sha256: 'a'.repeat(64),
          dataVersion: 1,
          schemaVersion: 1,
          normalizationVersion: 1,
          ftsTokenizer: 'trigram',
          installedAt: 0,
        }),
      )
    },
    async getVerses(scripture, lang, range) {
      opts.rangeSink?.push({ scripture, lang, range })
      return opts.verses?.[`${scripture}-${lang}`] ?? []
    },
    async getWords(_scripture, lang) {
      return opts.words?.[lang] ?? []
    },
    async getChapterTitle(scripture, lang) {
      return opts.titles?.[`${scripture}-${lang}`] ?? null
    },
    async search(_scripture, langs) {
      return (opts.searchRows ?? []).filter((r) => langs.includes(r.lang))
    },
    async install() {},
    async remove() {},
  }
}

const enRows: VerseRow[] = [
  { vk: '1:1', cn: 1, vn: 1, text: 'In the name of God…', subtitle: 'The Key', footnote: undefined },
  { vk: '1:2', cn: 1, vn: 2, text: 'Praise be to God…' },
]
const arRows: VerseRow[] = [
  { vk: '1:1', cn: 1, vn: 1, text: 'بسم الله' },
  { vk: '1:2', cn: 1, vn: 2, text: 'الحمد لله' },
]

describe('offlineQuranVerses', () => {
  it('returns null when a requested language is not installed', async () => {
    const store = fakeStore({ installedIds: ['quran-en'], verses: { 'quran-en': enRows } })
    expect(await offlineQuranVerses(store, ['en', 'ar'], { chapter: 1 })).toBeNull()
  })

  it('merges languages into each verse tr map with correct direction and index', async () => {
    const store = fakeStore({
      installedIds: ['quran-en', 'quran-ar'],
      verses: { 'quran-en': enRows, 'quran-ar': arRows },
      titles: { 'quran-en': 'The Key', 'quran-ar': 'الفاتحة' },
    })
    const result = await offlineQuranVerses(store, ['en', 'ar'], { chapter: 1 })
    expect(result).not.toBeNull()
    expect(result!.verses).toHaveLength(2)

    const first = result!.verses[0]
    expect(first.vk).toBe('1:1')
    expect(first.vi).toBe(0) // vn 1 -> 0-based index
    expect(first.tr?.en).toMatchObject({ lc: 'en', d: 'ltr', tx: 'In the name of God…', s: 'The Key' })
    expect(first.tr?.ar).toMatchObject({ lc: 'ar', d: 'rtl', tx: 'بسم الله' })

    expect(result!.titles).toEqual({ en: 'The Key', ar: 'الفاتحة' })
  })

  it('returns null when the spine language has no rows for the range', async () => {
    const store = fakeStore({
      installedIds: ['quran-en'],
      verses: { 'quran-en': [] },
    })
    expect(await offlineQuranVerses(store, ['en'], { chapter: 99 })).toBeNull()
  })

  it('omits a language for verses it lacks rather than failing', async () => {
    // ar missing 1:2 — the spine (en) still drives order; 1:2 has only en.
    const store = fakeStore({
      installedIds: ['quran-en', 'quran-ar'],
      verses: { 'quran-en': enRows, 'quran-ar': [arRows[0]] },
    })
    const result = await offlineQuranVerses(store, ['en', 'ar'], { chapter: 1 })
    expect(result!.verses[1].tr?.ar).toBeUndefined()
    expect(result!.verses[1].tr?.en).toBeDefined()
  })

  // ── Edge cases ─────────────────────────────────────────────────────────────

  it('returns null when no languages are requested', async () => {
    const store = fakeStore({ installedIds: ['quran-en'], verses: { 'quran-en': enRows } })
    expect(await offlineQuranVerses(store, [], { chapter: 1 })).toBeNull()
  })

  it.each(['ur', 'fa', 'ac'])('marks %s as right-to-left', async (lang) => {
    const id = `quran-${lang}`
    const store = fakeStore({
      installedIds: [id],
      verses: { [`quran-${lang}`]: [{ vk: '1:1', cn: 1, vn: 1, text: 'x' }] },
    })
    const result = await offlineQuranVerses(store, [lang], { chapter: 1 })
    expect(result!.verses[0].tr?.[lang]?.d).toBe('rtl')
  })

  // ── Word-by-word ───────────────────────────────────────────────────────────

  const wordRows: WordRow[] = [
    { cn: 1, vn: 1, wi: 0, gi: 1, lang: 'ar', text: 'بِسْمِ', root: 'سمو' },
    { cn: 1, vn: 1, wi: 0, gi: 1, lang: 'en', text: 'In the name', meaning: 'name' },
    { cn: 1, vn: 1, wi: 0, gi: 1, lang: 'tl', text: 'bismi' },
    { cn: 1, vn: 1, wi: 1, gi: 2, lang: 'ar', text: 'ٱللَّهِ', root: 'اله' },
    { cn: 1, vn: 1, wi: 1, gi: 2, lang: 'en', text: 'of GOD' },
  ]

  it('attaches word arrays from the words bundle, merging languages per word', async () => {
    const store = fakeStore({
      installedIds: ['quran-en', 'quran-words-en'],
      verses: { 'quran-en': enRows },
      words: { en: wordRows },
    })
    const result = await offlineQuranVerses(
      store,
      ['en'],
      { chapter: 1 },
      { lang: 'en', includeRoot: true, includeMeaning: true },
    )
    expect(result!.hasWords).toBe(true)

    const w = result!.verses[0].w
    expect(w).toHaveLength(2)
    expect(w![0]).toMatchObject({
      wi: 0,
      gi: 1,
      tx: { ar: 'بِسْمِ', en: 'In the name', tl: 'bismi' },
      r: 'سمو',
      m: 'name',
    })
    expect(w![1]).toMatchObject({ wi: 1, gi: 2, r: 'اله' })
    // 1:2 has no word rows — no w array rather than an empty one.
    expect(result!.verses[1].w).toBeUndefined()
  })

  it('omits root and meaning unless requested', async () => {
    const store = fakeStore({
      installedIds: ['quran-en', 'quran-words-en'],
      verses: { 'quran-en': enRows },
      words: { en: wordRows },
    })
    const result = await offlineQuranVerses(store, ['en'], { chapter: 1 }, { lang: 'en' })
    const w = result!.verses[0].w
    expect(w![0].r).toBeUndefined()
    expect(w![0].m).toBeUndefined()
    expect(w![0].tx).toMatchObject({ ar: 'بِسْمِ' })
  })

  it('serves verses without words when the words bundle is not installed', async () => {
    const store = fakeStore({
      installedIds: ['quran-en'],
      verses: { 'quran-en': enRows },
      words: { en: wordRows },
    })
    const result = await offlineQuranVerses(
      store,
      ['en'],
      { chapter: 1 },
      { lang: 'en', includeRoot: true, includeMeaning: true },
    )
    expect(result).not.toBeNull()
    expect(result!.hasWords).toBe(false)
    expect(result!.verses[0].w).toBeUndefined()
  })

  it('forwards the verse range to the store for each language', async () => {
    const rangeSink: Array<{ scripture: string; lang: string; range: unknown }> = []
    const store = fakeStore({
      installedIds: ['quran-en', 'quran-ar'],
      verses: { 'quran-en': enRows, 'quran-ar': arRows },
      rangeSink,
    })
    const range = { chapter: 2, verseStart: 5, verseEnd: 10 }
    await offlineQuranVerses(store, ['en', 'ar'], range)
    expect(rangeSink).toEqual([
      { scripture: 'quran', lang: 'en', range },
      { scripture: 'quran', lang: 'ar', range },
    ])
  })
})

describe('offlineQuranSearch', () => {
  const hits: SearchRow[] = [
    { vk: '1:1', cn: 1, vn: 1, lang: 'en', text: 'Most Merciful', hl: 'Most <b>Merciful</b>', rank: -2.5 },
    { vk: '76:3', cn: 76, vn: 3, lang: 'en', text: 'mercy or…', hl: '<b>mercy</b>', rank: -1.0 },
  ]

  it('returns null when no requested language is installed', async () => {
    const store = fakeStore({ installedIds: [], searchRows: hits })
    expect(await offlineQuranSearch(store, ['en'], 'mercy')).toBeNull()
  })

  it('returns an empty result when nothing matches but content is installed', async () => {
    const store = fakeStore({ installedIds: ['quran-en'], searchRows: [] })
    const res = await offlineQuranSearch(store, ['en'], 'zzz')
    expect(res?.info?.total).toBe(0)
    expect(res?.chapters).toEqual([])
  })

  it('groups hits into chapters with hl and a rank-derived score', async () => {
    const store = fakeStore({ installedIds: ['quran-en'], searchRows: hits })
    const res = await offlineQuranSearch(store, ['en'], 'mercy')
    expect(res?.info?.total).toBe(2)
    expect(res?.chapters?.map((c) => c.cn)).toEqual([1, 76])

    const v = res!.chapters![0].verses![0]
    expect(v.vk).toBe('1:1')
    expect(v.tr?.en?.hl).toBe('Most <b>Merciful</b>')
    expect(v.sc).toBeCloseTo(2.5) // -rank, so a more-negative rank scores higher
  })

  it('ignores languages the manifest lists but are not installed', async () => {
    // ar requested but not installed -> only en hits searched.
    const store = fakeStore({ installedIds: ['quran-en'], searchRows: hits })
    const res = await offlineQuranSearch(store, ['en', 'ar'], 'mercy')
    expect(res?.info?.total).toBe(2)
  })

  // ── Edge cases ─────────────────────────────────────────────────────────────

  it.each(['', ' ', '\t\n', 'a'])('returns null for a query under two chars (%j)', async (q) => {
    const store = fakeStore({ installedIds: ['quran-en'], searchRows: hits })
    expect(await offlineQuranSearch(store, ['en'], q)).toBeNull()
  })

  it('merges the same verse matched in two languages into one verse with both tr', async () => {
    // 1:1 matches in both en and ar -> one verse, two translations, kept once.
    const bilingual: SearchRow[] = [
      { vk: '1:1', cn: 1, vn: 1, lang: 'en', text: 'Most Merciful', hl: '<b>Merciful</b>', rank: -2.0 },
      { vk: '1:1', cn: 1, vn: 1, lang: 'ar', text: 'الرحيم', hl: '<b>الرحيم</b>', rank: -3.0 },
    ]
    const store = fakeStore({ installedIds: ['quran-en', 'quran-ar'], searchRows: bilingual })
    const res = await offlineQuranSearch(store, ['en', 'ar'], 'mercy')
    expect(res?.info?.total).toBe(1)
    const v = res!.chapters![0].verses![0]
    expect(v.tr?.en?.hl).toBe('<b>Merciful</b>')
    expect(v.tr?.ar?.hl).toBe('<b>الرحيم</b>')
    expect(v.tr?.ar?.d).toBe('rtl')
    // sc is the strongest (most-negative rank) across the two language hits.
    expect(v.sc).toBeCloseTo(3.0)
  })

  it('keeps the strongest score when a verse appears multiple times', async () => {
    const dupes: SearchRow[] = [
      { vk: '2:1', cn: 2, vn: 1, lang: 'en', text: 'first', rank: -0.5 },
      { vk: '2:1', cn: 2, vn: 1, lang: 'en', text: 'first', rank: -4.0 },
    ]
    const store = fakeStore({ installedIds: ['quran-en'], searchRows: dupes })
    const res = await offlineQuranSearch(store, ['en'], 'first')
    expect(res?.info?.total).toBe(1)
    expect(res!.chapters![0].verses![0].sc).toBeCloseTo(4.0)
  })

  it('preserves store hit order across chapters', async () => {
    // The store returns rows already ranked; the adapter must not reorder chapters.
    const ordered: SearchRow[] = [
      { vk: '76:3', cn: 76, vn: 3, lang: 'en', text: 'b', rank: -5.0 },
      { vk: '1:1', cn: 1, vn: 1, lang: 'en', text: 'a', rank: -2.0 },
    ]
    const store = fakeStore({ installedIds: ['quran-en'], searchRows: ordered })
    const res = await offlineQuranSearch(store, ['en'], 'mercy')
    expect(res?.chapters?.map((c) => c.cn)).toEqual([76, 1])
  })
})
