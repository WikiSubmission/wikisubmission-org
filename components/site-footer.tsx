import Link from 'next/link'
import Image from 'next/image'
import { About } from '@/constants/about'
import { FaGithub, FaDiscord, FaYoutube, FaTwitter, FaApple } from 'react-icons/fa'

const LINKS = {
  scripture: [
    { label: 'Quran', href: '/quran' },
    { label: 'Proclamation', href: '/proclamation' },
    { label: 'Introduction', href: '/introduction' },
    { label: 'Appendices', href: '/appendices/1' },
    { label: 'Miracle of 19', href: '/miracle' },
  ],
  explore: [
    { label: 'Practices', href: '/practices' },
    { label: 'Archive', href: '/archive' },
    { label: 'Music', href: '/music' },
    { label: 'Blog', href: '/blog' },
    { label: 'Downloads', href: '/downloads' },
  ],
  organization: [
    { label: 'Contact', href: '/contact' },
    { label: 'Donate', href: '/donate' },
    { label: 'Privacy Policy', href: '/legal/privacy-policy' },
    { label: 'Terms of Use', href: '/legal/terms-of-use' },
  ],
}

const SOCIAL = [
  { icon: FaGithub, href: About.social.github, label: 'GitHub' },
  { icon: FaDiscord, href: About.social.discord, label: 'Discord' },
  { icon: FaYoutube, href: About.social.youtube, label: 'YouTube' },
  { icon: FaTwitter, href: About.social.twitter, label: 'Twitter / X' },
]

export function SiteFooter() {
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

            <p className="text-sm text-muted-foreground leading-relaxed max-w-sm">
              Faith-based 501(c)(3) nonprofit organization providing free and open-source technology, educational resources, and creative works in the cause of God.
            </p>

            <div className="space-y-1.5">
              <p className="text-xs font-semibold uppercase tracking-widest text-primary/70">
                POWERED BY YOUR CONTRIBUTIONS
              </p>
              <p className="text-xs text-muted-foreground">
                We are commmitted to continue developing free and open-source tools & technology. No ads, no paywalls. To help us in this cause, you can <Link href="/donate" className='text-primary/70'>make a contribution.</Link> As a 501(c)(3) registered nonprofit (EIN: 39-4876245), your donations may be tax-deductible depending on your country.
              </p>
            </div>

            <div className="space-y-1.5">
              <p className="text-xs font-semibold uppercase tracking-widest text-primary/70">
                CONNECT WITH US
              </p>
              <p className="text-xs text-muted-foreground">
                Our team is growing. If you&apos;d like to get involved, or have any questions, connect with us on <Link href="/donate" className='text-primary/70'>Discord</Link> or email us at <Link href={`mailto:${About.email}`} className='text-primary/70'>{About.email}</Link>
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
                <span className="text-[10px] text-muted-foreground">Download on the</span>
                <span className="text-xs font-semibold">App Store</span>
              </div>
            </a>

            {/* Social icons */}
            <div className="flex items-center gap-3 pt-1">
              {SOCIAL.map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="size-8 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {/* Scripture */}
          <div className="space-y-4">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Scripture
            </p>
            <ul className="space-y-2.5">
              {LINKS.scripture.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Explore */}
          <div className="space-y-4">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Explore
            </p>
            <ul className="space-y-2.5">
              {LINKS.explore.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Organization */}
          <div className="space-y-4">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Organization
            </p>
            <ul className="space-y-2.5">
              {LINKS.organization.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-16 pt-6 border-t border-border/40 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} WikiSubmission. All rights reserved.</p>
        </div>

      </div>
    </footer>
  )
}
