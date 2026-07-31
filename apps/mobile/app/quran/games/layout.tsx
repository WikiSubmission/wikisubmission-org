'use client'

import { useTranslations } from 'next-intl'
import { useMobileAuth } from '@/components/mobile-auth-context'
import { MobileSignInGate } from '@/components/mobile-sign-in-gate'

/**
 * Games are account-bound (scores, streaks, leaderboard), so the whole subtree
 * is gated behind sign-in. This is the static-export counterpart to the web
 * games layout's server-side `auth()` redirect: here the check runs on the
 * client via MobileAuthProvider, prompting native sign-in when there is no
 * token rather than redirecting to a sign-in route.
 */
export default function GamesLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useMobileAuth()
  const t = useTranslations()

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center px-6">
        <p className="text-muted-foreground text-sm">{t('common.loading')}</p>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <MobileSignInGate
        title={t('mobile.auth.gamesGateTitle')}
        description={t('mobile.auth.gamesGateBody')}
      />
    )
  }

  return <>{children}</>
}
