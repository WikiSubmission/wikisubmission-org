import Link from 'next/link'
import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { getEditorialSession } from '@/lib/editorial-client'
import { canReadGame, canWriteGame } from '@/lib/editorial-access'
import { FILL_BLANK } from '@/lib/games-access'
import { getTranslations } from 'next-intl/server'

export const dynamic = 'force-dynamic'

export default async function AdminGamesHubPage() {
  const session = await auth()
  if (!session?.accessToken) redirect('/auth/sign-in?next=/admin/games')

  // The hub shows one tile per game the caller may open, so a user granted a
  // single game sees just that one. Resolved per request rather than from the
  // session flags, which lag a grant change by up to 55 minutes.
  const editorial = await getEditorialSession(session.accessToken)
  if (!editorial) redirect('/')

  const t = await getTranslations('adminGames')

  const tiles = [
    canReadGame(editorial, FILL_BLANK) && {
      href: '/admin/games/fill-blank',
      title: t('fillBlankTile'),
      body: t('fillBlankTileBody'),
    },
    // Maintenance rewrites shared tables, so it is a write-only surface.
    canWriteGame(editorial, FILL_BLANK) && {
      href: '/admin/games/fill-blank/maintenance',
      title: t('maintenanceTile'),
      body: t('maintenanceTileBody'),
    },
  ].filter((tile): tile is { href: string; title: string; body: string } => Boolean(tile))

  if (tiles.length === 0) redirect('/')

  return (
    <section style={wrap}>
      <header style={{ marginBottom: 24 }}>
        <p style={kicker}>{t('hubKicker')}</p>
        <h1 style={heading}>{t('hubTitle')}</h1>
        <p style={lede}>{t('hubLede')}</p>
      </header>

      <ul style={grid}>
        {tiles.map((tile) => (
          <li key={tile.href}>
            <Link href={tile.href} style={tileStyle}>
              <div style={tileTitle}>{tile.title}</div>
              <p style={tileBody}>{tile.body}</p>
            </Link>
          </li>
        ))}
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
