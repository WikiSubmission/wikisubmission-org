import { resolveBrowserApiBaseUrl } from '@/src/api/base-url'
import type { MobileAuthUser } from './mobile-auth-storage'

// Wire-level response from POST /auth/mobile/exchange and /auth/mobile/refresh
// (mirror of mobileAuthResponse in api/handlers/auth_mobile.go).
export interface MobileAuthResponse {
  access_token: string
  refresh_token: string
  token_type: string
  expires_in: number
  user: MobileAuthUser
}

export type AuthProvider = 'google' | 'apple'

/** Thrown when the native-auth endpoint returns a non-2xx response. */
export class MobileAuthError extends Error {
  readonly status: number
  constructor(status: number, message: string) {
    super(message)
    this.name = 'MobileAuthError'
    this.status = status
  }
}

async function postJson<T>(path: string, body: unknown): Promise<T> {
  const base = resolveBrowserApiBaseUrl()
  const res = await fetch(`${base}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    let message = `request failed with status ${res.status}`
    try {
      const data = (await res.json()) as { error?: string }
      if (data?.error) message = data.error
    } catch {
      // Non-JSON error body; the status-derived message stands.
    }
    throw new MobileAuthError(res.status, message)
  }

  return (await res.json()) as T
}

/**
 * Exchanges a verified provider ID token for a backend session. The backend
 * verifies the token against the provider JWKS, upserts the user, and mints the
 * same HS256 session token the rest of the API trusts.
 */
export function exchangeIdToken(
  provider: AuthProvider,
  idToken: string,
  nonce?: string,
): Promise<MobileAuthResponse> {
  return postJson<MobileAuthResponse>('/auth/mobile/exchange', {
    provider,
    id_token: idToken,
    nonce: nonce ?? '',
  })
}

/** Rotates an expiring session using the long-lived refresh token. */
export function refreshSession(refreshToken: string): Promise<MobileAuthResponse> {
  return postJson<MobileAuthResponse>('/auth/mobile/refresh', {
    refresh_token: refreshToken,
  })
}
