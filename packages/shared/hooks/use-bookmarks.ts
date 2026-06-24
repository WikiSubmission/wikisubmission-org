'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useScriptureAuth } from '@/lib/scripture-auth-context'
import { meApi } from '@/src/api/me-client'
import { getRegisteredOfflineUserStore } from '@/lib/offline/user/registry'
import type { BookmarkEntryMirror, NoteMirror } from '@/lib/offline/user/user-store'
import type { BookmarkEntryData, NoteData, ScriptureState } from '@/types/bookmarks'

function chapterFromVerseKey(verseKey: string): number {
  return parseInt(verseKey.split(':')[0] ?? '0', 10)
}

// Offline-aware bookmark-entry mutations: network-first, capturing the change in
// the outbox on failure (replayed on reconnect). Bookmark entries are keyed by
// the commutative natural key (category + scripture + verse), so an offline add
// or remove replays idempotently. The offline branch resolves successfully so
// React Query keeps its optimistic cache. Best-effort store calls; a null store
// (mobile/unsupported) leaves the online path unchanged.
async function addBookmarkEntryOfflineAware(
  scripture: string,
  categoryId: number,
  verseKey: string,
): Promise<{ data: BookmarkEntryData }> {
  try {
    return await meApi.createBookmarkEntry({ category_id: categoryId, scripture, verse_key: verseKey })
  } catch (err) {
    const store = getRegisteredOfflineUserStore()
    if (store) {
      try {
        await store.apply({ entity: 'bookmark_entry', op: 'create', categoryId, scripture, vk: verseKey })
        return {
          data: {
            id: -1,
            category_id: categoryId,
            scripture: scripture as 'quran' | 'bible',
            verse_key: verseKey,
            created_at: new Date().toISOString(),
          },
        }
      } catch {
        // store unavailable — surface the original network error
      }
    }
    throw err
  }
}

async function removeBookmarkEntryOfflineAware(
  scripture: string,
  categoryId: number,
  verseKey: string,
  entryId: number,
): Promise<void> {
  try {
    await meApi.deleteBookmarkEntry(entryId)
  } catch (err) {
    const store = getRegisteredOfflineUserStore()
    if (store) {
      try {
        await store.apply({ entity: 'bookmark_entry', op: 'delete', categoryId, scripture, vk: verseKey })
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
      addBookmarkEntryOfflineAware(scripture, vars.categoryId, vars.verseKey),
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
      qc.invalidateQueries({ queryKey: ['bookmark-category-entries', res.data.category_id] })
    },
  })
}

// ── Remove entry from category ─────────────────────────────────────────────

export function useRemoveBookmarkEntry(scripture: string) {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: (vars: { entryId: number; verseKey: string; categoryId: number }) =>
      removeBookmarkEntryOfflineAware(scripture, vars.categoryId, vars.verseKey, vars.entryId),
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
      qc.invalidateQueries({ queryKey: ['bookmark-category-entries'] })
    },
  })
}

// ── Bookmark category entries (for detail page) ───────────────────────────

export function useBookmarkCategoryEntries(categoryId: number) {
  const { isSignedIn } = useScriptureAuth()
  const { data, isLoading } = useQuery({
    queryKey: ['bookmark-category-entries', categoryId],
    queryFn: () => meApi.listBookmarkCategoryEntries(categoryId),
    enabled: isSignedIn && categoryId > 0,
    staleTime: 30_000,
  })
  return { entries: data?.data ?? [], isLoading }
}

// ── Cover-to-cover ─────────────────────────────────────────────────────────

export function useUpsertCoverToCover(scripture: string) {
  return useMutation({
    mutationFn: (verseKey: string) =>
      meApi.putCoverToCover({ scripture, verse_key: verseKey }),
  })
}

// ── Scripture state (bookmarks + notes for a chapter) ─────────────────────

// Flatten a chapter's ScriptureState into flat mirror rows for write-through.
function flattenForMirror(state: ScriptureState): {
  entries: BookmarkEntryMirror[]
  notes: NoteMirror[]
} {
  const entries: BookmarkEntryMirror[] = []
  for (const [vk, list] of Object.entries(state.bookmarks ?? {})) {
    for (const e of list) entries.push({ categoryId: e.category_id, scripture: e.scripture, vk })
  }
  const notes: NoteMirror[] = []
  for (const [vk, n] of Object.entries(state.notes ?? {})) {
    notes.push({
      scripture: n.scripture,
      vk,
      content: n.content,
      tags: n.tags ?? undefined,
      updatedAt: Date.parse(n.updated_at ?? '') || Date.now(),
    })
  }
  return { entries, notes }
}

// Rebuild a ScriptureState from mirror rows for offline reads. Mirror rows carry
// no server id, so ids are -1 (the reader keys off verse_key, not id).
function buildScriptureState(
  entries: BookmarkEntryMirror[],
  notes: NoteMirror[],
): ScriptureState {
  const bookmarks: Record<string, BookmarkEntryData[]> = {}
  for (const e of entries) {
    ;(bookmarks[e.vk] ??= []).push({
      id: -1,
      category_id: e.categoryId,
      scripture: e.scripture as 'quran' | 'bible',
      verse_key: e.vk,
      created_at: new Date().toISOString(),
    })
  }
  const notesMap: Record<string, NoteData> = {}
  for (const n of notes) {
    const iso = new Date(n.updatedAt).toISOString()
    notesMap[n.vk] = {
      id: -1,
      scripture: n.scripture as 'quran' | 'bible',
      verse_key: n.vk,
      content: n.content,
      tags: n.tags ?? [],
      created_at: iso,
      updated_at: iso,
    }
  }
  return { bookmarks, notes: notesMap }
}

export function useScriptureState(scripture: string, chapter: number): ScriptureState | undefined {
  const { isSignedIn } = useScriptureAuth()
  const { data } = useQuery<ScriptureState>({
    queryKey: stateKey(scripture, chapter),
    // Network-first; mirror the result for offline reads (only when nothing is
    // pending, so un-synced local edits are never overwritten), and fall back to
    // the mirror when offline.
    queryFn: async () => {
      const store = getRegisteredOfflineUserStore()
      try {
        const res = await meApi.getScriptureState(scripture, chapter)
        if (store) {
          try {
            if ((await store.pendingCount()) === 0) {
              const { entries, notes } = flattenForMirror(res)
              await store.mirrorChapterUserData(scripture, chapter, entries, notes)
            }
          } catch {
            // best-effort write-through
          }
        }
        return res
      } catch (err) {
        if (store) {
          try {
            const { entries, notes } = await store.getChapterUserData(scripture, chapter)
            return buildScriptureState(entries, notes)
          } catch {
            // store unavailable — surface the original error
          }
        }
        throw err
      }
    },
    enabled: isSignedIn && chapter > 0,
    staleTime: 60_000,
  })
  return data
}
