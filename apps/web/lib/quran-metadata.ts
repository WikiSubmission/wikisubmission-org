import { wsApiServer } from '@/src/api/server-client'
import { contentLangForUiLocale, DEFAULT_CONTENT_LANG } from '@/constants/ui-locales'
import type { components } from '@/src/api/types.gen'

export type Chapter = components['schemas']['Chapter']
export type Appendix = components['schemas']['Appendix']

/**
 * SSR fetch cache TTL for /quran content. Kept short so backend data updates /
 * corrections show up within an hour without a manual purge.
 */
export const QURAN_REVALIDATE_S = 3600

/**
 * Chapter and appendix titles for a reader in a given UI locale.
 *
 * Two rules live here so no call site has to remember either.
 *
 * The UI locale is translated to a content language first. `/chapters` and
 * `/appendices` validate `lang` against the backend's languages table and answer
 * 400 for anything missing from it, and the UI's `ckb` / `kmr` are not in it —
 * sending them raw is what left Kurdish readers with "Something went wrong"
 * instead of a reader.
 *
 * A request that comes back empty-handed then retries in English. Titles are
 * chrome: losing them should cost a reader their localized chapter names, never
 * the page, so every path here resolves to an array — empty at worst — and
 * callers render regardless.
 */
export async function fetchQuranMetadata(
  locale: string,
): Promise<{ chapters: Chapter[]; appendices: Appendix[] }> {
  const [chapters, appendices] = await Promise.all([
    fetchChapters(locale),
    fetchAppendices(locale),
  ])
  return { chapters, appendices }
}

/** Chapter titles for a UI locale, falling back to English then to `[]`. */
export async function fetchChapters(locale: string): Promise<Chapter[]> {
  return withEnglishFallback(locale, (lang) =>
    wsApiServer
      .GET('/chapters', {
        params: { query: { lang } },
        next: { revalidate: QURAN_REVALIDATE_S },
      })
      .then((res) => res.data),
  )
}

/** Appendix titles and snippets for a UI locale, falling back to English then to `[]`. */
export async function fetchAppendices(locale: string): Promise<Appendix[]> {
  return withEnglishFallback(locale, (lang) =>
    wsApiServer
      .GET('/appendices', {
        params: { query: { lang } },
        next: { revalidate: QURAN_REVALIDATE_S },
      })
      .then((res) => res.data),
  )
}

/**
 * Run a metadata fetch for `locale`'s content language, retrying in English if it
 * yields nothing, and swallowing the failure into `[]` if English fails too.
 *
 * An empty array that came back from a *successful* request is left alone: `de`,
 * `fr`, and `tr` legitimately have no appendices seeded, and quietly swapping in
 * English titles there would change what those readers see today.
 */
async function withEnglishFallback<T>(
  locale: string,
  fetchIn: (lang: string) => Promise<T[] | undefined>,
): Promise<T[]> {
  const lang = contentLangForUiLocale(locale)

  const first = await attempt(() => fetchIn(lang))
  if (first) return first

  if (lang !== DEFAULT_CONTENT_LANG) {
    const english = await attempt(() => fetchIn(DEFAULT_CONTENT_LANG))
    if (english) return english
  }

  return []
}

/** Resolve a fetch to its data, or to null on any non-2xx or thrown error. */
async function attempt<T>(fetchOnce: () => Promise<T[] | undefined>): Promise<T[] | null> {
  try {
    return (await fetchOnce()) ?? null
  } catch {
    return null
  }
}
