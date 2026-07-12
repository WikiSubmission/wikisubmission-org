'use client'

import { useEffect } from 'react'
import { RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { reportClientError } from '@/lib/crash-reporter'

/**
 * Route-level error boundary: catches render/effect throws below the root
 * layout so a bug in one screen degrades to this card instead of a dead
 * webview. Reports to the backend, offers retry.
 */
export default function RouteError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    reportClientError(error, 'error-boundary')
  }, [error])

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-4 px-8 text-center">
      <h2 className="font-display text-xl">Something went wrong</h2>
      <p className="text-muted-foreground text-sm">
        The screen hit an unexpected error. Your data is safe — try again, or
        restart the app if this keeps happening.
      </p>
      <Button onClick={reset} className="gap-2">
        <RefreshCw className="size-4" aria-hidden="true" />
        Try again
      </Button>
    </div>
  )
}
