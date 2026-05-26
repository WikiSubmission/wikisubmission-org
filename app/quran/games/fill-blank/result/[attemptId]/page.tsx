import { getTranslations } from 'next-intl/server'

type Params = Promise<{ attemptId: string }>

export default async function FillBlankResultPage({ params }: { params: Params }) {
  const { attemptId } = await params
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
        {t('resultKicker', { attemptId })}
      </div>
      <h1
        style={{
          marginTop: 8,
          fontFamily: 'var(--font-cormorant), Georgia, serif',
          fontSize: 'clamp(28px, 4vw, 40px)',
          lineHeight: 1.1,
        }}
      >
        {t('resultTitle')}
      </h1>
      <p style={{ color: 'var(--ed-fg-muted)', marginTop: 12 }}>
        {t('comingSoonResult')}
      </p>
    </section>
  )
}
