'use client'

import { useEffect } from 'react'
import { RefreshCw } from 'lucide-react'
import { useTranslations } from 'next-intl'
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
  const t = useTranslations()

  useEffect(() => {
    reportClientError(error, 'error-boundary')
  }, [error])

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-4 px-8 text-center">
      <h2 className="font-display text-xl">{t('common.error')}</h2>
      <p className="text-muted-foreground text-sm">{t('mobile.errors.routeBody')}</p>
      <Button onClick={reset} className="gap-2">
        <RefreshCw className="size-4" aria-hidden="true" />
        {t('mobile.errors.retry')}
      </Button>
    </div>
  )
}
