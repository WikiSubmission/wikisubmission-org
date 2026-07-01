import { resolveBrowserApiBaseUrl } from '@/src/api/base-url'
import type { SyncRequest, SyncResponse } from '@/lib/offline/user/types'
import { loadSession } from './mobile-auth-storage'

/**
 * Native SyncTransport: POST the outbox batch to /me/sync with the mobile bearer
 * token. The token is read from the persisted session (kept current by
 * MobileAuthProvider on sign-in and refresh). /me/sync is an out-of-contract
 * route, so this uses a raw authenticated fetch rather than openapi-fetch — the
 * native counterpart to apps/web/lib/offline-sync-transport.ts.
 */
export async function mobileSyncTransport(req: SyncRequest): Promise<SyncResponse> {
  const session = await loadSession()
  const token = session?.accessToken
  if (!token) throw new Error('not authenticated')

  const res = await fetch(`${resolveBrowserApiBaseUrl()}/me/sync`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(req),
  })
  if (!res.ok) {
    throw new Error(`sync failed: ${res.status} ${res.statusText}`)
  }
  return (await res.json()) as SyncResponse
}
