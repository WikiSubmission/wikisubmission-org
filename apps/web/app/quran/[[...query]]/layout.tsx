export const dynamic = 'force-dynamic'

import QuranSearchBar from './client-components/search-bar'
import QuranSettings from './client-components/settings'
import MetricsCollector from './mini-components/metrics-collector'
import { QuranPlayer } from '@/components/quran-player/now-playing-bar'
import { wsApiServer } from '@/src/api/server-client'
import { LanguagesInit } from '@/components/languages-init'
import { QuranNavInit } from '@/components/quran-nav-init'
import { SiteNav } from '@/components/site-nav'
import { SiteFooter } from '@/components/site-footer'
import { QuranNavSheet } from './client-components/nav-sheet'
import { QuranModeSelector } from './client-components/mode-selector'
import { QuranScrollContainer } from './client-components/scroll-container'
import { QuranDraftSwitch } from './client-components/draft-switch'
import { QuranPersonalActions } from './mini-components/personal-actions'
import { getLocale } from 'next-intl/server'
import { fetchQuranMetadata, QURAN_REVALIDATE_S } from '@/lib/quran-metadata'

export default async function QuranLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ query?: string[] }>
}) {
  const locale = await getLocale()
  // Titles are chrome — fetchQuranMetadata maps the UI locale to a content
  // language, retries in English, and resolves to [] rather than failing, so a
  // metadata outage costs the chapter picker and not the reader. The shell
  // therefore renders unconditionally: it used to sit behind a
  // `chapters && appendices` guard whose else-branch replaced the whole page
  // with "Something went wrong", which is what every Kurdish reader got.
  const [{ chapters, appendices }, languagesRes] = await Promise.all([
    fetchQuranMetadata(locale),
    wsApiServer.GET('/languages', { next: { revalidate: QURAN_REVALIDATE_S } }),
  ])

  const { query } = await params

  return (
    <>
      {/* Fixed header stack — SiteNav + optional sub-header.
          CSS slides this up by 64px on scroll-down (data-nav-hidden),
          so the sub-header rises to top-0 giving more reading space. */}
      <div className="quran-fixed-headers">
        <SiteNav />
        {query && (
          <header className="relative h-14 glass-nav bg-background/80 border-b border-border/40">
            <div className="quran-reader-toolbar px-3 h-full flex flex-row items-center gap-2 w-full justify-between">
              <div data-search-leading>
                <QuranNavSheet chapters={chapters} appendices={appendices} />
              </div>
              <div className="flex-1 min-w-0">
                <QuranSearchBar />
              </div>
              <div data-search-trailing className="flex items-center gap-2 shrink-0">
                <QuranModeSelector />
                <QuranPersonalActions />
                <QuranSettings />
              </div>
            </div>
          </header>
        )}
      </div>

      {/* Content offset below fixed headers.
          pt-16 (64px) when no sub-header, pt-[120px] (64+56) when sub-header present. */}
      <div className={query ? 'pt-30' : 'pt-16'}>
        <LanguagesInit languages={languagesRes.data ?? []} />
        <QuranNavInit chapters={chapters} appendices={appendices} />
        <QuranScrollContainer>
          <QuranDraftSwitch>{children}</QuranDraftSwitch>
        </QuranScrollContainer>
        <SiteFooter />
        <MetricsCollector />
        <QuranPlayer />
      </div>
    </>
  )
}
