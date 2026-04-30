import Link from 'next/link'
import { About } from '@/constants/about'
import { getTranslations } from 'next-intl/server'
import { FaApple, FaDiscord, FaGithub, FaYoutube } from 'react-icons/fa'
import { FaXTwitter } from 'react-icons/fa6'

const F = {
  display: 'var(--font-cormorant), Georgia, serif',
  serif: 'var(--font-source-serif), Georgia, serif',
  glacial: 'var(--font-glacial), sans-serif',
}

export async function SiteFooter() {
  const t = await getTranslations('footer')
  const nav = await getTranslations('nav')
  const navbar = await getTranslations('navbar')

  const LINKS = {
    scripture: [
      { label: nav('quran'), href: '/quran' },
      { label: navbar('bible'), href: '/bible' },
      { label: nav('proclamation'), href: '/proclamation' },
      { label: nav('introduction'), href: '/introduction' },
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
    ],
  }

  const COLS = [
    { heading: t('sectionScripture'), links: LINKS.scripture },
    { heading: t('sectionExplore'), links: LINKS.explore },
    { heading: t('sectionOrganization'), links: LINKS.organization },
  ]

  const SOCIALS = [
    { label: 'GitHub', href: About.social.github, icon: FaGithub },
    { label: 'Discord', href: About.social.discord, icon: FaDiscord },
    { label: 'YouTube', href: About.social.youtube, icon: FaYoutube },
    { label: 'X', href: About.social.twitter, icon: FaXTwitter },
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
              {t('missionDesc')}
            </p>

            <a
              href="https://apps.apple.com/us/app/submission-religion-of-god/id6444260632"
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${t('appStorePrefix')} ${t('appStoreLabel')}`}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 10,
                padding: '8px 16px',
                backgroundColor: '#000',
                color: '#fff',
                borderRadius: 8,
                textDecoration: 'none',
                width: 'fit-content',
                border: '1px solid #000',
                lineHeight: 1,
              }}
            >
              <FaApple size={26} aria-hidden="true" />
              <span
                style={{
                  display: 'inline-flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  gap: 2,
                  lineHeight: 1,
                }}
              >
                <span
                  style={{
                    fontFamily:
                      '-apple-system, BlinkMacSystemFont, "Helvetica Neue", Arial, sans-serif',
                    fontSize: 10,
                    fontWeight: 400,
                    letterSpacing: '0.02em',
                  }}
                >
                  {t('appStorePrefix')}
                </span>
                <span
                  style={{
                    fontFamily:
                      '-apple-system, BlinkMacSystemFont, "Helvetica Neue", Arial, sans-serif',
                    fontSize: 19,
                    fontWeight: 500,
                    letterSpacing: '-0.01em',
                  }}
                >
                  {t('appStoreLabel')}
                </span>
              </span>
            </a>

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
                  fontFamily: F.glacial,
                  fontSize: 10.5,
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase' as const,
                  color: 'var(--ed-accent)',
                  marginBottom: 4,
                }}
              >
                {t('supportHeading')}
              </div>
              <div
                style={{
                  fontFamily: F.serif,
                  fontSize: 12.5,
                  color: 'var(--ed-fg-muted)',
                  lineHeight: 1.55,
                }}
              >
                {t('supportBody')}
              </div>
              <Link
                href="/donate"
                className="ed-cta"
                style={{ marginTop: 10, fontFamily: F.serif, fontSize: 13 }}
              >
                {t('donateCta')}
              </Link>
            </div>
          </div>

          {/* Link columns */}
          {COLS.map((col) => (
            <div key={col.heading}>
              <div
                style={{
                  fontFamily: F.glacial,
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
              fontFamily: F.glacial,
              fontSize: 11,
              letterSpacing: '0.12em',
              color: 'var(--ed-accent)',
              flexShrink: 0,
              paddingTop: 2,
            }}
          >
            112:1–4
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
            {t('verse112')}
          </span>
        </div>

        {/* Bottom bar */}
        <div
          style={{
            marginTop: 24,
            fontFamily: F.glacial,
            fontSize: 11,
            letterSpacing: '0.1em',
            textTransform: 'uppercase' as const,
            color: 'var(--ed-fg-muted)',
          }}
          className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-3"
        >
          <div className="flex items-center gap-3 flex-wrap">
            <span>{t('copyrightLine')}</span>
            <span style={{ opacity: 0.5 }}>·</span>
            <span>{t('madeForCause')}</span>
          </div>
          <div className="sm:ml-auto flex gap-4">
            {SOCIALS.map((s) => {
              const Icon = s.icon
              return (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={s.label}
                className="ed-link inline-flex items-center gap-1.5"
                style={{ fontFamily: F.glacial }}
              >
                <Icon className="size-3.5" aria-hidden="true" />
                <span>{s.label}</span>
              </a>
            )})}
          </div>
        </div>
      </div>
    </footer>
  )
}
