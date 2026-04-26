'use client'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { F, SectionDivider } from './shared'

const PRAYER_TIMES: { time: string; active: boolean }[] = [
  { time: '05:12', active: false },
  { time: '12:30', active: false },
  { time: '15:42', active: true },
  { time: '18:15', active: false },
  { time: '19:48', active: false },
]

export function PracticesSection() {
  const t = useTranslations('homePage.practices')
  const PRAYER_NAMES = [
    t('fajr'),
    t('dhuhr'),
    t('asr'),
    t('maghrib'),
    t('isha'),
  ]
  const activeIdx = PRAYER_TIMES.findIndex((p) => p.active)
  const activeName = activeIdx >= 0 ? PRAYER_NAMES[activeIdx] : ''
  const activeTime = activeIdx >= 0 ? PRAYER_TIMES[activeIdx].time : ''

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
        <SectionDivider
          num={t('dividerNum')}
          title={t('dividerTitle')}
          sub={t('dividerSub')}
        />

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
              <span>{t('prayerKicker')}</span>
              <span>
                {t('prayerNext')} ·{' '}
                <strong style={{ color: 'var(--ed-accent)', fontWeight: 600 }}>
                  {activeName} · {activeTime}
                </strong>
              </span>
            </div>

            <div className="grid grid-cols-5 gap-2">
              {PRAYER_TIMES.map(({ time, active }, i) => (
                <div
                  key={i}
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
                    {PRAYER_NAMES[i]}
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
              {t('prayerDesc')}
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
              <span>{t('zakatKicker')}</span>
              <span>
                <strong style={{ color: 'var(--ed-accent)', fontWeight: 600 }}>
                  2.5%
                </strong>{' '}
                · {t('zakatRateLabel')}
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
              {t('zakatQuote')}
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
                {t('zakatRef')}
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
              {t('zakatDesc')}
            </p>
          </Link>
        </div>
      </div>
    </section>
  )
}
