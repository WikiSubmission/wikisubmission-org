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
  type AuthProvider,
  type MobileAuthResponse,
} from '@/lib/mobile-auth-client'
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
  signInWithGoogle: () => Promise<void>
  signInWithApple: () => Promise<void>
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

function providerOf(user: MobileAuthUser): AuthProvider {
  return user.auth_id.startsWith('apple:') ? 'apple' : 'google'
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

  // Keep the latest user in a ref so signOut can read it without being a dep.
  const userRef = useRef<MobileAuthUser | null>(null)
  userRef.current = session?.user ?? null

  const signOut = useCallback(async () => {
    const current = userRef.current
    if (current) await nativeSignOut(providerOf(current))
    await dropSession()
  }, [dropSession])

  const user = session?.user ?? null
  const value: MobileAuthContextValue = {
    user,
    isAuthenticated: user !== null,
    isAdmin: user?.is_admin ?? false,
    isEditor: user?.is_editor ?? false,
    isLoading,
    signInWithGoogle: useCallback(() => signInWith('google'), [signInWith]),
    signInWithApple: useCallback(() => signInWith('apple'), [signInWith]),
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
