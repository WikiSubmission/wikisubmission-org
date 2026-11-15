'use client'

import { Suspense } from 'react'
import { usePathname } from 'next/navigation'
import { QuranPlayer } from '@/components/quran-player/now-playing-bar'
import QuranSearchBar from '@web/app/quran/[[...query]]/client-components/search-bar'
import QuranSettings from '@web/app/quran/[[...query]]/client-components/settings'
import { QuranNavSheet } from '@web/app/quran/[[...query]]/client-components/nav-sheet'
import { QuranModeSelector } from '@web/app/quran/[[...query]]/client-components/mode-selector'
import { QuranScrollContainer } from '@web/app/quran/[[...query]]/client-components/scroll-container'
import { QuranPersonalActions } from '@/components/quran/personal-actions'
import { LanguagesInit } from '@web/components/languages-init'
import { QuranNavInit } from '@web/components/quran-nav-init'
import { DesktopNav } from '@/components/desktop-nav'
import { useAppendices, useChapters, useLanguages } from '@/hooks/use-quran-metadata'

const EMPTY: never[] = []

/** Chapter pages and the search page get the reader sub-header. */
function isReaderPath(pathname: string): boolean {
  return /^\/quran\/(\d{1,3}|search)\/?$/.test(pathname)
}

/**
 * Desktop counterpart of apps/web/app/quran/[[...query]]/layout.tsx. Same fixed
 * header stack and offsets; the chapter, appendix and language lists the web
 * layout fetches on the server are fetched here on the client instead.
 *
 * It wraps every /quran route, including the index and the word lab, which the
 * web app gives their own layouts. Those pages render no sub-header.
 */
export default function QuranLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? ''
  const reader = isReaderPath(pathname)
  const chapters = useChapters().data ?? EMPTY
  const appendices = useAppendices().data ?? EMPTY
  const languages = useLanguages().data ?? EMPTY

  return (
    <>
      {/* Fixed header stack. CSS slides it up 64px on scroll-down
          (data-nav-hidden), so the sub-header rises to the top. */}
      <div className="quran-fixed-headers">
        <DesktopNav />
        {reader && (
          <header className="relative h-14 glass-nav bg-background/80 border-b border-border/40">
            {/* Several toolbar controls read useSearchParams, which needs a
                Suspense boundary in a static export. */}
            <Suspense fallback={null}>
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
            </Suspense>
          </header>
        )}
      </div>

      <div className={reader ? 'pt-30' : 'pt-16'}>
        <LanguagesInit languages={languages} />
        <QuranNavInit chapters={chapters} appendices={appendices} />
        <QuranScrollContainer>
          <Suspense fallback={null}>{children}</Suspense>
        </QuranScrollContainer>
        <QuranPlayer />
      </div>
    </>
  )
}
