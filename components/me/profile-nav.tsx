'use client'

/**
 * Two profile-nav layouts. Choose one in /me/me-client.tsx.
 *
 *   ProfileNavMinimal   — back + locale + theme. Quietest. Recommended.
 *   ProfileNavWithMenu  — back + nav items + locale + theme. No UserMenu.
 */

import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'
import { LocaleSwitcher } from '@/components/toggles/locale-switcher'
import { PaletteThemeSwitcher } from '@/components/toggles/palette-theme-switcher'

const F = {
  mono: 'var(--font-jetbrains), ui-monospace, monospace',
  glacial: 'var(--font-glacial), sans-serif',
}

const NAV_ITEMS: { label: string; href: string }[] = [
  { label: 'quran', href: '/quran' },
  { label: 'bible', href: '/bible' },
  { label: 'miracle', href: '/miracle' },
  { label: 'practices', href: '/practices' },
  { label: 'archive', href: '/archive' },
]

function BackButton() {
  const router = useRouter()
  return (
    <button
      type="button"
      onClick={() => {
        if (typeof window !== 'undefined' && window.history.length > 1) {
          router.back()
        } else {
          router.push('/')
        }
      }}
      aria-label="Back"
      className="profile-nav-back"
    >
      <ArrowLeft size={14} aria-hidden />
      <span>Back</span>
    </button>
  )
}

export function ProfileNavMinimal() {
  const locale = useLocale()
  return (
    <div className="profile-nav profile-nav--minimal">
      <BackButton />
      <div className="profile-nav-spacer" />
      <div className="profile-nav-toggles">
        <LocaleSwitcher currentLocale={locale} />
        <PaletteThemeSwitcher />
      </div>
    </div>
  )
}

export function ProfileNavWithMenu() {
  const locale = useLocale()
  const pathname = usePathname()
  const t = useTranslations('navbar')

  return (
    <div className="profile-nav profile-nav--with-menu">
      <BackButton />
      <nav className="profile-nav-items" aria-label="Sections">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href || pathname?.startsWith(`${item.href}/`)
          return (
            <Link
              key={item.label}
              href={item.href}
              className="profile-nav-link"
              data-active={active ? 'true' : 'false'}
            >
              {t(item.label)}
            </Link>
          )
        })}
      </nav>
      <div className="profile-nav-toggles">
        <LocaleSwitcher currentLocale={locale} />
        <PaletteThemeSwitcher />
      </div>
    </div>
  )
}
