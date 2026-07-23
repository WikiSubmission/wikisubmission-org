import { resolveBrowserApiBaseUrl } from '@/src/api/base-url'
import type { SyncRequest, SyncResponse } from '@/lib/offline/user/types'
import { getMobileAccessToken, refreshMobileSession } from './register-api-auth-mobile'

/**
 * Native SyncTransport: POST the outbox batch to /me/sync with the mobile bearer
 * token. /me/sync is an out-of-contract route, so this uses a raw authenticated
 * fetch rather than openapi-fetch — the native counterpart to
 * apps/web/lib/offline-sync-transport.ts. Tokens come from the shared mobile
 * token manager (expiry-aware, single-flight refresh), and a 401 triggers one
 * rotation + replay since this bodied request is outside the API client's
 * automatic GET-only retry.
 */
async function postSync(token: string, req: SyncRequest): Promise<Response> {
  return fetch(`${resolveBrowserApiBaseUrl()}/me/sync`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(req),
  })
}

export async function mobileSyncTransport(req: SyncRequest): Promise<SyncResponse> {
  const token = await getMobileAccessToken()
  if (!token) throw new Error('not authenticated')

  let res = await postSync(token, req)
  if (res.status === 401) {
    const fresh = await refreshMobileSession()
    if (fresh) res = await postSync(fresh, req)
  }
  if (!res.ok) {
    throw new Error(`sync failed: ${res.status} ${res.statusText}`)
  }
  return (await res.json()) as SyncResponse
}
