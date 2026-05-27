import type { ReactNode } from 'react'
import { SiteNav } from '@/components/site-nav'
import { SiteFooter } from '@/components/site-footer'

// Auth + editor gating is handled in page.tsx, not here, so an unauthorized
// visitor still sees the chrome with the "not authorized" message.
export const dynamic = 'force-dynamic'

export default function StudioGamesLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <div className="quran-fixed-headers">
        <SiteNav />
      </div>
      <main className="pt-16">{children}</main>
      <SiteFooter />
    </>
  )
}
