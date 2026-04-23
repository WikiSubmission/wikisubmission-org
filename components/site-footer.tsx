import Link from 'next/link'
import { About } from '@/constants/about'
import { getTranslations } from 'next-intl/server'

const F = {
  display: 'var(--font-cormorant), Georgia, serif',
  mono: 'var(--font-jetbrains), ui-monospace, monospace',
  serif: 'var(--font-source-serif), Georgia, serif',
}

export async function SiteFooter() {
  const t = await getTranslations('footer')
  const nav = await getTranslations('nav')
  const navbar = await getTranslations('navbar')

  const LINKS = {
    scripture: [
      { label: nav('quran'), href: '/quran' },
      { label: nav('proclamation'), href: '/proclamation' },
      { label: nav('introduction'), href: '/introduction' },
      { label: t('linkAppendices'), href: '/appendices/1' },
      { label: t('linkMiracle'), href: '/miracle' },
    ],
    explore: [
      { label: navbar('practices'), href: '/practices' },
      { label: navbar('archive'), href: '/archive' },
      { label: navbar('music'), href: '/music' },
      { label: navbar('blog'), href: '/blog' },
      { label: nav('downloads'), href: '/downloads' },
    ],
    organization: [
      { label: nav('contact'), href: '/contact' },
      { label: nav('donate'), href: '/donate' },
      { label: t('linkPrivacy'), href: '/legal/privacy-policy' },
      { label: t('linkTerms'), href: '/legal/terms-of-use' },
      { label: 'Brand Guidelines', href: '/brand' },
    ],
  }

  const COLS = [
    { heading: 'Scripture', links: LINKS.scripture },
    { heading: 'Explore', links: LINKS.explore },
    { heading: 'Organization', links: LINKS.organization },
  ]

  const SOCIALS = [
    { label: 'GitHub', href: About.social.github },
    { label: 'Discord', href: About.social.discord },
    { label: 'YouTube', href: About.social.youtube },
    { label: 'X', href: About.social.twitter },
  ]

  return (
    <footer
      style={{
        borderTop: '1px solid var(--ed-rule)',
        backgroundColor: 'var(--ed-bg)',
      }}
    >
      <div
        style={{ maxWidth: 1240, margin: '0 auto' }}
        className="px-5 sm:px-10 pt-14 sm:pt-20 pb-10"
      >
        {/* Main grid */}
        <div
          className="grid grid-cols-[2fr_1fr_1fr_1fr] max-md:grid-cols-2 max-sm:grid-cols-1 gap-12 sm:gap-12 md:gap-12 mb-16"
        >
          {/* Brand column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }} className="max-md:col-span-2 max-sm:col-span-1">
            <div>
              <Link
                href="/"
                style={{
                  fontFamily: F.display,
                  fontSize: 24,
                  fontWeight: 600,
                  letterSpacing: '-0.015em',
                  color: 'var(--ed-fg)',
                  textDecoration: 'none',
                  display: 'block',
                }}
              >
                WikiSubmission
              </Link>
            </div>

            <p
              style={{
                fontFamily: F.serif,
                fontSize: 14,
                color: 'var(--ed-fg-muted)',
                lineHeight: 1.6,
                maxWidth: '44ch',
              }}
            >
              A faith-based nonprofit providing free, open-source tools for the
              Final Testament (Quran), the Bible, and religious education —
              <em> in service to God alone</em>.
            </p>

            <div
              style={{
                padding: '14px 16px',
                backgroundColor: 'var(--ed-bg-alt)',
                borderRadius: 2,
                maxWidth: 380,
              }}
            >
              <div
                style={{
                  fontFamily: F.mono,
                  fontSize: 10.5,
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase' as const,
                  color: 'var(--ed-accent)',
                  marginBottom: 4,
                }}
              >
                Supported by contributors
              </div>
              <div
                style={{
                  fontFamily: F.serif,
                  fontSize: 12.5,
                  color: 'var(--ed-fg-muted)',
                  lineHeight: 1.55,
                }}
              >
                501(c)(3) public charity · EIN 39‑4876245 · Donations fully
                tax-deductible.
              </div>
              <Link
                href="/donate"
                className="ed-cta"
                style={{ marginTop: 10, fontFamily: F.serif, fontSize: 13 }}
              >
                Make a donation →
              </Link>
            </div>
          </div>

          {/* Link columns */}
          {COLS.map((col) => (
            <div key={col.heading}>
              <div
                style={{
                  fontFamily: F.mono,
                  fontSize: 11,
                  letterSpacing: '0.18em',
                  textTransform: 'uppercase' as const,
                  color: 'var(--ed-accent)',
                  marginBottom: 18,
                }}
              >
                {col.heading}
              </div>
              <ul
                style={{
                  listStyle: 'none',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 10,
                }}
              >
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="ed-link"
                      style={{
                        fontFamily: F.serif,
                        fontSize: 14,
                        display: 'block',
                      }}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Verse block */}
        <div
          style={{
            padding: '28px 0',
            borderTop: '1px solid var(--ed-rule)',
            borderBottom: '1px solid var(--ed-rule)',
            display: 'flex',
            gap: 20,
            alignItems: 'baseline',
          }}
        >
          <span
            style={{
              fontFamily: F.mono,
              fontSize: 11,
              letterSpacing: '0.12em',
              color: 'var(--ed-accent)',
              flexShrink: 0,
              paddingTop: 2,
            }}
          >
            [112:1–4]
          </span>
          <span
            style={{
              fontFamily: F.display,
              fontStyle: 'italic',
              fontSize: 15,
              lineHeight: 1.55,
              color: 'var(--ed-fg-muted)',
            }}
          >
            Proclaim, &ldquo;He is the One and only GOD. The Absolute GOD. Never did
            He beget. Nor was He begotten. None equals Him.&rdquo;
          </span>
        </div>

        {/* Bottom bar */}
        <div
          style={{
            marginTop: 24,
            fontFamily: F.mono,
            fontSize: 11,
            letterSpacing: '0.1em',
            textTransform: 'uppercase' as const,
            color: 'var(--ed-fg-muted)',
          }}
          className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-3"
        >
          <div className="flex items-center gap-3 flex-wrap">
            <span>© MMXXVI · WikiSubmission.org</span>
            <span style={{ opacity: 0.5 }}>·</span>
            <span>Made for the cause of God</span>
          </div>
          <div className="sm:ml-auto flex gap-4">
            {SOCIALS.map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                className="ed-link"
                style={{ fontFamily: F.mono }}
              >
                {s.label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
