import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar'
import { QuranSidebar } from './client-components/sidebar'
import { PageSwitcher } from '@/components/page-switcher'
import QuranSearchbar from './client-components/searchbar'
import QuranSettings from './client-components/settings'
import MetricsCollector from './mini-components/metrics-collector'
import { QuranPlayerProvider } from '@/lib/quran-audio-context'
import { QuranPlayer } from '@/app/quran/[[...query]]/client-components/now-playing-bar'
import { wsApiServer } from '@/src/api/server-client'
import { LanguagesInit } from '@/components/languages-init'

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

  console.log('[layout] baseUrl:', process.env.INTERNAL_API_URL ?? process.env.NEXT_PUBLIC_API_URL)
  console.log('[layout] chapters:', chaptersRes.data ? `ok (${chaptersRes.data.length})` : `error: ${JSON.stringify(chaptersRes.error)}`)
  console.log('[layout] appendices:', appendicesRes.data ? `ok (${appendicesRes.data.length})` : `error: ${JSON.stringify(appendicesRes.error)}`)

  if (chaptersRes.data && appendicesRes.data) {
    return (
      <QuranPlayerProvider>
        <SidebarProvider>
          {/* Seed language direction data into the client Zustand store */}
          <LanguagesInit languages={languagesRes.data ?? []} />
          {/* Sidebar (left space) */}
          <QuranSidebar
            chapters={chaptersRes.data}
            appendices={appendicesRes.data}
          />
          {/* Main content (right space) */}
          <SidebarInset>
            {/* Header */}
            <header className="sticky top-0 z-50 flex h-16 shrink-0 items-center gap-2 px-4 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 border-b">
              <SidebarTrigger className="-ml-1 bg-secondary/50 rounded-full p-4 hover:bg-secondary/70 cursor-pointer lg:hidden" />
              <PageSwitcher currentPage="quran" />
              <QuranSearchbar />
              <QuranSettings />
            </header>
            {/* Main content */}
            <div className="flex flex-1 flex-col gap-4 p-4 pb-24">
              {children}
            </div>
            <MetricsCollector />
            <QuranPlayer />
          </SidebarInset>
        </SidebarProvider>
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
