'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { F, Arrow } from './shared'
import { StaggerContainer } from '@/lib/motion'

export function ClosingSection() {
  const t = useTranslations('homePage.closing')

  return (
    <section
      className="relative px-4 sm:px-6 md:px-10 overflow-hidden"
      style={{
        backgroundColor: 'var(--ed-invert-bg)',
        color: 'var(--ed-invert-fg)',
        paddingTop: 'clamp(80px, 12vw, 140px)',
        paddingBottom: 'clamp(80px, 12vw, 140px)',
      }}
    >
      {/* Subtle ambient radial atmosphere */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[650px] rounded-full opacity-20 blur-3xl"
        style={{
          background: 'radial-gradient(circle, var(--ed-accent) 0%, transparent 70%)',
        }}
      />

      <StaggerContainer
        stagger={0.12}
        delay={0}
        style={{
          maxWidth: 820,
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 32,
          textAlign: 'center',
          position: 'relative',
          zIndex: 1,
        }}
      >
        <div className="w-16 h-16 select-none opacity-85 hover:opacity-100 transition-opacity">
          <Image
            src="/brand-assets/logo-transparent.png"
            alt=""
            width={64}
            height={64}
            aria-hidden
          />
        </div>

        <h2
          style={{
            fontFamily: F.display,
            fontSize: 'clamp(30px, 4.5vw, 50px)',
            fontWeight: 400,
            lineHeight: 1.24,
            letterSpacing: '-0.025em',
            maxWidth: '24ch',
            color: 'var(--ed-invert-fg)',
            margin: 0,
          }}
        >
          &ldquo;Say, &lsquo;O followers of the scripture, let us come to a{' '}
          <span style={{ color: 'var(--ed-accent)', fontStyle: 'italic' }}>
            common agreement
          </span>{' '}
          between us and you: that we shall not worship except{' '}
          <span style={{ color: 'var(--ed-accent)' }}>GOD</span>.&rsquo;&rdquo;
        </h2>

        <div
          style={{
            fontFamily: F.mono,
            fontSize: 11.5,
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            opacity: 0.8,
            color: 'var(--ed-accent)',
          }}
        >
          — Quran 3:64
        </div>

        <div
          style={{
            display: 'flex',
            gap: 14,
            marginTop: 10,
            flexWrap: 'wrap',
            justifyContent: 'center',
          }}
        >
          <Link
            href="/quran/1"
            className="ed-btn-inv inline-flex items-center gap-2 text-xs sm:text-sm font-medium"
            style={{ fontFamily: F.serif }}
          >
            <span>{t('ctaPrimary')}</span>
            <Arrow />
          </Link>
          <Link
            href="/donate"
            className="ed-btn-ghost-inv inline-flex items-center gap-2 text-xs sm:text-sm font-medium"
            style={{ fontFamily: F.serif }}
          >
            <span>{t('ctaSecondary')}</span>
          </Link>
        </div>
      </StaggerContainer>
    </section>
  )
}
