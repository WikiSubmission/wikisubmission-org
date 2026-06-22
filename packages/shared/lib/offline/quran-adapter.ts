import type { components } from '@/src/api/types.gen'
import type { OfflineContentStore } from './content-store'

type VerseData = components['schemas']['VerseData']

// Languages written right-to-left among the Quran translations. Bundles do not
// store direction per row (it is a language property), so it is derived here —
// matching the backend's `d` field on each translation.
const RTL_LANGS = new Set(['ar', 'ur', 'fa', 'ac'])

function direction(lang: string): 'ltr' | 'rtl' {
  return RTL_LANGS.has(lang) ? 'rtl' : 'ltr'
}

export interface OfflineRange {
  chapter: number
  verseStart?: number
  verseEnd?: number
}

export interface OfflineVersesResult {
  verses: VerseData[]
  titles: Record<string, string>
}

/**
 * Build a network-shaped verse window (VerseData[] + chapter titles) entirely
 * from installed offline bundles, merging one bundle per language into each
 * verse's `tr` map. Returns null when any requested language is not installed —
 * the caller then falls back to the network. The first language acts as the
 * spine that fixes verse order.
 */
export async function offlineQuranVerses(
  store: OfflineContentStore,
  langs: string[],
  range: OfflineRange,
): Promise<OfflineVersesResult | null> {
  if (langs.length === 0) return null

  const installed = new Set((await store.installedBundles()).map((b) => b.id))
  for (const lang of langs) {
    if (!installed.has(`quran-${lang}`)) return null
  }

  const perLang = await Promise.all(
    langs.map(async (lang) => ({ lang, rows: await store.getVerses('quran', lang, range) })),
  )

  const spine = perLang[0]
  if (!spine || spine.rows.length === 0) return null

  const byLang = new Map(
    perLang.map(({ lang, rows }) => [lang, new Map(rows.map((r) => [r.vk, r]))]),
  )

  const verses: VerseData[] = spine.rows.map((spineRow) => {
    const tr: NonNullable<VerseData['tr']> = {}
    for (const lang of langs) {
      const row = byLang.get(lang)?.get(spineRow.vk)
      if (!row) continue
      tr[lang] = {
        lc: lang,
        d: direction(lang),
        tx: row.text,
        s: row.subtitle ?? null,
        f: row.footnote ?? null,
      }
    }
    return { vi: spineRow.vn - 1, vk: spineRow.vk, tr }
  })

  const titleEntries = await Promise.all(
    langs.map(
      async (lang) => [lang, await store.getChapterTitle('quran', lang, range.chapter)] as const,
    ),
  )
  const titles: Record<string, string> = {}
  for (const [lang, title] of titleEntries) {
    if (title) titles[lang] = title
  }

  return { verses, titles }
}
