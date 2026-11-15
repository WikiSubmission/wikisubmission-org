'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useLocale, useTranslations } from 'next-intl'
import { Languages, Settings } from 'lucide-react'
import { SiteBrand } from '@web/components/site-brand'
import { PaletteThemeSwitcher } from '@web/components/toggles/palette-theme-switcher'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { LOCALE_CHANGED_EVENT, LOCALE_LABELS, SUPPORTED_LOCALES } from '@/constants/locales'
import { cn } from '@/lib/utils'

type NavItem = { href: string; label: string; match: (path: string) => boolean }

/** Trailing-slash-insensitive prefix test (the export uses trailing slashes). */
function under(prefix: string) {
  return (path: string) => {
    const p = path.replace(/\/+$/, '') || '/'
    return p === prefix || p.startsWith(prefix + '/')
  }
}

/**
 * Top bar of the desktop app. 64px tall (h-16) to match the reader's fixed
 * header stack (see .quran-fixed-headers in globals.css). It links only to
 * what ships offline: no blog, music, donations, chat or sign-in.
 */
export function DesktopNav() {
  const pathname = usePathname() ?? '/'
  const t = useTranslations()

  const items: NavItem[] = [
    {
      href: '/quran/',
      label: t('nav.quran'),
      match: (p) => under('/quran')(p) && !under('/quran/index')(p) && !under('/quran/words')(p),
    },
    { href: '/quran/index/', label: t('quran.indexTitle'), match: under('/quran/index') },
    { href: '/quran/words/', label: t('navbar.wordLab'), match: under('/quran/words') },
    { href: '/appendices/', label: t('sidebar.appendices'), match: under('/appendices') },
    { href: '/miracle/', label: t('navbar.miracle'), match: under('/miracle') },
    {
      href: '/me/',
      label: t('quran.bandStudy'),
      match: (p) => under('/me')(p) && !under('/me/settings')(p),
    },
  ]

  return (
    <nav className="glass-nav h-16 border-b border-border/40 bg-background/80">
      <div className="mx-auto flex h-full max-w-6xl items-center gap-6 px-4">
        <SiteBrand />
        <ul className="flex min-w-0 flex-1 items-center gap-1 overflow-x-auto">
          {items.map((item) => {
            const active = item.match(pathname)
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={active ? 'page' : undefined}
                  className={cn(
                    'whitespace-nowrap rounded-md px-3 py-1.5 text-sm transition-colors',
                    active
                      ? 'bg-muted font-medium text-foreground'
                      : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground',
                  )}
                >
                  {item.label}
                </Link>
              </li>
            )
          })}
        </ul>
        <div className="flex shrink-0 items-center gap-1">
          <DesktopLocaleSwitcher />
          <PaletteThemeSwitcher />
          <Link
            href="/me/settings/"
            aria-label={t('settings.title')}
            title={t('settings.title')}
            className={cn(
              'inline-flex size-8 items-center justify-center rounded-md transition-colors hover:bg-muted',
              under('/me/settings')(pathname) ? 'text-foreground' : 'text-muted-foreground',
            )}
          >
            <Settings className="size-4" />
          </Link>
        </div>
      </div>
    </nav>
  )
}

/** Language picker. IntlProvider persists the choice and swaps catalogs. */
function DesktopLocaleSwitcher() {
  const locale = useLocale()
  const t = useTranslations('settings')
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={t('language')}
        title={t('language')}
        className="inline-flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      >
        <Languages className="size-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {SUPPORTED_LOCALES.map((code) => (
          <DropdownMenuItem
            key={code}
            onSelect={() =>
              window.dispatchEvent(new CustomEvent(LOCALE_CHANGED_EVENT, { detail: code }))
            }
            className={cn(code === locale && 'font-semibold')}
          >
            {LOCALE_LABELS[code]}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
