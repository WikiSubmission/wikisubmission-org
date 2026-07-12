import { setAccessTokenProvider, setAuthRefreshHandler } from '@/src/api/client'
import { MobileAuthError, refreshSession, toStoredSession } from './mobile-auth-client'
import {
  clearSession,
  loadSession,
  saveSession,
  type StoredSession,
} from './mobile-auth-storage'

// Refresh a little before the hard expiry so an in-flight request never races
// the deadline.
const REFRESH_SKEW_MS = 60_000

// In-memory mirror of the active session, kept fresh by MobileAuthProvider
// (on sign-in and sign-out) and by the refresh path below (on rotation).
// Tri-state: a session is signed in, null is "resolved: signed out",
// undefined means nothing has hydrated yet. The signed-out state is cached
// because falling through to loadSession() on every request costs a native
// bridge roundtrip per API call.
let current: StoredSession | null | undefined

// Session lifecycle events for the React layer: rotation happens inside the
// API client (outside React), so the provider subscribes to stay in sync.
interface SessionListeners {
  onRotated?: (session: StoredSession) => void
  onInvalidated?: () => void
}
let listeners: SessionListeners = {}

export function setMobileSession(session: StoredSession | null): void {
  current = session
}

export function setMobileSessionListeners(next: SessionListeners): void {
  listeners = next
}

let refreshInflight: Promise<string | undefined> | null = null

/**
 * Rotates the session using the stored refresh token. Single-flight: a burst
 * of concurrent 401s (or an expiry hit during a reader load-more burst) all
 * await one rotation. A definitive rejection from the backend (401/403 on the
 * refresh token itself) drops the session; transient failures keep it so the
 * next attempt can retry.
 */
export function refreshMobileSession(): Promise<string | undefined> {
  refreshInflight ??= (async () => {
    try {
      const session = current ?? (await loadSession())
      if (!session) return undefined
      try {
        const rotated = toStoredSession(await refreshSession(session.refreshToken))
        current = rotated
        await saveSession(rotated)
        listeners.onRotated?.(rotated)
        return rotated.accessToken
      } catch (error) {
        if (
          error instanceof MobileAuthError &&
          (error.status === 401 || error.status === 403)
        ) {
          current = null
          await clearSession()
          listeners.onInvalidated?.()
        }
        return undefined
      }
    } finally {
      refreshInflight = null
    }
  })()
  return refreshInflight
}

/**
 * The bearer token for the next request: the live token while it is fresh,
 * a proactively rotated one when it is at/near expiry. Falls back to the
 * persisted session on a cold start (before the provider has hydrated).
 */
export async function getMobileAccessToken(): Promise<string | undefined> {
  if (current === undefined) {
    current = (await loadSession()) ?? null
  }
  if (!current) return undefined
  if (current.expiresAt - REFRESH_SKEW_MS > Date.now()) {
    return current.accessToken
  }
  return refreshMobileSession()
}

/**
 * Registers the mobile platform's bearer-token source and 401 recovery for
 * the shared browser API client. The native counterpart to
 * apps/web/lib/register-api-auth.ts.
 */
export function registerMobileApiAuth(): void {
  setAccessTokenProvider(getMobileAccessToken)
  setAuthRefreshHandler(refreshMobileSession)
}
