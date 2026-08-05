import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { decodeSharePayload } from '@/lib/games-share'
import { buildPageMetadata } from '@/constants/metadata'

type Params = Promise<{ token: string }>

// Public route — sits outside `app/quran/games/` so the auth gate in that
// subtree does not block link previews. The payload is URL-encoded numbers
// only (score, correct, total); the player must sign in to actually play.

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { token } = await params
  const payload = decodeSharePayload(token)
  if (!payload) {
    return buildPageMetadata({
      title: 'Fill the Blank | WikiSubmission',
      description: 'Play the Fill-the-Blank Quran game.',
    })
  }
  const accuracy = Math.round((payload.correct / payload.total) * 100)
  const title = `Scored ${payload.score} on Fill the Blank`
  const description = `${payload.correct} of ${payload.total} correct (${accuracy}%) — Fill the Blank, a Quran game on WikiSubmission.`
  const ogImage = `/og?title=${encodeURIComponent(`Scored ${payload.score}`)}&subtitle=${encodeURIComponent(`${payload.correct}/${payload.total} correct · Fill the Blank`)}`
  return buildPageMetadata({
    title,
    description,
    url: `/share/games/fill-blank/${token}`,
    image: ogImage,
    twitterCard: 'summary_large_image',
  })
}

export default async function FillBlankSharePage({ params }: { params: Params }) {
  const { token } = await params
  const payload = decodeSharePayload(token)
  if (!payload) notFound()

  const accuracy = Math.round((payload.correct / payload.total) * 100)

  return (
    <main
      style={{
        maxWidth: 640,
        margin: '0 auto',
        padding: 'clamp(48px, 9vw, 96px) clamp(16px, 3vw, 24px)',
        textAlign: 'center',
      }}
    >
      <div
        style={{
          fontFamily: 'var(--font-jetbrains), ui-monospace, monospace',
          fontSize: 11,
          letterSpacing: '0.16em',
          textTransform: 'uppercase',
          color: 'var(--ed-fg-muted)',
        }}
      >
        Fill the Blank
      </div>
      <div
        style={{
          marginTop: 12,
          fontFamily: 'var(--font-cormorant), Georgia, serif',
          fontSize: 'clamp(56px, 10vw, 96px)',
          lineHeight: 1,
          color: 'var(--ed-accent)',
        }}
      >
        {payload.score}
      </div>
      <div
        style={{
          marginTop: 12,
          color: 'var(--ed-fg-muted)',
          fontSize: 16,
        }}
      >
        {payload.correct} of {payload.total} correct ({accuracy}%)
        {payload.difficulty ? ` · ×${payload.difficulty.toFixed(1)} multiplier` : ''}
      </div>
      <div style={{ marginTop: 40, display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
        <Link
          href="/quran/games/fill-blank"
          style={{
            padding: '12px 28px',
            borderRadius: 2,
            border: '1px solid var(--ed-fg)',
            background: 'var(--ed-fg)',
            color: 'var(--ed-bg)',
            fontSize: 15,
            fontWeight: 500,
            textDecoration: 'none',
          }}
        >
          Play your own round
        </Link>
        <Link
          href="/quran/games/leaderboard"
          style={{
            padding: '12px 28px',
            borderRadius: 2,
            border: '1px solid var(--ed-rule)',
            background: 'var(--ed-surface)',
            color: 'var(--ed-fg)',
            fontSize: 15,
            textDecoration: 'none',
          }}
        >
          Leaderboard
        </Link>
      </div>
    </main>
  )
}
