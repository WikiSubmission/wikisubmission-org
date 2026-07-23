'use client'

import { useRef } from 'react'
import { usePathname } from 'next/navigation'
import {
  activeTab,
  isQuranReaderRoute,
  isTabRoot,
  normalizePath,
  screenTitle,
} from '@/constants/navigation'
import { MobileTopBar } from '@/components/mobile-top-bar'
import { QuranPlayer } from '@/components/quran-player/now-playing-bar'
import { TabBar } from '@/components/tab-bar'
import { AmbientBackdrop } from '@/components/today/ambient-backdrop'
import { usePageEnterAnimation } from '@/hooks/use-page-enter-animation'
import { useReaderChromeScroll } from '@/hooks/use-reader-chrome-scroll'

/**
 * App chrome wrapper: fixed top bar + scrollable body + fixed bottom tab bar.
 * The body padding clears both fixed bars (plus safe-area insets) so screen
 * content is never hidden behind them.
 *
 * Quran chapter pages run in immersive mode: no tab bar at all, and the top
 * bar auto-hides while scrolling down (a slight upward scroll reveals it) so
 * the reading window is as tall as possible.
 */
export function MobileShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const tab = activeTab(pathname)
  const atRoot = isTabRoot(pathname)
  const reading = isQuranReaderRoute(pathname)
  const mainRef = useRef<HTMLElement>(null)

  useReaderChromeScroll(reading)
  usePageEnterAnimation(mainRef)

  const onToday = normalizePath(pathname) === '/'

  return (
    <div className="flex min-h-dvh flex-col">
      {/* Time-of-day scene behind every screen; full strength on Today, faded
          back elsewhere so dense content stays legible. */}
      <AmbientBackdrop subdued={!onToday} />
      <MobileTopBar
        title={screenTitle(pathname) ?? tab?.label ?? 'WikiSubmission'}
        showBack={!atRoot}
      />
      <main
        ref={mainRef}
        className="relative z-10 flex flex-1 flex-col"
        style={{
          paddingTop: 'calc(env(safe-area-inset-top) + 3.5rem)',
          paddingBottom: reading
            ? 'calc(env(safe-area-inset-bottom) + 1rem)'
            : 'calc(env(safe-area-inset-bottom) + 4rem)',
        }}
      >
        {children}
      </main>
      {/* Global mount: the bar follows audio across tabs and renders null when
          idle. Offset clears the fixed h-16 tab bar plus the safe area — on
          reader pages there is no tab bar, so it hugs the bottom. */}
      <QuranPlayer
        positionClassName={
          reading
            ? 'bottom-[env(safe-area-inset-bottom)] pb-2'
            : 'bottom-[calc(env(safe-area-inset-bottom)+4rem)] pb-2'
        }
      />
      {!reading && <TabBar />}
    </div>
  )
}
