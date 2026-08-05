'use client'

import { useMemo } from 'react'
import { useSession } from 'next-auth/react'
import { ScriptureAuthProvider } from '@/lib/scripture-auth-context'
import { useSignInPromptStore } from '@/store/sign-in-prompt'

/**
 * Web adapter for the shared scripture-auth context. Feeds the reader tree its
 * sign-in signal from next-auth and its sign-in prompt from the web store, so
 * shared reader components never import next-auth directly.
 */
export function ScriptureAuthBridge({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession()
  const openSignIn = useSignInPromptStore((s) => s.open)
  const isSignedIn = !!session?.accessToken

  const value = useMemo(
    () => ({ isSignedIn, promptSignIn: openSignIn }),
    [isSignedIn, openSignIn]
  )

  return <ScriptureAuthProvider value={value}>{children}</ScriptureAuthProvider>
}
