import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { gamesAdminClient } from '@/lib/games-admin-client'
import { type ReviewPassage } from '@/lib/games-editor'
import { GamesReview } from './games-review'
import { getTranslations } from 'next-intl/server'

// Editorial review console for the Quran Games catalog. Soft check below is
// UX only; the backend RequireEditor middleware enforces the real gate.
export const dynamic = 'force-dynamic'

export default async function GamesFillBlankStudioPage() {
  const session = await auth()
  if (!session?.accessToken) redirect('/auth/sign-in?next=/admin/games/fill-blank')

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

  // Default view mirrors the CLI: passages awaiting review. The proposed list
  // also seeds the "chapters with proposals" summary (no extra request).
  let initial: ReviewPassage[] = []
  let initialError: string | null = null
  try {
    initial = await gamesAdminClient(session.accessToken).listPassages({ status: 'proposed' })
  } catch {
    initialError = t('loadError')
  }

  const counts = new Map<number, number>()
  for (const p of initial) counts.set(p.chapter_start, (counts.get(p.chapter_start) ?? 0) + 1)
  const initialProposedChapters = [...counts.entries()]
    .map(([chapter, count]) => ({ chapter, count }))
    .sort((a, b) => a.chapter - b.chapter)

  return (
    <GamesReview
      initialPassages={initial}
      initialError={initialError}
      initialProposedChapters={initialProposedChapters}
    />
  )
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
