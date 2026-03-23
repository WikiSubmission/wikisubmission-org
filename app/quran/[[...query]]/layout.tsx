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
import { QuranNavSheet } from './client-components/nav-sheet'
import { QuranModeSelector } from './client-components/mode-selector'

export default async function QuranLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ query?: string[] }>
}) {
  const [chaptersRes, appendicesRes, languagesRes] = await Promise.all([
    wsApiServer.GET('/chapters', {
      params: { query: { lang: 'en' } },
      next: { revalidate: 86400 },
    }),
    wsApiServer.GET('/appendices', {
      params: { query: { lang: 'en' } },
      next: { revalidate: 86400 },
    }),
    wsApiServer.GET('/languages', { next: { revalidate: 86400 } }),
  ])

  const { query } = await params

  if (chaptersRes.data && appendicesRes.data) {
    return (
      <QuranPlayerProvider>
        <SiteNav />
        <main className="pt-0">
          <div className="h-svh flex flex-col">
            <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
              {/* Seed language direction data into the client Zustand store */}
              <LanguagesInit languages={languagesRes.data ?? []} />
              {/* Seed chapters + appendices for search autocomplete */}
              <QuranNavInit chapters={chaptersRes.data ?? []} appendices={appendicesRes.data ?? []} />
              {/* Sub-header: nav trigger + mode selector + search + settings */}
              {query && (
                <header className="sticky top-0 z-40 h-16 shrink-0 glass-nav bg-background/80 border-b border-border/40">
                  <div className="max-w-7xl mx-auto px-4 h-full flex flex-row items-center">
                    <div className="flex justify-start w-4/12">
                      <QuranNavSheet
                        chapters={chaptersRes.data}
                        appendices={appendicesRes.data}
                      />
                    </div>
                    <div className="flex items-center gap-2 w-4/12">
                      <QuranSearchBar />
                    </div>
                    <div className="flex justify-end gap-2 w-4/12">
                      <QuranModeSelector />
                      <QuranSettings />
                    </div>
                  </div>
                </header>
              )}
              {/* Main content */}
              <div className="flex flex-1 min-h-0 flex-col gap-4 p-4 pb-4 overflow-y-auto">
                {children}
              </div>
              <MetricsCollector />
              <QuranPlayer />
            </div>
          </div>
        </main>
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
