'use server'

import { auth } from '@/auth'
import {
  OfflineAdminApiError,
  offlineAdminClient,
  type PublishedState,
  type RebuildStatus,
} from '@/lib/offline-admin-client'

export type ActionResult<T> = { ok: true; data: T } | { ok: false; error: string }

async function adminClient() {
  const session = await auth()
  if (!session?.accessToken) return { error: 'not_authenticated' as const }
  if (!session.isAdmin) return { error: 'not_authorized' as const }
  return { client: offlineAdminClient(session.accessToken) }
}

function describe(err: unknown): string {
  if (err === 'not_authenticated') return 'Your session expired. Please sign in again.'
  if (err === 'not_authorized') return 'You do not have admin access.'
  if (err instanceof OfflineAdminApiError) {
    switch (err.status) {
      case 401:
        return 'Your session expired. Please sign in again.'
      case 403:
        return 'You do not have admin access.'
      case 409:
        return 'A rebuild is already running.'
      case 503:
        return 'Publishing is not configured on the server.'
      default:
        return err.serverMessage ?? 'The request failed. Please try again.'
    }
  }
  return 'The request failed. Please try again.'
}

export async function rebuildBundlesAction(): Promise<ActionResult<RebuildStatus>> {
  const ctx = await adminClient()
  if ('error' in ctx) return { ok: false, error: describe(ctx.error) }
  try {
    const data = await ctx.client.rebuild()
    return { ok: true, data }
  } catch (err) {
    return { ok: false, error: describe(err) }
  }
}

export async function rebuildStatusAction(): Promise<ActionResult<RebuildStatus>> {
  const ctx = await adminClient()
  if ('error' in ctx) return { ok: false, error: describe(ctx.error) }
  try {
    const data = await ctx.client.status()
    return { ok: true, data }
  } catch (err) {
    return { ok: false, error: describe(err) }
  }
}

export async function publishedFilesAction(): Promise<ActionResult<PublishedState>> {
  const ctx = await adminClient()
  if ('error' in ctx) return { ok: false, error: describe(ctx.error) }
  try {
    const data = await ctx.client.files()
    return { ok: true, data }
  } catch (err) {
    return { ok: false, error: describe(err) }
  }
}
