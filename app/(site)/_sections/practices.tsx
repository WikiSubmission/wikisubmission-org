import Link from 'next/link'
import { F, SectionDivider } from './shared'

const PRAYERS: [string, string, boolean][] = [
  ['Fajr', '05:12', false],
  ['Dhuhr', '12:30', false],
  ['Asr', '15:42', true],
  ['Maghrib', '18:15', false],
  ['Isha', '19:48', false],
]

export function PracticesSection() {
  return (
    <section
      style={{
        backgroundColor:
          'color-mix(in oklab, var(--ed-bg), var(--ed-surface) 20%)',
        padding: 'clamp(64px, 8vw, 96px) 0',
      }}
    >
      <div
        className="px-4 sm:px-6 md:px-10"
        style={{ maxWidth: 1240, margin: '0 auto' }}
      >
        <SectionDivider num="IV" title="Practices" sub="Daily observance" />

        <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: 20 }}>
          {/* Prayer tile */}
          <Link
            href="/practices"
            className="ed-card"
            style={{
              backgroundColor: 'var(--ed-surface)',
              padding: 'clamp(24px, 5vw, 36px)',
              display: 'flex',
              flexDirection: 'column',
              gap: 20,
              textDecoration: 'none',
            }}
          >
            <div
              className="flex items-center justify-between"
              style={{
                fontFamily: F.mono,
                fontSize: 10.5,
                letterSpacing: '0.16em',
                textTransform: 'uppercase',
                color: 'var(--ed-fg-muted)',
              }}
            >
              <span>The Contact Prayers</span>
              <span>
                Next ·{' '}
                <strong style={{ color: 'var(--ed-accent)', fontWeight: 600 }}>
                  Asr · 15:42
                </strong>
              </span>
            </div>

            <div className="grid grid-cols-5 gap-2">
              {PRAYERS.map(([name, time, active]) => (
                <div
                  key={name}
                  style={{
                    padding: '12px 8px',
                    border: '1px solid var(--ed-rule)',
                    borderRadius: 2,
                    textAlign: 'center',
                    background: active
                      ? 'color-mix(in oklab, var(--ed-accent), transparent 88%)'
                      : 'var(--ed-bg)',
                    borderColor: active ? 'var(--ed-accent)' : 'var(--ed-rule)',
                  }}
                >
                  <div
                    style={{
                      fontFamily: F.mono,
                      fontSize: 9.5,
                      letterSpacing: '0.14em',
                      textTransform: 'uppercase',
                      color: active ? 'var(--ed-accent)' : 'var(--ed-fg-muted)',
                    }}
                  >
                    {name}
                  </div>
                  <div
                    style={{
                      fontFamily: F.display,
                      fontSize: 17,
                      fontWeight: 500,
                      color: 'var(--ed-fg)',
                      marginTop: 4,
                      letterSpacing: '-0.01em',
                    }}
                  >
                    {time}
                  </div>
                </div>
              ))}
            </div>

            <p
              style={{
                fontFamily: F.serif,
                fontSize: 14,
                lineHeight: 1.6,
                color: 'var(--ed-fg-muted)',
                margin: 0,
              }}
            >
              Five daily contacts with God — observed at their proper
              astronomical times. The second pillar of Submission, alongside
              belief itself.
            </p>
          </Link>

          {/* Zakaat tile */}
          <Link
            href="/practices"
            className="ed-card"
            style={{
              backgroundColor: 'var(--ed-surface)',
              padding: 'clamp(24px, 5vw, 36px)',
              display: 'flex',
              flexDirection: 'column',
              gap: 20,
              textDecoration: 'none',
            }}
          >
            <div
              className="flex items-center justify-between"
              style={{
                fontFamily: F.mono,
                fontSize: 10.5,
                letterSpacing: '0.16em',
                textTransform: 'uppercase',
                color: 'var(--ed-fg-muted)',
              }}
            >
              <span>The Obligatory Charity</span>
              <span>
                <strong style={{ color: 'var(--ed-accent)', fontWeight: 600 }}>
                  2.5%
                </strong>{' '}
                · on income
              </span>
            </div>

            <blockquote
              style={{
                fontFamily: F.display,
                fontSize: 'clamp(18px, 3.6vw, 21px)',
                lineHeight: 1.5,
                color: 'var(--ed-fg)',
                fontStyle: 'italic',
                margin: 0,
                letterSpacing: '-0.01em',
                borderLeft: '2px solid var(--ed-accent)',
                paddingLeft: 18,
              }}
            >
              &ldquo;Charities shall go to the poor, the needy, the workers who
              collect them, the new converts, to free the slaves, to those
              burdened by sudden expenses, in the cause of GOD, and to the
              traveling alien.&rdquo;
              <span
                style={{
                  display: 'block',
                  fontFamily: F.mono,
                  fontSize: 10.5,
                  letterSpacing: '0.16em',
                  textTransform: 'uppercase',
                  color: 'var(--ed-accent)',
                  fontStyle: 'normal',
                  marginTop: 12,
                }}
              >
                — Quran 9:60
              </span>
            </blockquote>

            <p
              style={{
                fontFamily: F.serif,
                fontSize: 14,
                lineHeight: 1.6,
                color: 'var(--ed-fg-muted)',
                margin: 0,
              }}
            >
              A 2.5% charity on every income, paid the moment you receive it —
              to the eight categories God has specified. No threshold, no lunar
              year.
            </p>
          </Link>
        </div>
      </div>
    </section>
  )
}
