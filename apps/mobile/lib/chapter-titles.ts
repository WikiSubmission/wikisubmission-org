import { resolveBrowserApiBaseUrl } from '@/src/api/base-url'
import { CHAPTER_TITLES_EN } from '@/lib/quran-titles-en'
import { DEFAULT_LOCALE, type Locale } from '@/constants/locales'

/**
 * Localized chapter titles for the mobile chapter index.
 *
 * The bundled CHAPTER_TITLES_EN table is what makes the index work on a first
 * cold launch with no network, so it stays the base layer. On top of it, this
 * module fetches `GET /chapters?lang=<code>` once per locale and caches the
 * result in localStorage — the same fetch/cache/bundled-fallback shape as
 * lib/zikr.ts, including the synchronous read, because the index renders before
 * any effect has run.
 *
 * Coverage is a backend property, not a UI one. `GET /languages` lists no
 * Kurdish code at all (requests 400), and `de` silently returns the English
 * titles because the backend holds no German ones. Those locales therefore stay
 * on the bundled table; only ar, fr and tr have real translated titles today.
 * TRANSLATED_TITLE_LOCALES records that, so a locale is never asked for data
 * that cannot exist.
 */

/** UI locales the backend actually has chapter titles for. */
const TRANSLATED_TITLE_LOCALES: ReadonlySet<Locale> = new Set<Locale>(['ar', 'fr', 'tr'])

const CACHE_PREFIX = 'ws.chapterTitles.v1.'
const FETCH_TIMEOUT_MS = 10_000
/** Refetch after this long; chapter titles are effectively static content. */
const CACHE_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000

export type ChapterTitles = Record<number, string>

interface TitlesCache {
  fetchedAt: number
  titles: ChapterTitles
}

interface ChapterMetadata {
  chapter_number?: number
  title?: string
}

function cacheKey(locale: Locale): string {
  return `${CACHE_PREFIX}${locale}`
}

/** True when the backend can serve titles for this locale at all. */
export function hasTranslatedTitles(locale: Locale): boolean {
  return locale !== DEFAULT_LOCALE && TRANSLATED_TITLE_LOCALES.has(locale)
}

export async function fetchChapterTitles(
  locale: Locale,
  signal?: AbortSignal,
): Promise<ChapterTitles> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS)
  signal?.addEventListener('abort', () => controller.abort(), { once: true })
  try {
    const response = await fetch(
      `${resolveBrowserApiBaseUrl()}/chapters?lang=${encodeURIComponent(locale)}`,
      { signal: controller.signal },
    )
    if (!response.ok) throw new Error(`/chapters returned ${response.status}`)
    const json = (await response.json()) as unknown
    const rows: ChapterMetadata[] = Array.isArray(json)
      ? (json as ChapterMetadata[])
      : ((json as { data?: ChapterMetadata[] })?.data ?? [])
    const titles: ChapterTitles = {}
    for (const row of rows) {
      if (typeof row?.chapter_number === 'number' && typeof row.title === 'string' && row.title) {
        titles[row.chapter_number] = row.title
      }
    }
    if (Object.keys(titles).length === 0) throw new Error('/chapters returned no titles')
    return titles
  } finally {
    clearTimeout(timeout)
  }
}

export function writeCachedChapterTitles(locale: Locale, titles: ChapterTitles): void {
  if (typeof window === 'undefined' || Object.keys(titles).length === 0) return
  try {
    window.localStorage.setItem(
      cacheKey(locale),
      JSON.stringify({ fetchedAt: Date.now(), titles } satisfies TitlesCache),
    )
  } catch {
    // Storage full or blocked: the bundled English table still renders.
  }
}

/** Synchronous: the cached titles for a locale, or null. */
export function readCachedChapterTitles(locale: Locale): ChapterTitles | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(cacheKey(locale))
    if (!raw) return null
    const parsed = JSON.parse(raw) as TitlesCache
    if (typeof parsed?.fetchedAt !== 'number') return null
    if (Date.now() - parsed.fetchedAt > CACHE_MAX_AGE_MS) return null
    const titles = parsed.titles
    return titles && Object.keys(titles).length > 0 ? titles : null
  } catch {
    return null
  }
}

/**
 * Merge translated titles over the bundled English table, so a chapter the
 * backend has no title for still renders rather than showing a blank row.
 */
export function mergeWithBundled(titles: ChapterTitles | null | undefined): ChapterTitles {
  if (!titles) return CHAPTER_TITLES_EN
  return { ...CHAPTER_TITLES_EN, ...titles }
}
