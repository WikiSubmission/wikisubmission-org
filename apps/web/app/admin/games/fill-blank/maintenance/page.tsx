import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { GamesMaintenance } from './games-maintenance'
import { getTranslations } from 'next-intl/server'

export const dynamic = 'force-dynamic'

export default async function GamesFillBlankMaintenancePage() {
  const session = await auth()
  if (!session?.accessToken) redirect('/auth/sign-in?next=/admin/games/fill-blank/maintenance')

  const t = await getTranslations('adminGames')

  if (!session.isAdmin && !session.isEditor) {
    return (
      <main style={notAuthorizedWrap}>
        <p style={kicker}>{t('studio')}</p>
        <h1 style={heading}>{t('notAuthorized')}</h1>
        <p style={muted}>{t('notAuthorizedDesc')}</p>
      </main>
    )
  }

  return <GamesMaintenance />
}

const notAuthorizedWrap: React.CSSProperties = {
  maxWidth: 640,
  margin: '0 auto',
  padding: '80px 24px',
}

const kicker: React.CSSProperties = {
  fontFamily: 'var(--font-jetbrains), ui-monospace, monospace',
  fontSize: 11,
  letterSpacing: '0.16em',
  textTransform: 'uppercase',
  color: 'var(--ed-fg-muted)',
  margin: 0,
}

const heading: React.CSSProperties = {
  fontFamily: 'var(--font-cormorant), Georgia, serif',
  fontSize: 'clamp(28px, 4vw, 40px)',
  margin: '8px 0 16px',
  color: 'var(--ed-fg)',
}

const muted: React.CSSProperties = {
  color: 'var(--ed-fg-muted)',
  lineHeight: 1.6,
}
