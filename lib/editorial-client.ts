/**
 * Server-only client for the ws-backend editorial endpoints.
 *
 * Every call carries the caller's backend bearer token (minted in the next-auth
 * jwt callback, exposed as session.accessToken) and runs uncached. The backend
 * re-checks authorization on every request and is the real security boundary;
 * the data returned here only shapes what the editor UI renders.
 *
 * Do not import this from a Client Component. Editorial mutations must go through
 * server actions so the bearer token is never handed to the browser. It is only
 * ever imported from server components and server actions, never the browser.
 */
import createClient from 'openapi-fetch'
import { resolveServerApiBaseUrl } from '@/src/api/base-url'
import type { components, paths } from '@/src/api/types.gen'

export type EditorialSession = components['schemas']['EditorialSession']
export type QuranVersion = components['schemas']['QuranVersion']
export type BibleVersion = components['schemas']['BibleVersion']

const API_BASE = resolveServerApiBaseUrl()

function authedClient(token: string) {
  return createClient<paths>({
    baseUrl: API_BASE,
    fetch: (request: Request): Promise<Response> => {
      const headers = new Headers(request.headers)
      headers.set('Authorization', `Bearer ${token}`)
      return globalThis.fetch(new Request(request, { headers, cache: 'no-store' }))
    },
  })
}

/**
 * Resolves the caller's editorial permission snapshot. Returns null when the
 * backend denies access (403), the token is missing, or the request fails — the
 * caller treats null as "no editorial access" and denies by default.
 */
export async function getEditorialSession(
  token: string | undefined,
): Promise<EditorialSession | null> {
  if (!API_BASE || !token) return null
  try {
    const { data, error, response } = await authedClient(token).GET(
      '/editorial/session',
    )
    if (error || !response.ok || !data?.data) return null
    return data.data
  } catch {
    return null
  }
}

/** Lists the Quran version registry. Returns [] on denial or failure. */
export async function listQuranVersions(
  token: string | undefined,
): Promise<QuranVersion[]> {
  if (!API_BASE || !token) return []
  try {
    const { data, error, response } = await authedClient(token).GET(
      '/editorial/quran-versions',
    )
    if (error || !response.ok || !data?.data) return []
    return data.data
  } catch {
    return []
  }
}

/** Lists the Bible version registry. Returns [] on denial or failure. */
export async function listBibleVersions(
  token: string | undefined,
): Promise<BibleVersion[]> {
  if (!API_BASE || !token) return []
  try {
    const { data, error, response } = await authedClient(token).GET(
      '/editorial/bible-versions',
    )
    if (error || !response.ok || !data?.data) return []
    return data.data
  } catch {
    return []
  }
}
