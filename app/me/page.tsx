import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { QueryClient, dehydrate, HydrationBoundary } from '@tanstack/react-query'
import { meApiServer } from '@/src/api/me-server-client'
import MePageClient from './me-client'

export default async function MePage() {
  const session = await auth()
  if (!session?.accessToken) redirect('/auth/sign-in')

  const api = meApiServer(session.accessToken)
  const queryClient = new QueryClient({
    defaultOptions: { queries: { staleTime: 60_000 } },
  })

  await Promise.allSettled([
    queryClient.prefetchQuery({
      queryKey: ['streak', 'quran'],
      queryFn: () => api.getStreak('quran'),
    }),
    queryClient.prefetchQuery({
      queryKey: ['streak', 'bible'],
      queryFn: () => api.getStreak('bible'),
    }),
    queryClient.prefetchQuery({
      queryKey: ['cover-to-cover', 'quran'],
      queryFn: () => api.getCoverToCover('quran'),
    }),
    queryClient.prefetchQuery({
      queryKey: ['cover-to-cover', 'bible'],
      queryFn: () => api.getCoverToCover('bible'),
    }),
    queryClient.prefetchQuery({
      queryKey: ['bookmark-categories'],
      queryFn: () => api.listBookmarkCategories(),
    }),
    queryClient.prefetchQuery({
      queryKey: ['collections'],
      queryFn: () => api.listCollections(),
    }),
    queryClient.prefetchQuery({
      queryKey: ['notes', 'quran'],
      queryFn: () => api.getNotes('quran'),
    }),
    queryClient.prefetchQuery({
      queryKey: ['notes', 'bible'],
      queryFn: () => api.getNotes('bible'),
    }),
  ])

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <MePageClient
        name={session.user?.name}
        email={session.user?.email}
      />
    </HydrationBoundary>
  )
}
