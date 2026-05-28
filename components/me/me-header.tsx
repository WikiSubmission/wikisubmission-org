'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Fragment } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import { LocaleSwitcher } from '@/components/toggles/locale-switcher'
import { PaletteThemeSwitcher } from '@/components/toggles/palette-theme-switcher'
import { useCollections } from '@/hooks/use-collections'
import { useBookmarkCategories } from '@/hooks/use-bookmark-categories'

const ME_ROOT_RE = /^\/me\/?$/

type Crumb = { label: string; href?: string }

function useCrumbs(pathname: string): Crumb[] {
  const t = useTranslations('meHeader')
  const collections = useCollections()
  const categories = useBookmarkCategories()

  const segments = pathname.split('/').filter(Boolean)
  if (segments[0] !== 'me') return []

  const crumbs: Crumb[] = [{ label: t('profile'), href: '/me' }]
  if (segments.length === 1) return crumbs

  const section = segments[1]
  const id = segments[2]

  if (section === 'notes') {
    crumbs.push({ label: t('notes') })
    return crumbs
  }

  if (section === 'stats') {
    crumbs.push({ label: t('stats') })
    return crumbs
  }

  if (section === 'settings') {
    crumbs.push({ label: t('settings') })
    return crumbs
  }

  if (section === 'activity') {
    crumbs.push({ label: t('activity') })
    return crumbs
  }

  if (section === 'collections') {
    crumbs.push({ label: t('collections'), href: id ? '/me/collections' : undefined })
    if (id) {
      const numericId = Number.parseInt(id, 10)
      const item = Number.isFinite(numericId)
        ? collections.find((c) => c.id === numericId)
        : null
      crumbs.push({ label: item?.name ?? t('untitled') })
    }
    return crumbs
  }

  if (section === 'bookmarks') {
    crumbs.push({ label: t('bookmarks'), href: id ? '/me#bookmarks' : undefined })
    if (id) {
      const numericId = Number.parseInt(id, 10)
      const item = Number.isFinite(numericId)
        ? categories.find((c) => c.id === numericId)
        : null
      crumbs.push({ label: item?.name ?? t('untitled') })
    }
    return crumbs
  }

  crumbs.push({ label: section })
  return crumbs
}

function RootLinks() {
  const t = useTranslations("meHeader")

  return (
    <nav className="me-breadcrumb" aria-label="Profile links">
      <Link href="/me/settings">{t("settings")}</Link>
      <span className="sep" aria-hidden>/</span>
      <Link href="/me/activity">{t("activity")}</Link>
    </nav>
  )
}

function Breadcrumb({ crumbs }: { crumbs: Crumb[] }) {
  return (
    <nav className="me-breadcrumb" aria-label="Breadcrumb">
      {crumbs.map((crumb, i) => {
        const isLast = i === crumbs.length - 1
        return (
          <Fragment key={`${crumb.label}-${i}`}>
            {i > 0 ? (
              <span className="sep" aria-hidden>
                /
              </span>
            ) : null}
            {crumb.href && !isLast ? (
              <Link href={crumb.href}>{crumb.label}</Link>
            ) : (
              <span className={isLast ? 'crumb-current' : undefined}>{crumb.label}</span>
            )}
          </Fragment>
        )
      })}
    </nav>
  )
}

export function MeHeader() {
  const pathname = usePathname() ?? '/me'
  const locale = useLocale()
  const isRoot = ME_ROOT_RE.test(pathname)
  const crumbs = useCrumbs(pathname)

  return (
    <div className="me-header">
      {isRoot ? <RootLinks /> : <Breadcrumb crumbs={crumbs} />}
      <div className="me-header-spacer" />
      <div className="me-header-toggles">
        <LocaleSwitcher currentLocale={locale} />
        <PaletteThemeSwitcher />
      </div>
    </div>
  )
}
