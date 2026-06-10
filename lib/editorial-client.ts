/**
 * Server-only client for the ws-backend editorial endpoints.
 *
 * Every call carries the caller's backend bearer token (minted in the next-auth
 * jwt callback, exposed as session.accessToken) and runs uncached. The backend
 * re-checks authorization on every request and is the real security boundary;
 * the data returned here only shapes what the editor UI renders.
 *
 * Do not import this from a Client Component. Editorial mutations must go through
 * server actions so the bearer token is never handed to the browser. It is only
 * ever imported from server components and server actions, never the browser.
 */
import createClient from 'openapi-fetch'
import { resolveServerApiBaseUrl } from '@/src/api/base-url'
import type { components, paths } from '@/src/api/types.gen'

export type EditorialSession = components['schemas']['EditorialSession']
export type QuranVersion = components['schemas']['QuranVersion']
export type BibleVersion = components['schemas']['BibleVersion']
export type QuranChapterSummary = components['schemas']['QuranChapterSummary']
export type QuranChapterEditor = components['schemas']['QuranChapterEditor']
export type QuranVerseDraft = components['schemas']['QuranVerseDraft']
export type QuranTextFields = components['schemas']['QuranTextFields']
export type QuranPublishRequest = components['schemas']['QuranPublishRequest']
export type QuranChangelogEntry = components['schemas']['QuranChangelogEntry']
export type QuranVerseDraftInput = components['schemas']['QuranVerseDraftInput']
export type QuranPublishStatus = components['schemas']['QuranPublishStatus']
export type QuranChapterWords = components['schemas']['QuranChapterWords']
export type QuranVerseWords = components['schemas']['QuranVerseWords']
export type QuranWord = components['schemas']['QuranWord']
export type QuranWordFields = components['schemas']['QuranWordFields']
export type QuranWordDraftInput = components['schemas']['QuranWordDraftInput']
export type QuranRootSummary = components['schemas']['QuranRootSummary']
export type QuranRootPublishResult = components['schemas']['QuranRootPublishResult']

/** Uniform result for editorial mutations invoked from server actions. */
export type MutationResult<T> = { ok: true; data: T } | { ok: false; error: string }

const API_BASE = resolveServerApiBaseUrl()

function authedClient(token: string) {
  return createClient<paths>({
    baseUrl: API_BASE,
    fetch: (request: Request): Promise<Response> => {
      const headers = new Headers(request.headers)
      headers.set('Authorization', `Bearer ${token}`)
      return globalThis.fetch(new Request(request, { headers, cache: 'no-store' }))
    },
  })
}

/**
 * Resolves the caller's editorial permission snapshot. Returns null when the
 * backend denies access (403), the token is missing, or the request fails — the
 * caller treats null as "no editorial access" and denies by default.
 */
export async function getEditorialSession(
  token: string | undefined,
): Promise<EditorialSession | null> {
  if (!API_BASE || !token) return null
  try {
    const { data, error, response } = await authedClient(token).GET(
      '/editorial/session',
    )
    if (error || !response.ok || !data?.data) return null
    return data.data
  } catch {
    return null
  }
}

/** Lists the Quran version registry. Returns [] on denial or failure. */
export async function listQuranVersions(
  token: string | undefined,
): Promise<QuranVersion[]> {
  if (!API_BASE || !token) return []
  try {
    const { data, error, response } = await authedClient(token).GET(
      '/editorial/quran-versions',
    )
    if (error || !response.ok || !data?.data) return []
    return data.data
  } catch {
    return []
  }
}

/** Lists the Bible version registry. Returns [] on denial or failure. */
export async function listBibleVersions(
  token: string | undefined,
): Promise<BibleVersion[]> {
  if (!API_BASE || !token) return []
  try {
    const { data, error, response } = await authedClient(token).GET(
      '/editorial/bible-versions',
    )
    if (error || !response.ok || !data?.data) return []
    return data.data
  } catch {
    return []
  }
}

// ── Quran write path ─────────────────────────────────────────────────────────

/** Lists chapter navigation + progress for a version. [] on denial/failure. */
export async function listQuranChapters(
  token: string | undefined,
  versionId: number,
): Promise<QuranChapterSummary[]> {
  if (!API_BASE || !token) return []
  try {
    const { data, error, response } = await authedClient(token).GET(
      '/editorial/quran/versions/{versionId}/chapters',
      { params: { path: { versionId } } },
    )
    if (error || !response.ok || !data?.data) return []
    return data.data
  } catch {
    return []
  }
}

