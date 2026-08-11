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

const MESSAGES_DIR = path.resolve(__dirname, '../../../packages/shared/messages')
const OUT_DIR = path.resolve(__dirname, '../../../../ws-backend/db/seeds')

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
    writeFileSync(file, `${JSON.stringify(rows, null, 2)}\n`, 'utf8')

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
