import { setAccessTokenProvider } from '@/src/api/client'
import { loadSession } from './mobile-auth-storage'

// In-memory mirror of the active access token, kept fresh by MobileAuthProvider
// (on sign-in, refresh, and sign-out). Tri-state: a string is a live token,
// null means "resolved: signed out", undefined means the provider has not
// hydrated yet. The distinction matters because the signed-out state must be
// cached — falling through to loadSession() on every request costs a native
// Preferences bridge roundtrip per API call (noticeable during reader
// load-more bursts).
let currentAccessToken: string | null | undefined

export function setMobileAccessToken(token: string | undefined): void {
  currentAccessToken = token ?? null
}

/**
 * Registers the mobile platform's bearer-token source for the shared browser
 * API client. Prefers the in-memory token; only on a cold start (before the
 * provider has hydrated) does it fall back to the persisted session. This is
 * the native counterpart to apps/web/lib/register-api-auth.ts.
 */
export function registerMobileApiAuth(): void {
  setAccessTokenProvider(async () => {
    if (currentAccessToken !== undefined) return currentAccessToken ?? undefined
    const session = await loadSession()
    return session?.accessToken ?? undefined
  })
}
