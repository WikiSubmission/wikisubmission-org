/**
 * Server-only helpers that resolve per-game access for the /admin/games
 * surfaces.
 *
 * These deliberately re-resolve the caller's grants from ws-backend on every
 * call rather than reading session.isEditor, which is baked into the JWT for up
 * to 55 minutes and would let a revoked editor keep working (and, being a single
 * boolean, could not distinguish one game from another anyway).
 *
 * The backend re-checks every request — auth.RequireGameEditor for reads and
 * auth.RequireGameWriter for mutations — so these only shape the UI and short-
 * circuit obviously unauthorized calls.
 */
import { auth } from '@/auth'
import { getEditorialSession } from '@/lib/editorial-client'
import {
  canReadGame,
  canWriteGame,
  type EditorialSession,
} from '@/lib/editorial-access'
import { gamesAdminClient } from '@/lib/games-admin-client'

/** The one game with an editorial surface today; matches editor_games.key. */
export const FILL_BLANK = 'fill-blank'

export type GameAccessError = 'not_authenticated' | 'not_authorized'

export interface GameAccess {
  token: string
  editorial: EditorialSession
  canWrite: boolean
}

/**
 * Resolves read access to one game. Returns an error code rather than throwing
 * so callers can map it to a redirect, a panel, or an action result.
 */
export async function resolveGameAccess(
  gameKey: string
): Promise<{ access: GameAccess } | { error: GameAccessError }> {
  const session = await auth()
  if (!session?.accessToken) return { error: 'not_authenticated' }

  const editorial = await getEditorialSession(session.accessToken)
  if (!editorial || !canReadGame(editorial, gameKey))
    return { error: 'not_authorized' }

  return {
    access: {
      token: session.accessToken,
      editorial,
      canWrite: canWriteGame(editorial, gameKey),
    },
  }
}

/**
 * Resolves a client bound to one game, requiring write access when the caller
 * is about to mutate. `mode: 'write'` covers curation, passage status changes
 * and the maintenance jobs — all destructive.
 */
export async function gameClient(
  gameKey: string,
  mode: 'read' | 'write' = 'read'
): Promise<
  { client: ReturnType<typeof gamesAdminClient> } | { error: GameAccessError }
> {
  const resolved = await resolveGameAccess(gameKey)
  if ('error' in resolved) return { error: resolved.error }
  if (mode === 'write' && !resolved.access.canWrite)
    return { error: 'not_authorized' }
  return { client: gamesAdminClient(resolved.access.token, gameKey) }
}
