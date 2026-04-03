'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { Menu, X } from 'lucide-react'
import { ThemeToggle } from '@/components/toggles/theme-toggle'
import { LocaleSwitcher } from '@/components/toggles/locale-switcher'
// import { SignInButton, SignedIn, SignedOut, UserButton } from '' // Phase 3, but using supabase auth
import { cn } from '@/lib/utils'
import { useTranslations, useLocale } from 'next-intl'

const NAV_LINKS = [
  { label: 'home', href: '/' },
  { label: 'scripture', href: '/quran' },
  { label: 'bible', href: '/bible' },
  { label: 'miracle', href: '/miracle' },
  { label: 'practices', href: '/practices' },
  { label: 'archive', href: '/archive' },
  { label: 'music', href: '/music' },
  { label: 'blog', href: '/blog' },
]

export function SiteNav() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const pathname = usePathname()
  const t = useTranslations('navbar')
  const locale = useLocale()

  return (
    <nav className="sticky top-0 z-50 w-full glass-nav bg-background/80 border-b border-border/40">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-8">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2.5 shrink-0"
          onClick={() => setMobileOpen(false)}
        >
          <Image
            src="/brand-assets/logo-transparent.png"
            alt="WikiSubmission"
            width={32}
            height={32}
            className="rounded-full size-8"
          />
          <span className="font-headline font-bold text-lg hidden sm:block">
            WikiSubmission
          </span>
        </Link>

        {/* Desktop nav links */}
        <div className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'text-sm font-medium transition-colors hover:text-primary',
                pathname === link.href ||
                  (link.href !== '/' && pathname?.startsWith(link.href))
                  ? 'text-primary font-semibold'
                  : 'text-muted-foreground'
              )}
            >
              {t(link.label)}
            </Link>
          ))}
        </div>

        {/* Right controls */}
        <div className="flex items-center gap-2">
          <LocaleSwitcher currentLocale={locale} />
          <ThemeToggle />
          {/* Phase 3: auth
          <SignedOut>
            <SignInButton mode="modal">
              <button className="hidden sm:flex h-9 items-center px-4 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">
                Sign in
              </button>
            </SignInButton>
          </SignedOut>
          <SignedIn>
            <UserButton />
          </SignedIn>
          */}
          {/* Mobile hamburger */}
          <button
            className="md:hidden h-9 w-9 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-border/40 bg-background/95 backdrop-blur-sm px-6 py-4 flex flex-col gap-1">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                'px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                pathname === link.href ||
                  (link.href !== '/' && pathname?.startsWith(link.href))
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
              )}
            >
              {t(link.label)}
            </Link>
          ))}
          <div className="mt-2 pt-2 border-t border-border/40">
            <LocaleSwitcher currentLocale={locale} />
          </div>
        </div>
      )}
    </nav>
  )
}
