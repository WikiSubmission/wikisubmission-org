/**
 * Which deployed site the code is running on, not which build it came from.
 *
 * Staging (preview.wikisubmission.org) and production (wikisubmission.org) are
 * both `next build` output running with NODE_ENV=production, so NODE_ENV only
 * separates local dev from "some deployment". Anything that should be loud on
 * staging and silent in production has to key off this instead.
 *
 * NEXT_PUBLIC_SITE_ENV is the explicit switch. It is optional on purpose: with
 * it unset the hostname decides, so existing deployments behave correctly
 * without touching their environment config.
 */
export type SiteEnv = 'development' | 'staging' | 'production'

/** Every hostname that serves the real production site. */
const PRODUCTION_HOSTS = new Set([
  'wikisubmission.org',
  'www.wikisubmission.org',
])

function isSiteEnv(value: string | undefined): value is SiteEnv {
  return (
    value === 'development' || value === 'staging' || value === 'production'
  )
}

function currentHost(): string | null {
  if (typeof window !== 'undefined') return window.location.hostname
  // There is no location on the server; NEXT_PUBLIC_APP_URL is the deployment's
  // own origin, which is the closest equivalent.
  const appUrl = process.env.NEXT_PUBLIC_APP_URL
  if (!appUrl) return null
  try {
    return new URL(appUrl).hostname
  } catch {
    return null
  }
}

export function getSiteEnv(): SiteEnv {
  const explicit = process.env.NEXT_PUBLIC_SITE_ENV?.trim().toLowerCase()
  if (isSiteEnv(explicit)) return explicit

  if (process.env.NODE_ENV !== 'production') return 'development'

  const host = currentHost()
  // An unresolvable host counts as production. The cost of guessing wrong the
  // other way is debug noise leaking to real visitors, which is the thing this
  // exists to prevent.
  if (host === null) return 'production'
  return PRODUCTION_HOSTS.has(host) ? 'production' : 'staging'
}

/**
 * True on local dev and on staging, false on production. Guard for diagnostics
 * that help while testing a release but must never reach real visitors.
 */
export function isDebugSite(): boolean {
  return getSiteEnv() !== 'production'
}