/** Fetches the full chapter editing surface, or null on denial/failure. */
export async function getQuranChapter(
  token: string | undefined,
  versionId: number,
  chapterNumber: number,
): Promise<QuranChapterEditor | null> {
  if (!API_BASE || !token) return null
  try {
    const { data, error, response } = await authedClient(token).GET(
      '/editorial/quran/versions/{versionId}/chapters/{chapterNumber}',
      { params: { path: { versionId, chapterNumber } } },
    )
    if (error || !response.ok || !data?.data) return null
    return data.data
  } catch {
    return null
  }
}

/** Lists publish requests visible to the caller. [] on denial/failure. */
export async function listQuranPublishRequests(
  token: string | undefined,
  filter?: { status?: QuranPublishStatus; versionId?: number },
): Promise<QuranPublishRequest[]> {
  if (!API_BASE || !token) return []
  try {
    const { data, error, response } = await authedClient(token).GET(
      '/editorial/quran/publish-requests',
      { params: { query: { status: filter?.status, version_id: filter?.versionId } } },
    )
    if (error || !response.ok || !data?.data) return []
    return data.data
  } catch {
    return []
  }
}

/** Lists recent changelog entries for a chapter. [] on denial/failure. */
export async function listQuranChapterChangelog(
  token: string | undefined,
  versionId: number,
  chapterNumber: number,
  limit?: number,
): Promise<QuranChangelogEntry[]> {
  if (!API_BASE || !token) return []
  try {
    const { data, error, response } = await authedClient(token).GET(
      '/editorial/quran/versions/{versionId}/chapters/{chapterNumber}/changelog',
      { params: { path: { versionId, chapterNumber }, query: { limit } } },
    )
    if (error || !response.ok || !data?.data) return []
    return data.data
  } catch {
    return []
  }
}

/** Saves a verse draft. */
export async function upsertQuranVerseDraft(
  token: string,
  versionId: number,
  chapterNumber: number,
  verseNumber: number,
  body: QuranVerseDraftInput,
): Promise<MutationResult<QuranVerseDraft>> {
  try {
    const { data, error, response } = await authedClient(token).PUT(
      '/editorial/quran/versions/{versionId}/chapters/{chapterNumber}/verses/{verseNumber}',
      { params: { path: { versionId, chapterNumber, verseNumber } }, body },
    )
    if (error || !response.ok || !data?.data) {
      return { ok: false, error: messageFrom(error, response.status) }
    }
    return { ok: true, data: data.data }
  } catch {
    return { ok: false, error: 'Network error saving verse draft.' }
  }
}

/** Saves the chapter-title draft. */
export async function upsertQuranChapterDraft(
  token: string,
  versionId: number,
  chapterNumber: number,
  title: string | null,
): Promise<MutationResult<{ chapter_number: number; title?: string | null }>> {
  try {
    const { data, error, response } = await authedClient(token).PUT(
      '/editorial/quran/versions/{versionId}/chapters/{chapterNumber}',
      { params: { path: { versionId, chapterNumber } }, body: { title } },
    )
    if (error || !response.ok || !data?.data) {
      return { ok: false, error: messageFrom(error, response.status) }
    }
    return { ok: true, data: data.data }
  } catch {
    return { ok: false, error: 'Network error saving chapter draft.' }
  }
}

/** Submits a chapter for publishing. */
export async function createQuranPublishRequest(
  token: string,
  versionId: number,
  chapterNumber: number,
  note?: string | null,
): Promise<MutationResult<QuranPublishRequest>> {
  try {
    const { data, error, response } = await authedClient(token).POST(
      '/editorial/quran/versions/{versionId}/chapters/{chapterNumber}/publish-request',
      { params: { path: { versionId, chapterNumber } }, body: { note } },
    )
    if (error || !response.ok || !data?.data) {
      return { ok: false, error: messageFrom(error, response.status) }
    }
    return { ok: true, data: data.data }
  } catch {
    return { ok: false, error: 'Network error submitting publish request.' }
  }
}

