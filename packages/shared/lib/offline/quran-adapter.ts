import type { components } from '@/src/api/types.gen'
import type { OfflineContentStore } from './content-store'
import type { WordRow } from './types'

type VerseData = components['schemas']['VerseData']
type WordData = components['schemas']['WordData']
type QuranResponse = components['schemas']['QuranResponse']
type ChapterData = components['schemas']['ChapterData']
type TranslationContent = components['schemas']['TranslationContent']

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

/** Word-by-word options for offlineQuranVerses. `lang` selects the words
 * bundle (`quran-words-${lang}`); the bundle itself carries every word
 * language the display needs (Arabic, target, transliteration). */
export interface OfflineWordsOpts {
  lang: string
  includeRoot?: boolean
  includeMeaning?: boolean
}

export interface OfflineVersesResult {
  verses: VerseData[]
  titles: Record<string, string>
  /** True when the word-by-word breakdown was attached from a words bundle. */
  hasWords: boolean
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
  words?: OfflineWordsOpts,
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

  // Word-by-word: attached only when the words bundle for the requested
  // language is installed; its absence never fails the verse read.
  let hasWords = false
  if (words && installed.has(`quran-words-${words.lang}`)) {
    const wordRows = await store.getWords('quran', words.lang, range)
    if (wordRows.length > 0) {
      attachWords(verses, wordRows, words)
      hasWords = true
    }
  }

  const titleEntries = await Promise.all(
    langs.map(
      async (lang) => [lang, await store.getChapterTitle('quran', lang, range.chapter)] as const,
    ),
  )
  const titles: Record<string, string> = {}
  for (const [lang, title] of titleEntries) {
    if (title) titles[lang] = title
  }

  return { verses, titles, hasWords }
}

/**
 * Rebuild the API's per-verse `w` arrays from flat word rows, mirroring the
 * backend's attachWordsToVerses: one WordData per (verse, word_index) whose
 * `tx` merges every language's text; `r` only when includeRoot (roots ride on
 * Arabic rows); `m` only when includeMeaning (meanings ride on translation
 * rows).
 */
function attachWords(verses: VerseData[], wordRows: WordRow[], opts: OfflineWordsOpts): void {
  const byVk = new Map<string, Map<number, WordData>>()
  for (const row of wordRows) {
    const vk = `${row.cn}:${row.vn}`
    let words = byVk.get(vk)
    if (!words) {
      words = new Map()
      byVk.set(vk, words)
    }
    let word = words.get(row.wi)
    if (!word) {
      word = { wi: row.wi, gi: row.gi, tx: {} }
      words.set(row.wi, word)
    }
    ;(word.tx as Record<string, string>)[row.lang] = row.text
    if (opts.includeRoot && row.root != null && word.r == null) word.r = row.root
    if (opts.includeMeaning && row.meaning != null) word.m = row.meaning
  }

  for (const verse of verses) {
    const words = verse.vk ? byVk.get(verse.vk) : undefined
    if (!words) continue
    verse.w = [...words.values()].sort((a, b) => (a.wi ?? 0) - (b.wi ?? 0))
  }
}

/**
 * Offline full-text search across installed bundles, assembled into the same
 * QuranResponse shape the network /search returns so result-search.tsx needs no
 * changes. Each hit contributes its language's text + highlighted snippet to the
 * verse's `tr` map; `sc` is derived from the FTS rank (more-negative is better)
 * so the UI's descending-score sort surfaces the strongest matches first.
 *
 * Returns null when no requested language is installed (caller keeps the network
 * error); returns an empty result when bundles are present but nothing matched.
 * Single page in v1 (no offset paging).
 */
export async function offlineQuranSearch(
  store: OfflineContentStore,
  langs: string[],
  query: string,
  opts: { limit?: number } = {},
): Promise<QuranResponse | null> {
  const trimmed = query.trim()
  if (trimmed.length < 2) return null

  const installed = new Set((await store.installedBundles()).map((b) => b.id))
  const available = langs.filter((lang) => installed.has(`quran-${lang}`))
  if (available.length === 0) return null

  const rows = await store.search('quran', available, trimmed, { limit: opts.limit ?? 50 })
  if (rows.length === 0) {
    return { info: { result_count: 0, total: 0 }, chapters: [] }
  }

  const verseByVk = new Map<string, VerseData>()
  const cnByVk = new Map<string, number>()
  const order: string[] = []

  for (const row of rows) {
    let verse = verseByVk.get(row.vk)
    if (!verse) {
      verse = { vi: row.vn - 1, vk: row.vk, sc: 0, tr: {} }
      verseByVk.set(row.vk, verse)
      cnByVk.set(row.vk, row.cn)
      order.push(row.vk)
    }
    const score = -(row.rank ?? 0)
    if (score > (verse.sc ?? 0)) verse.sc = score
    const tr = verse.tr as Record<string, TranslationContent>
    tr[row.lang] = {
      lc: row.lang,
      d: direction(row.lang),
      tx: row.text,
      hl: row.hl ?? null,
    }
  }

  const chapters: ChapterData[] = []
  const chapterIndex = new Map<number, number>()
  for (const vk of order) {
    const cn = cnByVk.get(vk) as number
    let idx = chapterIndex.get(cn)
    if (idx === undefined) {
      idx = chapters.length
      chapterIndex.set(cn, idx)
      chapters.push({ cn, titles: {}, verses: [] })
    }
    chapters[idx].verses!.push(verseByVk.get(vk) as VerseData)
  }

  return {
    info: { result_count: order.length, total: order.length },
    chapters,
  }
}
