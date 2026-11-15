import fs from 'node:fs'
import path from 'node:path'

/**
 * Maps a request path to a file in the static export (`out/`). Shared by the
 * dev host and the Electron protocol handler so both serve the app the same
 * way. Pure apart from file-existence checks, so it is unit tested.
 */
export type StaticResolution =
  | { kind: 'file'; file: string; contentType: string }
  | { kind: 'redirect'; location: string }
  | { kind: 'not-found'; file: string | null }

const CONTENT_TYPES: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.map': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.otf': 'font/otf',
  '.mp3': 'audio/mpeg',
  '.wasm': 'application/wasm',
}

export function contentTypeFor(file: string): string {
  return CONTENT_TYPES[path.extname(file).toLowerCase()] ?? 'application/octet-stream'
}

function isFile(p: string): boolean {
  try {
    return fs.statSync(p).isFile()
  } catch {
    return false
  }
}

function isDir(p: string): boolean {
  try {
    return fs.statSync(p).isDirectory()
  } catch {
    return false
  }
}

/**
 * Next's client asks for per-segment prefetch payloads with dotted names
 * (`__next.quran.$d$chapter.__PAGE__.txt`), but the static export writes them
 * as nested folders (`__next.quran/$d$chapter/__PAGE__.txt`). Map the request
 * onto the file that exists, or return null.
 */
function segmentPayloadFile(target: string): string | null {
  const m = /^__next\.(.+)\.txt$/.exec(path.basename(target))
  if (!m) return null
  const [first, ...rest] = m[1].split('.')
  if (rest.length === 0) return null
  const nested = path.join(path.dirname(target), `__next.${first}`, ...rest) + '.txt'
  return isFile(nested) ? nested : null
}

/** The page that renders verse references, ranges, lists and text search. */
export const QURAN_SEARCH_PATH = '/quran/search/'

/**
 * Resolve `pathname` (already URL-decoded is not assumed; it is decoded here)
 * against `outDir`. `search` is the raw query string including "?", kept on
 * trailing-slash redirects.
 */
export function resolveStatic(outDir: string, pathname: string, search = ''): StaticResolution {
  const notFoundFile = path.join(outDir, '404.html')
  const notFound: StaticResolution = { kind: 'not-found', file: isFile(notFoundFile) ? notFoundFile : null }

  let decoded: string
  try {
    decoded = decodeURIComponent(pathname)
  } catch {
    return notFound
  }
  if (decoded.includes('\0')) return notFound

  // Normalize and refuse anything that escapes outDir.
  const root = path.resolve(outDir)
  const target = path.resolve(root, '.' + path.posix.normalize('/' + decoded))
  if (target !== root && !target.startsWith(root + path.sep)) return notFound

  if (decoded.endsWith('/')) {
    const index = path.join(target, 'index.html')
    if (isFile(index)) return { kind: 'file', file: index, contentType: contentTypeFor(index) }
  } else if (isFile(target)) {
    return { kind: 'file', file: target, contentType: contentTypeFor(target) }
  } else if (segmentPayloadFile(target)) {
    const file = segmentPayloadFile(target)!
    return { kind: 'file', file, contentType: contentTypeFor(file) }
  } else if (isDir(target) && isFile(path.join(target, 'index.html'))) {
    // The export uses trailing slashes; send folders to their canonical URL.
    return { kind: 'redirect', location: pathname + '/' + search }
  }

  // A free-form Quran query such as /quran/2:255 or /quran/mercy. The web app
  // serves these from a catch-all route; the export has a page per chapter
  // only, so send the query to the search page. RSC payload requests (with a
  // file extension) are left to 404, and Next then falls back to a full page
  // load, which lands here.
  // The word lab keeps /quran/words/<root> in the address bar as you browse,
  // so a reload asks for it.
  const word = /^\/quran\/words\/([^/]+)\/?$/.exec(decoded)
  if (word && !path.extname(word[1])) {
    return { kind: 'redirect', location: '/quran/words/?root=' + encodeURIComponent(word[1]) }
  }

  const m = /^\/quran\/([^/]+)\/?$/.exec(decoded)
  if (m && !path.extname(m[1]) && m[1] !== 'search') {
    return { kind: 'redirect', location: QURAN_SEARCH_PATH + '?q=' + encodeURIComponent(m[1]) }
  }

  return notFound
}
