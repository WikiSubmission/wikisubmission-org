/**
 * Server-only thin client for the editorial games endpoints.
 *
 * These routes (`/admin/games/*`) are deliberately registered outside the
 * OpenAPI contract on the backend, so the typed `wsApi` does not know them.
 * This wrapper uses plain fetch with the caller's bearer token. Never import
 * it in a Client Component — call it from server actions only.
 */
import type { ReviewPassage, ReviewStatus } from './games-editor'

const baseUrl = process.env.INTERNAL_API_URL ?? process.env.NEXT_PUBLIC_API_URL

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
    throw new Error(`${res.status}`)
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
  }
}
