import type { ReactNode } from 'react'
import { SiteNav } from '@/components/site-nav'
import { SiteFooter } from '@/components/site-footer'

// Shared admin chrome. Per-page gating happens in each page.tsx so the games
// studio (reachable by non-admin editors) and admin-only pages can coexist
// under one route tree.
export const dynamic = 'force-dynamic'

export default function AdminLayout({ children }: { children: ReactNode }) {
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
