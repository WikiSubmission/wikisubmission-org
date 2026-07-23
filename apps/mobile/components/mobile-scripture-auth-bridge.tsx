'use client'

import { useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { ScriptureAuthProvider } from '@/lib/scripture-auth-context'
import { useMobileAuth } from '@/components/mobile-auth-context'

/**
 * Mobile adapter for the shared scripture-auth context. Feeds the reader tree
 * its sign-in signal from the native MobileAuthProvider and routes sign-in
 * prompts to the Profile tab (where the native sign-in lives), so shared reader
 * components stay free of any platform auth dependency.
 */
export function MobileScriptureAuthBridge({
  children,
}: {
  children: React.ReactNode
}) {
  const { isAuthenticated } = useMobileAuth()
  const router = useRouter()

  const value = useMemo(
    () => ({ isSignedIn: isAuthenticated, promptSignIn: () => router.push('/me') }),
    [isAuthenticated, router]
  )

  return <ScriptureAuthProvider value={value}>{children}</ScriptureAuthProvider>
}
