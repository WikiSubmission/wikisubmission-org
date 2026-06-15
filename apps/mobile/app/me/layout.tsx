'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { useMobileAuth } from '@/components/mobile-auth-context'

// Client auth-gate for the Profile tab. Replaces the web /me layout's
// server-side auth() redirect: signed-out users see the native sign-in, signed-in
// users get the shared profile tree wrapped in the editorial page context.
export default function MeLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, signInWithGoogle, signInWithApple } = useMobileAuth()
  const [busy, setBusy] = useState(false)

  async function run(action: () => Promise<void>) {
    setBusy(true)
    try {
      await action()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Something went wrong')
    } finally {
      setBusy(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center px-6">
        <p className="text-muted-foreground text-sm">Loading…</p>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
        <div className="space-y-1">
          <h2 className="font-display text-xl">Sign in</h2>
          <p className="text-muted-foreground text-sm">
            Sync your bookmarks, notes, collections, and reading streak.
          </p>
        </div>
        <Button className="w-full" disabled={busy} onClick={() => run(signInWithGoogle)}>
          Continue with Google
        </Button>
        <Button
          className="w-full"
          variant="outline"
          disabled={busy}
          onClick={() => run(signInWithApple)}
        >
          Continue with Apple
        </Button>
      </div>
    )
  }

  return <div className="ed-page">{children}</div>
}
