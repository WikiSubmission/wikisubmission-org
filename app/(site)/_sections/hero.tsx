'use client'
import Image from 'next/image'
import Link from 'next/link'
import { F, Arrow } from './shared'

function Stat({ k, label }: { k: string; label: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <div
        style={{
          fontFamily: F.display,
          fontSize: 28,
          letterSpacing: '-0.02em',
          fontWeight: 500,
          color: 'var(--ed-fg)',
        }}
      >
        {k}
      </div>
      <div
        style={{
          fontFamily: F.mono,
          fontSize: 10.5,
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

export function HeroManifesto() {
  return (
    <section
      className="px-4 sm:px-6 md:px-10"
      style={{
        position: 'relative',
        paddingTop: 'clamp(56px, 10vw, 120px)',
        paddingBottom: 'clamp(40px, 8vw, 100px)',
        maxWidth: 1240,
        margin: '0 auto',
        overflow: 'visible',
      }}
    >
      <div
        style={{
          columnGap: 60,
          rowGap: 48,
          alignItems: 'start',
        }}
        className="grid grid-cols-[1.3fr_1fr] max-md:grid-cols-1"
      >
        {/* Headline */}
        <h1
          style={{
            fontFamily: F.display,
            fontSize: 'clamp(48px, 14vw, 128px)',
            fontWeight: 400,
            lineHeight: 0.92,
            letterSpacing: '-0.035em',
            color: 'var(--ed-fg)',
          }}
        >
          <span style={{ display: 'block' }}>Wisdom</span>
          <span
            style={{
              display: 'block',
              fontStyle: 'italic',
              color: 'var(--ed-fg-muted)',
            }}
          >
            for all
          </span>
          <span style={{ display: 'block', color: 'var(--ed-accent)' }}>
            <em>nations.</em>
          </span>
        </h1>

        {/* Arabic verse — right column */}
        <div
          style={{
            borderLeft: '1px solid var(--ed-rule)',
            paddingLeft: 32,
            alignSelf: 'center',
          }}
          className="max-md:border-l-0 max-md:border-t max-md:pl-0 max-md:pt-6"
        >
          <div
            dir="rtl"
            style={{
              fontFamily: F.arabic,
              fontSize: 'clamp(18px, 5vw, 26px)',
              lineHeight: 1.85,
              color: 'var(--ed-fg)',
              textAlign: 'right',
            }}
          >
            ﴿ تَبَارَكَ الَّذِي نَزَّلَ الْفُرْقَانَ عَلَىٰ عَبْدِهِ لِيَكُونَ لِلْعَالَمِينَ نَذِيرًا ﴾
          </div>
          <div
            style={{
              marginTop: 14,
              fontFamily: F.mono,
              fontSize: 10.5,
              textTransform: 'uppercase' as const,
              letterSpacing: '0.16em',
              color: 'var(--ed-fg-muted)',
              textAlign: 'right',
            }}
          >
            Sura 25 · verse 1
          </div>
        </div>

        {/* Lede */}
        <p
          style={{
            fontFamily: F.serif,
            fontSize: 'clamp(16px, 4.2vw, 18px)',
            lineHeight: 1.6,
            color: 'var(--ed-fg-muted)',
            maxWidth: '52ch',
          }}
        >
          WikiSubmission is a free, open-source home for the Final Testament,
          the Bible, and the mathematical miracle of&nbsp;19 — tools for every
          person who seeks God directly, without intermediary.
        </p>

        {/* CTAs */}
        <div
          style={{
            gridColumn: '1 / -1',
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
            Read the Final Testament
            <Arrow />
          </Link>
          <Link
            href="/miracle"
            className="ed-btn-ghost"
            style={{ fontFamily: F.serif }}
          >
            The miracle of 19
          </Link>
        </div>

        {/* Stats row */}
        <div
          style={{
            gridColumn: '1 / -1',
            display: 'flex',
            gap: 'clamp(24px, 8vw, 56px)',
            paddingTop: 40,
            borderTop: '1px solid var(--ed-rule)',
            flexWrap: 'wrap',
          }}
        >
          <Stat k="114" label="chapters" />
          <Stat k="6,346" label="verses" />
          <Stat k="4" label="languages" />
          <Stat k="free" label="always" />
        </div>
      </div>

      {/* Background ornament */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          right: -80,
          top: 40,
          width: 420,
          opacity: 0.05,
          pointerEvents: 'none',
          mixBlendMode: 'multiply',
        }}
        className="hidden lg:block"
      >
        <Image
          src="/brand-assets/logo-transparent.png"
          alt=""
          width={420}
          height={420}
        />
      </div>
    </section>
  )
}
