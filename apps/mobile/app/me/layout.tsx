'use client'

import { useMobileAuth } from '@/components/mobile-auth-context'
import { MobileSignInGate } from '@/components/mobile-sign-in-gate'

// Client auth-gate for the Profile tab. Replaces the web /me layout's
// server-side auth() redirect: signed-out users see the native sign-in, signed-in
// users get the shared profile tree wrapped in the editorial page context.
export default function MeLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useMobileAuth()

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center px-6">
        <p className="text-muted-foreground text-sm">Loading…</p>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <MobileSignInGate
        title="Sign in"
        description="Sync your bookmarks, notes, collections, and reading streak."
      />
    )
  }

  return <div className="ed-page">{children}</div>
}
