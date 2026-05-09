import { getSession } from 'next-auth/react'
import type { BookmarkData, NoteData, ScriptureState, ReadingProgressData, StreakData } from '@/types/bookmarks'
import type { CollectionData, CollectionDetail, CollectionVerseData } from '@/types/collections'

const baseUrl = process.env.NEXT_PUBLIC_API_URL

async function meGet<T>(path: string): Promise<T> {
  const session = await getSession()
  const res = await fetch(`${baseUrl}${path}`, {
    headers: session?.accessToken
      ? { Authorization: `Bearer ${session.accessToken}` }
      : {},
  })
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`)
  return res.json()
}

async function mePost<T>(path: string, body: unknown): Promise<T> {
  const session = await getSession()
  const res = await fetch(`${baseUrl}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(session?.accessToken ? { Authorization: `Bearer ${session.accessToken}` } : {}),
    },
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`)
  return res.json()
}

async function mePatch<T>(path: string, body: unknown): Promise<T> {
  const session = await getSession()
  const res = await fetch(`${baseUrl}${path}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...(session?.accessToken ? { Authorization: `Bearer ${session.accessToken}` } : {}),
    },
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`)
  return res.json()
}

async function mePut<T>(path: string, body: unknown): Promise<T> {
  const session = await getSession()
  const res = await fetch(`${baseUrl}${path}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...(session?.accessToken ? { Authorization: `Bearer ${session.accessToken}` } : {}),
    },
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`)
  return res.json()
}

async function meDelete(path: string): Promise<void> {
  const session = await getSession()
  const res = await fetch(`${baseUrl}${path}`, {
    method: 'DELETE',
    headers: session?.accessToken
      ? { Authorization: `Bearer ${session.accessToken}` }
      : {},
  })
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`)
}

// ── Typed API calls ──────────────────────────────────────────────────────

export const meApi = {
  getBookmarks: (scripture: string): Promise<{ data: BookmarkData[] }> =>
    meGet(`/me/bookmarks?scripture=${scripture}`),

  createBookmark: (body: {
    scripture: string
    verse_key: string
    name?: string
    color?: string
    kind?: string
  }): Promise<{ data: BookmarkData }> => mePost('/me/bookmarks', body),

  updateBookmark: (
    id: number,
    body: { name?: string; color?: string }
  ): Promise<{ data: BookmarkData }> => mePatch(`/me/bookmarks/${id}`, body),

  deleteBookmark: (id: number): Promise<void> =>
    meDelete(`/me/bookmarks/${id}`),

  putCoverToCover: (body: {
    scripture: string
    verse_key: string
  }): Promise<{ data: BookmarkData }> => mePut('/me/cover-to-cover', body),

  getScriptureState: (
    scripture: string,
    chapter: number
  ): Promise<ScriptureState> =>
    meGet(`/me/scripture-state?scripture=${scripture}&chapter=${chapter}`),

  getNotes: (
    scripture: string,
    verseKey?: string,
    lang?: string
  ): Promise<{ data: NoteData[] }> => {
    const params = new URLSearchParams({ scripture })
    if (verseKey) params.set('verse_key', verseKey)
    if (lang) params.set('lang', lang)
    return meGet(`/me/notes?${params}`)
  },

  createNote: (body: {
    scripture: string
    verse_key: string
    lang?: string
    content: string
  }): Promise<{ data: NoteData }> => mePost('/me/notes', body),

  updateNote: (
    id: number,
    body: { content: string }
  ): Promise<{ data: NoteData }> => mePatch(`/me/notes/${id}`, body),

  deleteNote: (id: number): Promise<void> => meDelete(`/me/notes/${id}`),

  getReadingProgress: (scripture: string): Promise<{ data: ReadingProgressData | null }> =>
    meGet(`/me/reading-progress?scripture=${scripture}`),

  putReadingProgress: (body: { scripture: string; verse_key: string }): Promise<{ data: ReadingProgressData }> =>
    mePut('/me/reading-progress', body),

  getStreak: (scripture: string): Promise<{ data: StreakData }> =>
    meGet(`/me/streak?scripture=${scripture}`),

  postReadingLog: (body: { scripture: string; verses_read?: number; day?: string }): Promise<void> =>
    mePost('/me/reading-log', body),

  getPreferences: (scripture: string): Promise<{ data: Record<string, unknown> | null }> =>
    meGet(`/me/preferences?scripture=${scripture}`),

  putPreferences: (body: { scripture: string; payload: Record<string, unknown> }): Promise<void> =>
    mePut('/me/preferences', body),

  listCollections: (): Promise<{ data: CollectionData[] }> =>
    meGet('/me/collections'),

  getCollection: (id: number): Promise<{ data: CollectionDetail }> =>
    meGet(`/me/collections/${id}`),

  createCollection: (body: { name: string; description?: string; is_public?: boolean }): Promise<{ data: CollectionData }> =>
    mePost('/me/collections', body),

  updateCollection: (
    id: number,
    body: { name: string; description?: string; is_public?: boolean; regenerate_token?: boolean }
  ): Promise<{ data: CollectionData }> =>
    mePatch(`/me/collections/${id}`, body),

  deleteCollection: (id: number): Promise<void> =>
    meDelete(`/me/collections/${id}`),

  addVerseToCollection: (
    id: number,
    body: { scripture: string; verse_key: string; note?: string }
  ): Promise<{ data: CollectionVerseData }> =>
    mePost(`/me/collections/${id}/verses`, body),

  removeVerseFromCollection: (id: number, verseId: number): Promise<void> =>
    meDelete(`/me/collections/${id}/verses/${verseId}`),

  getSharedCollection: (token: string): Promise<{ data: CollectionDetail }> => {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL
    return fetch(`${baseUrl}/collections/share/${token}`).then((r) => {
      if (!r.ok) throw new Error(`${r.status}`)
      return r.json()
    })
  },
}
