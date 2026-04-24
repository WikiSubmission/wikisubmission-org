import Link from 'next/link'
import { F, SectionDivider, Arrow } from './shared'

export function ScriptureSection() {
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
        <SectionDivider num="I" title="Scripture" sub="Primary Texts" />

        <div
          style={{ gap: 20 }}
          className="grid grid-cols-[2fr_1fr_1fr] max-md:grid-cols-1"
        >
          {/* Featured: Final Testament */}
          <Link
            href="/quran"
            className="ed-card"
            style={{
              display: 'flex',
              backgroundColor: 'var(--ed-surface)',
            }}
          >
            {/* Body */}
            <div
              style={{
                flex: '1.2',
                padding: 'clamp(24px, 6vw, 40px)',
                display: 'flex',
                flexDirection: 'column',
                gap: 16,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  fontFamily: F.mono,
                  fontSize: 10.5,
                  letterSpacing: '0.16em',
                  textTransform: 'uppercase' as const,
                  color: 'var(--ed-accent)',
                }}
              >
                <span
                  style={{
                    width: 5,
                    height: 5,
                    borderRadius: '50%',
                    backgroundColor: 'var(--ed-accent)',
                    display: 'inline-block',
                  }}
                />
                Most read
              </div>
              <h3
                style={{
                  fontFamily: F.display,
                  fontSize: 'clamp(30px, 8vw, 36px)',
                  fontWeight: 500,
                  lineHeight: 1.05,
                  letterSpacing: '-0.02em',
                  color: 'var(--ed-fg)',
                }}
              >
                The Final Testament
                <span
                  style={{ color: 'var(--ed-fg-muted)', fontStyle: 'italic' }}
                >
                  {' '}
                  · Al-Qur&apos;ān
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
                Authorized English version, translated from the Original by
                Rashad Khalifa, Ph.D — with the full Arabic, verse-by-verse
                footnotes, and the mathematical structure intact.
              </p>
              <div
                style={{
                  display: 'flex',
                  gap: 10,
                  flexWrap: 'wrap',
                  fontFamily: F.mono,
                  fontSize: 10.5,
                  color: 'var(--ed-fg-muted)',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase' as const,
                }}
              >
                <span>114 suras</span>
                <span>·</span>
                <span>6,346 verses</span>
                <span>·</span>
                <span>EN · AR · FR · TR</span>
              </div>
              <div
                className="ed-cta"
                style={{ marginTop: 'auto', fontSize: 14 }}
              >
                Open the reader <Arrow />
              </div>
            </div>

            {/* Visual stack */}
            <div
              style={{
                flex: 1,
                position: 'relative',
                backgroundColor: 'var(--ed-bg-alt)',
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
              <div style={{ position: 'relative', width: 180, height: 240 }}>
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'var(--ed-fg)',
                    borderRadius: '2px 8px 8px 2px',
                    opacity: 0.3,
                    transform: 'rotate(6deg) translateX(20px)',
                  }}
                />
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background: `linear-gradient(135deg, color-mix(in oklab, var(--ed-accent), var(--ed-bg) 20%), color-mix(in oklab, var(--ed-accent), var(--ed-fg) 20%))`,
                    borderRadius: '2px 8px 8px 2px',
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
            </div>
          </Link>

          {/* The Bible */}
          <CompactCard
            href="/bible"
            glyph={
              <svg
                width="26"
                height="26"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.4"
              >
                <path d="M4 4h12a4 4 0 0 1 4 4v12" />
                <path d="M4 4v14a2 2 0 0 0 2 2h14" />
                <path d="M8 8h8M8 12h8M8 16h5" />
              </svg>
            }
            title="The Bible"
            desc="Comparative study of the Old &amp; New Testaments — in the light of the Final Testament."
          />

          {/* The Proclamation */}
          <CompactCard
            href="/proclamation"
            glyph={
              <span
                style={{
                  fontFamily: F.display,
                  fontSize: 20,
                  fontWeight: 500,
                  fontStyle: 'italic',
                  color: 'var(--ed-accent)',
                }}
              >
                19
              </span>
            }
            title="The Proclamation"
            desc="One Unified Religion for All the People — Rashad Khalifa, 1989."
          />
        </div>
      </div>
    </section>
  )
}

function CompactCard({
  href,
  glyph,
  title,
  desc,
}: {
  href: string
  glyph: React.ReactNode
  title: string
  desc: string
}) {
  return (
    <Link
      href={href}
      className="ed-card"
      style={{
        display: 'flex',
        flexDirection: 'column',
        padding: 'clamp(24px, 5vw, 32px)',
        gap: 14,
        backgroundColor: 'var(--ed-surface)',
      }}
    >
      <div
        style={{
          width: 44,
          height: 44,
          border: '1px solid var(--ed-rule)',
          borderRadius: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--ed-accent)',
          marginBottom: 8,
        }}
      >
        {glyph}
      </div>
      <h3
        style={{
          fontFamily: F.display,
          fontSize: 22,
          fontWeight: 500,
          letterSpacing: '-0.01em',
          color: 'var(--ed-fg)',
        }}
      >
        {title}
      </h3>
      <p
        style={{
          fontFamily: F.serif,
          fontSize: 13.5,
          color: 'var(--ed-fg-muted)',
          lineHeight: 1.55,
          flex: 1,
        }}
        dangerouslySetInnerHTML={{ __html: desc }}
      />
      <div className="ed-cta" style={{ fontSize: 13 }}>
        Read <Arrow />
      </div>
    </Link>
  )
}
