import { redirect } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { FillBlankRound } from '@/components/games/fill-blank-round'

type SearchParams = Promise<{ v?: string }>

// The active variant travels in the `?v=` query rather than a path segment, so
// the route is a single page shared by both the SSR web app and the static
// mobile export (which cannot pre-render unbounded path params).
export default async function FillBlankPlayPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const { v } = await searchParams
  if (!v) redirect('/quran/games/fill-blank')
  const t = await getTranslations('games')

  return (
    <section
      style={{
        maxWidth: 720,
        margin: '0 auto',
        padding: 'clamp(32px, 6vw, 64px) clamp(16px, 3vw, 24px)',
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
        {t('playKicker', { variantId: v })}
      </div>
      <h1
        style={{
          marginTop: 8,
          marginBottom: 24,
          fontFamily: 'var(--font-cormorant), Georgia, serif',
          fontSize: 'clamp(28px, 4vw, 40px)',
          lineHeight: 1.1,
        }}
      >
        {t('playTitle')}
      </h1>
      <FillBlankRound variantId={v} />
    </section>
  )
}
