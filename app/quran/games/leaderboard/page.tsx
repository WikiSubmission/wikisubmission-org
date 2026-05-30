import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import { GamesLeaderboard } from './games-leaderboard'

export const metadata = {
  title: 'Leaderboard — Quran Games — WikiSubmission',
}

export default async function GamesLeaderboardPage() {
  const t = await getTranslations('games')

  return (
    <section
      style={{
        maxWidth: 960,
        margin: '0 auto',
        padding: 'clamp(32px, 6vw, 64px) clamp(16px, 3vw, 24px)',
      }}
    >
      <Link
        href="/quran/games"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          marginBottom: 24,
          fontFamily: 'var(--font-jetbrains), ui-monospace, monospace',
          fontSize: 11,
          letterSpacing: '0.16em',
          textTransform: 'uppercase',
          color: 'var(--ed-fg-muted)',
          textDecoration: 'none',
        }}
      >
        ← {t('backToGames')}
      </Link>
      <h1
        style={{
          fontFamily: 'var(--font-cormorant), Georgia, serif',
          fontSize: 'clamp(32px, 5vw, 48px)',
          lineHeight: 1.1,
          margin: 0,
        }}
      >
        {t('leaderboardTitle')}
      </h1>
      <GamesLeaderboard />
    </section>
  )
}
