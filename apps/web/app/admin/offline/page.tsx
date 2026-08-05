import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { OfflineBundlesClient } from './offline-bundles-client'

export const dynamic = 'force-dynamic'

export default async function AdminOfflinePage() {
  const session = await auth()
  if (!session?.accessToken) redirect('/auth/sign-in?next=/admin/offline')
  if (!session.isAdmin) redirect('/')

  return (
    <section style={wrap}>
      <header style={{ marginBottom: 24 }}>
        <p style={kicker}>Administration</p>
        <h1 style={heading}>Offline bundles</h1>
        <p style={lede}>
          The downloadable content packages behind offline reading. Rebuild after content
          changes to publish a new version to the CDN.
        </p>
      </header>

      <OfflineBundlesClient />
    </section>
  )
}

const wrap: React.CSSProperties = {
  maxWidth: 720,
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
