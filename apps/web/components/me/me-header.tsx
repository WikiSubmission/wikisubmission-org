'use client'

import Link from 'next/link'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { Fragment } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import { ChevronLeft } from 'lucide-react'
import { LocaleSwitcher } from '@/components/toggles/locale-switcher'
import { PaletteThemeSwitcher } from '@/components/toggles/palette-theme-switcher'
import { useCollections } from '@/hooks/use-collections'
import { useBookmarkCategories } from '@/hooks/use-bookmark-categories'

const ME_ROOT_RE = /^\/me\/?$/
const ME_PATH_RE = /^(\/[a-z]{2}(-[A-Z]{2})?)?\/me(\/|$)/

type Crumb = { label: string; href?: string }

function normalizeMePath(pathname: string, locale: string): string {
  if (pathname === `/${locale}` || pathname === `/${locale}/`) return '/'
  if (pathname.startsWith(`/${locale}/`)) return pathname.slice(locale.length + 1)
  return pathname
}

function useCrumbs(pathname: string, detailId: string | null): Crumb[] {
  const t = useTranslations('meHeader')
  const collections = useCollections()
  const categories = useBookmarkCategories()

  const segments = pathname.split('/').filter(Boolean)
  if (segments[0] !== 'me') return []

  const crumbs: Crumb[] = [{ label: t('profile'), href: '/me' }]
  if (segments.length === 1) return crumbs

  const section = segments[1]
  // Detail routes (bookmarks/collections) now carry the id in ?id= rather than
  // a path segment, so the deep-linked item name comes from the query.
  const id = detailId ?? undefined

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
      const item = Number.isFinite(numericId) ? collections.find((c) => c.id === numericId) : null
      crumbs.push({ label: item?.name ?? t('untitled') })
    }
    return crumbs
  }

  if (section === 'bookmarks') {
    crumbs.push({ label: t('bookmarks'), href: id ? '/me#bookmarks' : undefined })
    if (id) {
      const numericId = Number.parseInt(id, 10)
      const item = Number.isFinite(numericId) ? categories.find((c) => c.id === numericId) : null
      crumbs.push({ label: item?.name ?? t('untitled') })
    }
    return crumbs
  }

  crumbs.push({ label: section })
  return crumbs
}

function RootNav() {
  const t = useTranslations('meHeader')
  const router = useRouter()

  function handleBack() {
    const stored = typeof window !== 'undefined' ? sessionStorage.getItem('me.preReferrer') : null
    if (stored && !ME_PATH_RE.test(stored)) {
      router.push(stored)
      return
    }
    router.push('/')
  }

  return (
    <nav className="me-breadcrumb" aria-label="Profile navigation">
      <button type="button" className="me-header-back" onClick={handleBack}>
        <ChevronLeft size={14} aria-hidden />
        <span>{t('back')}</span>
      </button>
      <span className="sep" aria-hidden>|</span>
      <Link href="/me/settings">{t('settings')}</Link>
      <span className="sep" aria-hidden>|</span>
      <Link href="/me/activity">{t('activity')}</Link>
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
  const searchParams = useSearchParams()
  const locale = useLocale()
  const normalizedPath = normalizeMePath(pathname, locale)
  const isRoot = ME_ROOT_RE.test(normalizedPath)
  const crumbs = useCrumbs(normalizedPath, searchParams.get('id'))

  return (
    <div className="me-header">
      {isRoot ? <RootNav /> : <Breadcrumb crumbs={crumbs} />}
      <div className="me-header-spacer" />
      <div className="me-header-toggles">
        <LocaleSwitcher currentLocale={locale} />
        <PaletteThemeSwitcher />
      </div>
    </div>
  )
}
