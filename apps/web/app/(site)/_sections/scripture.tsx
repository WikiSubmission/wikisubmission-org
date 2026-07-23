'use client'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { F, SectionDivider, Arrow } from './shared'

type CardData = {
  href: string
  title: string
  titleAlt: string
  desc: string
  tags: string[]
  visual: React.ReactNode
  visualAlt?: boolean
  ctaLabel: string
}

export function ScriptureSection() {
  const t = useTranslations('homePage.scripture')

  return (
    <section
      style={{
        backgroundColor: 'var(--ed-bg-alt)',
        padding: 'clamp(64px, 8vw, 96px) 0',
      }}
    >
      <div
        className="px-4 sm:px-6 md:px-10"
        style={{ maxWidth: 1240, margin: '0 auto' }}
      >
        <SectionDivider
          num={t('dividerNum')}
          title={t('dividerTitle')}
          sub={t('dividerSub')}
        />

        <div
          style={{ gap: 20 }}
          className="grid grid-cols-2 max-md:grid-cols-1"
        >
          <FeaturedCard
            href="/quran"
            title={t('quranTitle')}
            titleAlt={t('quranTitleAlt')}
            desc={t('quranDesc')}
            tags={t('quranTags').split(' · ')}
            ctaLabel={t('openReader')}
            visual={
              <div style={{ position: 'relative', width: 180, height: 240 }}>
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'var(--ed-fg)',
                    borderRadius: '1px 3px 3px 1px',
                    opacity: 0.3,
                    transform: 'rotate(6deg) translateX(20px)',
                  }}
                />
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background: `linear-gradient(135deg, color-mix(in oklab, var(--ed-accent), var(--ed-bg) 20%), color-mix(in oklab, var(--ed-accent), var(--ed-fg) 20%))`,
                    borderRadius: '1px 3px 3px 1px',
                    boxShadow: '0 20px 60px -20px rgba(20,15,10,0.4)',
                    transform: 'rotate(-4deg)',
                  }}
                />
                <div
                  dir="rtl"
                  style={{
                    position: 'absolute',
                    inset: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: F.arabic,
                    color: 'var(--ed-bg)',
                    fontSize: 32,
                    textAlign: 'center',
                    transform: 'rotate(-4deg)',
                    lineHeight: 1.2,
                  }}
                >
                  سُورَة
                  <br />
                  ٢٥
                </div>
              </div>
            }
          />

          <FeaturedCard
            href="/bible"
            title={t('bibleTitle')}
            titleAlt={t('bibleTitleAlt')}
            desc={t('bibleDesc')}
            tags={t('bibleTags').split(' · ')}
            ctaLabel={t('openReader')}
            visualAlt
            visual={
              <div style={{ position: 'relative', width: 180, height: 240 }}>
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'var(--ed-fg-muted)',
                    borderRadius: '1px 3px 3px 1px',
                    opacity: 0.25,
                    transform: 'rotate(6deg) translateX(20px)',
                  }}
                />
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background: `linear-gradient(135deg, color-mix(in oklab, var(--ed-fg-muted), var(--ed-bg) 30%), color-mix(in oklab, var(--ed-fg-muted), var(--ed-fg) 20%))`,
                    borderRadius: '1px 3px 3px 1px',
                    boxShadow: '0 20px 60px -20px rgba(20,15,10,0.35)',
                    transform: 'rotate(-4deg)',
                  }}
                />
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: F.display,
                    color: 'var(--ed-bg)',
                    fontSize: 28,
                    textAlign: 'center',
                    transform: 'rotate(-4deg)',
                    lineHeight: 1.1,
                    letterSpacing: '0.05em',
                    fontWeight: 500,
                  }}
                >
                  OT
                  <br />
                  NT
                </div>
              </div>
            }
          />
        </div>
      </div>
    </section>
  )
}

function FeaturedCard({
  href,
  title,
  titleAlt,
  desc,
  tags,
  visual,
  visualAlt,
  ctaLabel,
}: CardData) {
  return (
    <Link
      href={href}
      className="ed-card"
      style={{
        display: 'flex',
        backgroundColor: 'var(--ed-surface)',
        minHeight: 360,
      }}
    >
      <div
        style={{
          flex: '1.2',
          padding: 'clamp(24px, 6vw, 40px)',
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
        }}
      >
        <h3
          style={{
            fontFamily: F.display,
            fontSize: 'clamp(28px, 6vw, 34px)',
            fontWeight: 500,
            lineHeight: 1.05,
            letterSpacing: '-0.02em',
            color: 'var(--ed-fg)',
          }}
        >
          {title}
          <span
            style={{ color: 'var(--ed-fg-muted)', fontStyle: 'italic' }}
          >
            {' '}
            {titleAlt}
          </span>
        </h3>
        <p
          style={{
            fontFamily: F.serif,
            fontSize: 15,
            color: 'var(--ed-fg-muted)',
            lineHeight: 1.6,
            maxWidth: '44ch',
          }}
        >
          {desc}
        </p>
        <div
          style={{
            display: 'flex',
            gap: 10,
            flexWrap: 'wrap',
            fontFamily: F.glacial,
            fontSize: 10,
            fontWeight: 700,
            color: 'var(--ed-fg-muted)',
            letterSpacing: '0.12em',
            textTransform: 'uppercase' as const,
          }}
        >
          {tags.map((tag, i) => (
            <span key={i}>
              {i > 0 ? <span style={{ marginRight: 10, opacity: 0.5 }}>·</span> : null}
              {tag}
            </span>
          ))}
        </div>
        <div className="ed-cta" style={{ marginTop: 'auto', fontSize: 14 }}>
          {ctaLabel} <Arrow />
        </div>
      </div>

      <div
        style={{
          flex: 1,
          position: 'relative',
          backgroundColor: visualAlt ? 'var(--ed-bg)' : 'var(--ed-bg-alt)',
          borderLeft: '1px solid var(--ed-rule)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 360,
          padding: 40,
          overflow: 'hidden',
        }}
        className="hidden sm:flex"
      >
        {visual}
      </div>
    </Link>
  )
}
