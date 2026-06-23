import { getSession } from 'next-auth/react'
import { resolveBrowserApiBaseUrl } from '@/src/api/base-url'
import type { SyncRequest, SyncResponse } from '@/lib/offline/user/types'

/**
 * Web SyncTransport: POST the outbox batch to /me/sync with the next-auth bearer
 * token. /me/sync is an out-of-contract route (registered before the OpenAPI
 * validator), so this uses a raw authenticated fetch rather than the typed
 * openapi-fetch client.
 */
export async function webSyncTransport(req: SyncRequest): Promise<SyncResponse> {
  const session = await getSession()
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
