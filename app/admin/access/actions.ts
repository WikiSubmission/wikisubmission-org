'use server'

import { auth } from '@/auth'
import { adminUsersClient, AdminUsersError, type AdminUser } from '@/lib/admin-users-client'

export type AccessResult<T> = { ok: true; data: T } | { ok: false; error: string }

async function client() {
  const session = await auth()
  if (!session?.accessToken) return { error: 'not_authenticated' as const }
  if (!session.isAdmin) return { error: 'not_authorized' as const }
  return { client: adminUsersClient(session.accessToken) }
}

function describe(err: unknown): string {
  if (err === 'not_authenticated') return 'Your session expired. Please sign in again.'
  if (err === 'not_authorized') return 'Admin access required.'
  if (err instanceof AdminUsersError) {
    switch (err.status) {
      case 401:
        return 'Your session expired. Please sign in again.'
      case 403:
        return 'Admin access required.'
      case 404:
        return 'User not found.'
      default:
        return err.serverMessage || 'Request failed.'
    }
  }
  return 'Unexpected error.'
}

export async function setGamesEditorAction(
  userId: number,
  grant: boolean,
): Promise<AccessResult<AdminUser>> {
  const r = await client()
  if ('error' in r) return { ok: false, error: describe(r.error) }
  try {
    // Send the full permissions object; the backend writes it as-is.
    const updated = await r.client.update(userId, { permissions: { games_editor: grant } })
    return { ok: true, data: updated }
  } catch (err) {
    return { ok: false, error: describe(err) }
  }
}

export async function setRoleAction(
  userId: number,
  role: 'admin' | 'editor' | 'member',
): Promise<AccessResult<AdminUser>> {
  const r = await client()
  if ('error' in r) return { ok: false, error: describe(r.error) }
  try {
    const updated = await r.client.update(userId, { role })
    return { ok: true, data: updated }
  } catch (err) {
    return { ok: false, error: describe(err) }
  }
}
