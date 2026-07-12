import { resolveBrowserApiBaseUrl } from '@/src/api/base-url'
import type { MobileAuthUser, StoredSession } from './mobile-auth-storage'

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

/** Maps a wire response to the persisted session shape (absolute expiry). */
export function toStoredSession(res: MobileAuthResponse): StoredSession {
  return {
    accessToken: res.access_token,
    refreshToken: res.refresh_token,
    expiresAt: Date.now() + res.expires_in * 1000,
    user: res.user,
  }
}

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

// Wire-level response from POST /auth/mobile/otp/request. otp_token is opaque
// to the client — it is held in memory and presented back to verify.
interface MobileOTPRequestResponse {
  otp_token: string
}

/**
 * Requests an email one-time code. The backend emails a 6-digit code and returns
 * an opaque token binding that code; hand the token back to verifyEmailOtp along
 * with the code the user enters. Mirrors the web send-otp flow, but stateless in
 * the response body rather than an httpOnly cookie (mobile has no cookie jar).
 */
export async function requestEmailOtp(email: string): Promise<string> {
  const res = await postJson<MobileOTPRequestResponse>('/auth/mobile/otp/request', {
    email,
  })
  return res.otp_token
}

/** Verifies an emailed code against its pending token, returning a session. */
export function verifyEmailOtp(
  otpToken: string,
  code: string,
): Promise<MobileAuthResponse> {
  return postJson<MobileAuthResponse>('/auth/mobile/otp/verify', {
    otp_token: otpToken,
    code,
  })
}
