import type { ReactNode } from 'react'
import { SiteNav } from '@/components/site-nav'
import { SiteFooter } from '@/components/site-footer'

// The topical index sits outside app/quran/[[...query]], whose layout lives
// inside the catch-all segment and so does not apply here — the same situation
// app/quran/words and app/quran/games are in. Chrome is therefore declared
// locally, mirroring app/quran/games/layout.tsx minus its auth redirect: the
// index is public.
export default function QuranIndexLayout({ children }: { children: ReactNode }) {
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
