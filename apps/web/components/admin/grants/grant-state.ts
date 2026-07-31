/**
 * Maps between the access console's local editing state and the backend's
 * EditorGrantsInput wire format. Extracted from the former /editor/admin editor.
 *
 * Wire convention on the way out: a module key is *present* to grant read and
 * mapped to `true` to grant write, so 'none' means omit the key entirely. Same
 * for per-version and per-game grants, which are arrays of rows rather than maps.
 */
import type {
  EditorGameGrant,
  EditorGrantsInput,
  EditorialEditor,
  EditorVersionGrant,
} from '@/lib/editorial-content-client'
import { GAME_MODULE_KEY } from '@/lib/editorial-access'
import type { GrantLevel } from './grant-controls'

/** Content modules, in the order the console lists them. */
export const CONTENT_MODULES: Array<{ key: string; label: string }> = [
  { key: 'quran', label: 'Quran' },
  { key: 'bible', label: 'Bible' },
  { key: 'article', label: 'Articles' },
  { key: 'community', label: 'Communities' },
  { key: 'author', label: 'Authors' },
  { key: 'category', label: 'Categories' },
  { key: 'appendix', label: 'Appendices' },
]

export interface GrantState {
  /** Content modules only; games live in `allGames`. */
  modules: Record<string, GrantLevel>
  quran: Record<number, { access: GrantLevel; approve: boolean }>
  bible: Record<number, GrantLevel>
  /** The global games tier — the `game` module grant. Covers every game. */
  allGames: GrantLevel
  /** Per-game grants, keyed by game key. Independent of `allGames`. */
  games: Record<string, GrantLevel>
  reference: number | null
}

function levelFrom(grant: boolean | undefined): GrantLevel {
  if (grant === undefined) return 'none'
  return grant ? 'write' : 'read'
}

export function initialGrantState(editor: EditorialEditor): GrantState {
  const modules: Record<string, GrantLevel> = {}
  for (const { key } of CONTENT_MODULES) {
    modules[key] = levelFrom(editor.modules[key])
  }

  const quran: GrantState['quran'] = {}
  for (const g of editor.quran_versions) {
    quran[g.version_id] = {
      access: g.can_write ? 'write' : 'read',
      approve: g.can_approve ?? false,
    }
  }

  const bible: GrantState['bible'] = {}
  for (const g of editor.bible_versions) {
    bible[g.version_id] = g.can_write ? 'write' : 'read'
  }

  const games: GrantState['games'] = {}
  for (const g of editor.games ?? []) {
    games[g.game_key] = g.can_write ? 'write' : 'read'
  }

  return {
    modules,
    quran,
    bible,
    allGames: levelFrom(editor.modules[GAME_MODULE_KEY]),
    games,
    reference: editor.quran_reference_version_id ?? null,
  }
}

export function grantStateToInput(state: GrantState): EditorGrantsInput {
  const modules: Record<string, boolean> = {}
  for (const [key, access] of Object.entries(state.modules)) {
    if (access !== 'none') modules[key] = access === 'write'
  }
  // The global games tier rides along as a module grant.
  if (state.allGames !== 'none')
    modules[GAME_MODULE_KEY] = state.allGames === 'write'

  // A version row is kept when it grants access OR carries an approve flag —
  // approve is a capability of its own and must survive access === 'none'.
  const quran_versions: EditorVersionGrant[] = Object.entries(state.quran)
    .filter(([, g]) => g.access !== 'none' || g.approve)
    .map(([id, g]) => ({
      version_id: Number(id),
      can_write: g.access === 'write',
      can_approve: g.approve,
    }))

  const bible_versions: EditorVersionGrant[] = Object.entries(state.bible)
    .filter(([, access]) => access !== 'none')
    .map(([id, access]) => ({
      version_id: Number(id),
      can_write: access === 'write',
    }))

  const games: EditorGameGrant[] = Object.entries(state.games)
    .filter(([, access]) => access !== 'none')
    .map(([game_key, access]) => ({ game_key, can_write: access === 'write' }))

  return {
    modules,
    quran_versions,
    bible_versions,
    games,
    quran_reference_version_id: state.reference,
  }
}

/** One-line summary for the collapsed row. */
export function grantSummary(editor: EditorialEditor): string {
  if (editor.role === 'admin') return 'admin — full access'

  const parts: string[] = []
  for (const [key, canWrite] of Object.entries(editor.modules)) {
    if (key === GAME_MODULE_KEY) {
      parts.push(`all games${canWrite ? ' (write)' : ' (read)'}`)
      continue
    }
    parts.push(`${key}${canWrite ? ' (write)' : ' (read)'}`)
  }
  for (const g of editor.games ?? []) {
    parts.push(`${g.game_key}${g.can_write ? ' (write)' : ' (read)'}`)
  }

  return parts.length === 0 ? 'no grants' : parts.join(', ')
}
