/**
 * Builds links to free-form Quran queries: verse references, ranges and lists
 * such as "2:255", "2:1-5" or "1:1,2:255".
 *
 * The web app serves any `/quran/<query>` path from its catch-all route. The
 * desktop app is a static export with one page per chapter, so it cannot serve
 * arbitrary paths and registers a resolver that sends these queries to its
 * search page instead. Plain chapter links (`/quran/<n>?verse=<v>`) exist on
 * both and do not go through here.
 */
export type QuranPathResolver = (segment: string) => string

const webResolver: QuranPathResolver = (segment) => `/quran/${segment}`

let resolver: QuranPathResolver = webResolver

export function setQuranPathResolver(next: QuranPathResolver): void {
  resolver = next
}

/**
 * Href for `/quran/<segment>` on the current platform. `segment` is passed
 * exactly as the web URL used it (encoded or not), so the web result is
 * unchanged.
 */
export function quranPathHref(segment: string): string {
  return resolver(segment)
}

/**
 * Where a text search from the Quran search bar goes. The web app keeps the
 * reader on the current path and adds `?q=`, which its catch-all page turns
 * into search results. The desktop app sends it to its search page, so chapter
 * pages never have to watch the query string.
 */
export type QuranSearchResolver = (pathname: string, params: URLSearchParams) => string

let searchResolver: QuranSearchResolver = (pathname, params) => `${pathname}?${params.toString()}`

export function setQuranSearchResolver(next: QuranSearchResolver): void {
  searchResolver = next
}

export function quranSearchTarget(pathname: string, params: URLSearchParams): string {
  return searchResolver(pathname, params)
}
