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

const API_BASE = (
  process.env.INTERNAL_API_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  ''
).replace(/\/+$/, '')

const PERMISSION_GAMES_EDITOR = 'games_editor'

export interface UserAccess {
  isAdmin: boolean
  isEditor: boolean
}

const DENY_ALL: UserAccess = { isAdmin: false, isEditor: false }

interface MeResponse {
  data?: {
    role?: string
    permissions?: Record<string, unknown> | null
    is_active?: boolean
  } | null
}

export async function fetchUserAccess(token: string): Promise<UserAccess> {
  if (!API_BASE || !token) return DENY_ALL
  try {
    const res = await fetch(`${API_BASE}/users/me`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    })
    if (!res.ok) return DENY_ALL
    const body = (await res.json()) as MeResponse
    const user = body.data
    if (!user || user.is_active === false) return DENY_ALL
    const isAdmin = user.role === 'admin'
    const permGranted =
      !!user.permissions && user.permissions[PERMISSION_GAMES_EDITOR] === true
    return { isAdmin, isEditor: isAdmin || permGranted }
  } catch {
    return DENY_ALL
  }
}
