/**
 * Server-only thin client for the editorial games endpoints.
 *
 * These routes (`/admin/games/*`) are deliberately registered outside the
 * OpenAPI contract on the backend, so the typed `wsApi` does not know them.
 * This wrapper uses plain fetch with the caller's bearer token. Never import
 * it in a Client Component — call it from server actions only.
 */
import type { ReviewPassage, ReviewStatus } from './games-editor'

// Trim any trailing slash so path concatenation never produces a double slash
// (e.g. ".../api/v1/" + "/admin/games" -> ".../api/v1//admin/games"), which the
// backend router treats as an unregistered path and 404s.
const baseUrl = (process.env.INTERNAL_API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? '').replace(
  /\/+$/,
  '',
)

interface SeedFrequencyResult {
  language: string
  tokens: number
}

interface LoadLemmasResult {
  language: string
  lemma_rows: number
}

interface SetStatusResult {
  id: number
  status: string
}

interface CurateResult {
  chapter: number
  proposed: number
  dropped: number
  window_start: number
  window_end: number
  next_verse: number
  done: boolean
  verses_total: number
}

/** Error carrying the backend status code and `message` body, for the UI. */
export class AdminApiError extends Error {
  readonly status: number
  readonly serverMessage?: string
  /** Seconds the server suggested waiting before retry, parsed from
   * `Retry-After` on 429 responses. `undefined` when not provided. */
  readonly retryAfterSeconds?: number
  constructor(status: number, serverMessage?: string, retryAfterSeconds?: number) {
    super(serverMessage ? `${status}: ${serverMessage}` : `${status}`)
    this.name = 'AdminApiError'
    this.status = status
    this.serverMessage = serverMessage
    this.retryAfterSeconds = retryAfterSeconds
  }
}

function parseRetryAfterHeader(value: string | null): number | undefined {
  if (!value) return undefined
  const trimmed = value.trim()
  const asNumber = Number(trimmed)
  if (Number.isFinite(asNumber) && asNumber > 0) return asNumber
  const asDate = Date.parse(trimmed)
  if (!Number.isNaN(asDate)) {
    const delta = Math.ceil((asDate - Date.now()) / 1000)
    if (delta > 0) return delta
  }
  return undefined
}

/**
 * Calls an `/admin/games` endpoint and unwraps the `{ data }` envelope.
 * Throws with the backend status code prefix so callers can map 401/403/500.
 */
async function call<T>(
  token: string,
  path: string,
  init?: { method?: string; body?: unknown; query?: Record<string, string | undefined> },
): Promise<T> {
  const url = new URL(`${baseUrl}/admin/games${path}`)
  if (init?.query) {
    for (const [key, value] of Object.entries(init.query)) {
      if (value !== undefined && value !== '') url.searchParams.set(key, value)
    }
  }

  const res = await fetch(url, {
    method: init?.method ?? 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      ...(init?.body !== undefined ? { 'Content-Type': 'application/json' } : {}),
    },
    body: init?.body !== undefined ? JSON.stringify(init.body) : undefined,
    cache: 'no-store',
  })

  if (!res.ok) {
    let serverMessage: string | undefined
    try {
      const body = (await res.json()) as { message?: string }
      serverMessage = body?.message
    } catch {
      // non-JSON error body; status alone will have to do
    }
    const retryAfter =
      res.status === 429 ? parseRetryAfterHeader(res.headers.get('Retry-After')) : undefined
    throw new AdminApiError(res.status, serverMessage, retryAfter)
  }

  const json = (await res.json()) as { data: T }
  return json.data
}

export function gamesAdminClient(token: string) {
  return {
    listPassages: (opts?: { status?: string; chapter?: string }): Promise<ReviewPassage[]> =>
      call<ReviewPassage[]>(token, '/passages', {
        query: { status: opts?.status, chapter: opts?.chapter },
      }),

    getPassage: (id: number): Promise<ReviewPassage> =>
      call<ReviewPassage>(token, `/passages/${id}`),

    setStatus: (id: number, status: ReviewStatus): Promise<SetStatusResult> =>
      call<SetStatusResult>(token, `/passages/${id}/status`, {
        method: 'POST',
        body: { status },
      }),

    seedFrequency: (): Promise<SeedFrequencyResult> =>
      call<SeedFrequencyResult>(token, '/maintenance/seed-frequency', { method: 'POST' }),

    loadLemmas: (): Promise<LoadLemmasResult> =>
      call<LoadLemmasResult>(token, '/maintenance/load-lemmas', { method: 'POST' }),

    curate: (chapter: number, afterVerse: number): Promise<CurateResult> =>
      call<CurateResult>(token, '/curate', {
        method: 'POST',
        body: { chapter, after_verse: afterVerse },
      }),
  }
}
