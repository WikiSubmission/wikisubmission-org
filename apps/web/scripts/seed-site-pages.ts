/**
 * Generates the page-level site catalogue seed from the route manifest.
 *
 * One row per (indexable route × locale), carrying the page's title and
 * description resolved from that locale's message catalog. No crawl and no
 * network: this is the tier that makes `/site/search` useful before the body
 * extractor exists, and it stays the source of the page-level rows afterwards —
 * `extract-site-text.ts` adds section rows with real bodies on top.
 *
 * Chapter and appendix rows are deliberately absent: the backend derives those
 * in SQL from chapter_text and appendices, where the titles already live per
 * language (see db/site.go RebuildDerivedSiteDocuments).
 *
 * Usage, from apps/web:
 *   pnpm site:seed-pages
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import {
  SITE_ROUTES,
  routeHref,
  type Label,
  type SiteRoute,
} from '../../../packages/shared/lib/site-routes'
import { UI_LOCALES } from '../../../packages/shared/constants/ui-locales'
import { backendSeedsDir } from './lib/backend-repo'

const MESSAGES_DIR = path.resolve(__dirname, '../../../packages/shared/messages')
const OUT_DIR = backendSeedsDir(__dirname)

/** Row shape consumed by db.SeedSiteDocuments. */
interface SeedRow {
  route: string
  anchor: string | null
  kind: string
  section_index: number
  title: string
  heading: string | null
  description: string | null
  body: string
  priority: number
}

type Catalog = Record<string, unknown>

function loadCatalog(locale: string): Catalog {
  return JSON.parse(readFileSync(path.join(MESSAGES_DIR, `${locale}.json`), 'utf8')) as Catalog
}

/** Resolves a dotted key, returning undefined rather than throwing. */
function lookup(catalog: Catalog, dottedKey: string): string | undefined {
  let node: unknown = catalog
  for (const part of dottedKey.split('.')) {
    if (typeof node !== 'object' || node === null) return undefined
    node = (node as Record<string, unknown>)[part]
  }
  return typeof node === 'string' ? node : undefined
}

/**
 * Resolves a label in one locale, falling back to English then the key.
 *
 * The fallback mirrors what the app does at runtime: `mergeMessages` layers each
 * catalog over English, so a partially translated locale (kmr) renders English
 * for untranslated keys. Indexing the same text keeps search consistent with
 * what is on screen.
 */
function resolveLabel(
  label: Label,
  catalog: Catalog,
  english: Catalog,
): { value: string; translated: boolean } {
  if ('literal' in label) return { value: label.literal, translated: false }
  const localized = lookup(catalog, label.key)
  if (localized !== undefined) return { value: localized, translated: true }
  const fallback = lookup(english, label.key)
  return { value: fallback ?? label.key, translated: false }
}

function rowFor(route: SiteRoute, catalog: Catalog, english: Catalog): SeedRow | null {
  const href = routeHref(route)
  if (href === null) return null

  const title = resolveLabel(route.title, catalog, english).value
  const description = route.description
    ? resolveLabel(route.description, catalog, english).value
    : null

  return {
    route: href,
    anchor: null,
    kind: route.kind === 'reader' || route.kind === 'tool' ? 'page' : route.kind,
    section_index: 0,
    title,
    heading: null,
    description,
    // Page-level rows carry no body; the extractor fills that in later. The
    // title and description are already indexed in bands A and B.
    body: '',
    priority: route.priority,
  }
}

/**
 * Folds newly generated page rows into whatever the file already holds, keeping
 * the section rows this script does not produce.
 *
 * Without this, running the script after `site:index` silently regresses a
 * locale: it rewrote site_docs_en.json as 23 page rows and dropped the 109
 * extracted body sections, leaving `/site/search` with titles and no text until
 * someone remembered to re-crawl. Preserving them makes the script safe to run at
 * any point, which matters because check-site-routes.ts tells people to run it
 * the moment they add a route.
 *
 * A section whose route no longer has a page row is dropped: the route left the
 * manifest or stopped being indexable, so its body has nowhere to point.
 */
function merge(pageRows: SeedRow[], file: string): SeedRow[] {
  let existing: SeedRow[]
  try {
    existing = JSON.parse(readFileSync(file, 'utf8')) as SeedRow[]
  } catch {
    return pageRows // first run for this locale
  }

  const sectionsByRoute = new Map<string, SeedRow[]>()
  const pageBodyByRoute = new Map<string, string>()
  for (const row of existing) {
    if (row.section_index === 0) {
      // Title, description and priority are regenerated from the manifest, but
      // the body is the crawler's to own — rowFor() always writes '' for a page
      // row. Blanking it here would strip the page-level text off 22 routes.
      if (row.body) pageBodyByRoute.set(row.route, row.body)
      continue
    }
    const list = sectionsByRoute.get(row.route)
    if (list) list.push(row)
    else sectionsByRoute.set(row.route, [row])
  }

  const merged: SeedRow[] = []
  for (const page of pageRows) {
    const body = page.body || pageBodyByRoute.get(page.route) || ''
    merged.push({ ...page, body })
    const sections = sectionsByRoute.get(page.route)
    if (!sections) continue
    sections.sort((a, b) => a.section_index - b.section_index)
    merged.push(...sections)
    sectionsByRoute.delete(page.route)
  }

  for (const [route, sections] of sectionsByRoute) {
    console.warn(
      `  dropped ${sections.length} section row(s) for ${route}: no longer an indexable page`,
    )
  }

  return merged
}

function main() {
  const english = loadCatalog('en')
  const indexable = SITE_ROUTES.filter((route) => route.indexable && !route.expand)

  mkdirSync(OUT_DIR, { recursive: true })

  const summary: string[] = []
  for (const locale of UI_LOCALES) {
    const catalog = locale.code === 'en' ? english : loadCatalog(locale.code)
    const rows = indexable
      .map((route) => rowFor(route, catalog, english))
      .filter((row): row is SeedRow => row !== null)

    if (rows.length === 0) throw new Error(`no rows generated for ${locale.code}`)

    const file = path.join(OUT_DIR, `site_docs_${locale.code}.json`)
    writeFileSync(file, `${JSON.stringify(merge(rows, file), null, 2)}\n`, 'utf8')

    // Reports how much of each locale is genuinely translated, so a locale that
    // is really just English is visible rather than silently indexed as itself.
    const translated = indexable.filter(
      (route) => 'key' in route.title && lookup(catalog, route.title.key) !== undefined,
    ).length
    summary.push(
      `${locale.code}: ${rows.length} rows, ${translated}/${indexable.length} titles translated`,
    )
  }

  console.log(summary.join('\n'))
  console.log(`\nWrote ${UI_LOCALES.length} seed files to ${OUT_DIR}`)
}

main()
