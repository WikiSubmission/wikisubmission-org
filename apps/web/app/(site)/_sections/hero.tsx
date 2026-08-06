'use client'
import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useRef } from 'react'
import { useTranslations } from 'next-intl'
import gsap from 'gsap'
import { useChatPanel } from '@/components/chat-sidebar/panel-context'
import { F, Arrow } from './shared'
import { StaggerContainer } from '@/lib/motion'

function Stat({ k, label }: { k: string; label: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <div
        style={{
          fontFamily: F.display,
          fontSize: 20,
          letterSpacing: '-0.01em',
          fontWeight: 500,
          color: 'var(--ed-fg)',
          lineHeight: 1,
        }}
      >
        {k}
      </div>
      <div
        style={{
          fontFamily: F.glacial,
          fontSize: 9.5,
          fontWeight: 700,
          letterSpacing: '0.14em',
          textTransform: 'uppercase' as const,
          color: 'var(--ed-fg-muted)',
        }}
      >
        {label}
      </div>
    </div>
  )
}

function HeroLogo() {
  const ref = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    gsap.to(el, { opacity: 0.04, duration: 1.5, delay: 0.5, ease: 'power2.out' })
  }, [])

  return (
    <div
      ref={ref}
      aria-hidden
      style={{
        position: 'absolute',
        right: -40,
        top: 48,
        width: 260,
        pointerEvents: 'none',
        mixBlendMode: 'multiply',
        opacity: 0,
      }}
      className="hidden lg:block"
    >
      <Image
        src="/brand-assets/logo-mark.png"
        alt=""
        width={260}
        height={260}
        priority
      />
    </div>
  )
}

export function HeroManifesto() {
  const { toggle: toggleAsk } = useChatPanel()
  const t = useTranslations('homePage.hero')

  return (
    <section
      className="px-4 sm:px-6 md:px-10"
      style={{
        position: 'relative',
        paddingTop: 'clamp(48px, 8vw, 92px)',
        paddingBottom: 'clamp(36px, 6vw, 72px)',
        maxWidth: 1240,
        margin: '0 auto',
        overflow: 'visible',
      }}
    >
      <StaggerContainer
        stagger={0.09}
        delay={0}
        once={true}
        threshold={0.01}
        style={{ columnGap: 56, rowGap: 36, alignItems: 'start' }}
        className="grid grid-cols-[1.15fr_0.85fr] max-md:grid-cols-1"
      >
        {/* Left column: headline, lede, CTAs */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <h1
            style={{
              fontFamily: F.display,
              fontSize: 'clamp(30px, 5vw, 54px)',
              fontWeight: 400,
              lineHeight: 1.06,
              letterSpacing: '-0.025em',
              color: 'var(--ed-fg)',
              maxWidth: '15ch',
            }}
          >
            <span>{t('headline1')} </span>
            <span style={{ fontStyle: 'italic', color: 'var(--ed-fg-muted)' }}>
              {t('headline2')}{' '}
            </span>
            <span style={{ color: 'var(--ed-accent)' }}>{t('headline3')}</span>
          </h1>

          <p
            style={{
              fontFamily: F.serif,
              fontSize: 'clamp(15px, 3.4vw, 16.5px)',
              lineHeight: 1.62,
              color: 'var(--ed-fg-muted)',
              maxWidth: '52ch',
              margin: 0,
            }}
          >
            {t('lede')}
          </p>

          <div
            style={{
              display: 'flex',
              gap: 'clamp(10px, 3vw, 12px)',
              flexWrap: 'wrap',
            }}
          >
            <Link
              href="/quran"
              className="ed-btn-primary"
              style={{ fontFamily: F.serif }}
            >
              {t('ctaPrimary')}
              <Arrow />
            </Link>
            <button
              type="button"
              onClick={toggleAsk}
              className="ed-btn-ghost"
              style={{ fontFamily: F.serif }}
            >
              {t('ctaSecondary')}
            </button>
          </div>
        </div>

        {/* Right column: featured verse (2:62) */}
        <aside
          style={{
            borderLeft: '1px solid var(--ed-rule)',
            paddingLeft: 28,
            alignSelf: 'stretch',
          }}
          className="max-md:border-l-0 max-md:border-t max-md:pl-0 max-md:pt-7"
        >
          <div
            style={{
              fontFamily: F.glacial,
              fontSize: 9.5,
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.16em',
              color: 'var(--ed-accent)',
              marginBottom: 12,
            }}
          >
            {t('verseKicker')}
          </div>
          <p
            style={{
              fontFamily: F.serif,
              fontSize: 'clamp(13.5px, 3.4vw, 14.5px)',
              lineHeight: 1.7,
              color: 'var(--ed-fg-muted)',
              margin: 0,
              fontStyle: 'italic',
            }}
          >
            {t('verse')}
          </p>
        </aside>

        {/* Stats row, full width */}
        <div
          style={{
            gridColumn: '1 / -1',
            display: 'flex',
            gap: 'clamp(20px, 6vw, 44px)',
            paddingTop: 28,
            marginTop: 4,
            borderTop: '1px solid var(--ed-rule)',
            flexWrap: 'wrap',
          }}
        >
          <Stat k={t('stat1k')} label={t('stat1label')} />
          <Stat k={t('stat2k')} label={t('stat2label')} />
          <Stat k={t('stat3k')} label={t('stat3label')} />
          <Stat k={t('stat4k')} label={t('stat4label')} />
        </div>
      </StaggerContainer>

      <HeroLogo />
    </section>
  )
}
