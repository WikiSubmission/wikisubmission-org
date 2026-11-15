import { setQuranPathResolver, setQuranSearchResolver } from '@/lib/quran-links'

/** The desktop route that renders verse lists and text search for `?q=`. */
export const QURAN_SEARCH_PATH = '/quran/search/'

export function quranSearchHref(query: string): string {
  return `${QURAN_SEARCH_PATH}?q=${encodeURIComponent(query)}`
}

function decodeSegment(segment: string): string {
  try {
    return decodeURIComponent(segment)
  } catch {
    // Not percent-encoded (a bare "%" in text): use it as typed.
    return segment
  }
}

/**
 * Point free-form `/quran/<query>` links at the search page, since the static
 * export only has a page per chapter. A bare chapter number still goes to its
 * own page.
 */
export function registerDesktopLinks(): void {
  setQuranPathResolver((segment) => {
    const query = decodeSegment(segment)
    if (/^\d{1,3}$/.test(query)) {
      const n = Number(query)
      if (n >= 1 && n <= 114) return `/quran/${n}/`
    }
    return quranSearchHref(query)
  })
  // Text searches from the search bar always land on the search page, so a
  // chapter page never has to subscribe to the query string.
  setQuranSearchResolver((_pathname, params) => `${QURAN_SEARCH_PATH}?${params.toString()}`)
}
