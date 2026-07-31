/**
 * Fetches the current user's coarse access flags from ws-backend so the session
 * can carry isAdmin / isEditor without a round-trip on every request. Called
 * from the next-auth jwt callback right after the backend token is minted, so
 * the token bakes in the flags for the life of its 55-minute refresh window.
 *
 * BECAUSE THEY ARE BAKED IN, THESE FLAGS GO STALE for up to 55 minutes after an
 * admin changes someone's grants. They are therefore only used for cheap nav
 * gating (showing or hiding a menu entry). Any page or server action that
 * actually gates access must resolve a fresh snapshot per request via
 * getEditorialSession() and the predicates in lib/editorial-access.ts.
 *
 * The backend middleware is the real security boundary either way.
 */

import createClient from 'openapi-fetch'
import { resolveServerApiBaseUrl } from '@/src/api/base-url'
import type { paths } from '@/src/api/types.gen'
import { hasAnyGameAccess, hasEditorWorkspaceAccess } from '@/lib/editorial-access'

const API_BASE = resolveServerApiBaseUrl()

export interface UserAccess {
  isAdmin: boolean
  /** Can reach at least one games studio under /admin/games. */
  isEditor: boolean
  /** Can reach at least one content workspace under /editor. */
  isEditorialEditor: boolean
}

const DENY_ALL: UserAccess = { isAdmin: false, isEditor: false, isEditorialEditor: false }

function makeAuthedFetch(token: string) {
  return async (request: Request): Promise<Response> => {
    const headers = new Headers(request.headers)
    headers.set('Authorization', `Bearer ${token}`)
    return globalThis.fetch(
      new Request(request, {
        headers,
        cache: 'no-store',
      }),
    )
  }
}

export async function fetchUserAccess(token: string): Promise<UserAccess> {
  if (!API_BASE || !token) return DENY_ALL
  try {
    const client = createClient<paths>({
      baseUrl: API_BASE,
      fetch: makeAuthedFetch(token),
    })

    // /editorial/session resolves the grant tables server-side. It replaced a
    // read of users.permissions.games_editor, which no longer drives access
    // (games moved to per-game grants in backend migration 027).
    const { data, error, response } = await client.GET('/editorial/session')

    // 403 means the caller holds no grants at all — not an error, just a member.
    if (error || !response.ok || !data?.data) return DENY_ALL

    const editorial = data.data
    return {
      isAdmin: editorial.is_admin,
      isEditor: hasAnyGameAccess(editorial),
      isEditorialEditor: hasEditorWorkspaceAccess(editorial),
    }
  } catch {
    return DENY_ALL
  }
}
