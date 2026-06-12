'use client'

import { useQuery } from '@tanstack/react-query'
import { useSession } from 'next-auth/react'
import { meApi } from '@/src/api/me-client'
import type { ReadingStatsData, ReadingStatsRange } from '@/types/bookmarks'

function resolveTz(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'
  } catch {
    return 'UTC'
  }
}

export function useReadingStats(
  scripture: 'quran' | 'bible',
  range: ReadingStatsRange = '30d',
): { data: ReadingStatsData | null; isLoading: boolean; isError: boolean } {
  const { data: session } = useSession()
  const tz = resolveTz()
  const { data, isLoading, isError } = useQuery({
    queryKey: ['reading-stats', scripture, range, tz],
    queryFn: () => meApi.getReadingStats(scripture, range, tz),
    enabled: !!session?.accessToken,
    staleTime: 60_000,
  })
  return { data: data?.data ?? null, isLoading, isError }
}
