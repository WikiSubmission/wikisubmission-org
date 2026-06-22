import { describe, it, expect } from 'vitest'
import { offlineQuranVerses } from '@/lib/offline/quran-adapter'
import type { OfflineContentStore } from '@/lib/offline/content-store'
import type { BundleInfo, VerseRow } from '@/lib/offline/types'

// A fake store backed by in-memory rows, exercising only the methods the
// adapter uses. Keyed by `${scripture}-${lang}`.
function fakeStore(opts: {
  installedIds: string[]
  verses: Record<string, VerseRow[]>
  titles?: Record<string, string>
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
      return opts.verses[`${scripture}-${lang}`] ?? []
    },
    async getChapterTitle(scripture, lang) {
      return opts.titles?.[`${scripture}-${lang}`] ?? null
    },
    async search() {
      return []
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
