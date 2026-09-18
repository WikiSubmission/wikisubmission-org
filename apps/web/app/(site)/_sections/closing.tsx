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
      className="relative px-4 sm:px-6 md:px-10 overflow-hidden select-none bg-[var(--ed-invert-bg)]"
      style={{
        color: 'var(--ed-invert-fg)',
        paddingTop: 'clamp(80px, 12vw, 140px)',
        paddingBottom: 'clamp(80px, 12vw, 140px)',
      }}
    >
      {/* 1. Master Full-Bleed Atmospheric Closing Artwork */}
      <div className="pointer-events-none absolute inset-0 z-0">
        <Image
          src="/hero-image-2.png"
          alt=""
          fill
          priority
          quality={90}
          sizes="100vw"
          className="pointer-events-none object-cover object-[50%_46%] sm:object-[50%_42%]"
        />
      </div>

      {/* 2. Base Dark Atmospheric Veil (balances artwork luminosity into dark inverted aesthetic) */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-[1]"
        style={{
          background: 'color-mix(in srgb, var(--ed-invert-bg) 42%, transparent)',
        }}
      />

      {/* 3. Central Atmospheric Readability Pool (soft, natural contrast behind quotation) */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-[2]"
        style={{
          background: `
            radial-gradient(
              ellipse 65% 58% at 50% 48%,
              color-mix(in srgb, var(--ed-invert-bg) 62%, transparent) 0%,
              color-mix(in srgb, var(--ed-invert-bg) 25%, transparent) 55%,
              transparent 80%
            )
          `,
        }}
      />

      {/* 4. Peripheral Vignette (subtle edge darkening) */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-[2]"
        style={{
          background: `
            radial-gradient(
              ellipse 85% 82% at 50% 50%,
              transparent 45%,
              color-mix(in srgb, var(--ed-invert-bg) 60%, transparent) 100%
            )
          `,
        }}
      />

      {/* 5. Top Transition Hairline & Vignette */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-24 sm:h-32 z-[3]"
        style={{
          background:
            'linear-gradient(to bottom, color-mix(in srgb, var(--ed-invert-bg) 70%, transparent) 0%, transparent 100%)',
        }}
      />

      {/* 6. Bottom Fade (grounds the section and transitions seamlessly to the footer) */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-32 sm:h-44 z-[3]"
        style={{
          background: `
            linear-gradient(
              to bottom,
              transparent 0%,
              color-mix(in srgb, var(--ed-invert-bg) 50%, transparent) 45%,
              color-mix(in srgb, var(--ed-invert-bg) 88%, transparent) 80%,
              var(--ed-invert-bg) 100%
            )
          `,
        }}
      />

      {/* 7. Museum Canvas Grain */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-[4] opacity-[0.022] mix-blend-overlay"
        style={{
          backgroundImage: `
            url("data:image/svg+xml,%3Csvg viewBox='0 0 180 180' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='.8'/%3E%3C/svg%3E")
          `,
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
          zIndex: 10,
        }}
      >
        <div className="w-16 h-16 select-none opacity-90 hover:opacity-100 transition-opacity drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]">
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
            textShadow:
              '0 2px 14px rgba(0, 0, 0, 0.8), 0 1px 3px rgba(0, 0, 0, 0.6)',
          }}
        >
          &ldquo;Say, &lsquo;O followers of the scripture, let us come to a{' '}
          <span
            style={{
              color: 'var(--ed-accent)',
              fontStyle: 'italic',
              textShadow: '0 2px 10px rgba(0, 0, 0, 0.9), 0 1px 2px rgba(0,0,0,0.8)',
            }}
          >
            common agreement
          </span>{' '}
          between us and you: that we shall not worship except{' '}
          <span
            style={{
              color: 'var(--ed-accent)',
              textShadow: '0 2px 10px rgba(0, 0, 0, 0.9), 0 1px 2px rgba(0,0,0,0.8)',
            }}
          >
            GOD
          </span>
          .&rsquo;&rdquo;
        </h2>

        <div
          style={{
            fontFamily: F.mono,
            fontSize: 11.5,
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            opacity: 0.95,
            color: 'var(--ed-accent)',
            textShadow: '0 2px 10px rgba(0, 0, 0, 0.9), 0 1px 3px rgba(0, 0, 0, 0.8)',
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
            className="ed-btn-inv btn-tap sheen-hover inline-flex items-center gap-2 text-xs sm:text-sm font-medium"
            style={{ fontFamily: F.serif }}
          >
            <span>{t('ctaPrimary')}</span>
            <Arrow />
          </Link>
          <Link
            href="/donate"
            className="ed-btn-ghost-inv btn-tap inline-flex items-center gap-2 text-xs sm:text-sm font-medium"
            style={{ fontFamily: F.serif }}
          >
            <span>{t('ctaSecondary')}</span>
          </Link>
        </div>
      </StaggerContainer>
    </section>
  )
}
