import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { QueryClient, dehydrate, HydrationBoundary } from '@tanstack/react-query'
import { meApiServer } from '@/src/api/me-server-client'
import { listContentDocs } from '@/lib/editorial-content-client'
import { getEditorialSession } from '@/lib/editorial-client'
import { canWriteContentModule } from '@/lib/editorial-access'
import MePageClient from './me-client'

export default async function MePage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>
}) {
  const session = await auth()
  if (!session?.accessToken) redirect('/auth/sign-in')
  const { tab } = await searchParams

  const api = meApiServer(session.accessToken)
  const queryClient = new QueryClient({
    defaultOptions: { queries: { staleTime: 60_000 } },
  })

  const hasEditorialAccess = session.isEditorialEditor === true || session.isAdmin === true

  const [, , , , , , articlesRes, editorialSession] = await Promise.allSettled([
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
      queryKey: ['notes', 'quran'],
      queryFn: () => api.getNotes('quran'),
    }),
    queryClient.prefetchQuery({
      queryKey: ['notes', 'bible'],
      queryFn: () => api.getNotes('bible'),
    }),
    hasEditorialAccess
      ? listContentDocs(session.accessToken, 'article', { limit: 100 })
      : Promise.resolve({ docs: [], total: 0 }),
    hasEditorialAccess
      ? getEditorialSession(session.accessToken)
      : Promise.resolve(null),
  ])

  const articles =
    articlesRes.status === 'fulfilled' ? articlesRes.value.docs : []
  const editorial =
    editorialSession.status === 'fulfilled' ? editorialSession.value : null
  const canWriteArticles = editorial ? canWriteContentModule(editorial, 'article') : false

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <MePageClient
        name={session.user?.name}
        email={session.user?.email}
        settingsInitialTab={tab}
        initialArticles={articles}
        editorialSession={editorial}
        canWriteArticles={canWriteArticles}
      />
    </HydrationBoundary>
  )
}
