/**
 * Validation for routes carried in notification payloads. Notification taps
 * navigate with router.push, so only known static-export prefixes are allowed
 * through — anything else (external URLs, typos, malicious payloads) is
 * dropped and the tap just opens the app.
 */

/** Static-export route prefixes a notification is allowed to open. */
const ROUTE_WHITELIST = [
  '/',
  '/quran',
  '/appendices',
  '/more',
  '/me',
  '/proclamation',
  '/introduction',
  '/zakat',
]

export function safeRoute(candidate: unknown): string | null {
  if (typeof candidate !== 'string' || !candidate.startsWith('/')) return null
  const normalized = candidate.replace(/\/+$/, '') || '/'
  return ROUTE_WHITELIST.some((prefix) =>
    prefix === '/' ? normalized === '/' : normalized === prefix || normalized.startsWith(`${prefix}/`),
  )
    ? normalized
    : null
}
