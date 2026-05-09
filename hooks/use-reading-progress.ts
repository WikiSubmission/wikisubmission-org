'use client'

import { useEffect, useRef } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { useSession } from 'next-auth/react'
import { meApi } from '@/src/api/me-client'
import type { ReadingProgressData } from '@/types/bookmarks'

export function useReadingProgress(scripture: string): ReadingProgressData | null {
  const { data: session } = useSession()
  const { data } = useQuery({
    queryKey: ['reading-progress', scripture],
    queryFn: () => meApi.getReadingProgress(scripture),
    enabled: !!session?.accessToken,
    staleTime: 60_000,
  })
  return data?.data ?? null
}

export function useSyncReadingProgress(scripture: string) {
  const { data: session } = useSession()
  const { mutate } = useMutation({
    mutationFn: (verseKey: string) =>
      meApi.putReadingProgress({ scripture, verse_key: verseKey }),
  })
  return session?.accessToken ? mutate : null
}

// Debounced hook: call `reportVerse(verseKey)` and it fires a PUT after 5s of inactivity.
export function useReadingProgressSync(scripture: string) {
  const { data: session } = useSession()
  const { mutate } = useMutation({
    mutationFn: (verseKey: string) =>
      meApi.putReadingProgress({ scripture, verse_key: verseKey }),
  })
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const lastRef = useRef<string | null>(null)

  function reportVerse(verseKey: string) {
    if (!session?.accessToken || verseKey === lastRef.current) return
    lastRef.current = verseKey
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      mutate(verseKey)
    }, 5_000)
  }

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [])

  return reportVerse
}
