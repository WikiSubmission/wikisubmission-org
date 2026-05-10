'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useSession } from 'next-auth/react'
import { meApi } from '@/src/api/me-client'
import type { NoteData, ScriptureState } from '@/types/bookmarks'

function chapterFromVerseKey(verseKey: string): number {
  return parseInt(verseKey.split(':')[0] ?? '0', 10)
}

function stateKey(scripture: string, chapter: number) {
  return ['scripture-state', scripture, chapter]
}

function mergeNote(
  old: ScriptureState | undefined,
  verseKey: string,
  note: NoteData
): ScriptureState {
  return {
    bookmarks: old?.bookmarks ?? {},
    notes: { ...(old?.notes ?? {}), [verseKey]: note },
  }
}

// ── Upsert note (create or update the single note for a verse) ─────────────

export function useUpsertNote(scripture: string) {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: (vars: { verseKey: string; content: string }) =>
      meApi.upsertNote({ scripture, verse_key: vars.verseKey, content: vars.content }),
    onMutate: async ({ verseKey, content }) => {
      const chapter = chapterFromVerseKey(verseKey)
      const key = stateKey(scripture, chapter)
      await qc.cancelQueries({ queryKey: key })

      const prev = qc.getQueryData<ScriptureState>(key)
      const existing = prev?.notes?.[verseKey]
      const optimistic: NoteData = {
        id: existing?.id ?? -1,
        scripture: scripture as 'quran' | 'bible',
        verse_key: verseKey,
        content,
        created_at: existing?.created_at ?? new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
      qc.setQueryData<ScriptureState>(key, (old) =>
        mergeNote(old, verseKey, optimistic)
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
        mergeNote(old, verseKey, res.data)
      )
      qc.invalidateQueries({ queryKey: ['notes', scripture] })
    },
  })
}

// ── Delete note ────────────────────────────────────────────────────────────

export function useDeleteNote(scripture: string) {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: (vars: { id: number; verseKey: string }) =>
      meApi.deleteNote(vars.id),
    onMutate: async ({ verseKey }) => {
      const chapter = chapterFromVerseKey(verseKey)
      const key = stateKey(scripture, chapter)
      await qc.cancelQueries({ queryKey: key })

      const prev = qc.getQueryData<ScriptureState>(key)
      qc.setQueryData<ScriptureState>(key, (old) => {
        if (!old) return old
        const rest = { ...old.notes }
        delete rest[verseKey]
        return { bookmarks: old.bookmarks, notes: rest }
      })
      return { prev, key }
    },
    onError: (_err, _vars, ctx) => {
      if (ctx) qc.setQueryData<ScriptureState>(ctx.key, ctx.prev)
    },
    onSuccess: (_res, { verseKey }) => {
      qc.invalidateQueries({ queryKey: ['notes', scripture] })
    },
  })
}

// ── Note count (quran + bible) ─────────────────────────────────────────────

function useNotesByScripture(scripture: 'quran' | 'bible') {
  const { data: session } = useSession()
  const { data } = useQuery<{ data: NoteData[] }>({
    queryKey: ['notes', scripture],
    queryFn: () => meApi.getNotes(scripture),
    enabled: !!session?.accessToken,
    staleTime: 30_000,
  })
  return data?.data ?? []
}

export function useNoteCount(): number {
  const quranNotes = useNotesByScripture('quran')
  const bibleNotes = useNotesByScripture('bible')
  return quranNotes.length + bibleNotes.length
}
