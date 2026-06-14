'use client'

import { useEffect, useRef } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { useScriptureAuth } from '@/lib/scripture-auth-context'
import { meApi } from '@/src/api/me-client'
import type { StreakData } from '@/types/bookmarks'

export function useStreak(scripture: string): StreakData | null {
  const { isSignedIn } = useScriptureAuth()
  const { data } = useQuery({
    queryKey: ['streak', scripture],
    queryFn: () => meApi.getStreak(scripture),
    enabled: isSignedIn,
    staleTime: 5 * 60_000,
  })
  return data?.data ?? null
}

// Fire-and-forget hook: accumulates verses_read and flushes every ~60s or on unmount.
export function useReadingLogSync(scripture: string) {
  const { isSignedIn } = useScriptureAuth()
  const { mutate } = useMutation({
    mutationFn: (versesRead: number) =>
      meApi.postReadingLog({ scripture, verses_read: versesRead }),
  })
  const countRef = useRef(0)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (!isSignedIn) return

    timerRef.current = setInterval(() => {
      if (countRef.current > 0) {
        mutate(countRef.current)
        countRef.current = 0
      }
    }, 60_000)

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
      if (countRef.current > 0) {
        mutate(countRef.current)
        countRef.current = 0
      }
    }
  }, [isSignedIn, mutate])

  function increment() {
    if (!isSignedIn) return
    countRef.current += 1
  }

  return increment
}
