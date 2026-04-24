import Image from 'next/image'
import Link from 'next/link'
import { F, Arrow } from './shared'

export function ClosingSection() {
  return (
    <section
      className="px-4 sm:px-6 md:px-10"
      style={{
        backgroundColor: 'var(--ed-fg)',
        color: 'var(--ed-bg)',
        paddingTop: 'clamp(72px, 12vw, 144px)',
        paddingBottom: 'clamp(72px, 12vw, 144px)',
      }}
    >
      <div
        style={{
          maxWidth: 880,
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 32,
          textAlign: 'center',
        }}
      >
        {/* Logo mark */}
        <div style={{ width: 80 }}>
          <Image
            src="/brand-assets/logo-transparent.png"
            alt=""
            width={80}
            height={80}
            aria-hidden
          />
        </div>

        {/* Quote */}
        <h2
          style={{
            fontFamily: F.display,
            fontSize: 'clamp(32px, 4vw, 52px)',
            fontWeight: 400,
            lineHeight: 1.2,
            letterSpacing: '-0.02em',
            maxWidth: '20ch',
            color: 'var(--ed-bg)',
          }}
        >
          &ldquo;Say, I am instructed to worship God,{' '}
          <em>devoting</em>{' '}my religion absolutely to Him alone.&rdquo;
        </h2>

        <div
          style={{
            fontFamily: F.mono,
            fontSize: 12,
            letterSpacing: '0.18em',
            textTransform: 'uppercase' as const,
            opacity: 0.6,
          }}
        >
          — 39:11
        </div>

        {/* CTAs */}
        <div
          style={{
            display: 'flex',
            gap: 12,
            marginTop: 12,
            flexWrap: 'wrap',
            justifyContent: 'center',
          }}
        >
          <Link
            href="/quran"
            className="ed-btn-inv"
            style={{ fontFamily: F.serif }}
          >
            Start at chapter 1
            <Arrow />
          </Link>
          <Link
            href="/donate"
            className="ed-btn-ghost-inv"
            style={{ fontFamily: F.serif }}
          >
            Support the mission
          </Link>
        </div>
      </div>
    </section>
  )
}
