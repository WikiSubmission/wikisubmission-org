'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { meApi } from '@/src/api/me-client'
import type { NoteData, ScriptureState } from '@/types/bookmarks'

function chapterFromVerseKey(verseKey: string): number {
  return parseInt(verseKey.split(':')[0] ?? '0', 10)
}

function stateKey(scripture: string, chapter: number) {
  return ['scripture-state', scripture, chapter]
}

function mergeNotes(
  old: ScriptureState | undefined,
  verseKey: string,
  updater: (prev: NoteData[]) => NoteData[]
): ScriptureState {
  const prevNotes = old?.notes ?? {}
  return {
    bookmarks: old?.bookmarks ?? {},
    notes: { ...prevNotes, [verseKey]: updater(prevNotes[verseKey] ?? []) },
  }
}

// ── Add note ───────────────────────────────────────────────────────────────

export function useAddNote(scripture: string) {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: (vars: { verseKey: string; lang: string; content: string }) =>
      meApi.createNote({
        scripture,
        verse_key: vars.verseKey,
        lang: vars.lang,
        content: vars.content,
      }),
    onMutate: async ({ verseKey, lang, content }) => {
      const chapter = chapterFromVerseKey(verseKey)
      const key = stateKey(scripture, chapter)
      await qc.cancelQueries({ queryKey: key })

      const prev = qc.getQueryData<ScriptureState>(key)
      const optimistic: NoteData = {
        id: -1,
        scripture,
        verse_key: verseKey,
        lang,
        content,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
      qc.setQueryData<ScriptureState>(key, (old) =>
        mergeNotes(old, verseKey, (prev) => [optimistic, ...prev])
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
        mergeNotes(old, verseKey, (prev) => [
          res.data,
          ...prev.filter((n) => n.id !== -1),
        ])
      )
    },
  })
}

// ── Update note ────────────────────────────────────────────────────────────

export function useUpdateNote(scripture: string) {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: (vars: { id: number; verseKey: string; content: string }) =>
      meApi.updateNote(vars.id, { content: vars.content }),
    onSuccess: (res, { verseKey }) => {
      const chapter = chapterFromVerseKey(verseKey)
      const key = stateKey(scripture, chapter)
      qc.setQueryData<ScriptureState>(key, (old) =>
        mergeNotes(old, verseKey, (prev) =>
          prev.map((n) => (n.id === res.data.id ? res.data : n))
        )
      )
    },
  })
}

// ── Delete note ────────────────────────────────────────────────────────────

export function useDeleteNote(scripture: string) {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: (vars: { id: number; verseKey: string }) =>
      meApi.deleteNote(vars.id),
    onMutate: async ({ id, verseKey }) => {
      const chapter = chapterFromVerseKey(verseKey)
      const key = stateKey(scripture, chapter)
      await qc.cancelQueries({ queryKey: key })

      const prev = qc.getQueryData<ScriptureState>(key)
      qc.setQueryData<ScriptureState>(key, (old) =>
        mergeNotes(old, verseKey, (prev) => prev.filter((n) => n.id !== id))
      )
      return { prev, key }
    },
    onError: (_err, _vars, ctx) => {
      if (ctx) qc.setQueryData<ScriptureState>(ctx.key, ctx.prev)
    },
  })
}
