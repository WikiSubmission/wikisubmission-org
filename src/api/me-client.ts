import { wsApi } from './client'
import type { components } from './types.gen'

type BookmarkData = components['schemas']['Bookmark']
type NoteData = components['schemas']['Note']
type ScriptureState = components['schemas']['ScriptureState']
type ReadingProgressData = components['schemas']['ReadingProgress']
type StreakData = components['schemas']['Streak']
type CollectionData = components['schemas']['Collection']
type CollectionDetail = components['schemas']['CollectionDetail']
type CollectionVerseData = components['schemas']['CollectionVerse']

type WsResult<T> = { data?: T; error?: unknown; response: Response }

async function unwrap<T>(p: Promise<WsResult<T>>): Promise<T> {
  const { data, error, response } = await p
  if (error || !response.ok || data === undefined) {
    throw new Error(`${response.status} ${response.statusText}`)
  }
  return data
}

async function callVoid(p: Promise<WsResult<unknown>>): Promise<void> {
  await unwrap(p)
}

export const meApi = {
  getBookmarks: (scripture: string): Promise<{ data: BookmarkData[] }> =>
    unwrap(wsApi.GET('/me/bookmarks', { params: { query: { scripture } } })),

  createBookmark: (body: {
    scripture: string
    verse_key: string
    name?: string
    color?: string
    kind?: string
  }): Promise<{ data: BookmarkData }> =>
    unwrap(wsApi.POST('/me/bookmarks', { body })),

  updateBookmark: (
    id: number,
    body: { name?: string; color?: string }
  ): Promise<{ data: BookmarkData }> =>
    unwrap(wsApi.PATCH('/me/bookmarks/{id}', { params: { path: { id } }, body })),

  deleteBookmark: (id: number): Promise<void> =>
    callVoid(wsApi.DELETE('/me/bookmarks/{id}', { params: { path: { id } } })),

  putCoverToCover: (body: {
    scripture: string
    verse_key: string
  }): Promise<{ data: BookmarkData }> =>
    unwrap(wsApi.PUT('/me/cover-to-cover', { body })),

  getScriptureState: (
    scripture: string,
    chapter: number
  ): Promise<ScriptureState> =>
    unwrap(wsApi.GET('/me/scripture-state', { params: { query: { scripture, chapter } } })),

  getNotes: (
    scripture: string,
    verseKey?: string,
    lang?: string
  ): Promise<{ data: NoteData[] }> =>
    unwrap(wsApi.GET('/me/notes', { params: { query: { scripture, verse_key: verseKey, lang } } })),

  createNote: (body: {
    scripture: string
    verse_key: string
    lang?: string
    content: string
  }): Promise<{ data: NoteData }> =>
    unwrap(wsApi.POST('/me/notes', { body })),

  updateNote: (
    id: number,
    body: { content: string }
  ): Promise<{ data: NoteData }> =>
    unwrap(wsApi.PATCH('/me/notes/{id}', { params: { path: { id } }, body })),

  deleteNote: (id: number): Promise<void> =>
    callVoid(wsApi.DELETE('/me/notes/{id}', { params: { path: { id } } })),

  getReadingProgress: (scripture: string): Promise<{ data: ReadingProgressData | null }> =>
    unwrap(wsApi.GET('/me/reading-progress', { params: { query: { scripture } } })),

  putReadingProgress: (body: { scripture: string; verse_key: string }): Promise<{ data: ReadingProgressData }> =>
    unwrap(wsApi.PUT('/me/reading-progress', { body })),

  getStreak: (scripture: string): Promise<{ data: StreakData }> =>
    unwrap(wsApi.GET('/me/streak', { params: { query: { scripture } } })),

  postReadingLog: (body: { scripture: string; verses_read?: number; day?: string }): Promise<void> =>
    callVoid(wsApi.POST('/me/reading-log', { body })),

  getPreferences: (scripture: string): Promise<{ data: Record<string, unknown> | null }> =>
    unwrap(wsApi.GET('/me/preferences', { params: { query: { scripture } } })),

  putPreferences: (body: { scripture: string; payload: Record<string, unknown> }): Promise<void> =>
    callVoid(wsApi.PUT('/me/preferences', { body })),

  listCollections: (): Promise<{ data: CollectionData[] }> =>
    unwrap(wsApi.GET('/me/collections')),

  getCollection: (id: number): Promise<{ data: CollectionDetail }> =>
    unwrap(wsApi.GET('/me/collections/{id}', { params: { path: { id } } })),

  createCollection: (body: { name: string; description?: string; is_public?: boolean }): Promise<{ data: CollectionData }> =>
    unwrap(wsApi.POST('/me/collections', { body })),

  updateCollection: (
    id: number,
    body: { name: string; description?: string; is_public?: boolean; regenerate_token?: boolean }
  ): Promise<{ data: CollectionData }> =>
    unwrap(wsApi.PATCH('/me/collections/{id}', { params: { path: { id } }, body })),

  deleteCollection: (id: number): Promise<void> =>
    callVoid(wsApi.DELETE('/me/collections/{id}', { params: { path: { id } } })),

  addVerseToCollection: (
    id: number,
    body: { scripture: string; verse_key: string; note?: string }
  ): Promise<{ data: CollectionVerseData }> =>
    unwrap(wsApi.POST('/me/collections/{id}/verses', { params: { path: { id } }, body })),

  removeVerseFromCollection: (id: number, verseId: number): Promise<void> =>
    callVoid(wsApi.DELETE('/me/collections/{id}/verses/{verseId}', { params: { path: { id, verseId } } })),

  getSharedCollection: (token: string): Promise<{ data: CollectionDetail }> =>
    unwrap(wsApi.GET('/collections/share/{token}', { params: { path: { token } } })),
}
