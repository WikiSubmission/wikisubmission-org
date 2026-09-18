'use client'

import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import { Fragment, Suspense } from 'react'
import { ArrowLeft } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'
import { useCollections } from '@/hooks/use-collections'
import { useBookmarkCategories } from '@/hooks/use-bookmark-categories'

const ME_ROOT_RE = /^\/me\/?$/

type Crumb = { label: string; href?: string }

type HeaderItem = {
  id?: number | string
  name?: string
  title?: string
}

function normalizeMePath(pathname: string, locale: string): string {
  if (pathname === `/${locale}` || pathname === `/${locale}/`) return '/'
  if (pathname.startsWith(`/${locale}/`)) return pathname.slice(locale.length + 1)
  return pathname
}

function extractItems(raw: unknown): HeaderItem[] {
  if (Array.isArray(raw)) {
    return raw as HeaderItem[]
  }
  if (typeof raw === 'object' && raw !== null) {
    const record = raw as Record<string, unknown>
    if (Array.isArray(record.collections)) return record.collections as HeaderItem[]
    if (Array.isArray(record.categories)) return record.categories as HeaderItem[]
    if (Array.isArray(record.data)) return record.data as HeaderItem[]
  }
  return []
}

function useCrumbs(pathname: string, detailId: string | null, localePrefix = ''): Crumb[] {
  const t = useTranslations('meHeader')
  const rawCollections = useCollections()
  const rawCategories = useBookmarkCategories()

  const collections = extractItems(rawCollections)
  const categories = extractItems(rawCategories)

  const segments = pathname.split('/').filter(Boolean)
  if (segments[0] !== 'me') return []

  const rootHref = `${localePrefix}/me`
  const crumbs: Crumb[] = [{ label: t('profile'), href: rootHref }]
  if (segments.length === 1) return crumbs

  const section = segments[1]
  const id = detailId ?? segments[2] ?? undefined

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
    crumbs.push({
      label: t('collections'),
      href: id ? `${localePrefix}/me/collections` : undefined,
    })
    if (id) {
      const numericId = Number.parseInt(id, 10)
      const item = collections.find(
        (c) => String(c?.id) === id || (Number.isFinite(numericId) && c?.id === numericId)
      )
      crumbs.push({ label: item?.name ?? item?.title ?? t('untitled') })
    }
    return crumbs
  }

  if (section === 'bookmarks') {
    crumbs.push({
      label: t('bookmarks'),
      href: id ? `${localePrefix}/me#bookmarks` : undefined,
    })
    if (id) {
      const numericId = Number.parseInt(id, 10)
      const item = categories.find(
        (c) => String(c?.id) === id || (Number.isFinite(numericId) && c?.id === numericId)
      )
      crumbs.push({ label: item?.name ?? item?.title ?? t('untitled') })
    }
    return crumbs
  }

  crumbs.push({ label: section })
  return crumbs
}

function Breadcrumb({ crumbs }: { crumbs: Crumb[] }) {
  return (
    <nav className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wider text-[var(--ed-fg-muted)]" aria-label="Breadcrumb">
      {crumbs.map((crumb, i) => {
        const isLast = i === crumbs.length - 1
        return (
          <Fragment key={`${crumb.label}-${i}`}>
            {i > 0 ? (
              <span className="opacity-30" aria-hidden="true">
                /
              </span>
            ) : null}
            {crumb.href && !isLast ? (
              <Link href={crumb.href} className="hover:text-[var(--ed-fg)] transition-colors">
                {crumb.label}
              </Link>
            ) : (
              <span
                className={isLast ? 'text-[var(--ed-accent)] font-semibold' : undefined}
                aria-current={isLast ? 'page' : undefined}
              >
                {crumb.label}
              </span>
            )}
          </Fragment>
        )
      })}
    </nav>
  )
}

function MeHeaderContent() {
  const pathname = usePathname() ?? '/me'
  const searchParams = useSearchParams()
  const locale = useLocale()

  const hasLocalePrefix = pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  const localePrefix = hasLocalePrefix ? `/${locale}` : ''

  const normalizedPath = normalizeMePath(pathname, locale)
  const isRoot = ME_ROOT_RE.test(normalizedPath)
  const crumbs = useCrumbs(normalizedPath, searchParams.get('id'), localePrefix)

  if (isRoot) return null

  return (
    <div className="w-full border-b border-[var(--ed-rule)] bg-[var(--ed-bg)]">
      <div className="max-w-[960px] mx-auto px-4 sm:px-6 py-3 flex items-center justify-between text-[12px] font-mono">
        <Link
          href={`${localePrefix}/me`}
          className="inline-flex items-center gap-1.5 text-[var(--ed-fg-muted)] hover:text-[var(--ed-fg)] transition-colors cursor-pointer"
        >
          <ArrowLeft size={13} />
          <span>Dashboard</span>
        </Link>
        <Breadcrumb crumbs={crumbs} />
      </div>
    </div>
  )
}

export function MeHeader() {
  return (
    <Suspense fallback={null}>
      <MeHeaderContent />
    </Suspense>
  )
}