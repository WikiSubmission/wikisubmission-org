import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useSession } from 'next-auth/react'
import { meApi } from '@/src/api/me-client'
import type { BookmarkData, ScriptureState } from '@/types/bookmarks'

export function useBookmarksList(scripture: string): BookmarkData[] {
  const { data: session } = useSession()
  const { data } = useQuery<{ data: BookmarkData[] }>({
    queryKey: ['bookmarks', scripture],
    queryFn: () => meApi.getBookmarks(scripture),
    enabled: !!session?.accessToken,
    staleTime: 30_000,
  })
  return data?.data ?? []
}

function chapterFromVerseKey(verseKey: string): number {
  return parseInt(verseKey.split(':')[0] ?? '0', 10)
}

function stateKey(scripture: string, chapter: number) {
  return ['scripture-state', scripture, chapter]
}

function mergeBookmarks(
  old: ScriptureState | undefined,
  patch: Record<string, BookmarkData>
): ScriptureState {
  return {
    bookmarks: { ...(old?.bookmarks ?? {}), ...patch },
    notes: old?.notes ?? {},
  }
}

// ── Add bookmark ───────────────────────────────────────────────────────────

export function useAddBookmark(scripture: string) {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: (vars: { verseKey: string; name?: string; color?: string }) =>
      meApi.createBookmark({
        scripture,
        verse_key: vars.verseKey,
        name: vars.name ?? '',
        color: vars.color ?? 'amber',
        kind: 'normal',
      }),
    onMutate: async ({ verseKey, name = '', color = 'amber' }) => {
      const chapter = chapterFromVerseKey(verseKey)
      const key = stateKey(scripture, chapter)
      await qc.cancelQueries({ queryKey: key })

      const prev = qc.getQueryData<ScriptureState>(key)
      const optimistic: BookmarkData = {
        id: -1,
        scripture,
        verse_key: verseKey,
        name,
        color,
        kind: 'normal',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
      qc.setQueryData<ScriptureState>(key, (old) =>
        mergeBookmarks(old, { [verseKey]: optimistic })
      )
      return { prev, key }
    },
    onError: (_err, _vars, ctx) => {
      if (ctx) qc.setQueryData<ScriptureState>(ctx.key, ctx.prev)
    },
    onSuccess: (res, { verseKey }) => {
      const chapter = chapterFromVerseKey(verseKey)
      const key = stateKey(scripture, chapter)
      qc.setQueryData<ScriptureState>(key, (old) =>
        mergeBookmarks(old, { [verseKey]: res.data })
      )
    },
  })
}

// ── Delete bookmark ────────────────────────────────────────────────────────

export function useDeleteBookmark(scripture: string) {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: (vars: { id: number; verseKey: string }) =>
      meApi.deleteBookmark(vars.id),
    onMutate: async ({ verseKey }) => {
      const chapter = chapterFromVerseKey(verseKey)
      const key = stateKey(scripture, chapter)
      await qc.cancelQueries({ queryKey: key })

      const prev = qc.getQueryData<ScriptureState>(key)
      qc.setQueryData<ScriptureState>(key, (old) => {
        if (!old) return old
        const { [verseKey]: _removed, ...rest } = old.bookmarks
        return { bookmarks: rest, notes: old.notes ?? {} }
      })
      return { prev, key }
    },
    onError: (_err, _vars, ctx) => {
      if (ctx) qc.setQueryData<ScriptureState>(ctx.key, ctx.prev)
    },
  })
}

// ── Update bookmark ────────────────────────────────────────────────────────

export function useUpdateBookmark(scripture: string) {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: (vars: { id: number; verseKey: string; name?: string; color?: string }) =>
      meApi.updateBookmark(vars.id, { name: vars.name, color: vars.color }),
    onSuccess: (res, { verseKey }) => {
      const chapter = chapterFromVerseKey(verseKey)
      const key = stateKey(scripture, chapter)
      qc.setQueryData<ScriptureState>(key, (old) =>
        mergeBookmarks(old, { [verseKey]: res.data })
      )
    },
  })
}

// ── Cover-to-cover ─────────────────────────────────────────────────────────

export function useUpsertCoverToCover(scripture: string) {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: (verseKey: string) =>
      meApi.putCoverToCover({ scripture, verse_key: verseKey }),
    onSuccess: (res, verseKey) => {
      const chapter = chapterFromVerseKey(verseKey)
      const key = stateKey(scripture, chapter)
      qc.setQueryData<ScriptureState>(key, (old) =>
        mergeBookmarks(old, { [verseKey]: res.data })
      )
    },
  })
}
