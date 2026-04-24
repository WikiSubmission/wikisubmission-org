import Link from 'next/link'
import { F, SectionDivider, Arrow } from './shared'

function Fact({ k, v, note }: { k: string; v: string; note: string }) {
  return (
    <div
      style={{
        padding: 'clamp(24px, 5vw, 32px) clamp(20px, 5vw, 28px)',
        backgroundColor: 'var(--ed-surface)',
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
      }}
    >
      <div
        style={{
          fontFamily: F.display,
          fontSize: 36,
          letterSpacing: '-0.02em',
          fontWeight: 500,
          lineHeight: 1,
          color: 'var(--ed-fg)',
        }}
      >
        {k}
      </div>
      <div
        style={{
          fontFamily: F.serif,
          fontSize: 13.5,
          color: 'var(--ed-fg-muted)',
          marginBottom: 4,
        }}
      >
        {v}
      </div>
      <div
        style={{
          fontFamily: F.mono,
          fontSize: 10.5,
          textTransform: 'uppercase' as const,
          letterSpacing: '0.12em',
          color: 'var(--ed-accent)',
          marginTop: 'auto',
        }}
      >
        {note}
      </div>
    </div>
  )
}

export function MiracleSection() {
  return (
    <section
      className="px-4 sm:px-6 md:px-10"
      style={{
        paddingTop: 'clamp(72px, 10vw, 120px)',
        paddingBottom: 'clamp(72px, 10vw, 120px)',
        maxWidth: 1240,
        margin: '0 auto',
      }}
    >
      <SectionDivider num="II" title="The Miracle" sub="A physical proof" />

      <div
        style={{ gap: 72, alignItems: 'stretch' }}
        className="grid grid-cols-[1.2fr_1fr] max-md:grid-cols-1 max-md:gap-12"
      >
        {/* Left: 19 + description */}
        <div
          className="max-sm:flex-col max-sm:gap-6"
          style={{ display: 'flex', gap: 32, alignItems: 'flex-start' }}
        >
          <div
            aria-hidden
            style={{
              fontFamily: F.display,
              fontSize: 'clamp(84px, 24vw, 200px)',
              lineHeight: 0.85,
              letterSpacing: '-0.04em',
              color: 'var(--ed-accent)',
              display: 'flex',
              alignItems: 'baseline',
              flexShrink: 0,
              userSelect: 'none',
            }}
          >
            <span style={{ fontStyle: 'italic' }}>1</span>
            <span style={{ fontStyle: 'italic' }}>9</span>
          </div>
          <div>
            <h3
              style={{
                fontFamily: F.display,
                fontSize: 'clamp(34px, 8vw, 44px)',
                fontWeight: 500,
                letterSpacing: '-0.025em',
                lineHeight: 1.05,
                marginBottom: 8,
                color: 'var(--ed-fg)',
              }}
            >
              Over it is nineteen.
            </h3>
            <p
              style={{
                fontFamily: F.mono,
                fontSize: 11,
                letterSpacing: '0.14em',
                textTransform: 'uppercase' as const,
                color: 'var(--ed-fg-muted)',
                marginBottom: 20,
              }}
            >
              Sura 74, verse 30
            </p>
            <p
              style={{
                fontFamily: F.serif,
                fontSize: 16,
                color: 'var(--ed-fg-muted)',
                lineHeight: 1.65,
                marginBottom: 24,
                maxWidth: '44ch',
              }}
            >
              The Quran is mathematically composed — every chapter, every
              Bismillah, every letter count interlocked through the number
              nineteen. It could not have been authored by a human.
            </p>
            <Link href="/miracle" className="ed-cta">
              See the evidence <Arrow />
            </Link>
          </div>
        </div>

        {/* Right: 2×2 fact grid */}
        <div
          className="grid grid-cols-1 sm:grid-cols-2"
          style={{
            gap: 0,
            border: '1px solid var(--ed-rule)',
            borderRadius: 3,
            overflow: 'hidden',
          }}
        >
          {[
            { k: '114', v: 'chapters', note: '= 19 × 6' },
            { k: '6,346', v: 'numbered verses', note: 'digit sum = 19' },
            { k: '19', v: 'letters in Bismillah', note: 'opens the Quran' },
            { k: '1,974', v: 'years gap', note: 'to decoded year' },
          ].map((f, i) => (
            <div
              key={i}
              className="border-b last:border-b-0 sm:last:border-b-0 sm:[&:nth-child(-n+2)]:border-b sm:[&:nth-child(odd)]:border-r sm:[&:nth-child(3)]:border-b-0"
            >
              <Fact {...f} />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
