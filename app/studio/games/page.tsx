import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { gamesAdminClient } from '@/lib/games-admin-client'
import { isEditor, type ReviewPassage } from '@/lib/games-editor'
import { GamesReview } from './games-review'

// Editorial review console for the Quran Games catalog. Intentionally not
// linked from public navigation; the soft check below is UX only, the backend
// RequireEditor middleware enforces the real gate.
export const dynamic = 'force-dynamic'

export default async function StudioGamesPage() {
  const session = await auth()
  if (!session?.accessToken) redirect('/auth/sign-in?next=/studio/games')

  if (!isEditor(session.user?.email)) {
    return (
      <main style={notAuthorizedWrap}>
        <p style={kicker}>Studio</p>
        <h1 style={heading}>Not authorized</h1>
        <p style={muted}>
          This page is restricted to the games editorial team. If you should have access, ask an
          administrator to add your email to the editor allowlist.
        </p>
      </main>
    )
  }

  // Default view mirrors the CLI: passages awaiting review.
  let initial: ReviewPassage[] = []
  let initialError: string | null = null
  try {
    initial = await gamesAdminClient(session.accessToken).listPassages({ status: 'proposed' })
  } catch {
    initialError = 'Could not load passages. Use the filters to retry.'
  }

  return <GamesReview initialPassages={initial} initialError={initialError} />
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
