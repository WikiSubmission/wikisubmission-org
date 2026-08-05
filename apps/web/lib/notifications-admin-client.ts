/**
 * Server-only thin client for the admin notifications endpoints.
 *
 * These routes (`/admin/notifications/*`) are registered outside the OpenAPI
 * contract on the backend (like `/admin/games/*`), so the typed `wsApi` does
 * not know them. This wrapper uses plain fetch with the caller's bearer token.
 * Never import it in a Client Component — call it from server actions only.
 */

const baseUrl = (process.env.INTERNAL_API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? '').replace(
  /\/+$/,
  '',
)

export interface ZikrEntry {
  id: number
  text: string
  lang: string
  source?: string
  weight: number
  active: boolean
  updated_at: string
}

export type ScheduleDestination = 'all' | 'web_push' | 'fcm'
export type ScheduleFrequency = 'once' | 'daily' | 'weekly' | 'biweekly' | 'monthly'

export interface ScheduledNotification {
  id: number
  title: string
  body: string
  url?: string
  category?: string
  destination: ScheduleDestination
  category_filter?: string
  frequency: ScheduleFrequency
  starts_at: string
  timezone: string
  enabled: boolean
  next_run_at: string
  last_run_at?: string
  last_status?: string
  last_error?: string
  last_web_sent?: number
  last_fcm_sent?: number
  created_by?: string
  created_at: string
  updated_at: string
}

export interface ScheduleInput {
  title: string
  body: string
  url?: string
  category?: string
  destination: ScheduleDestination
  category_filter?: string
  frequency: ScheduleFrequency
  /** RFC3339 or wall-clock `YYYY-MM-DDTHH:MM` interpreted in `timezone`. */
  starts_at: string
  timezone: string
  enabled?: boolean
}

export interface ZikrInput {
  text: string
  lang?: string
  source?: string
  active?: boolean
  weight?: number
}

export interface SendResult {
  web_sent?: number
  fcm_sent?: number
  status?: string
  broadcast?: boolean
}

/** Error carrying the backend status code and `message` body, for the UI. */
export class NotificationsAdminError extends Error {
  readonly status: number
  readonly serverMessage?: string
  constructor(status: number, serverMessage?: string) {
    super(serverMessage ? `${status}: ${serverMessage}` : `${status}`)
    this.name = 'NotificationsAdminError'
    this.status = status
    this.serverMessage = serverMessage
  }
}

/** Calls an `/admin/notifications` endpoint and unwraps the `{ data }` envelope. */
async function call<T>(
  token: string,
  path: string,
  init?: { method?: string; body?: unknown },
): Promise<T> {
  const res = await fetch(`${baseUrl}/admin/notifications${path}`, {
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
    throw new NotificationsAdminError(res.status, serverMessage)
  }

  const json = (await res.json()) as { data: T }
  return json.data
}

export function notificationsAdminClient(token: string) {
  return {
    listZikr: (): Promise<ZikrEntry[]> => call<ZikrEntry[]>(token, '/zikr'),

    createZikr: (input: ZikrInput): Promise<ZikrEntry> =>
      call<ZikrEntry>(token, '/zikr', { method: 'POST', body: input }),

    updateZikr: (id: number, patch: Partial<ZikrInput>): Promise<ZikrEntry> =>
      call<ZikrEntry>(token, `/zikr/${id}`, { method: 'PATCH', body: patch }),

    deleteZikr: (id: number): Promise<{ ok: boolean }> =>
      call<{ ok: boolean }>(token, `/zikr/${id}`, { method: 'DELETE' }),

    listSchedules: (): Promise<ScheduledNotification[]> =>
      call<ScheduledNotification[]>(token, '/schedules'),

    createSchedule: (input: ScheduleInput): Promise<ScheduledNotification> =>
      call<ScheduledNotification>(token, '/schedules', { method: 'POST', body: input }),

    updateSchedule: (id: number, patch: Partial<ScheduleInput>): Promise<ScheduledNotification> =>
      call<ScheduledNotification>(token, `/schedules/${id}`, { method: 'PATCH', body: patch }),

    deleteSchedule: (id: number): Promise<{ ok: boolean }> =>
      call<{ ok: boolean }>(token, `/schedules/${id}`, { method: 'DELETE' }),

    sendNow: (id: number): Promise<SendResult> =>
      call<SendResult>(token, `/schedules/${id}/send-now`, { method: 'POST', body: {} }),

    sendTest: (input: {
      title: string
      body: string
      url?: string
      broadcast?: boolean
      destination?: ScheduleDestination
      category_filter?: string
    }): Promise<SendResult> => call<SendResult>(token, '/test', { method: 'POST', body: input }),
  }
}
