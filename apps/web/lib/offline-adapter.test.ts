import { describe, it, expect } from 'vitest'
import { offlineQuranVerses, offlineQuranSearch } from '@/lib/offline/quran-adapter'
import type { OfflineContentStore } from '@/lib/offline/content-store'
import type { BundleInfo, SearchRow, VerseRow } from '@/lib/offline/types'

// A fake store backed by in-memory rows, exercising only the methods the
// adapter uses. Keyed by `${scripture}-${lang}`.
function fakeStore(opts: {
  installedIds: string[]
  verses?: Record<string, VerseRow[]>
  titles?: Record<string, string>
  searchRows?: SearchRow[]
}): OfflineContentStore {
  return {
    async installedBundles() {
      return opts.installedIds.map(
        (id): BundleInfo => ({
          id,
          scripture: 'quran',
          lang: id.split('-')[1] ?? '',
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
    async getVerses(scripture, lang) {
      return opts.verses?.[`${scripture}-${lang}`] ?? []
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
})
