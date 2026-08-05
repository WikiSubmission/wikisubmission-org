'use client'

import { useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { ZIKR_FALLBACK } from '@/constants/zikr-fallback'
import {
  fetchZikrList,
  readCachedZikrList,
  writeCachedZikrList,
  type ZikrItem,
} from '@/lib/zikr'

/**
 * Zikr list for the Today strip. Never empty: cached backend list, refreshed
 * daily, layered over the bundled fallback.
 */
export function useZikr(): { items: ZikrItem[] } {
  const query = useQuery<ZikrItem[], Error>({
    queryKey: ['zikr'],
    queryFn: ({ signal }) => fetchZikrList(signal),
    staleTime: 24 * 60 * 60 * 1000,
    gcTime: Infinity,
    retry: 1,
    placeholderData: () => readCachedZikrList() ?? undefined,
  })

  // Write-through so the next cold start (and its splash) reads the fresh
  // list synchronously.
  useEffect(() => {
    if (query.data && !query.isPlaceholderData) writeCachedZikrList(query.data)
  }, [query.data, query.isPlaceholderData])

  return { items: query.data?.length ? query.data : ZIKR_FALLBACK }
}
