'use server'

import { auth } from '@/auth'
import { AdminApiError, gamesAdminClient, type LanguageStat } from '@/lib/games-admin-client'

export type ActionResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string }

async function editorClient() {
  const session = await auth()
  if (!session?.accessToken) return { error: 'not_authenticated' as const }
  if (!session.isAdmin && !session.isEditor) return { error: 'not_authorized' as const }
  return { client: gamesAdminClient(session.accessToken) }
}

function describe(err: unknown): string {
  if (err === 'not_authenticated') return 'Your session expired. Please sign in again.'
  if (err === 'not_authorized') return 'You do not have games editor access.'
  if (err instanceof AdminApiError) {
    switch (err.status) {
      case 401: return 'Your session expired. Please sign in again.'
      case 403: return 'You do not have games editor access.'
      default: return err.serverMessage ?? 'The request failed. Please try again.'
    }
  }
  return 'The request failed. Please try again.'
}

export async function frequencyStatsAction(): Promise<ActionResult<LanguageStat[]>> {
  const ctx = await editorClient()
  if ('error' in ctx) return { ok: false, error: describe(ctx.error) }
  try {
    const data = await ctx.client.frequencyStats()
    return { ok: true, data }
  } catch (err) {
    return { ok: false, error: describe(err) }
  }
}

export async function lemmaStatsAction(): Promise<ActionResult<LanguageStat[]>> {
  const ctx = await editorClient()
  if ('error' in ctx) return { ok: false, error: describe(ctx.error) }
  try {
    const data = await ctx.client.lemmaStats()
    return { ok: true, data }
  } catch (err) {
    return { ok: false, error: describe(err) }
  }
}

export async function seedFrequencyAction(
  language: string,
): Promise<ActionResult<{ language: string; tokens: number }>> {
  const ctx = await editorClient()
  if ('error' in ctx) return { ok: false, error: describe(ctx.error) }
  try {
    const data = await ctx.client.seedFrequency(language)
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
