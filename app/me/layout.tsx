import type { ReactNode } from 'react'
import { redirect } from 'next/navigation'
import { QueryClient, dehydrate, HydrationBoundary } from '@tanstack/react-query'
import { auth } from '@/auth'
import { meApiServer } from '@/src/api/me-server-client'
import { MeHeader } from '@/components/me/me-header'

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
      <div className="ed-page">
        <MeHeader />
        {children}
      </div>
    </HydrationBoundary>
  )
}
