'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useSession } from 'next-auth/react'
import { meApi } from '@/src/api/me-client'
import type { BookmarkEntryData, ScriptureState } from '@/types/bookmarks'

function chapterFromVerseKey(verseKey: string): number {
  return parseInt(verseKey.split(':')[0] ?? '0', 10)
}

function stateKey(scripture: string, chapter: number) {
  return ['scripture-state', scripture, chapter]
}

function mergeEntries(
  old: ScriptureState | undefined,
  verseKey: string,
  updater: (prev: BookmarkEntryData[]) => BookmarkEntryData[]
): ScriptureState {
  const prev = old?.bookmarks ?? {}
  return {
    bookmarks: { ...prev, [verseKey]: updater(prev[verseKey] ?? []) },
    notes: old?.notes ?? {},
  }
}

// ── Add entry to category ──────────────────────────────────────────────────

export function useAddBookmarkEntry(scripture: string) {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: (vars: { categoryId: number; verseKey: string }) =>
      meApi.createBookmarkEntry({
        category_id: vars.categoryId,
        scripture,
        verse_key: vars.verseKey,
      }),
    onMutate: async ({ categoryId, verseKey }) => {
      const chapter = chapterFromVerseKey(verseKey)
      const key = stateKey(scripture, chapter)
      await qc.cancelQueries({ queryKey: key })

      const prev = qc.getQueryData<ScriptureState>(key)
      const optimistic: BookmarkEntryData = {
        id: -1,
        category_id: categoryId,
        scripture: scripture as 'quran' | 'bible',
        verse_key: verseKey,
        created_at: new Date().toISOString(),
      }
      qc.setQueryData<ScriptureState>(key, (old) =>
        mergeEntries(old, verseKey, (entries) => [...entries, optimistic])
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
        mergeEntries(old, verseKey, (entries) => [
          ...entries.filter((e) => e.id !== -1),
          res.data,
        ])
      )
      qc.invalidateQueries({ queryKey: ['bookmark-categories'] })
    },
  })
}

// ── Remove entry from category ─────────────────────────────────────────────

export function useRemoveBookmarkEntry(scripture: string) {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: (vars: { entryId: number; verseKey: string }) =>
      meApi.deleteBookmarkEntry(vars.entryId),
    onMutate: async ({ entryId, verseKey }) => {
      const chapter = chapterFromVerseKey(verseKey)
      const key = stateKey(scripture, chapter)
      await qc.cancelQueries({ queryKey: key })

      const prev = qc.getQueryData<ScriptureState>(key)
      qc.setQueryData<ScriptureState>(key, (old) =>
        mergeEntries(old, verseKey, (entries) => entries.filter((e) => e.id !== entryId))
      )
      return { prev, key }
    },
    onError: (_err, _vars, ctx) => {
      if (ctx) qc.setQueryData<ScriptureState>(ctx.key, ctx.prev)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['bookmark-categories'] })
    },
  })
}

// ── Cover-to-cover ─────────────────────────────────────────────────────────

export function useUpsertCoverToCover(scripture: string) {
  return useMutation({
    mutationFn: (verseKey: string) =>
      meApi.putCoverToCover({ scripture, verse_key: verseKey }),
  })
}

// ── Scripture state (bookmarks + notes for a chapter) ─────────────────────

export function useScriptureState(scripture: string, chapter: number): ScriptureState | undefined {
  const { data: session } = useSession()
  const { data } = useQuery<ScriptureState>({
    queryKey: stateKey(scripture, chapter),
    queryFn: () => meApi.getScriptureState(scripture, chapter),
    enabled: !!session?.accessToken && chapter > 0,
    staleTime: 60_000,
  })
  return data
}
