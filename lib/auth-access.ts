/**
 * Fetches the current user's role and permissions from ws-backend so the
 * session can carry isAdmin / isEditor without doing a round-trip on every
 * request. Called from the next-auth jwt callback right after the backend
 * token is minted, so the token bakes in the access flags for the life of
 * its 55-minute refresh window.
 *
 * The backend's RequireEditor middleware is the real security boundary; the
 * flags returned here only drive UI gating.
 */

import createClient from 'openapi-fetch'
import { resolveServerApiBaseUrl } from '@/src/api/base-url'
import type { paths } from '@/src/api/types.gen'

const API_BASE = resolveServerApiBaseUrl()
const PERMISSION_GAMES_EDITOR = 'games_editor'

export interface UserAccess {
  isAdmin: boolean
  isEditor: boolean
}

const DENY_ALL: UserAccess = { isAdmin: false, isEditor: false }

export async function fetchUserAccess(token: string): Promise<UserAccess> {
  if (!API_BASE || !token) return DENY_ALL
  try {
    const client = createClient<paths>({
      baseUrl: API_BASE,
      fetch: (url, init) =>
        globalThis.fetch(url, {
          ...init,
          headers: {
            ...(init?.headers as Record<string, string> | undefined),
            Authorization: `Bearer ${token}`,
          },
          cache: 'no-store',
        } as RequestInit),
    })

    const { data, error, response } = await client.GET('/users/me')
    if (error || !response.ok || !data?.data) return DENY_ALL

    const user = data.data
    if (user.is_active === false) return DENY_ALL

    const isAdmin = user.role === 'admin'
    const permGranted =
      !!user.permissions && user.permissions[PERMISSION_GAMES_EDITOR] === true

    return { isAdmin, isEditor: isAdmin || permGranted }
  } catch {
    return DENY_ALL
  }
}
