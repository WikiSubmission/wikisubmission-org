/**
 * Server-only thin client for the admin offline-bundle endpoints.
 *
 * These routes (`/admin/offline/*`) are registered outside the OpenAPI
 * contract on the backend (like `/admin/games/*`), so the typed `wsApi` does
 * not know them. Plain fetch with the caller's bearer token; call from server
 * actions only, never from a Client Component.
 */

// Trim any trailing slash so path concatenation never produces a double slash,
// which the backend router treats as an unregistered path and 404s.
const baseUrl = (process.env.INTERNAL_API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? '').replace(
  /\/+$/,
  '',
)

/** One published bundle as reported by a finished rebuild (manifest entry). */
export interface RebuildBundle {
  id: string
  scripture: string
  lang: string
  kind: string
  url: string
  bytes: number
  sha256: string
  data_version: number
}

export interface RebuildStatus {
  status: 'idle' | 'running' | 'done' | 'failed'
  started_at?: string
  finished_at?: string
  data_version?: number
  error?: string
  bundles?: RebuildBundle[]
}

/** Error carrying the backend status code and `message` body, for the UI. */
export class OfflineAdminApiError extends Error {
  readonly status: number
  readonly serverMessage?: string
  constructor(status: number, serverMessage?: string) {
    super(serverMessage ? `${status}: ${serverMessage}` : `${status}`)
    this.name = 'OfflineAdminApiError'
    this.status = status
    this.serverMessage = serverMessage
  }
}

async function call<T>(token: string, path: string, method: 'GET' | 'POST'): Promise<T> {
  const res = await fetch(`${baseUrl}/admin/offline${path}`, {
    method,
    headers: { Authorization: `Bearer ${token}` },
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
    throw new OfflineAdminApiError(res.status, serverMessage)
  }

  const json = (await res.json()) as { data: T }
  return json.data
}

export function offlineAdminClient(token: string) {
  return {
    /** Kick off a rebuild+publish of every offline bundle. 409 when one is
     * already running, 503 when publishing is not configured server-side. */
    rebuild: (): Promise<RebuildStatus> => call<RebuildStatus>(token, '/rebuild', 'POST'),

    /** Current (or last) rebuild state, for polling. */
    status: (): Promise<RebuildStatus> => call<RebuildStatus>(token, '/rebuild', 'GET'),
  }
}
