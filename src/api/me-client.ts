import { getSession } from 'next-auth/react'
import type { BookmarkData, ScriptureState } from '@/types/bookmarks'

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
}
