/**
 * Pure permission predicates over the resolved EditorialSession snapshot from
 * ws-backend (`GET /editorial/session`).
 *
 * These mirror the Go decision methods in ws-backend's
 * db/editorial_permissions.go one-for-one. The backend is the real security
 * boundary and re-checks every mutation; these only decide what the UI renders
 * and which routes redirect. Keep the two in sync — especially the games union
 * rule below, which is the one place the two tiers do not behave like versions.
 *
 * Safe to import from client components: no server-only imports, no I/O.
 *
 * Wire convention: the maps are keyed by string, and *presence of a key means
 * read access* while `=== true` means write. Hence `!== undefined` for reads and
 * `=== true` for writes throughout.
 */
import type { components } from '@/src/api/types.gen'

export type EditorialSession = components['schemas']['EditorialSession']
export type EditorGame = components['schemas']['EditorGame']

/** Module keys that have a workspace in /editor, in sidebar order. */
export const CONTENT_MODULE_KEYS = [
  'quran',
  'bible',
  'article',
  'community',
  'author',
  'appendix',
] as const

export type ContentModuleKey = (typeof CONTENT_MODULE_KEYS)[number]

/**
 * The global games tier. A module grant under this key covers every game at
 * once, including games added later. Not a /editor workspace — the games studio
 * lives at /admin/games.
 */
export const GAME_MODULE_KEY = 'game'

// ── modules ──────────────────────────────────────────────────────────────────

export function canReadModule(
  session: EditorialSession,
  module: string
): boolean {
  return session.is_admin || session.modules[module] !== undefined
}

export function canWriteModule(
  session: EditorialSession,
  module: string
): boolean {
  return session.is_admin || session.modules[module] === true
}

/** Route-level rules for generic content documents. Categories live under
 * Articles, while the Authors management surface is admin-only. */
export function canReadContentModule(
  session: EditorialSession,
  module: string
): boolean {
  if (module === 'category') return canReadModule(session, 'article')
  if (module === 'author') return session.is_admin
  return canReadModule(session, module)
}

export function canWriteContentModule(
  session: EditorialSession,
  module: string
): boolean {
  if (module === 'category') return canWriteModule(session, 'article')
  if (module === 'author') return session.is_admin
  return canWriteModule(session, module)
}

// ── Quran versions ───────────────────────────────────────────────────────────
// Version access INTERSECTS with the owning module grant: both are required.

export function canReadQuranVersion(
  session: EditorialSession,
  versionId: number
): boolean {
  if (session.is_admin) return true
  if (!canReadModule(session, 'quran')) return false
  return session.quran_versions[String(versionId)] !== undefined
}

export function canWriteQuranVersion(
  session: EditorialSession,
  versionId: number
): boolean {
  if (session.is_admin) return true
  if (!canReadModule(session, 'quran')) return false
  return session.quran_versions[String(versionId)] === true
}

/**
 * Approving publish requests is a dedicated grant, independent of write. Gated
 * on the quran module grant too, so revoking the module revokes approval even
 * if a stale version grant lingers.
 */
export function canApproveQuranVersion(
  session: EditorialSession,
  versionId: number
): boolean {
  if (session.is_admin) return true
  if (!canReadModule(session, 'quran')) return false
  return session.quran_approver_versions?.[String(versionId)] === true
}

export function canApproveAnyQuranVersion(session: EditorialSession): boolean {
  if (session.is_admin) return true
  if (!canReadModule(session, 'quran')) return false
  return Object.values(session.quran_approver_versions ?? {}).some(Boolean)
}

// ── Bible versions ───────────────────────────────────────────────────────────

export function canReadBibleVersion(
  session: EditorialSession,
  versionId: number
): boolean {
  if (session.is_admin) return true
  if (!canReadModule(session, 'bible')) return false
  return session.bible_versions[String(versionId)] !== undefined
}

export function canWriteBibleVersion(
  session: EditorialSession,
  versionId: number
): boolean {
  if (session.is_admin) return true
  if (!canReadModule(session, 'bible')) return false
  return session.bible_versions[String(versionId)] === true
}

// ── games ────────────────────────────────────────────────────────────────────
// Games are a UNION, not an intersection: the global `game` module grant OR a
// per-game entry is sufficient on its own. That asymmetry is deliberate — it is
// what lets an admin grant one game without handing over the whole surface.

export function hasGlobalGameAccess(session: EditorialSession): boolean {
  return session.is_admin || session.modules[GAME_MODULE_KEY] !== undefined
}

export function canReadGame(
  session: EditorialSession,
  gameKey: string
): boolean {
  if (hasGlobalGameAccess(session)) return true
  return session.games?.[gameKey] !== undefined
}

export function canWriteGame(
  session: EditorialSession,
  gameKey: string
): boolean {
  if (session.is_admin || session.modules[GAME_MODULE_KEY] === true) return true
  return session.games?.[gameKey] === true
}

export function hasAnyGameAccess(session: EditorialSession): boolean {
  if (hasGlobalGameAccess(session)) return true
  return Object.keys(session.games ?? {}).length > 0
}

/**
 * Filters a game registry to what the caller may open. Takes the registry rather
 * than reading keys off the session, because admins and global games editors
 * hold no per-game entries — an empty `session.games` does not mean "no games".
 */
export function accessibleGames<T extends { key: string }>(
  session: EditorialSession,
  registry: readonly T[]
): T[] {
  return registry.filter((game) => canReadGame(session, game.key))
}

// ── surfaces ─────────────────────────────────────────────────────────────────

/**
 * Whether the caller has anything to do in /editor. Games are excluded on
 * purpose: they have no content documents, so a games-only editor would land on
 * an empty workspace and should be sent to /admin/games instead.
 */
export function hasEditorWorkspaceAccess(session: EditorialSession): boolean {
  if (session.is_admin) return true
  return CONTENT_MODULE_KEYS.some((key) => session.modules[key] !== undefined)
}
