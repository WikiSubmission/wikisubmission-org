/**
 * URL scheme allow-list, shared by the editorial editor (input side) and the
 * public Portable Text renderer (output side).
 *
 * Editors are semi-trusted, but a link/image URL they type is stored and later
 * rendered into an `<a href>` / `<img src>` on public pages. React does not
 * sanitize URL attributes, so a `javascript:` (or `data:`/`vbscript:`) URL
 * would be a stored XSS vector on click. We normalize and reject anything that
 * is not an http(s), mailto, tel, or same-origin relative URL.
 */

// Schemes we consider safe to place in an href/src. Everything with a scheme
// outside this set is rejected.
const SAFE_SCHEMES = new Set(['http:', 'https:', 'mailto:', 'tel:'])

// Matches a leading scheme, e.g. "https:" or "javascript:".
const SCHEME_RE = /^([a-z][a-z0-9+.-]*):/i

// ASCII control characters (0x00-0x1F, 0x7F) and spaces. Browsers ignore these
// mid-scheme, so "java\tscript:alert(1)" must be stripped before sniffing.
const CONTROL_AND_SPACE_RE = /[\u0000-\u0020\u007f]/g

/**
 * Returns the URL if its scheme is safe (or it is a relative / fragment URL),
 * otherwise `undefined`. The accepted string is returned trimmed; callers
 * decide how to treat rejection (omit the attribute, drop the mark…).
 */
export function sanitizeUrl(raw: string | undefined | null): string | undefined {
  if (!raw) return undefined
  // Detection only — the trimmed original is what we return when accepted.
  const probe = raw.replace(CONTROL_AND_SPACE_RE, '')
  if (!probe) return undefined

  const match = SCHEME_RE.exec(probe)
  // No scheme → relative or fragment/query URL (e.g. "/blog/x", "#foot"): safe.
  if (!match) return raw.trim()

  const scheme = `${match[1].toLowerCase()}:`
  return SAFE_SCHEMES.has(scheme) ? raw.trim() : undefined
}
