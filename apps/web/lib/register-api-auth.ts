import { getSession } from 'next-auth/react'
import { setAccessTokenProvider } from '@/src/api/client'

/**
 * Registers the web platform's bearer-token source for the shared browser API
 * client. Backed by next-auth's client-side session. Called once from the
 * client Providers tree; the native app registers its own provider instead.
 */
export function registerWebApiAuth(): void {
  setAccessTokenProvider(async () => {
    const session = await getSession()
    return session?.accessToken ?? undefined
  })
}
