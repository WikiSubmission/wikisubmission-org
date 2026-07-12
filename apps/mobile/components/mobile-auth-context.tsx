'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react'
import {
  exchangeIdToken,
  refreshSession,
  requestEmailOtp,
  verifyEmailOtp,
  type AuthProvider,
  type MobileAuthResponse,
} from '@/lib/mobile-auth-client'
import { isAppleSignInAvailable } from '@/lib/platform'
import {
  clearSession,
  loadSession,
  saveSession,
  type MobileAuthUser,
  type StoredSession,
} from '@/lib/mobile-auth-storage'
import {
  registerMobileApiAuth,
  setMobileAccessToken,
} from '@/lib/register-api-auth-mobile'
import { nativeSignIn, nativeSignOut } from '@/lib/native-social-login'

// Wire the shared browser API client to the mobile token store. Done at module
// scope so it runs once, before any provider renders (mirrors the web app).
registerMobileApiAuth()

// Refresh a little before the hard expiry so an in-flight request never races
// the deadline.
const REFRESH_SKEW_MS = 60_000

interface MobileAuthContextValue {
  user: MobileAuthUser | null
  isAuthenticated: boolean
  isAdmin: boolean
  isEditor: boolean
  isLoading: boolean
  /** Whether the Sign in with Apple button should be offered (iOS only). */
  appleSignInAvailable: boolean
  signInWithGoogle: () => Promise<void>
  signInWithApple: () => Promise<void>
  /** Emails a one-time code to the address and arms verifyEmailCode. */
  requestEmailCode: (email: string) => Promise<void>
  /** Verifies the code the user entered and signs them in. */
  verifyEmailCode: (code: string) => Promise<void>
  signOut: () => Promise<void>
}

const MobileAuthContext = createContext<MobileAuthContextValue | null>(null)

function toSession(res: MobileAuthResponse): StoredSession {
  return {
    accessToken: res.access_token,
    refreshToken: res.refresh_token,
    expiresAt: Date.now() + res.expires_in * 1000,
    user: res.user,
  }
}

// Maps a stored user to the native provider whose SDK session must be cleared on
// sign-out. Email-OTP users have no native SDK session, so this returns null and
// the native logout is skipped.
function providerOf(user: MobileAuthUser): AuthProvider | null {
  if (user.auth_id.startsWith('apple:')) return 'apple'
  if (user.auth_id.startsWith('google:')) return 'google'
  return null
}

export function MobileAuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<StoredSession | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Persist + publish a freshly minted/rotated session everywhere it is read.
  const adoptSession = useCallback(async (next: StoredSession) => {
    await saveSession(next)
    setMobileAccessToken(next.accessToken)
    setSession(next)
  }, [])

  const dropSession = useCallback(async () => {
    await clearSession()
    setMobileAccessToken(undefined)
    setSession(null)
  }, [])

  // Hydrate from storage on mount, rotating the token if it has expired.
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const stored = await loadSession()
      if (cancelled) return
      if (!stored) {
        // Mark the signed-out state as resolved so the API client stops
        // falling back to a Preferences read on every request.
        setMobileAccessToken(undefined)
        setIsLoading(false)
        return
      }
      if (stored.expiresAt - REFRESH_SKEW_MS > Date.now()) {
        setMobileAccessToken(stored.accessToken)
        setSession(stored)
        setIsLoading(false)
        return
      }
      try {
        const rotated = toSession(await refreshSession(stored.refreshToken))
        if (cancelled) return
        await adoptSession(rotated)
      } catch {
        if (!cancelled) await dropSession()
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [adoptSession, dropSession])

  const signInWith = useCallback(
    async (provider: AuthProvider) => {
      const { idToken, nonce } = await nativeSignIn(provider)
      const res = await exchangeIdToken(provider, idToken, nonce)
      await adoptSession(toSession(res))
    },
    [adoptSession],
  )

  // Holds the opaque pending-OTP token between requestEmailCode and
  // verifyEmailCode. Kept in a ref (not state) so it never triggers a re-render
  // and is not exposed outside this provider.
  const pendingOtpRef = useRef<string | null>(null)

  const requestEmailCode = useCallback(async (email: string) => {
    pendingOtpRef.current = await requestEmailOtp(email)
  }, [])

  const verifyEmailCode = useCallback(
    async (code: string) => {
      const token = pendingOtpRef.current
      if (!token) {
        throw new Error('Request a code before verifying')
      }
      const res = await verifyEmailOtp(token, code)
      pendingOtpRef.current = null
      await adoptSession(toSession(res))
    },
    [adoptSession],
  )

  // Keep the latest user in a ref so signOut can read it without being a dep.
  // Synced in an effect (not during render) so it commits after paint, which
  // is fine here: signOut only reads it from a user-triggered handler.
  const userRef = useRef<MobileAuthUser | null>(null)
  useEffect(() => {
    userRef.current = session?.user ?? null
  }, [session])

  const signOut = useCallback(async () => {
    const current = userRef.current
    const provider = current ? providerOf(current) : null
    if (provider) await nativeSignOut(provider)
    await dropSession()
  }, [dropSession])

  const user = session?.user ?? null
  const value: MobileAuthContextValue = {
    user,
    isAuthenticated: user !== null,
    isAdmin: user?.is_admin ?? false,
    isEditor: user?.is_editor ?? false,
    isLoading,
    appleSignInAvailable: isAppleSignInAvailable(),
    signInWithGoogle: useCallback(() => signInWith('google'), [signInWith]),
    signInWithApple: useCallback(() => signInWith('apple'), [signInWith]),
    requestEmailCode,
    verifyEmailCode,
    signOut,
  }

  return (
    <MobileAuthContext.Provider value={value}>
      {children}
    </MobileAuthContext.Provider>
  )
}

export function useMobileAuth(): MobileAuthContextValue {
  const ctx = useContext(MobileAuthContext)
  if (!ctx) {
    throw new Error('useMobileAuth must be used within MobileAuthProvider')
  }
  return ctx
}
