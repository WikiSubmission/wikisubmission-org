'use client'

import { createContext, useContext, type ReactNode } from 'react'

/**
 * Platform-neutral auth signal for the Quran/Bible reader tree.
 *
 * The reader's personalization features (bookmarks, notes, reading progress,
 * preference sync) only need two things from auth: whether a user is signed in,
 * and a way to prompt sign-in. The actual bearer token is attached separately by
 * the shared API client's token provider (see src/api/client.ts), so this
 * context deliberately carries no token.
 *
 * Web backs it with next-auth + the sign-in-prompt store; mobile backs it with
 * the native MobileAuthProvider. Reader components import only useScriptureAuth
 * and stay free of any platform auth dependency.
 */
export interface ScriptureAuthValue {
  isSignedIn: boolean
  promptSignIn: () => void
}

const ScriptureAuthContext = createContext<ScriptureAuthValue>({
  isSignedIn: false,
  promptSignIn: () => {},
})

export function ScriptureAuthProvider({
  value,
  children,
}: {
  value: ScriptureAuthValue
  children: ReactNode
}) {
  return (
    <ScriptureAuthContext.Provider value={value}>
      {children}
    </ScriptureAuthContext.Provider>
  )
}

export function useScriptureAuth(): ScriptureAuthValue {
  return useContext(ScriptureAuthContext)
}
