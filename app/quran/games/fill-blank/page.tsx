import { getTranslations } from 'next-intl/server'

export const metadata = {
  title: 'Fill the Missing Word — WikiSubmission',
  description: 'Procedurally generated Quran fill-in-the-blank practice with global leaderboards.',
}

export default async function FillBlankEntryPage() {
  const t = await getTranslations('games')

  return (
    <section
      style={{
        maxWidth: 720,
        margin: '0 auto',
        padding: 'clamp(32px, 6vw, 64px) clamp(16px, 3vw, 24px)',
      }}
    >
      <h1
        style={{
          fontFamily: 'var(--font-cormorant), Georgia, serif',
          fontSize: 'clamp(32px, 5vw, 48px)',
          lineHeight: 1.1,
          margin: 0,
        }}
      >
        {t('fillBlankTitle')}
      </h1>
      <p
        style={{
          marginTop: 12,
          color: 'var(--ed-fg-muted)',
          maxWidth: 560,
          lineHeight: 1.55,
        }}
      >
        {t('fillBlankIntro')}
      </p>

      <div
        style={{
          marginTop: 32,
          padding: 24,
          border: '1px dashed var(--ed-rule)',
          borderRadius: 2,
          color: 'var(--ed-fg-muted)',
          fontFamily: 'var(--font-jetbrains), ui-monospace, monospace',
          fontSize: 12,
          letterSpacing: '0.08em',
        }}
      >
        {t('comingSoonPickers')}
      </div>
    </section>
  )
}
