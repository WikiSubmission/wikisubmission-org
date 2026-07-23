/**
 * Server-only client for the first-party editorial content store and the
 * admin grant surface. Mirrors lib/editorial-client.ts: reads degrade to
 * empty/null, mutations return MutationResult; the backend re-checks
 * permissions on every call.
 *
 * Do not import this from a Client Component — mutations must go through
 * server actions so the bearer token never reaches the browser.
 */
import createClient from 'openapi-fetch'
import { resolveServerApiBaseUrl } from '@/src/api/base-url'
import type { components, paths } from '@/src/api/types.gen'

export type EditorialContentModule = components['schemas']['EditorialContentModule']
export type EditorialContentStatus = components['schemas']['EditorialContentStatus']
export type EditorialContentDoc = components['schemas']['EditorialContentDoc']
export type EditorialContentInput = components['schemas']['EditorialContentInput']
export type EditorialEditor = components['schemas']['EditorialEditor']
export type EditorGrantsInput = components['schemas']['EditorGrantsInput']
export type EditorVersionGrant = components['schemas']['EditorVersionGrant']

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

// ── content documents ────────────────────────────────────────────────────────

export interface ContentListResult {
  docs: EditorialContentDoc[]
  total: number
}

/** Lists one module's documents. Empty result on denial or failure. */
export async function listContentDocs(
  token: string | undefined,
  module: EditorialContentModule,
  filter?: { q?: string; status?: EditorialContentStatus; limit?: number; offset?: number },
): Promise<ContentListResult> {
  if (!API_BASE || !token) return { docs: [], total: 0 }
  try {
    const { data, error, response } = await authedClient(token).GET(
      '/editorial/content/{module}',
      {
        params: {
          path: { module },
          query: {
            q: filter?.q,
            status: filter?.status,
            limit: filter?.limit,
            offset: filter?.offset,
          },
        },
      },
    )
    if (error || !response.ok || !data?.data) return { docs: [], total: 0 }
    return { docs: data.data, total: data.total }
  } catch {
    return { docs: [], total: 0 }
  }
}

/** Fetches one document, or null on denial/failure. */
export async function getContentDoc(
  token: string | undefined,
  module: EditorialContentModule,
  docId: number,
): Promise<EditorialContentDoc | null> {
  if (!API_BASE || !token) return null
  try {
    const { data, error, response } = await authedClient(token).GET(
      '/editorial/content/{module}/{docId}',
      { params: { path: { module, docId } } },
    )
    if (error || !response.ok || !data?.data) return null
    return data.data
  } catch {
    return null
  }
}

/** Creates a draft document. */
export async function createContentDoc(
  token: string,
  module: EditorialContentModule,
  body: EditorialContentInput,
): Promise<MutationResult<EditorialContentDoc>> {
  try {
    const { data, error, response } = await authedClient(token).POST(
      '/editorial/content/{module}',
      { params: { path: { module } }, body },
    )
    if (error || !response.ok || !data?.data) {
      return { ok: false, error: messageFrom(error, response.status) }
    }
    return { ok: true, data: data.data }
  } catch {
    return { ok: false, error: 'Network error creating the document.' }
  }
}

/** Replaces a document's draft fields. */
export async function updateContentDoc(
  token: string,
  module: EditorialContentModule,
  docId: number,
  body: EditorialContentInput,
): Promise<MutationResult<EditorialContentDoc>> {
  try {
    const { data, error, response } = await authedClient(token).PUT(
      '/editorial/content/{module}/{docId}',
      { params: { path: { module, docId } }, body },
    )
    if (error || !response.ok || !data?.data) {
      return { ok: false, error: messageFrom(error, response.status) }
    }
    return { ok: true, data: data.data }
  } catch {
    return { ok: false, error: 'Network error saving the document.' }
  }
}

/** Deletes a document (draft and published snapshot). */
export async function deleteContentDoc(
  token: string,
  module: EditorialContentModule,
  docId: number,
): Promise<MutationResult<null>> {
  try {
    const { error, response } = await authedClient(token).DELETE(
      '/editorial/content/{module}/{docId}',
      { params: { path: { module, docId } } },
    )
    if (error || !response.ok) {
      return { ok: false, error: messageFrom(error, response.status) }
    }
    return { ok: true, data: null }
  } catch {
    return { ok: false, error: 'Network error deleting the document.' }
  }
}

/** Publishes the current draft. */
export async function publishContentDoc(
  token: string,
  module: EditorialContentModule,
  docId: number,
): Promise<MutationResult<EditorialContentDoc>> {
  try {
    const { data, error, response } = await authedClient(token).POST(
      '/editorial/content/{module}/{docId}/publish',
      { params: { path: { module, docId } } },
    )
    if (error || !response.ok || !data?.data) {
      return { ok: false, error: messageFrom(error, response.status) }
    }
    return { ok: true, data: data.data }
  } catch {
    return { ok: false, error: 'Network error publishing the document.' }
  }
}

/** Retracts the published snapshot. */
export async function unpublishContentDoc(
  token: string,
  module: EditorialContentModule,
  docId: number,
): Promise<MutationResult<EditorialContentDoc>> {
  try {
    const { data, error, response } = await authedClient(token).POST(
      '/editorial/content/{module}/{docId}/unpublish',
      { params: { path: { module, docId } } },
    )
    if (error || !response.ok || !data?.data) {
      return { ok: false, error: messageFrom(error, response.status) }
    }
    return { ok: true, data: data.data }
  } catch {
    return { ok: false, error: 'Network error unpublishing the document.' }
  }
}

// ── admin grants ─────────────────────────────────────────────────────────────

/** Lists users with their editorial grants (admin). Empty result on denial. */
export async function listEditorialEditors(
  token: string | undefined,
  filter?: { limit?: number; offset?: number },
): Promise<{ editors: EditorialEditor[]; total: number }> {
  if (!API_BASE || !token) return { editors: [], total: 0 }
  try {
    const { data, error, response } = await authedClient(token).GET(
      '/editorial/admin/editors',
      { params: { query: { limit: filter?.limit, offset: filter?.offset } } },
    )
    if (error || !response.ok || !data?.data) return { editors: [], total: 0 }
    return { editors: data.data, total: data.total }
  } catch {
    return { editors: [], total: 0 }
  }
}

/** Replaces one user's editorial grants (admin). */
export async function replaceEditorGrants(
  token: string,
  userId: number,
  body: EditorGrantsInput,
): Promise<MutationResult<EditorialEditor>> {
  try {
    const { data, error, response } = await authedClient(token).PUT(
      '/editorial/admin/editors/{userId}',
      { params: { path: { userId } }, body },
    )
    if (error || !response.ok || !data?.data) {
      return { ok: false, error: messageFrom(error, response.status) }
    }
    return { ok: true, data: data.data }
  } catch {
    return { ok: false, error: 'Network error saving grants.' }
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
