/**
 * Build-time guard: every page on disk is accounted for in the route manifest.
 *
 * Runs as `prebuild`, so a page that nobody registered fails the build rather
 * than shipping invisible. An unregistered route is absent from the sitemap,
 * llms.txt, the command menu and the `/site/search` catalogue — none of which
 * breaks a page, which is exactly why it goes unnoticed. /quran/index shipped
 * that way.
 *
 * A STATIC route must have an exact row in SITE_ROUTES or an explicit entry in
 * NOT_INDEXED. Pattern matching is deliberately not enough for one: under
 * `app/quran/` both the reader's catch-all (`/quran/:query*`) and the synthetic
 * chapter expansion (`/quran/:chapter`) match the literal path `/quran/index`,
 * so the manifest looked complete while the page was missing from every
 * generated artefact. A dynamic route still resolves by pattern, since its
 * concrete URLs come from data.
 *
 * Usage, from apps/web:
 *   pnpm check:routes
 */
import { readdirSync } from 'node:fs'
import path from 'node:path'
import {
  SITE_ROUTES,
  isExcluded,
  matchesPattern,
  routePatternFromDir,
} from '../../../packages/shared/lib/site-routes'

const APP_DIR = path.resolve(__dirname, '../app')

function diskRoutes(): string[] {
  const found = new Set<string>()
  const walk = (dir: string) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name)
      if (entry.isDirectory()) walk(full)
      else if (entry.name === 'page.tsx') {
        found.add(routePatternFromDir(path.relative(APP_DIR, dir)))
      }
    }
  }
  walk(APP_DIR)
  return [...found].sort()
}

/** A route with no `:param` segment addresses exactly one URL. */
export function isStaticRoute(route: string): boolean {
  return !route.includes(':')
}

/** True when the manifest accounts for `route` as a page or as an exclusion. */
export function isCovered(route: string): boolean {
  if (isExcluded(route)) return true
  if (SITE_ROUTES.some((r) => r.route === route)) return true
  if (isStaticRoute(route)) return false
  return SITE_ROUTES.some((r) => matchesPattern(r.route, route))
}

function main() {
  const missing = diskRoutes().filter((route) => !isCovered(route))

  if (missing.length === 0) {
    console.log(`site-routes: ${diskRoutes().length} routes on disk, all accounted for.`)
    return
  }

  console.error(
    `\nsite-routes: ${missing.length} page(s) on disk are missing from the route manifest:\n`,
  )
  for (const route of missing) console.error(`  ${route}`)
  console.error(
    [
      '',
      'Add each one to SITE_ROUTES in packages/shared/lib/site-routes.ts, or to',
      'NOT_INDEXED in the same file if it should stay out of the sitemap, llms.txt,',
      'the command menu and the /site/search catalogue.',
      '',
      'After adding an indexable route, regenerate the search catalogue:',
      '  pnpm site:seed-pages     # writes db/seeds/site_docs_<lang>.json in ws-backend',
      '  just seed-site           # from ws-backend, loads it into that environment',
      '',
    ].join('\n'),
  )
  process.exit(1)
}

main()
