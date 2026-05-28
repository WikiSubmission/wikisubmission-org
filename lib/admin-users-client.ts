/**
 * Admin user-management client. Calls the backend's RequireAdmin-gated user
 * endpoints with the caller's session bearer token. Admin server actions
 * compose this client; it must not be imported from client components (the
 * token must stay server-side).
 */

const API_BASE = (
  process.env.INTERNAL_API_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  ''
).replace(/\/+$/, '')

export interface AdminUser {
  id: number
  auth_id: string
  email: string
  display_name?: string | null
  role: 'admin' | 'editor' | 'member' | string
  permissions: Record<string, unknown> | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export class AdminUsersError extends Error {
  status: number
  serverMessage: string
  constructor(status: number, message: string) {
    super(`${status}: ${message}`)
    this.status = status
    this.serverMessage = message
  }
}

async function call<T>(token: string, method: string, path: string, body?: unknown): Promise<T> {
  const init: RequestInit = {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
    },
    cache: 'no-store',
  }
  if (body !== undefined) init.body = JSON.stringify(body)
  const res = await fetch(`${API_BASE}${path}`, init)
  if (!res.ok) {
    let message = res.statusText
    try {
      const data = (await res.json()) as { error?: string }
      if (data?.error) message = data.error
    } catch {
      // ignore non-JSON error bodies
    }
    throw new AdminUsersError(res.status, message)
  }
  const data = (await res.json()) as { data: T }
  return data.data
}

export function adminUsersClient(token: string) {
  return {
    list: (opts?: { limit?: number; offset?: number }): Promise<AdminUser[]> => {
      const params = new URLSearchParams()
      if (opts?.limit != null) params.set('limit', String(opts.limit))
      if (opts?.offset != null) params.set('offset', String(opts.offset))
      const qs = params.toString()
      return call(token, 'GET', `/users${qs ? `?${qs}` : ''}`)
    },

    update: (
      id: number,
      patch: { role?: string; permissions?: Record<string, unknown>; is_active?: boolean },
    ): Promise<AdminUser> => call(token, 'PATCH', `/users/${id}`, patch),
  }
}
