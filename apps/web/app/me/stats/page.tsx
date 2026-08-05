import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { QueryClient, dehydrate, HydrationBoundary } from '@tanstack/react-query'
import { meApiServer } from '@/src/api/me-server-client'
import StatsPageClient from '@/components/me/stats-screen'

export default async function StatsPage() {
  const session = await auth()
  if (!session?.accessToken) redirect('/auth/sign-in')

  const api = meApiServer(session.accessToken)
  const queryClient = new QueryClient({
    defaultOptions: { queries: { staleTime: 60_000 } },
  })

  await Promise.allSettled([
    queryClient.prefetchQuery({
      queryKey: ['reading-stats', 'quran', '30d', 'UTC'],
      queryFn: () => api.getReadingStats('quran', '30d', 'UTC'),
    }),
    queryClient.prefetchQuery({
      queryKey: ['streak', 'quran'],
      queryFn: () => api.getStreak('quran'),
    }),
    queryClient.prefetchQuery({
      queryKey: ['streak', 'bible'],
      queryFn: () => api.getStreak('bible'),
    }),
  ])

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <StatsPageClient />
    </HydrationBoundary>
  )
}
