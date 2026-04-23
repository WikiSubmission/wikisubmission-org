import Link from 'next/link'
import { F, SectionDivider, Arrow } from './shared'

export function ToolsSection() {
  return (
    <section
      style={{
        backgroundColor: 'var(--ed-bg-alt)',
        padding: 'clamp(64px, 8vw, 96px) 0',
      }}
    >
      <div style={{ maxWidth: 1240, margin: '0 auto', padding: '0 40px' }}>
        <SectionDivider num="III" title="Practices & Tools" sub="For daily life" />

        <div
          style={{ gap: 16 }}
          className="grid grid-cols-3 max-md:grid-cols-1"
        >
          {/* Prayer Times — spans 2 columns */}
          <Link
            href="/practices"
            style={{
              gridColumn: 'span 2',
              backgroundColor: 'var(--ed-surface)',
              border: '1px solid var(--ed-rule)',
              borderRadius: 3,
              padding: 32,
              display: 'flex',
              flexDirection: 'column',
              gap: 14,
              textDecoration: 'none',
            }}
            className="max-md:col-span-1 ed-card"
          >
            <span
              style={{
                fontFamily: F.mono,
                fontSize: 10.5,
                letterSpacing: '0.14em',
                textTransform: 'uppercase' as const,
                color: 'var(--ed-accent)',
              }}
            >
              Prayer Times
            </span>
            <div style={{ flex: 1 }}>
              <div
                style={{
                  fontFamily: F.display,
                  fontSize: 22,
                  fontWeight: 500,
                  letterSpacing: '-0.01em',
                  color: 'var(--ed-fg)',
                  marginBottom: 8,
                }}
              >
                Fajr · Dhuhr · Asr · Maghrib · Isha
              </div>
              <p
                style={{
                  fontFamily: F.serif,
                  fontSize: 13,
                  color: 'var(--ed-fg-muted)',
                  lineHeight: 1.55,
                }}
              >
                Accurate prayer times calculated for your location, updated daily.
              </p>
            </div>
            <div className="ed-cta" style={{ fontSize: 13 }}>
              View times <Arrow />
            </div>
          </Link>

          {/* Submission AI */}
          <Link
            href="/chat"
            className="ed-card"
            style={{
              backgroundColor: 'var(--ed-surface)',
              display: 'flex',
              flexDirection: 'column',
              gap: 14,
              padding: 28,
            }}
          >
            <div
              style={{
                width: 40,
                height: 40,
                border: '1px solid var(--ed-accent)',
                borderRadius: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--ed-accent)',
              }}
            >
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <path d="M12 2v3M12 19v3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M2 12h3M19 12h3M4.9 19.1 7 17M17 7l2.1-2.1" />
                <circle cx="12" cy="12" r="4" />
              </svg>
            </div>
            <div style={{ flex: 1 }}>
              <div
                style={{
                  fontFamily: F.display,
                  fontSize: 19,
                  fontWeight: 500,
                  letterSpacing: '-0.01em',
                  color: 'var(--ed-fg)',
                  marginBottom: 6,
                }}
              >
                Submission AI
              </div>
              <p
                style={{
                  fontFamily: F.serif,
                  fontSize: 13,
                  color: 'var(--ed-fg-muted)',
                  lineHeight: 1.55,
                }}
              >
                Ask any question about the Quran or Islamic practice — grounded
                in scripture, not opinion.
              </p>
            </div>
            <div className="ed-cta" style={{ fontSize: 13 }}>
              Ask <Arrow />
            </div>
          </Link>

          {/* Simple tool cards */}
          {[
            {
              href: '/downloads',
              title: 'Downloads',
              desc: 'PDFs, audio, and printable editions.',
              icon: (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M12 3v12M7 10l5 5 5-5M5 21h14" />
                </svg>
              ),
            },
            {
              href: 'https://apps.apple.com/app/id6444260632',
              title: 'iOS & Android',
              desc: 'Read and listen on every device.',
              icon: (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <rect x="6" y="2" width="12" height="20" rx="2" />
                  <circle cx="12" cy="18" r="0.6" fill="currentColor" />
                </svg>
              ),
            },
            {
              href: '/music',
              title: 'Music',
              desc: 'Al-Minshawi, Al-Husary & more.',
              icon: (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M9 18V5l12-2v13" />
                  <circle cx="6" cy="18" r="3" />
                  <circle cx="18" cy="16" r="3" />
                </svg>
              ),
            },
            {
              href: 'https://discord.com/oauth2/authorize?client_id=978658099474890793',
              title: 'Discord Bot',
              desc: 'Verse lookup in your server.',
              icon: (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M8 12h.01M16 12h.01" />
                  <path d="M5 16s1.5 2 7 2 7-2 7-2" />
                  <path d="M7 8s2-3 5-3 5 3 5 3l2 10-3 1-1-2-6 0-1 2-3-1z" />
                </svg>
              ),
            },
          ].map((tool) => (
            <Link
              key={tool.title}
              href={tool.href}
              className="ed-card"
              style={{
                backgroundColor: 'var(--ed-surface)',
                display: 'flex',
                flexDirection: 'column',
                gap: 12,
                padding: 22,
              }}
            >
              <div
                style={{
                  width: 40,
                  height: 40,
                  border: '1px solid var(--ed-rule)',
                  borderRadius: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--ed-fg)',
                }}
              >
                {tool.icon}
              </div>
              <div
                style={{
                  fontFamily: F.display,
                  fontSize: 19,
                  fontWeight: 500,
                  letterSpacing: '-0.01em',
                  color: 'var(--ed-fg)',
                }}
              >
                {tool.title}
              </div>
              <p
                style={{
                  fontFamily: F.serif,
                  fontSize: 13,
                  color: 'var(--ed-fg-muted)',
                  lineHeight: 1.55,
                }}
              >
                {tool.desc}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
