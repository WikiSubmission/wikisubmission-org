/**
 * Server-side API client for use in Server Components only.
 *
 * Uses INTERNAL_API_URL when available to avoid
 * going through the public internet for server-to-server calls.
 * Falls back to NEXT_PUBLIC_API_URL for local development.
 *
 * Never import this in Client Components — INTERNAL_API_URL is not exposed
 * to the browser and the import will fail at runtime.
 */
import createClient from 'openapi-fetch'
import type { paths } from './types.gen'

const baseUrl = process.env.INTERNAL_API_URL ?? process.env.NEXT_PUBLIC_API_URL
const internalAuthToken = process.env.INTERNAL_API_TOKEN

// Most scripture metadata changes rarely — cache those server-side responses
// for 24h.
// Next.js data cache is separate from the page cache, so this works even
// with force-dynamic pages. Music and community content can change through
// admin tools, so those requests bypass the data cache.
//
// X-Internal-Auth, when configured, lets the SSR container bypass the
// backend's per-IP rate limit — without it, all SSR traffic shares one
// IP bucket and trips 429s under load.
const dynamicPrefixes = ['/music/', '/communities']

function isDynamicApiPath(url: RequestInfo | URL) {
  const raw =
    typeof url === 'string' ? url : url instanceof URL ? url.href : url.url
  const pathname = new URL(raw, 'http://local').pathname
  return dynamicPrefixes.some((prefix) => pathname.includes(prefix))
}

const cachedFetch: typeof globalThis.fetch = (url, init) => {
  const cacheOptions = isDynamicApiPath(url)
    ? { cache: 'no-store' as const }
    : { next: { revalidate: 86400 } }

  return globalThis.fetch(url, {
    ...init,
    headers: {
      ...(init?.headers as Record<string, string> | undefined),
      ...(internalAuthToken ? { 'X-Internal-Auth': internalAuthToken } : {}),
    },
    ...cacheOptions,
  } as RequestInit)
}

export const wsApiServer = createClient<paths>({ baseUrl, fetch: cachedFetch })
