import Link from 'next/link'
import { getTranslations, getLocale } from 'next-intl/server'
import { FillBlankPicker } from './fill-blank-picker'
import { GamesOverview } from '../games-overview'

export const metadata = {
  title: 'Fill the Missing Word — WikiSubmission',
  description: 'Procedurally generated Quran fill-in-the-blank practice with global leaderboards.',
}

export default async function FillBlankEntryPage() {
  const t = await getTranslations('games')
  const locale = await getLocale()
  const isRtl = ['ar', 'ac', 'fa', 'ur'].includes(locale)

  return (
    <section
      style={{
        maxWidth: 720,
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
        {isRtl ? '→' : '←'} {t('backToGames')}
      </Link>
      <h1
        style={{
          fontFamily: 'var(--font-cormorant), Georgia, serif',
          fontSize: 'clamp(32px, 5vw, 48px)',
          lineHeight: 1.1,
          margin: 0,
        }}
      >
        {t('fillBlankTitle')}
      </h1>
      <p
        style={{
          marginTop: 12,
          color: 'var(--ed-fg-muted)',
          maxWidth: 560,
          lineHeight: 1.55,
        }}
      >
        {t('fillBlankIntro')}
      </p>

      <FillBlankPicker />
      <GamesOverview />
    </section>
  )
}
