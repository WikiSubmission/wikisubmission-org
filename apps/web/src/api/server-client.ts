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
import { resolveServerApiBaseUrl } from './base-url'

const baseUrl = resolveServerApiBaseUrl()
const internalAuthToken = process.env.INTERNAL_API_TOKEN

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
