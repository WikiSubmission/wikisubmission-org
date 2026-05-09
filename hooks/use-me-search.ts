'use client'

import { useQuery } from '@tanstack/react-query'
import { useSession } from 'next-auth/react'
import { meApi } from '@/src/api/me-client'
import type { SearchResultData } from '@/types/bookmarks'

export function useMeSearch(q: string, scripture?: string): SearchResultData[] {
  const { data: session } = useSession()

  const { data } = useQuery<{ data: SearchResultData[] }>({
    queryKey: ['me-search', q, scripture],
    queryFn: () => meApi.searchNotes(q, scripture),
    enabled: !!session?.accessToken && q.trim().length > 0,
    staleTime: 30_000,
  })

  return data?.data ?? []
}
