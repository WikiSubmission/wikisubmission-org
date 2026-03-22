export const dynamic = 'force-dynamic'

import QuranSearchbar from './client-components/searchbar'
import QuranSettings from './client-components/settings'
import MetricsCollector from './mini-components/metrics-collector'
import { QuranPlayerProvider } from '@/lib/quran-audio-context'
import { QuranPlayer } from '@/app/quran/[[...query]]/client-components/now-playing-bar'
import { wsApiServer } from '@/src/api/server-client'
import { LanguagesInit } from '@/components/languages-init'
import { SiteNav } from '@/components/site-nav'
import { QuranNavSheet } from './client-components/nav-sheet'
import { QuranModeSelector } from './client-components/mode-selector'

export default async function QuranLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [chaptersRes, appendicesRes, languagesRes] = await Promise.all([
    wsApiServer.GET('/chapters', { params: { query: { lang: 'en' } } }),
    wsApiServer.GET('/appendices', { params: { query: { lang: 'en' } } }),
    wsApiServer.GET('/languages'),
  ])

  if (chaptersRes.data && appendicesRes.data) {
    return (
      <QuranPlayerProvider>
        <div className="h-svh flex flex-col">
          <SiteNav />
          <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
            {/* Seed language direction data into the client Zustand store */}
            <LanguagesInit languages={languagesRes.data ?? []} />
            {/* Sub-header: nav trigger + search + mode selector + settings */}
            <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-2 px-4 glass-nav bg-background/80 border-b border-border/40">
              <QuranNavSheet
                chapters={chaptersRes.data}
                appendices={appendicesRes.data}
              />
              <QuranSearchbar />
              <QuranModeSelector />
              <QuranSettings />
            </header>
            {/* Main content */}
            <div className="flex flex-1 min-h-0 flex-col gap-4 p-4 pb-4 overflow-y-auto">
              {children}
            </div>
            <MetricsCollector />
            <QuranPlayer />
          </div>
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
