import Link from 'next/link'
import Image from 'next/image'
import { About } from '@/constants/about'
import { FaGithub, FaDiscord, FaYoutube, FaTwitter, FaApple } from 'react-icons/fa'
import { getTranslations } from 'next-intl/server'

const SOCIAL = [
  { icon: FaGithub, href: About.social.github, label: 'GitHub' },
  { icon: FaDiscord, href: About.social.discord, label: 'Discord' },
  { icon: FaYoutube, href: About.social.youtube, label: 'YouTube' },
  { icon: FaTwitter, href: About.social.twitter, label: 'Twitter / X' },
]

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
    ],
  }

  return (
    <footer className="border-t border-border/40 bg-muted/20 mt-24">
      <div className="max-w-7xl mx-auto px-6 py-16">

        {/* Top section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">

          {/* Brand + mission — spans 2 cols on large */}
          <div className="lg:col-span-2 space-y-5">
            <Link href="/" className="flex items-center gap-2.5 w-fit">
              <Image
                src="/brand-assets/logo-transparent.png"
                alt="WikiSubmission"
                width={32}
                height={32}
                className="rounded-full size-8"
              />
              <span className="font-bold text-lg">WikiSubmission</span>
            </Link>

            <p className="text-muted-foreground leading-relaxed max-w-sm">
              {t('missionDesc')}
            </p>

            <div className="space-y-1.5">
              <p className="text-xs font-semibold uppercase tracking-widest">
                {t('poweredHeading')}
              </p>
              <p className="text-xs text-muted-foreground">
                {t.rich('poweredBody', {
                  donateLink: (chunks) => (
                    <Link href="/donate" className="text-primary/70">{chunks}</Link>
                  ),
                })}
              </p>
            </div>

            <div className="space-y-1.5">
              <p className="text-xs font-semibold uppercase tracking-widest">
                {t('connectHeading')}
              </p>
              <p className="text-xs text-muted-foreground">
                {t.rich('connectBody', {
                  email: About.email,
                  discordLink: (chunks) => (
                    <Link href={About.social.discord} className="text-primary/70">{chunks}</Link>
                  ),
                  emailLink: (chunks) => (
                    <Link href={`mailto:${About.email}`} className="text-primary/70">{chunks}</Link>
                  ),
                })}
              </p>
            </div>

            {/* App Store */}
            <a
              href="https://apps.apple.com/us/app/submission-religion-of-god/id6444260632"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 w-fit px-3 py-2 rounded-lg border border-border/60 hover:border-border hover:bg-muted/50 transition-colors"
            >
              <FaApple size={18} />
              <div className="flex flex-col leading-tight">
                <span className="text-[10px] text-muted-foreground">{t('appStorePrefix')}</span>
                <span className="text-xs font-semibold">{t('appStoreLabel')}</span>
              </div>
            </a>
          </div>

          {/* Scripture */}
          <div className="space-y-4">
            <p className="text-xs font-semibold uppercase tracking-widest">
              {t('sectionScripture')}
            </p>
            <ul className="space-y-2.5">
              {LINKS.scripture.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Explore */}
          <div className="space-y-4">
            <p className="text-xs font-semibold uppercase tracking-widest">
              {t('sectionExplore')}
            </p>
            <ul className="space-y-2.5">
              {LINKS.explore.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Organization */}
          <div className="space-y-4">
            <p className="text-xs font-semibold uppercase tracking-widest">
              {t('sectionOrganization')}
            </p>
            <ul className="space-y-2.5">
              {LINKS.organization.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-8 pt-6 border-t border-border/40 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <p>{t('copyright', { year: new Date().getFullYear() })}</p>
          <div className="flex items-center gap-3">
            {SOCIAL.map(({ icon: Icon, href, label }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="size-7 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                <Icon size={14} />
              </a>
            ))}
          </div>
        </div>

      </div>
    </footer>
  )
}
