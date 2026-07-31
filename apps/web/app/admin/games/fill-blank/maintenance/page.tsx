import { redirect } from 'next/navigation'
import { GamesMaintenance } from './games-maintenance'
import { FILL_BLANK, resolveGameAccess } from '@/lib/games-access'
import { getTranslations } from 'next-intl/server'

export const dynamic = 'force-dynamic'

export default async function GamesFillBlankMaintenancePage() {
  const t = await getTranslations('adminGames')
  const resolved = await resolveGameAccess(FILL_BLANK)

  // Every job on this page rewrites shared tables, so read access alone is not
  // enough to be here — require write on the game.
  if ('error' in resolved || !resolved.access.canWrite) {
    if ('error' in resolved && resolved.error === 'not_authenticated') {
      redirect('/auth/sign-in?next=/admin/games/fill-blank/maintenance')
    }
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
