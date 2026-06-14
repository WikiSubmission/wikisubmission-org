'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { useMobileAuth } from '@/components/mobile-auth-context'

/**
 * Games are account-bound (scores, streaks, leaderboard), so the whole subtree
 * is gated behind sign-in. This is the static-export counterpart to the web
 * games layout's server-side `auth()` redirect: here the check runs on the
 * client via MobileAuthProvider, prompting native sign-in when there is no
 * token rather than redirecting to a sign-in route.
 */
export default function GamesLayout({ children }: { children: React.ReactNode }) {
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
          <h2 className="font-display text-xl">Sign in to play</h2>
          <p className="text-muted-foreground text-sm">
            Quran games track your scores, streak, and leaderboard rank.
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

  return <>{children}</>
}
