/**
 * Admin user-management client. Calls the backend's RequireAdmin-gated user
 * endpoints with the caller's session bearer token. Admin server actions
 * compose this client; it must not be imported from client components (the
 * token must stay server-side).
 */

import createClient from 'openapi-fetch'
import { resolveServerApiBaseUrl } from '@/src/api/base-url'
import type { components, paths } from '@/src/api/types.gen'

const API_BASE = resolveServerApiBaseUrl()

type AdminUserSchema = components['schemas']['User']

export interface AdminUser extends Omit<AdminUserSchema, 'permissions'> {
  permissions: Record<string, unknown> | null
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

function toAdminUser(user: AdminUserSchema): AdminUser {
  return {
    ...user,
    permissions: (user.permissions as Record<string, unknown> | null) ?? null,
  }
}

function extractMessage(err: unknown, fallback: string): string {
  if (!err || typeof err !== 'object') return fallback
  const maybe = err as { message?: string }
  return maybe.message || fallback
}

function makeAuthedFetch(token: string) {
  return async (request: Request): Promise<Response> => {
    const headers = new Headers(request.headers)
    headers.set('Authorization', `Bearer ${token}`)
    return globalThis.fetch(
      new Request(request, {
        headers,
        cache: 'no-store',
      }),
    )
  }
}

export function adminUsersClient(token: string) {
  const client = createClient<paths>({
    baseUrl: API_BASE,
    fetch: makeAuthedFetch(token),
  })

  return {
    list: async (opts?: { limit?: number; offset?: number }): Promise<AdminUser[]> => {
      const { data, error, response } = await client.GET('/users', {
        params: { query: { limit: opts?.limit, offset: opts?.offset } },
      })
      if (error || !response.ok || !data?.data) {
        throw new AdminUsersError(response.status, extractMessage(error, response.statusText))
      }
      return data.data.map(toAdminUser)
    },

    update: async (
      id: number,
      patch: { role?: 'admin' | 'editor' | 'member'; permissions?: Record<string, unknown>; is_active?: boolean },
    ): Promise<AdminUser> => {
      const { data, error, response } = await client.PATCH('/users/{id}', {
        params: { path: { id } },
        body: patch,
      })
      if (error || !response.ok || !data?.data) {
        throw new AdminUsersError(response.status, extractMessage(error, response.statusText))
      }
      return toAdminUser(data.data)
    },
  }
}
