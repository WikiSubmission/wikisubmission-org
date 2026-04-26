export const dynamic = 'force-dynamic'

import QuranSearchBar from './client-components/search-bar'
import QuranSettings from './client-components/settings'
import MetricsCollector from './mini-components/metrics-collector'
import { QuranPlayerProvider } from '@/lib/quran-audio-context'
import { QuranPlayer } from '@/app/quran/[[...query]]/client-components/now-playing-bar'
import { wsApiServer } from '@/src/api/server-client'
import { LanguagesInit } from '@/components/languages-init'
import { QuranNavInit } from '@/components/quran-nav-init'
import { SiteNav } from '@/components/site-nav'
import { SiteFooter } from '@/components/site-footer'
import { QuranNavSheet } from './client-components/nav-sheet'
import { QuranModeSelector } from './client-components/mode-selector'
import { QuranScrollContainer } from './client-components/scroll-container'
import { getLocale } from 'next-intl/server'

export default async function QuranLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ query?: string[] }>
}) {
  const locale = await getLocale()
  const [chaptersRes, appendicesRes, languagesRes] = await Promise.all([
    wsApiServer.GET('/chapters', {
      params: { query: { lang: locale } },
      next: { revalidate: 86400 },
    }),
    wsApiServer.GET('/appendices', {
      params: { query: { lang: locale } },
      next: { revalidate: 86400 },
    }),
    wsApiServer.GET('/languages', { next: { revalidate: 86400 } }),
  ])

  const { query } = await params

  if (chaptersRes.data && appendicesRes.data) {
    return (
      <QuranPlayerProvider>
        {/* Fixed header stack — SiteNav + optional sub-header.
            CSS slides this up by 64px on scroll-down (data-nav-hidden),
            so the sub-header rises to top-0 giving more reading space. */}
        <div className="quran-fixed-headers">
          <SiteNav />
          {query && (
            <header className="h-14 glass-nav bg-background/80 border-b border-border/40">
              <div className="px-3 h-full flex flex-row items-center gap-2 w-full justify-between">
                <QuranNavSheet
                  chapters={chaptersRes.data}
                  appendices={appendicesRes.data}
                />
                <div className="flex-1 min-w-0">
                  <QuranSearchBar />
                </div>
                <div className="flex gap-2 shrink-0">
                  <QuranModeSelector />
                </div>
                <QuranSettings />
              </div>
            </header>
          )}
        </div>

        {/* Content offset below fixed headers.
            pt-16 (64px) when no sub-header, pt-[120px] (64+56) when sub-header present. */}
        <div className={query ? 'pt-30' : 'pt-16'}>
          <LanguagesInit languages={languagesRes.data ?? []} />
          <QuranNavInit
            chapters={chaptersRes.data ?? []}
            appendices={appendicesRes.data ?? []}
          />
          <QuranScrollContainer>{children}</QuranScrollContainer>
          <SiteFooter />
          <MetricsCollector />
          <QuranPlayer />
        </div>
      </QuranPlayerProvider>
    )
  } else {
    return (
      <div>
        <p>Something went wrong</p>
      </div>
    )
  }
}
