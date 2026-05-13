import { wsApi } from './client'
import type { components } from './types.gen'

type BookmarkData = components['schemas']['Bookmark']
type BookmarkCategoryData = components['schemas']['BookmarkCategory']
type BookmarkEntryData = components['schemas']['BookmarkEntry']
type NoteData = components['schemas']['Note']
type SearchResultData = components['schemas']['SearchResult']
type ScriptureState = components['schemas']['ScriptureState']
type ReadingProgressData = components['schemas']['ReadingProgress']
type StreakData = components['schemas']['Streak']
type CollectionData = components['schemas']['Collection']
type CollectionDetail = components['schemas']['CollectionDetail']
type CollectionVerseData = components['schemas']['CollectionVerse']
type Scripture = components['parameters']['MeScriptureParam']

type WsResult<T> = { data?: T; error?: unknown; response: Response }

function toScripture(scripture: string): Scripture {
  return scripture === 'bible' ? 'bible' : 'quran'
}

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
  // ── Bookmark categories ──────────────────────────────────────────────────

  listBookmarkCategories: (): Promise<{ data: BookmarkCategoryData[] }> =>
    unwrap(wsApi.GET('/me/bookmark-categories')),

  createBookmarkCategory: (body: {
    name: string
    color?: string
  }): Promise<{ data: BookmarkCategoryData }> =>
    unwrap(wsApi.POST('/me/bookmark-categories', { body: { name: body.name, color: body.color ?? 'amber' } })),

  updateBookmarkCategory: (
    id: number,
    body: { name?: string; color?: string }
  ): Promise<{ data: BookmarkCategoryData }> =>
    unwrap(wsApi.PATCH('/me/bookmark-categories/{id}', { params: { path: { id } }, body })),

  deleteBookmarkCategory: (id: number): Promise<void> =>
    callVoid(wsApi.DELETE('/me/bookmark-categories/{id}', { params: { path: { id } } })),

  // ── Bookmark entries ─────────────────────────────────────────────────────

  listBookmarkCategoryEntries: (id: number): Promise<{ data: BookmarkEntryData[] }> =>
    unwrap(wsApi.GET('/me/bookmark-categories/{id}/entries', { params: { path: { id } } })),

  createBookmarkEntry: (body: {
    category_id: number
    scripture: string
    verse_key: string
  }): Promise<{ data: BookmarkEntryData }> =>
    unwrap(wsApi.POST('/me/bookmark-entries', {
      body: {
        category_id: body.category_id,
        scripture: toScripture(body.scripture),
        verse_key: body.verse_key,
      },
    })),

  deleteBookmarkEntry: (id: number): Promise<void> =>
    callVoid(wsApi.DELETE('/me/bookmark-entries/{id}', { params: { path: { id } } })),

  // ── Cover-to-cover (still uses old bookmark row) ─────────────────────────

  getCoverToCover: (scripture: string): Promise<{ data: BookmarkData | null }> =>
    unwrap(wsApi.GET('/me/cover-to-cover', { params: { query: { scripture: toScripture(scripture) } } })),

  putCoverToCover: (body: {
    scripture: string
    verse_key: string
  }): Promise<{ data: BookmarkData }> =>
    unwrap(wsApi.PUT('/me/cover-to-cover', {
      body: { scripture: toScripture(body.scripture), verse_key: body.verse_key },
    })),

  // ── Scripture state ──────────────────────────────────────────────────────

  getScriptureState: (
    scripture: string,
    chapter: number
  ): Promise<ScriptureState> =>
    unwrap(wsApi.GET('/me/scripture-state', { params: { query: { scripture: toScripture(scripture), chapter } } })),

  // ── Notes ────────────────────────────────────────────────────────────────

  getNotes: (
    scripture: string,
    verseKey?: string
  ): Promise<{ data: NoteData[] }> =>
    unwrap(wsApi.GET('/me/notes', { params: { query: { scripture: toScripture(scripture), verse_key: verseKey } } })),

  upsertNote: (body: {
    scripture: string
    verse_key: string
    content: string
    tags?: string[]
  }): Promise<{ data: NoteData }> =>
    unwrap(wsApi.PUT('/me/notes', {
      body: {
        scripture: toScripture(body.scripture),
        verse_key: body.verse_key,
        content: body.content,
        ...(body.tags !== undefined ? { tags: body.tags } : {}),
      },
    })),

  deleteNote: (id: number): Promise<void> =>
    callVoid(wsApi.DELETE('/me/notes/{id}', { params: { path: { id } } })),

  // ── Personal search ──────────────────────────────────────────────────────

  searchNotes: (q: string, scripture?: string): Promise<{ data: SearchResultData[] }> =>
    unwrap(wsApi.GET('/me/search', {
      params: {
        query: {
          q,
          ...(scripture ? { scripture: toScripture(scripture) } : {}),
        },
      },
    })),

  // ── Reading progress ─────────────────────────────────────────────────────

  getReadingProgress: (scripture: string): Promise<{ data: ReadingProgressData | null }> =>
    unwrap(wsApi.GET('/me/reading-progress', { params: { query: { scripture: toScripture(scripture) } } })),

  putReadingProgress: (body: { scripture: string; verse_key: string }): Promise<{ data: ReadingProgressData }> =>
    unwrap(wsApi.PUT('/me/reading-progress', {
      body: { scripture: toScripture(body.scripture), verse_key: body.verse_key },
    })),

  getStreak: (scripture: string): Promise<{ data: StreakData }> =>
    unwrap(wsApi.GET('/me/streak', { params: { query: { scripture: toScripture(scripture) } } })),

  postReadingLog: (body: { scripture: string; verses_read?: number; day?: string }): Promise<void> =>
    callVoid(wsApi.POST('/me/reading-log', {
      body: {
        scripture: toScripture(body.scripture),
        verses_read: body.verses_read ?? 1,
        day: body.day,
      },
    })),

  getPreferences: (scripture: string): Promise<{ data: Record<string, unknown> | null }> =>
    unwrap(wsApi.GET('/me/preferences', { params: { query: { scripture: toScripture(scripture) } } })),

  putPreferences: (body: { scripture: string; payload: Record<string, unknown> }): Promise<void> =>
    callVoid(wsApi.PUT('/me/preferences', {
      body: { scripture: toScripture(body.scripture), payload: body.payload },
    })),

  // ── Collections ──────────────────────────────────────────────────────────

  listCollections: (): Promise<{ data: CollectionData[] }> =>
    unwrap(wsApi.GET('/me/collections')),

  getCollection: (id: number): Promise<{ data: CollectionDetail }> =>
    unwrap(wsApi.GET('/me/collections/{id}', { params: { path: { id } } })),

  createCollection: (body: { name: string; description?: string; is_public?: boolean }): Promise<{ data: CollectionData }> =>
    unwrap(wsApi.POST('/me/collections', {
      body: {
        name: body.name,
        description: body.description,
        is_public: body.is_public ?? false,
      },
    })),

  updateCollection: (
    id: number,
    body: { name: string; description?: string; is_public?: boolean; regenerate_token?: boolean }
  ): Promise<{ data: CollectionData }> =>
    unwrap(wsApi.PATCH('/me/collections/{id}', {
      params: { path: { id } },
      body: {
        name: body.name,
        description: body.description,
        is_public: body.is_public,
        regenerate_token: body.regenerate_token ?? false,
      },
    })),

  deleteCollection: (id: number): Promise<void> =>
    callVoid(wsApi.DELETE('/me/collections/{id}', { params: { path: { id } } })),

  addVerseToCollection: (
    id: number,
    body: { scripture: string; verse_key: string; note?: string }
  ): Promise<{ data: CollectionVerseData }> =>
    unwrap(wsApi.POST('/me/collections/{id}/verses', {
      params: { path: { id } },
      body: {
        scripture: toScripture(body.scripture),
        verse_key: body.verse_key,
        note: body.note,
      },
    })),

  removeVerseFromCollection: (id: number, verseId: number): Promise<void> =>
    callVoid(wsApi.DELETE('/me/collections/{id}/verses/{verseId}', { params: { path: { id, verseId } } })),

  getSharedCollection: (token: string): Promise<{ data: CollectionDetail }> =>
    unwrap(wsApi.GET('/collections/share/{token}', { params: { path: { token } } })),
}
