'use server'

import { revalidatePath } from 'next/cache'

import { auth } from '@/auth'
import { adminUsersClient, AdminUsersError } from '@/lib/admin-users-client'
import {
  replaceEditorGrants,
  type EditorGrantsInput,
} from '@/lib/editorial-content-client'

export type AccessResult = { ok: true } | { ok: false; error: string }

export type AccessRole = 'member' | 'editor' | 'game_editor' | 'admin'

export interface SaveAccessInput {
  userId: number
  roles: AccessRole[]
  grants: EditorGrantsInput
}

function describe(err: unknown): string {
  if (err === 'not_authenticated')
    return 'Your session expired. Please sign in again.'
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

/**
 * Saves one user's access across all three areas.
 *
 * Two backend calls, because roles and grants live in different places: roles
 * are normalized per user, while grants are their own tables behind
 * PUT /editorial/admin/editors/{id} (which replaces them atomically — anything
 * absent from `grants` is revoked).
 *
 * Roles are written first: they are the coarser control, and if the grants write
 * then fails the user is left with the roles the admin chose rather than a
 * half-applied grant set. Both calls are admin-gated server-side.
 *
 * Note this never writes users.permissions. Games access moved to the grant
 * tables (backend migration 027); the old code path here wrote the whole
 * permissions object, which silently dropped any other key on that user.
 */
export async function saveAccessAction(
  input: SaveAccessInput
): Promise<AccessResult> {
  const session = await auth()
  if (!session?.accessToken)
    return { ok: false, error: describe('not_authenticated') }
  if (!session.isAdmin) return { ok: false, error: describe('not_authorized') }

  try {
    await adminUsersClient(session.accessToken).update(input.userId, {
      roles: input.roles,
    })
  } catch (err) {
    return { ok: false, error: describe(err) }
  }

  const result = await replaceEditorGrants(
    session.accessToken,
    input.userId,
    input.grants
  )
  if (!result.ok) return { ok: false, error: result.error }

  revalidatePath('/admin/access')
  return { ok: true }
}
