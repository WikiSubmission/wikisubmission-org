'use server'

import { auth } from '@/auth'
import { AdminApiError, gamesAdminClient } from '@/lib/games-admin-client'
import { type ReviewPassage, type ReviewStatus } from '@/lib/games-editor'

export type ActionResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string; rateLimited?: boolean }

/**
 * Resolves an authenticated editor session and returns a bound admin client.
 * Every action re-checks the session flags (set from DB role + permissions);
 * the backend RequireEditor middleware is still the real gate.
 */
async function editorClient() {
  const session = await auth()
  if (!session?.accessToken) {
    return { error: 'not_authenticated' as const }
  }
  if (!session.isAdmin && !session.isEditor) {
    return { error: 'not_authorized' as const }
  }
  return { client: gamesAdminClient(session.accessToken) }
}

function describe(err: unknown): string {
  // Gating failures from editorClient() arrive as plain string codes.
  if (err === 'not_authenticated') return 'Your session expired. Please sign in again.'
  if (err === 'not_authorized') return 'You do not have games editor access.'

  if (err instanceof AdminApiError) {
    switch (err.status) {
      case 401:
        return 'Your session expired. Please sign in again.'
      case 403:
        return 'You do not have games editor access.'
      case 404:
        return 'Not found.'
      case 429:
        return 'Groq rate limit reached. Pausing before the next window.'
      case 503:
        return 'Curation is not configured on the server (missing GROQ_API_KEY).'
      case 400:
        return err.serverMessage ?? 'Invalid request.'
      case 502:
        // Pass through the upstream reason (rate limit, timeout, etc.).
        return err.serverMessage ?? 'The model could not curate this chapter. Try again.'
      default:
        return err.serverMessage ?? 'The request failed. Please try again.'
    }
  }
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

export type ProposedChapter = { chapter: number; count: number }

/** Distinct chapters that currently have proposed passages, with counts. */
export async function proposedSummaryAction(): Promise<ActionResult<ProposedChapter[]>> {
  const ctx = await editorClient()
  if ('error' in ctx) return { ok: false, error: describe(ctx.error) }
  try {
    const rows = await ctx.client.listPassages({ status: 'proposed' })
    const counts = new Map<number, number>()
    for (const p of rows) {
      counts.set(p.chapter_start, (counts.get(p.chapter_start) ?? 0) + 1)
    }
    const data = [...counts.entries()]
      .map(([chapter, count]) => ({ chapter, count }))
      .sort((a, b) => a.chapter - b.chapter)
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

export type CurateWindowResult = {
  chapter: number
  proposed: number
  dropped: number
  window_start: number
  window_end: number
  next_verse: number
  done: boolean
  verses_total: number
}

/** Curates a single verse window of a chapter, starting after `afterVerse`. */
export async function curateAction(
  chapter: number,
  afterVerse: number,
): Promise<ActionResult<CurateWindowResult>> {
  const ctx = await editorClient()
  if ('error' in ctx) return { ok: false, error: describe(ctx.error) }
  if (!Number.isInteger(chapter) || chapter < 1 || chapter > 114) {
    return { ok: false, error: 'Chapter must be between 1 and 114.' }
  }
  try {
    const data = await ctx.client.curate(chapter, afterVerse)
    return { ok: true, data }
  } catch (err) {
    const rateLimited = err instanceof AdminApiError && err.status === 429
    return { ok: false, error: describe(err), rateLimited }
  }
}
