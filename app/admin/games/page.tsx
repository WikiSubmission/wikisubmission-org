import Link from 'next/link'
import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { getTranslations } from 'next-intl/server'

export const dynamic = 'force-dynamic'

export default async function AdminGamesHubPage() {
  const session = await auth()
  if (!session?.accessToken) redirect('/auth/sign-in?next=/admin/games')
  // Admins only. Non-admin editors reach their specific game studio directly
  // (for example /admin/games/fill-blank) without seeing this hub.
  if (!session.isAdmin) redirect('/admin/games/fill-blank')

  const t = await getTranslations('adminGames')

  return (
    <section style={wrap}>
      <header style={{ marginBottom: 24 }}>
        <p style={kicker}>{t('hubKicker')}</p>
        <h1 style={heading}>{t('hubTitle')}</h1>
        <p style={lede}>{t('hubLede')}</p>
      </header>

      <ul style={grid}>
        <li>
          <Link href="/admin/games/fill-blank" style={tileStyle}>
            <div style={tileTitle}>{t('fillBlankTile')}</div>
            <p style={tileBody}>{t('fillBlankTileBody')}</p>
          </Link>
        </li>
        <li>
          <Link href="/admin/games/fill-blank/maintenance" style={tileStyle}>
            <div style={tileTitle}>{t('maintenanceTile')}</div>
            <p style={tileBody}>{t('maintenanceTileBody')}</p>
          </Link>
        </li>
      </ul>
    </section>
  )
}

const wrap: React.CSSProperties = {
  maxWidth: 960,
  margin: '0 auto',
  padding: 'clamp(32px, 6vw, 64px) clamp(16px, 3vw, 24px)',
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
  fontSize: 'clamp(32px, 5vw, 48px)',
  margin: '6px 0 12px',
}

const lede: React.CSSProperties = {
  color: 'var(--ed-fg-muted)',
  fontSize: 15,
  lineHeight: 1.55,
}

const grid: React.CSSProperties = {
  listStyle: 'none',
  padding: 0,
  margin: 0,
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
  gap: 16,
}

const tileStyle: React.CSSProperties = {
  display: 'block',
  padding: '20px 24px',
  border: '1px solid var(--ed-rule)',
  borderRadius: 2,
  textDecoration: 'none',
  color: 'var(--ed-fg)',
  background: 'var(--ed-surface)',
  height: '100%',
}

const tileTitle: React.CSSProperties = {
  fontFamily: 'var(--font-cormorant), Georgia, serif',
  fontSize: 22,
  fontWeight: 500,
}

const tileBody: React.CSSProperties = {
  marginTop: 6,
  color: 'var(--ed-fg-muted)',
  fontSize: 14,
  lineHeight: 1.55,
}
