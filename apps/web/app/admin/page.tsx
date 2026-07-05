import Link from 'next/link'
import { redirect } from 'next/navigation'
import { auth } from '@/auth'

export const dynamic = 'force-dynamic'

interface Tile {
  href: string
  title: string
  body: string
}

const TILES: Tile[] = [
  {
    href: '/admin/access',
    title: 'Access',
    body: 'Grant or revoke per-feature access for any account. Today this controls the games editor permission; more features will appear here as they ship.',
  },
  {
    href: '/admin/games',
    title: 'Games',
    body: 'Per-game settings and maintenance, including the Fill the Missing Word studio.',
  },
  {
    href: '/admin/offline',
    title: 'Offline bundles',
    body: 'Rebuild and publish the downloadable Quran packages (text and word by word) after content changes.',
  },
]

export default async function AdminLandingPage() {
  const session = await auth()
  if (!session?.accessToken) redirect('/auth/sign-in?next=/admin')
  if (!session.isAdmin) redirect('/')

  return (
    <section style={wrap}>
      <header style={{ marginBottom: 32 }}>
        <p style={kicker}>Administration</p>
        <h1 style={heading}>Admin</h1>
        <p style={lede}>
          Manage access and per-feature settings. Anything destructive is logged and rate-limited.
        </p>
      </header>

      <ul style={grid}>
        {TILES.map((tile) => (
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
  fontSize: 'clamp(40px, 6vw, 64px)',
  lineHeight: 1.05,
  letterSpacing: '-0.02em',
  margin: '6px 0 12px',
}

const lede: React.CSSProperties = {
  color: 'var(--ed-fg-muted)',
  fontSize: 16,
  maxWidth: 560,
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
  fontSize: 24,
  fontWeight: 500,
}

const tileBody: React.CSSProperties = {
  marginTop: 6,
  color: 'var(--ed-fg-muted)',
  fontSize: 14,
  lineHeight: 1.55,
}
