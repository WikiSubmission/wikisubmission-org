'use client'

import { usePathname } from 'next/navigation'
import { activeTab, isTabRoot } from '@/constants/navigation'
import { MobileTopBar } from '@/components/mobile-top-bar'
import { TabBar } from '@/components/tab-bar'

/**
 * App chrome wrapper: fixed top bar + scrollable body + fixed bottom tab bar.
 * The body padding clears both fixed bars (plus safe-area insets) so screen
 * content is never hidden behind them.
 */
export function MobileShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const tab = activeTab(pathname)
  const atRoot = isTabRoot(pathname)

  return (
    <div className="flex min-h-dvh flex-col">
      <MobileTopBar title={tab?.label ?? 'WikiSubmission'} showBack={!atRoot} />
      <main
        className="flex flex-1 flex-col"
        style={{
          paddingTop: 'calc(env(safe-area-inset-top) + 3.5rem)',
          paddingBottom: 'calc(env(safe-area-inset-bottom) + 4rem)',
        }}
      >
        {children}
      </main>
      <TabBar />
    </div>
  )
}
