import { setAccessTokenProvider } from '@/src/api/client'
import { loadSession } from './mobile-auth-storage'

// In-memory mirror of the active access token, kept fresh by MobileAuthProvider
// (on sign-in, refresh, and sign-out). The shared API client reads it on every
// request through the provider registered below.
let currentAccessToken: string | undefined

export function setMobileAccessToken(token: string | undefined): void {
  currentAccessToken = token
}

/**
 * Registers the mobile platform's bearer-token source for the shared browser
 * API client. Prefers the in-memory token; on a cold start (before the provider
 * has hydrated) it falls back to the persisted session in Preferences. This is
 * the native counterpart to apps/web/lib/register-api-auth.ts.
 */
export function registerMobileApiAuth(): void {
  setAccessTokenProvider(async () => {
    if (currentAccessToken) return currentAccessToken
    const session = await loadSession()
    return session?.accessToken ?? undefined
  })
}
