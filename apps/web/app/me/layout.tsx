import type { ReactNode } from 'react'
import { redirect } from 'next/navigation'
import { QueryClient, dehydrate, HydrationBoundary } from '@tanstack/react-query'
import { auth } from '@/auth'
import { meApiServer } from '@/src/api/me-server-client'
import { SiteNav } from '@/components/site-nav'
import { MeHeader } from '@/components/me/me-header'
import './me.css'

export default async function MeLayout({ children }: { children: ReactNode }) {
  const session = await auth()
  if (!session?.accessToken) redirect('/auth/sign-in')

  const api = meApiServer(session.accessToken)
  const queryClient = new QueryClient({
    defaultOptions: { queries: { staleTime: 60_000 } },
  })

  await Promise.allSettled([
    queryClient.prefetchQuery({
      queryKey: ['bookmark-categories'],
      queryFn: () => api.listBookmarkCategories(),
    }),
    queryClient.prefetchQuery({
      queryKey: ['collections'],
      queryFn: () => api.listCollections(),
    }),
  ])

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <div className="ws-account-root flex flex-col min-h-screen bg-[var(--ed-bg)] text-[var(--ed-fg)] w-full">
        <SiteNav />
        <MeHeader />
        <div className="flex-1 w-full">
          {children}
        </div>
      </div>
    </HydrationBoundary>
  )
}
