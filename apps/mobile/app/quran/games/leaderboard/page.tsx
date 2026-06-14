'use client'

import { useTranslations } from 'next-intl'
import { GamesLeaderboard } from '@/components/games/games-leaderboard'

// Global / weekly leaderboard. The shared GamesLeaderboard component fetches and
// renders both scopes; the shell owns the back navigation, so this screen only
// adds the heading.
export default function GamesLeaderboardPage() {
  const t = useTranslations('games')

  return (
    <div className="mx-auto w-full max-w-2xl px-4 pt-3 pb-6">
      <h1 className="font-serif text-2xl font-semibold leading-tight">{t('leaderboardTitle')}</h1>
      <GamesLeaderboard />
    </div>
  )
}
