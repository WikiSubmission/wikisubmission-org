import Image from 'next/image'
import Link from 'next/link'
import { About } from '@/constants/about'
import { getTranslations } from 'next-intl/server'
import { FaApple, FaDiscord, FaGithub, FaYoutube } from 'react-icons/fa'
import { FaXTwitter } from 'react-icons/fa6'
import { ArrowUpRight } from 'lucide-react'

const F = {
  display: 'var(--font-cormorant), Georgia, serif',
  serif: 'var(--font-source-serif), Georgia, serif',
  mono: 'var(--font-jetbrains), monospace',
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
      { label: navbar('chat'), href: '/chat' },
      { label: nav('downloads'), href: '/downloads' },
    ],
    organization: [
      { label: nav('contact'), href: '/contact' },
      { label: nav('donate'), href: '/donate' },
      { label: t('linkBrand'), href: '/brand' },
      { label: t('linkPrivacy'), href: '/legal/privacy-policy' },
      { label: t('linkTerms'), href: '/legal/terms-of-use' },
    ],
  }

  const COLS = [
    {
      heading: t('sectionScripture'),
      links: LINKS.scripture,
    },
    {
      heading: t('sectionExplore'),
      links: LINKS.explore,
    },
    {
      heading: t('sectionOrganization'),
      links: LINKS.organization,
    },
  ]

  const SOCIALS = [
    { label: 'GitHub', href: About.social.github, icon: FaGithub },
    { label: 'Discord', href: About.social.discord, icon: FaDiscord },
    { label: 'YouTube', href: About.social.youtube, icon: FaYoutube },
    { label: 'X', href: About.social.twitter, icon: FaXTwitter },
  ]

  return (
    <footer className="border-t border-[var(--ed-rule)] bg-[var(--ed-bg)] text-[var(--ed-fg)] select-none">
      <div className="mx-auto max-w-[1280px] px-5 sm:px-8 lg:px-10 py-10 sm:py-12">
        {/* Main Brand + Nav Columns */}
        <div className="grid grid-cols-2 gap-8 md:grid-cols-5 lg:gap-10">
          {/* Brand & Mission (spans 2 columns on tablet/desktop) */}
          <div className="col-span-2 flex flex-col justify-between pr-0 md:pr-6">
            <div className="space-y-3">
              <Link
                href="/"
                className="group inline-flex items-center gap-2.5 text-inherit no-underline"
                aria-label="WikiSubmission Home"
              >
                <Image
                  src="/brand-assets/logo-mark.png"
                  alt=""
                  width={26}
                  height={26}
                  className="size-[26px] object-contain transition-transform duration-300 group-hover:scale-105"
                />
                <span
                  className="text-xl font-semibold tracking-tight text-[var(--ed-fg)]"
                  style={{ fontFamily: F.display }}
                >
                  WikiSubmission
                </span>
              </Link>

              <p
                className="m-0 text-[13px] leading-relaxed text-[var(--ed-fg-muted)] max-w-[340px]"
                style={{ fontFamily: F.serif }}
              >
                {t('missionDesc')}
              </p>
            </div>

            <div className="mt-5 flex items-center gap-3 text-[11px] font-mono text-[var(--ed-fg-muted)]">
              <span className="opacity-80">501(c)(3) · EIN 39-4876245</span>
              <span className="opacity-30">·</span>
              <a
                href="https://apps.apple.com/us/app/submission-religion-of-god/id6444260632"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[var(--ed-fg-muted)] hover:text-[var(--ed-accent)] transition-colors"
              >
                <FaApple size={12} className="shrink-0" />
                <span>iOS App</span>
                <ArrowUpRight size={10} className="opacity-60" />
              </a>
            </div>
          </div>

          {/* 3 Navigation Columns */}
          {COLS.map((col) => (
            <div key={col.heading} className="flex flex-col">
              <span className="text-[10.5px] font-mono uppercase tracking-[0.16em] font-semibold text-[var(--ed-accent)] mb-3">
                {col.heading}
              </span>
              <ul className="m-0 flex flex-col gap-2 p-0 list-none">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-[13px] text-[var(--ed-fg-muted)] hover:text-[var(--ed-fg)] transition-colors inline-block"
                      style={{ fontFamily: F.serif }}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Compact Utility Bar */}
        <div className="mt-8 pt-5 border-t border-[var(--ed-rule)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-[11px] font-mono text-[var(--ed-fg-muted)] flex-wrap">
            <span>{t('copyrightLine')}</span>
            <span className="opacity-30">·</span>
            <span>{t('madeForCause')}</span>
            <span className="opacity-30">·</span>
            <span className="text-[var(--ed-accent)] opacity-90">Open-Source & Ad-Free</span>
          </div>

          <div className="flex items-center gap-1.5">
            {SOCIALS.map((s) => {
              const Icon = s.icon
              return (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  title={s.label}
                  className="flex size-7 items-center justify-center rounded-[4px] border border-[var(--ed-rule)] text-[var(--ed-fg-muted)] hover:border-[var(--ed-accent)] hover:text-[var(--ed-accent)] hover:bg-[color-mix(in_oklab,var(--ed-accent),transparent_94%)] transition-colors"
                >
                  <Icon size={12} />
                </a>
              )
            })}
          </div>
        </div>
      </div>
    </footer>
  )
}
