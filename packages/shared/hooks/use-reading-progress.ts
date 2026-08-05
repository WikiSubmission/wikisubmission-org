'use client'

import { useEffect, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useScriptureAuth } from '@/lib/scripture-auth-context'
import { meApi } from '@/src/api/me-client'
import { getRegisteredOfflineUserStore } from '@/lib/offline/user/registry'
import type { BookmarkData, ReadingProgressData } from '@/types/bookmarks'

/**
 * Persist reading progress, network-first. On success the offline mirror is
 * refreshed; on failure (offline) the change is captured in the outbox and
 * replayed on reconnect. All offline-store calls are best-effort so the existing
 * online path is never affected, and the no-op store on mobile/unsupported
 * browsers leaves behavior unchanged.
 */
async function putReadingProgressOfflineAware(
  scripture: string,
  verseKey: string,
): Promise<{ data: ReadingProgressData | null }> {
  const store = getRegisteredOfflineUserStore()
  try {
    const res = await meApi.putReadingProgress({ scripture, verse_key: verseKey })
    if (store) {
      try {
        await store.mirrorReadingProgress(scripture, verseKey)
      } catch {
        // best-effort write-through
      }
    }
    return res
  } catch (err) {
    if (store) {
      try {
        await store.apply({ entity: 'reading_progress', op: 'upsert', scripture, vk: verseKey })
        return { data: null }
      } catch {
        // store unavailable — surface the original network error
      }
    }
    throw err
  }
}

export function useReadingProgress(scripture: string): ReadingProgressData | null {
  const { isSignedIn } = useScriptureAuth()
  const { data } = useQuery({
    queryKey: ['reading-progress', scripture],
    queryFn: () => meApi.getReadingProgress(scripture),
    enabled: isSignedIn,
    staleTime: 60_000,
  })
  return data?.data ?? null
}

export function useSyncReadingProgress(scripture: string) {
  const { isSignedIn } = useScriptureAuth()
  const { mutate } = useMutation({
    mutationFn: (verseKey: string) => putReadingProgressOfflineAware(scripture, verseKey),
  })
  return isSignedIn ? mutate : null
}

export function useCoverToCoverProgress(scripture: string): BookmarkData | null {
  const { isSignedIn } = useScriptureAuth()
  const { data } = useQuery({
    queryKey: ['cover-to-cover', scripture],
    queryFn: () => meApi.getCoverToCover(scripture),
    enabled: isSignedIn,
    staleTime: 60_000,
  })
  return data?.data ?? null
}

export function useMarkCoverToCover(scripture: string) {
  const { isSignedIn } = useScriptureAuth()
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
  return isSignedIn ? mutate : null
}

// Debounced hook: call `reportVerse(verseKey)` and it fires a PUT after 5s of inactivity.
export function useReadingProgressSync(scripture: string) {
  const { isSignedIn } = useScriptureAuth()
  const { mutate } = useMutation({
    mutationFn: (verseKey: string) => putReadingProgressOfflineAware(scripture, verseKey),
  })
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const lastRef = useRef<string | null>(null)

  function reportVerse(verseKey: string) {
    if (!isSignedIn || verseKey === lastRef.current) return
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
