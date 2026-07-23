'use client'

import { useQuery } from '@tanstack/react-query'
import { useScriptureAuth } from '@/lib/scripture-auth-context'
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
  const { isSignedIn } = useScriptureAuth()
  const tz = resolveTz()
  const { data, isLoading, isError } = useQuery({
    queryKey: ['reading-stats', scripture, range, tz],
    queryFn: () => meApi.getReadingStats(scripture, range, tz),
    enabled: isSignedIn,
    staleTime: 60_000,
  })
  return { data: data?.data ?? null, isLoading, isError }
}
