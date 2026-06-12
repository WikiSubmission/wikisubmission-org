'use client'

import { useEffect, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useSession } from 'next-auth/react'
import { meApi } from '@/src/api/me-client'
import type { BookmarkData, ReadingProgressData } from '@/types/bookmarks'

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

export function useCoverToCoverProgress(scripture: string): BookmarkData | null {
  const { data: session } = useSession()
  const { data } = useQuery({
    queryKey: ['cover-to-cover', scripture],
    queryFn: () => meApi.getCoverToCover(scripture),
    enabled: !!session?.accessToken,
    staleTime: 60_000,
  })
  return data?.data ?? null
}

export function useMarkCoverToCover(scripture: string) {
  const { data: session } = useSession()
  const qc = useQueryClient()
  const { mutate } = useMutation({
    mutationFn: (verseKey: string) =>
      meApi.putCoverToCover({ scripture, verse_key: verseKey }),
    onMutate: async (verseKey: string) => {
      const key = ['cover-to-cover', scripture]
      await qc.cancelQueries({ queryKey: key })
      const prev = qc.getQueryData(key)
      qc.setQueryData(key, (old: { data: BookmarkData | null } | undefined) => ({
        data: old?.data
          ? { ...old.data, verse_key: verseKey }
          : { id: -1, scripture, verse_key: verseKey, name: 'Cover to Cover', color: 'blue', kind: 'cover_to_cover' as const, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
      }))
      return { prev, key }
    },
    onError: (_err, _vars, ctx) => {
      if (ctx) qc.setQueryData(ctx.key, ctx.prev)
    },
    onSuccess: (res) => {
      qc.setQueryData(['cover-to-cover', scripture], { data: res.data })
      qc.invalidateQueries({ queryKey: ['streak', scripture] })
    },
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
