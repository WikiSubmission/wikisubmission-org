import { Suspense } from 'react'
import { SiteNav } from '@/components/site-nav'
import { SiteFooter } from '@/components/site-footer'
import { BibleNavSheet } from './client-components/bible-nav-sheet'
import { BibleModeSelector } from './client-components/bible-mode-selector'
import BibleSettings from './client-components/bible-settings'
import BibleSearchBar from './client-components/bible-search-bar'

export default async function BibleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ query?: string[] }>
}) {
  const { query } = await params
  const hasQuery = query && query.length > 0

  return (
    <>
      <div className="quran-fixed-headers">
        <SiteNav />
        {hasQuery && (
          <header className="h-14 glass-nav bg-background/80 border-b border-border/40">
            <div className="px-3 h-full flex-row flex items-center gap-2 w-full justify-between">
              <BibleNavSheet />
              <Suspense>
                <BibleSearchBar className="flex-1 min-w-0" />
              </Suspense>
              <div className="flex flex-row gap-2">
                <div className="flex gap-2 shrink-0">
                  <BibleModeSelector />
                </div>
                <BibleSettings />
              </div>
            </div>
          </header>
        )}
      </div>

      <div className={hasQuery ? 'pt-30' : 'pt-16'}>
        {children}
        <SiteFooter />
      </div>
    </>
  )
}
