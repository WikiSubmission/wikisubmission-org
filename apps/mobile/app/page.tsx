'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { useMobileAuth } from '@/components/mobile-auth-context'

export default function HomePage() {
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
    <main className="safe-top safe-bottom mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center gap-6 px-6 text-center">
      <div className="space-y-2">
        <h1 className="font-display text-3xl">WikiSubmission</h1>
        <p className="text-muted-foreground text-sm">Quran: The Final Testament</p>
      </div>

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
    </main>
  )
}
