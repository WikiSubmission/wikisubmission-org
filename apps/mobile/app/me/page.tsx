'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { useMobileAuth } from '@/components/mobile-auth-context'

export default function ProfilePage() {
  const { user, isAuthenticated, isLoading, signInWithGoogle, signInWithApple, signOut } =
    useMobileAuth()
  const [busy, setBusy] = useState(false)

  async function run(action: () => Promise<void>) {
    setBusy(true)
    try {
      await action()
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Something went wrong'
      toast.error(message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center gap-6 px-6 text-center">
      {isLoading ? (
        <p className="text-muted-foreground text-sm">Loading…</p>
      ) : isAuthenticated ? (
        <div className="w-full space-y-4">
          <p className="text-sm">
            Signed in as <span className="font-medium">{user?.email}</span>
          </p>
          <Button className="w-full" variant="outline" disabled={busy} onClick={() => run(signOut)}>
            Sign out
          </Button>
        </div>
      ) : (
        <div className="w-full space-y-3">
          <div className="space-y-1">
            <h2 className="font-display text-xl">Sign in</h2>
            <p className="text-muted-foreground text-sm">
              Sync your bookmarks, notes, and reading streak.
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
      )}
    </div>
  )
}
