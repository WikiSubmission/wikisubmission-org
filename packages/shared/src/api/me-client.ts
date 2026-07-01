import { wsApi } from './client'
import type { components, paths } from './types.gen'

type BookmarkData = components['schemas']['Bookmark']
type BookmarkCategoryData = components['schemas']['BookmarkCategory']
type BookmarkEntryData = components['schemas']['BookmarkEntry']
type NoteData = components['schemas']['Note']
type SearchResultData = components['schemas']['SearchResult']
type ScriptureState = components['schemas']['ScriptureState']
type ReadingProgressData = components['schemas']['ReadingProgress']
type StreakData = components['schemas']['Streak']
type ReadingStatsData = components['schemas']['ReadingStats']
type ReadingStatsRange = '7d' | '30d' | '90d' | '1y' | 'all'
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

  getReadingStats: (
    scripture: string,
    range: ReadingStatsRange = '30d',
    tz?: string,
  ): Promise<{ data: ReadingStatsData }> =>
    unwrap(wsApi.GET('/me/reading-stats', {
      params: {
        query: {
          scripture: toScripture(scripture),
          range,
          ...(tz ? { tz } : {}),
        },
      },
    })),

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
    body: { name: string; description?: string; is_public?: boolean; edit_policy?: 'owner_only' | 'everyone'; regenerate_token?: boolean }
  ): Promise<{ data: CollectionData }> =>
    unwrap(wsApi.PATCH('/me/collections/{id}', {
      params: { path: { id } },
      body: {
        name: body.name,
        description: body.description,
        is_public: body.is_public,
        edit_policy: body.edit_policy,
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

  subscribeCollection: (shareToken: string): Promise<{ data: { collection_id: number } }> =>
    unwrap(wsApi.POST('/me/collection-subscriptions', { body: { share_token: shareToken } })),

  unsubscribeCollection: (id: number): Promise<void> =>
    callVoid(wsApi.DELETE('/me/collection-subscriptions/{id}', { params: { path: { id } } })),

  // ── Games (Fill-the-Blank) ───────────────────────────────────────────────
  // gamesApi is declared below. The getter defers resolution until first
  // access, avoiding the temporal-dead-zone reference while letting callers
  // use `meApi.games.startVariant(...)`.
  get games() {
    return gamesApi
  },

  // ── Activity + consent ───────────────────────────────────────────────────
  get activity() {
    return activityApi
  },

  // ── Web push ───────────────────────────────────────────────────────────
  get push() {
    return pushApi
  },

  // ── Export + content deletion ───────────────────────────────────────────
  get privacy() {
    return privacyApi
  },
}

// ── Web push (OpenAPI contract) ─────────────────────────────────────────────

export type PushSubscribeBody = components['schemas']['PushSubscribeRequest']
type PushSubscribeResponse = components['schemas']['PushSubscribeResponse']
type PushTestResponse = components['schemas']['PushTestResponse']
type OkResponse = components['schemas']['OkResponse']

const pushApi = {
  subscribe: (body: PushSubscribeBody): Promise<PushSubscribeResponse> =>
    unwrap(wsApi.POST('/me/push/subscribe', { body })),

  unsubscribe: (endpoint: string): Promise<OkResponse> =>
    unwrap(wsApi.DELETE('/me/push/subscribe', { body: { endpoint } })),

  sendTest: (): Promise<PushTestResponse> => unwrap(wsApi.POST('/me/push/test')),
}

// ── Activity feed (OpenAPI contract) ───────────────────────────────────────

export type ActivityKind = components['schemas']['ActivityKind']
export type ActivityEntry = components['schemas']['ActivityEntry']
type RecordActivityBody = components['schemas']['RecordActivityRequest']
type ActivityListEnvelope = components['schemas']['ActivityListEnvelope']
type ActivityStoredResponse = components['schemas']['ActivityStoredResponse']
type DeletedCountResponse = components['schemas']['DeletedCountResponse']
type ActivityConsentResponse = components['schemas']['ActivityConsentResponse']

const activityApi = {
  record: (body: RecordActivityBody): Promise<ActivityStoredResponse> =>
    unwrap(wsApi.POST('/me/activity', { body })),

  list: (opts?: { limit?: number; offset?: number }): Promise<ActivityListEnvelope> =>
    unwrap(wsApi.GET('/me/activity', { params: { query: { limit: opts?.limit, offset: opts?.offset } } })),

  clear: (): Promise<DeletedCountResponse> => unwrap(wsApi.DELETE('/me/activity')),

  getConsent: (): Promise<ActivityConsentResponse> => unwrap(wsApi.GET('/me/consent')),

  setConsent: (consent: boolean): Promise<ActivityConsentResponse> =>
    unwrap(wsApi.PUT('/me/consent', { body: { consent } })),
}

// ── Export + content deletion (OpenAPI contract) ───────────────────────────

type UserDataExportEnvelope = components['schemas']['UserDataExportEnvelope']
type UserDataDeletionEnvelope = components['schemas']['UserDataDeletionEnvelope']
type RetryAfterResponse = components['schemas']['RetryAfterResponse']
type ReasonResponse = components['schemas']['ReasonResponse']
type DeleteContentRequest = components['schemas']['DeleteContentRequest']

const privacyApi = {
  requestExport: async (): Promise<{ queued: true } | { queued: false; retryAfterSeconds: number }> => {
    const { error, response } = await wsApi.POST('/me/export')
    if (response.status === 429) {
      return {
        queued: false,
        retryAfterSeconds: Number((error as RetryAfterResponse | undefined)?.retry_after_seconds ?? 0),
      }
    }
    if (error || !response.ok) throw new Error(`${response.status} ${response.statusText}`)
    return { queued: true }
  },

  getExportStatus: (): Promise<UserDataExportEnvelope> => unwrap(wsApi.GET('/me/export/status')),

  requestContentDeletion: async (
    body: { categories: string[] },
  ): Promise<{ queued: true } | { queued: false; status: number; reason?: string }> => {
    const { error, response } = await wsApi.POST('/me/delete-content', { body: body as DeleteContentRequest })
    if (response.status === 409 || response.status === 429) {
      return {
        queued: false,
        status: response.status,
        reason: (error as ReasonResponse | undefined)?.reason,
      }
    }
    if (error || !response.ok) throw new Error(`${response.status} ${response.statusText}`)
    return { queued: true }
  },

  getDeletionStatus: (): Promise<UserDataDeletionEnvelope> => unwrap(wsApi.GET('/me/delete-content/status')),
}

// ── Games contract (types derived from the generated OpenAPI schemas) ───────

export type GameLanguage = StartGameVariantRequest['language']
export type GameDifficulty = StartGameVariantRequest['difficulty']
export type GameRoundSize = StartGameVariantRequest['size']
export type GameLeaderboardScope = GameLeaderboardQuery['scope']

export type GamePassage = components['schemas']['GamePassage']
export type GameBlank = components['schemas']['GameBlank']
export type GameBlankHint = components['schemas']['GameBlankHint']
export type GameRenderedVerse = components['schemas']['GameRenderedVerse']
export type GameVariant = components['schemas']['GameVariant']
export type GameSubmitResult = components['schemas']['GameSubmitResult']
export type GamePerBlankResult = components['schemas']['GamePerBlankResult']
export type GameLeaderboardEntry = components['schemas']['GameLeaderboardEntry']
export type GameHistoryEntry = components['schemas']['GameHistoryEntry']
export type GameStats = components['schemas']['GameStats']

type StartGameVariantRequest = components['schemas']['StartGameVariantRequest']
type SubmitGameAttemptRequest = components['schemas']['SubmitGameAttemptRequest']
type GameLeaderboardQuery = NonNullable<
  paths['/games/fill-blank/leaderboard']['get']['parameters']['query']
>

type GamePassageListEnvelope = components['schemas']['GamePassageListEnvelope']
type GameVariantEnvelope = components['schemas']['GameVariantEnvelope']
type GameSubmitResultEnvelope = components['schemas']['GameSubmitResultEnvelope']
type GameLeaderboardEnvelope = components['schemas']['GameLeaderboardEnvelope']
type GameHistoryEnvelope = components['schemas']['GameHistoryEnvelope']
type GameStatsEnvelope = components['schemas']['GameStatsEnvelope']

type GameCheckBody = {
  variant_id: string
  session_id: string
  index: number
  guess: string
}
type GameCheckResponse = { correct: boolean; attempts_remaining?: number }
type GamesCheckApi = {
  POST: (path: '/games/fill-blank/check', init: { body: GameCheckBody }) => Promise<WsResult<GameCheckResponse>>
}
const gamesCheckApi = wsApi as unknown as GamesCheckApi

const gamesApi = {
  listPassages: (
    opts?: { language?: GameLanguage; theme?: string; chapter?: number }
  ): Promise<GamePassageListEnvelope> =>
    unwrap(wsApi.GET('/games/fill-blank/passages', { params: { query: opts ?? {} } })),

  startVariant: (body: StartGameVariantRequest): Promise<GameVariantEnvelope> =>
    unwrap(wsApi.POST('/games/fill-blank/variants', { body })),

  submitVariant: (body: SubmitGameAttemptRequest): Promise<GameSubmitResultEnvelope> =>
    unwrap(wsApi.POST('/games/fill-blank/submit', { body })),

  getLeaderboard: (query: GameLeaderboardQuery): Promise<GameLeaderboardEnvelope> =>
    unwrap(wsApi.GET('/games/fill-blank/leaderboard', { params: { query } })),

  getHistory: (
    opts?: { limit?: number; cursor?: string }
  ): Promise<GameHistoryEnvelope> =>
    unwrap(wsApi.GET('/me/games/history', { params: { query: opts ?? {} } })),

  getStats: (): Promise<GameStatsEnvelope> => unwrap(wsApi.GET('/me/games/stats')),

  // Validate a single blank for instant feedback. Returns correctness and, for
  // non-easy difficulties, the remaining attempts for that blank in the session.
  checkBlank: (body: GameCheckBody): Promise<GameCheckResponse> =>
    unwrap(gamesCheckApi.POST('/games/fill-blank/check', { body })),
}