/** Decision on a publish request: approve, reject, or cancel. */
export async function decideQuranPublishRequest(
  token: string,
  requestId: number,
  decision: 'approve' | 'reject' | 'cancel',
  note?: string | null,
): Promise<MutationResult<QuranPublishRequest>> {
  const path = {
    approve: '/editorial/quran/publish-requests/{requestId}/approve',
    reject: '/editorial/quran/publish-requests/{requestId}/reject',
    cancel: '/editorial/quran/publish-requests/{requestId}/cancel',
  }[decision] as
    | '/editorial/quran/publish-requests/{requestId}/approve'
    | '/editorial/quran/publish-requests/{requestId}/reject'
    | '/editorial/quran/publish-requests/{requestId}/cancel'
  try {
    const { data, error, response } = await authedClient(token).POST(path, {
      params: { path: { requestId } },
      body: decision === 'cancel' ? undefined : { note },
    })
    if (error || !response.ok || !data?.data) {
      return { ok: false, error: messageFrom(error, response.status) }
    }
    return { ok: true, data: data.data }
  } catch {
    return { ok: false, error: `Network error during ${decision}.` }
  }
}

// ── Quran word-by-word + roots (Phase 2) ─────────────────────────────────────

/** Fetches the word-by-word editing surface for a chapter, or null on failure. */
export async function getQuranChapterWords(
  token: string | undefined,
  versionId: number,
  chapterNumber: number,
): Promise<QuranChapterWords | null> {
  if (!API_BASE || !token) return null
  try {
    const { data, error, response } = await authedClient(token).GET(
      '/editorial/quran/versions/{versionId}/chapters/{chapterNumber}/words',
      { params: { path: { versionId, chapterNumber } } },
    )
    if (error || !response.ok || !data?.data) return null
    return data.data
  } catch {
    return null
  }
}

/** Saves one per-word draft. */
export async function upsertQuranWordDraft(
  token: string,
  versionId: number,
  wordId: number,
  body: QuranWordDraftInput,
): Promise<MutationResult<QuranWord>> {
  try {
    const { data, error, response } = await authedClient(token).PUT(
      '/editorial/quran/versions/{versionId}/words/{wordId}',
      { params: { path: { versionId, wordId } }, body },
    )
    if (error || !response.ok || !data?.data) {
      return { ok: false, error: messageFrom(error, response.status) }
    }
    return { ok: true, data: data.data }
  } catch {
    return { ok: false, error: 'Network error saving word draft.' }
  }
}

/** Lists root meanings for a version (Root Book). Returns empty on failure. */
export async function listQuranRoots(
  token: string | undefined,
  versionId: number,
  opts?: { q?: string; limit?: number; offset?: number },
): Promise<{ roots: QuranRootSummary[]; total: number }> {
  if (!API_BASE || !token) return { roots: [], total: 0 }
  try {
    const { data, error, response } = await authedClient(token).GET(
      '/editorial/quran/versions/{versionId}/roots',
      { params: { path: { versionId }, query: { q: opts?.q, limit: opts?.limit, offset: opts?.offset } } },
    )
    if (error || !response.ok || !data?.data) return { roots: [], total: 0 }
    return { roots: data.data, total: data.total }
  } catch {
    return { roots: [], total: 0 }
  }
}

/** Saves this version's draft meaning for a root (broadcasts by JOIN). */
export async function upsertQuranRootMeaning(
  token: string,
  versionId: number,
  rootId: number,
  meaning: string | null,
): Promise<MutationResult<QuranRootSummary>> {
  try {
    const { data, error, response } = await authedClient(token).PUT(
      '/editorial/quran/versions/{versionId}/roots/{rootId}',
      { params: { path: { versionId, rootId } }, body: { meaning } },
    )
    if (error || !response.ok || !data?.data) {
      return { ok: false, error: messageFrom(error, response.status) }
    }
    return { ok: true, data: data.data }
  } catch {
    return { ok: false, error: 'Network error saving root meaning.' }
  }
}

/** Publishes all pending root meaning drafts for a version (approver only). */
export async function publishQuranRootMeanings(
  token: string,
  versionId: number,
  note?: string | null,
): Promise<MutationResult<QuranRootPublishResult>> {
  try {
    const { data, error, response } = await authedClient(token).POST(
      '/editorial/quran/versions/{versionId}/roots/publish',
      { params: { path: { versionId } }, body: { note } },
    )
    if (error || !response.ok || !data?.data) {
      return { ok: false, error: messageFrom(error, response.status) }
    }
    return { ok: true, data: data.data }
  } catch {
    return { ok: false, error: 'Network error publishing root meanings.' }
  }
}

/** Extracts a human-readable message from an error envelope, with a status fallback. */
function messageFrom(error: unknown, status: number): string {
  if (error && typeof error === 'object' && 'message' in error) {
    const m = (error as { message?: unknown }).message
    if (typeof m === 'string' && m) return m
  }
  if (status === 403) return 'You do not have permission for this action.'
  if (status === 404) return 'Not found.'
  if (status === 409) return 'Conflicts with the current state.'
  return 'Request failed.'
}
