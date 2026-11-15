'use client'

import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useTranslations } from 'next-intl'

/**
 * Translated chrome around the appendix body.
 *
 * The page itself is a server component so the MDX content can be imported at
 * build time, but `output: 'export'` prerenders with no request context — a
 * server-side translation would freeze English into the static HTML. Anything
 * the locale switcher must be able to change has to render on the client.
 */

interface AppendixLink {
  number: number
  title: string
}

export function AppendixEmptyState() {
  const t = useTranslations('mobile.appendix')
  return (
    <p className="text-muted-foreground py-8 text-center text-sm">{t('comingSoon')}</p>
  )
}

export function AppendixPagination({
  prev,
  next,
}: {
  prev?: AppendixLink
  next?: AppendixLink
}) {
  const t = useTranslations('mobile.appendix')

  return (
    <div className="border-border/40 flex items-center justify-between gap-4 border-t pt-4">
      {prev ? (
        <Link
          href={`/appendices/${prev.number}`}
          className="text-muted-foreground hover:text-primary flex min-w-0 items-center gap-2 text-sm transition-colors"
        >
          <ChevronLeft className="rtl-flip size-4 shrink-0" aria-hidden="true" />
          <span className="truncate">
            <span className="block text-xs">{t('label', { number: prev.number })}</span>
            <span className="font-medium">{prev.title}</span>
          </span>
        </Link>
      ) : (
        <span />
      )}

      {next ? (
        <Link
          href={`/appendices/${next.number}`}
          className="text-muted-foreground hover:text-primary flex min-w-0 items-center gap-2 text-end text-sm transition-colors"
        >
          <span className="truncate">
            <span className="block text-xs">{t('label', { number: next.number })}</span>
            <span className="font-medium">{next.title}</span>
          </span>
          <ChevronRight className="rtl-flip size-4 shrink-0" aria-hidden="true" />
        </Link>
      ) : (
        <span />
      )}
    </div>
  )
}
