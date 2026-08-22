/**
 * Locates the ws-backend checkout that the seed generators write into.
 *
 * The two generators used to hardcode `../../../../ws-backend/db/seeds`. That
 * assumes the sibling clone is named `ws-backend`, and it fails badly when it is
 * not: the path does not exist, `mkdirSync(..., { recursive: true })` cheerfully
 * creates it, and the run reports success having written seven files into a
 * directory no repo tracks. A wrong path should be loud, not invisible.
 *
 * Resolution order: WS_BACKEND_DIR if set, then the sibling names actually seen
 * in the wild. Anything found must already contain db/seeds, so a stray empty
 * directory cannot win.
 */
import { existsSync } from 'node:fs'
import path from 'node:path'

/** Sibling clone names for ws-backend. `ws-backend` is the documented one. */
const CANDIDATE_DIRS = ['ws-backend', 'backend']

/** Absolute path to the backend's db/seeds, or a thrown error explaining why not. */
export function backendSeedsDir(fromDir: string): string {
  // apps/web/scripts -> apps/web -> apps -> org -> the directory holding both repos.
  const siblingRoot = path.resolve(fromDir, '../../../..')

  const override = process.env.WS_BACKEND_DIR
  if (override) {
    const seeds = path.resolve(override, 'db/seeds')
    if (!existsSync(seeds)) {
      throw new Error(
        `WS_BACKEND_DIR is set to ${override}, but ${seeds} does not exist.`,
      )
    }
    return seeds
  }

  for (const name of CANDIDATE_DIRS) {
    const seeds = path.join(siblingRoot, name, 'db', 'seeds')
    if (existsSync(seeds)) return seeds
  }

  throw new Error(
    [
      'Could not find the ws-backend checkout to write seeds into.',
      `Looked for ${CANDIDATE_DIRS.map((n) => `${n}/db/seeds`).join(' and ')} under ${siblingRoot}.`,
      'Clone it beside this repo, or point WS_BACKEND_DIR at it:',
      '  WS_BACKEND_DIR=../../path/to/ws-backend pnpm site:seed-pages',
    ].join('\n'),
  )
}
