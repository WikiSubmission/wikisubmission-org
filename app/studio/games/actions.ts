'use server'

import { auth } from '@/auth'
import { gamesAdminClient } from '@/lib/games-admin-client'
import { isEditor, type ReviewPassage, type ReviewStatus } from '@/lib/games-editor'

export type ActionResult<T> = { ok: true; data: T } | { ok: false; error: string }

/**
 * Resolves an authenticated editor session and returns a bound admin client.
 * Every action re-checks the session and the soft allowlist; the backend
 * RequireEditor middleware is still the real gate.
 */
async function editorClient() {
  const session = await auth()
  if (!session?.accessToken) {
    return { error: 'not_authenticated' as const }
  }
  if (!isEditor(session.user?.email)) {
    return { error: 'not_authorized' as const }
  }
  return { client: gamesAdminClient(session.accessToken) }
}

function describe(err: unknown): string {
  const code = err instanceof Error ? err.message : ''
  if (code === '401') return 'Your session expired. Please sign in again.'
  if (code === '403') return 'You are not on the editor allowlist.'
  if (code === '404') return 'Passage not found.'
  return 'The request failed. Please try again.'
}

export async function listPassagesAction(filters: {
  status?: string
  chapter?: string
}): Promise<ActionResult<ReviewPassage[]>> {
  const ctx = await editorClient()
  if ('error' in ctx) return { ok: false, error: describe(ctx.error) }
  try {
    const data = await ctx.client.listPassages(filters)
    return { ok: true, data }
  } catch (err) {
    return { ok: false, error: describe(err) }
  }
}

export async function setStatusAction(
  id: number,
  status: ReviewStatus,
): Promise<ActionResult<{ id: number; status: string }>> {
  const ctx = await editorClient()
  if ('error' in ctx) return { ok: false, error: describe(ctx.error) }
  try {
    const data = await ctx.client.setStatus(id, status)
    return { ok: true, data }
  } catch (err) {
    return { ok: false, error: describe(err) }
  }
}

export async function seedFrequencyAction(): Promise<
  ActionResult<{ language: string; tokens: number }>
> {
  const ctx = await editorClient()
  if ('error' in ctx) return { ok: false, error: describe(ctx.error) }
  try {
    const data = await ctx.client.seedFrequency()
    return { ok: true, data }
  } catch (err) {
    return { ok: false, error: describe(err) }
  }
}

export async function loadLemmasAction(): Promise<
  ActionResult<{ language: string; lemma_rows: number }>
> {
  const ctx = await editorClient()
  if ('error' in ctx) return { ok: false, error: describe(ctx.error) }
  try {
    const data = await ctx.client.loadLemmas()
    return { ok: true, data }
  } catch (err) {
    return { ok: false, error: describe(err) }
  }
}
