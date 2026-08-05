'use server'

import { AdminApiError, type LanguageStat } from '@/lib/games-admin-client'
import { FILL_BLANK, gameClient } from '@/lib/games-access'

export type ActionResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string }

// Stats are reads; seeding and lemma loading rewrite shared tables, so they
// require write on this game rather than mere read.
function editorClient(mode: 'read' | 'write' = 'read') {
  return gameClient(FILL_BLANK, mode)
}

function describe(err: unknown): string {
  if (err === 'not_authenticated') return 'Your session expired. Please sign in again.'
  if (err === 'not_authorized') return 'You do not have access to this game.'
  if (err instanceof AdminApiError) {
    switch (err.status) {
      case 401: return 'Your session expired. Please sign in again.'
      case 403: return 'You do not have access to this game.'
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
  const ctx = await editorClient('write')
  if ('error' in ctx) return { ok: false, error: describe(ctx.error) }
  try {
    const data = await ctx.client.seedFrequency(language)
    return { ok: true, data }
  } catch (err) {
    return { ok: false, error: describe(err) }
  }
}

export async function loadLemmasAction(
  language: string,
): Promise<ActionResult<{ language: string; lemma_rows: number }>> {
  const ctx = await editorClient('write')
  if ('error' in ctx) return { ok: false, error: describe(ctx.error) }
  try {
    const data = await ctx.client.loadLemmas(language)
    return { ok: true, data }
  } catch (err) {
    return { ok: false, error: describe(err) }
  }
}
