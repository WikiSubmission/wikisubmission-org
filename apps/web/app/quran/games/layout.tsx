import type { ReactNode } from 'react'
import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { SiteNav } from '@/components/site-nav'
import { SiteFooter } from '@/components/site-footer'

export const dynamic = 'force-dynamic'

export default async function GamesLayout({ children }: { children: ReactNode }) {
  const session = await auth()
  if (!session?.accessToken) redirect('/auth/sign-in?next=/quran/games')

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
