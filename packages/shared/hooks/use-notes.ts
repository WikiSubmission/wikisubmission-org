'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useScriptureAuth } from '@/lib/scripture-auth-context'
import { meApi } from '@/src/api/me-client'
import { getRegisteredOfflineUserStore } from '@/lib/offline/user/registry'
import type { NoteData, ScriptureState } from '@/types/bookmarks'

function chapterFromVerseKey(verseKey: string): number {
  return parseInt(verseKey.split(':')[0] ?? '0', 10)
}

// Offline-aware note mutations: network-first, with the offline mirror refreshed
// on success and the change captured in the outbox on failure (replayed on
// reconnect). The offline branch resolves successfully with an optimistic note
// so React Query keeps the optimistic cache instead of rolling back. All store
// calls are best-effort; a null store (mobile/unsupported) leaves behavior
// unchanged, so the online path never regresses.
async function upsertNoteOfflineAware(
  scripture: string,
  verseKey: string,
  content: string,
  tags?: string[],
): Promise<{ data: NoteData }> {
  const store = getRegisteredOfflineUserStore()
  try {
    const res = await meApi.upsertNote({ scripture, verse_key: verseKey, content, tags })
    if (store) {
      try {
        await store.mirrorNote({ scripture, vk: verseKey, content, tags, updatedAt: Date.now() })
      } catch {
        // best-effort write-through
      }
    }
    return res
  } catch (err) {
    if (store) {
      try {
        await store.apply({ entity: 'note', op: 'upsert', scripture, vk: verseKey, content, tags })
        return {
          data: {
            id: -1,
            scripture: scripture as 'quran' | 'bible',
            verse_key: verseKey,
            content,
            tags: tags ?? [],
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        }
      } catch {
        // store unavailable — surface the original network error
      }
    }
    throw err
  }
}

async function deleteNoteOfflineAware(scripture: string, verseKey: string, id: number): Promise<void> {
  try {
    await meApi.deleteNote(id)
  } catch (err) {
    const store = getRegisteredOfflineUserStore()
    if (store) {
      try {
        await store.apply({ entity: 'note', op: 'delete', scripture, vk: verseKey })
        return
      } catch {
        // store unavailable — surface the original network error
      }
    }
    throw err
  }
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
    mutationFn: (vars: { verseKey: string; content: string; tags?: string[] }) =>
      upsertNoteOfflineAware(scripture, vars.verseKey, vars.content, vars.tags),
    onMutate: async ({ verseKey, content, tags }) => {
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
        tags: tags ?? existing?.tags ?? [],
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
      deleteNoteOfflineAware(scripture, vars.verseKey, vars.id),
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
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notes', scripture] })
    },
  })
}

// ── Note count (quran + bible) ─────────────────────────────────────────────

export function useNotesByScripture(scripture: 'quran' | 'bible'): NoteData[] {
  const { isSignedIn } = useScriptureAuth()
  const { data } = useQuery<{ data: NoteData[] }>({
    queryKey: ['notes', scripture],
    queryFn: () => meApi.getNotes(scripture),
    enabled: isSignedIn,
    staleTime: 30_000,
  })
  return data?.data ?? []
}

export function useNoteCount(): number {
  const quranNotes = useNotesByScripture('quran')
  const bibleNotes = useNotesByScripture('bible')
  return quranNotes.length + bibleNotes.length
}

/** All notes across both scriptures, sorted by updated_at desc. */
export function useAllNotes(): NoteData[] {
  const quranNotes = useNotesByScripture('quran')
  const bibleNotes = useNotesByScripture('bible')
  return [...quranNotes, ...bibleNotes].sort((a, b) =>
    (b.updated_at ?? '').localeCompare(a.updated_at ?? '')
  )
}
