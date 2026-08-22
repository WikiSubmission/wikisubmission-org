/**
 * Extracts the site's own page bodies into the search catalogue seeds, by
 * crawling the rendered site.
 *
 * Why crawl rather than render components the way `extract-library-text.tsx`
 * does: that script works because library content is pure JSX with no data
 * fetching, no intl, and no client islands. Site pages are none of those — they
 * call `useTranslations`, import client islands, and several are shells over a
 * component fed by the API. Stubbing all of that means one stub per island, a
 * fake intl provider, and fake API responses; it fails silently when a stub
 * renders nothing, and it can only ever produce English.
 *
 * Fetching each route with a `locale` cookie gets every locale through one
 * mechanism, covers i18n copy, hardcoded JSX, fs-read markdown and SSR'd backend
 * content alike, and cannot drift from what users see, because it is what users
 * see.
 *
 * Chapter and appendix rows are deliberately absent: the backend derives those in
 * SQL from chapter_text and appendices, where the titles already live per
 * language (db/site.go RebuildDerivedSiteDocuments).
 *
 * Usage, from apps/web:
 *   pnpm site:index                                   # against localhost:3000
 *   pnpm site:index --base=https://wikisubmission.org # against production
 *   pnpm site:index --strict                          # fail on untranslated locales
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
import { extractMain, splitSections, stripSkipped } from './lib/html-sections'
import { backendSeedsDir } from './lib/backend-repo'

const MESSAGES_DIR = path.resolve(__dirname, '../../../packages/shared/messages')
const OUT_DIR = backendSeedsDir(__dirname)

/** A route declaring `ssr` must yield at least this much text, or it is broken. */
const MIN_SSR_CHARS = 200

/** Below this share of English's length, a locale is really rendering English. */
const TRANSLATION_FLOOR = 0.6

/** Refuse a total swing larger than this without an explicit override. */
const MAX_DRIFT = 0.25

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

interface Args {
  base: string
  langs: string[]
  concurrency: number
  strict: boolean
  acceptDrift: boolean
}

function parseArgs(argv: string[]): Args {
  const get = (name: string) =>
    argv.find((a) => a.startsWith(`--${name}=`))?.split('=').slice(1).join('=')
  return {
    base: (get('base') ?? 'http://localhost:3000').replace(/\/$/, ''),
    // Split on commas or whitespace: pnpm rewrites commas in a forwarded
    // argument to spaces on Windows, so `--langs=en,ar` can arrive as `en ar`.
    langs: (get('langs') ?? UI_LOCALES.map((l) => l.code).join(','))
      .split(/[,\s]+/)
      .filter(Boolean),
    concurrency: Number(get('concurrency') ?? 4),
    strict: argv.includes('--strict'),
    acceptDrift: argv.includes('--accept-drift'),
  }
}

type Catalog = Record<string, unknown>

function lookup(catalog: Catalog, dottedKey: string): string | undefined {
  let node: unknown = catalog
  for (const part of dottedKey.split('.')) {
    if (typeof node !== 'object' || node === null) return undefined
    node = (node as Record<string, unknown>)[part]
  }
  return typeof node === 'string' ? node : undefined
}

function resolveLabel(label: Label, catalog: Catalog, english: Catalog): string {
  if ('literal' in label) return label.literal
  return lookup(catalog, label.key) ?? lookup(english, label.key) ?? label.key
}

/** Kinds in the manifest that the catalogue does not model separately. */
function seedKind(route: SiteRoute): string {
  return route.kind === 'reader' || route.kind === 'tool' ? 'page' : route.kind
}

interface Fetched {
  route: SiteRoute
  href: string
  lang: string
  sections: { heading: string | null; anchor: string | null; body: string }[]
  chars: number
  status: number
}

async function fetchRoute(base: string, route: SiteRoute, href: string, lang: string): Promise<Fetched> {
  const response = await fetch(`${base}${href}`, {
    headers: { Cookie: `locale=${lang}`, 'Accept-Language': lang },
    redirect: 'manual',
  })

  if (response.status !== 200) {
    return { route, href, lang, sections: [], chars: 0, status: response.status }
  }

  const html = await response.text()
  // The site layout wraps every page in exactly one <main>, with the nav and
  // footer outside it, so slicing that is what separates page content from chrome.
  const main = extractMain(html)
  if (main === null) {
    return { route, href, lang, sections: [], chars: 0, status: -1 }
  }

  const sections = splitSections(stripSkipped(main)).map(({ heading, anchor, body }) => ({
    heading,
    anchor,
    body,
  }))
  const chars = sections.reduce((n, s) => n + s.body.length, 0)
  return { route, href, lang, sections, chars, status: 200 }
}

/** Runs `worker` over `items` with a bounded number in flight. */
async function mapLimit<T, R>(
  items: T[],
  limit: number,
  worker: (item: T) => Promise<R>,
): Promise<R[]> {
  const results: R[] = new Array(items.length)
  let next = 0
  const runners = Array.from({ length: Math.max(1, Math.min(limit, items.length)) }, async () => {
    for (;;) {
      const index = next++
      if (index >= items.length) return
      results[index] = await worker(items[index]!)
    }
  })
  await Promise.all(runners)
  return results
}

async function main() {
  const args = parseArgs(process.argv.slice(2))
  const english = JSON.parse(readFileSync(path.join(MESSAGES_DIR, 'en.json'), 'utf8')) as Catalog

  // Auth-gated routes redirect to sign-in for an anonymous crawler, so their
  // body would be the sign-in page. They keep their manifest title and
  // description via seed-site-pages.ts; only the body is unavailable.
  const authGated = SITE_ROUTES.filter(
    (route) => route.indexable && !route.expand && route.requiresAuth,
  )
  const indexable = SITE_ROUTES.filter(
    (route) =>
      route.indexable && !route.expand && route.bodySource !== 'none' && !route.requiresAuth,
  )

  const jobs: { route: SiteRoute; href: string; lang: string }[] = []
  for (const lang of args.langs) {
    for (const route of indexable) {
      const href = routeHref(route)
      if (href !== null) jobs.push({ route, href, lang })
    }
  }

  console.log(
    `crawling ${indexable.length} routes x ${args.langs.length} locales ` +
      `(${jobs.length} requests, concurrency ${args.concurrency}) from ${args.base}`,
  )

  const fetched = await mapLimit(jobs, args.concurrency, (job) =>
    fetchRoute(args.base, job.route, job.href, job.lang),
  )

  // ── Failures ──────────────────────────────────────────────────────────────
  const errors: string[] = []
  const warnings: string[] = []

  for (const result of fetched) {
    if (result.status === -1) {
      errors.push(`${result.href} [${result.lang}]: no <main> element in the response`)
    } else if (result.status !== 200) {
      errors.push(`${result.href} [${result.lang}]: HTTP ${result.status}`)
    } else if (result.route.bodySource === 'ssr' && result.chars < MIN_SSR_CHARS) {
      // The silent failure the stub approach guarantees: a page that turned into
      // a client-only shell still returns 200, and the extractor would happily
      // index nothing at all.
      errors.push(
        `${result.href} [${result.lang}]: only ${result.chars} chars, expected at least ` +
          `${MIN_SSR_CHARS} for bodySource 'ssr' (client-only shell?)`,
      )
    }
  }

  // ── Translation coverage ──────────────────────────────────────────────────
  const englishChars = new Map<string, number>()
  for (const result of fetched) {
    if (result.lang === 'en') englishChars.set(result.href, result.chars)
  }
  for (const result of fetched) {
    if (result.lang === 'en') continue
    const baseline = englishChars.get(result.href) ?? 0
    if (baseline < MIN_SSR_CHARS) continue
    if (result.chars < baseline * TRANSLATION_FLOOR) {
      warnings.push(
        `${result.href} [${result.lang}]: ${result.chars} chars vs ${baseline} in en ` +
          `(likely rendering English)`,
      )
    }
  }

  // ── Rows ──────────────────────────────────────────────────────────────────
  const perLocale = new Map<string, SeedRow[]>()
  for (const result of fetched) {
    if (result.status !== 200) continue
    const catalog =
      result.lang === 'en'
        ? english
        : (JSON.parse(readFileSync(path.join(MESSAGES_DIR, `${result.lang}.json`), 'utf8')) as Catalog)

    const title = resolveLabel(result.route.title, catalog, english)
    const description = result.route.description
      ? resolveLabel(result.route.description, catalog, english)
      : null
    const rows = perLocale.get(result.lang) ?? []

    // Section 0 is the page's lead copy, and becomes the page-level row so a
    // route always has one even when it has no headings.
    const [lead, ...rest] = result.sections
    rows.push({
      route: result.href,
      anchor: null,
      kind: seedKind(result.route),
      section_index: 0,
      title,
      heading: null,
      description,
      body: lead?.body ?? '',
      priority: result.route.priority,
    })

    let index = 1
    for (const section of rest) {
      rows.push({
        route: result.href,
        anchor: section.anchor,
        kind: 'section',
        section_index: index++,
        title,
        heading: section.heading,
        description: null,
        body: section.body,
        priority: result.route.priority,
      })
    }

    perLocale.set(result.lang, rows)
  }

  // ── Drift ─────────────────────────────────────────────────────────────────
  let previousChars = 0
  for (const lang of args.langs) {
    const file = path.join(OUT_DIR, `site_docs_${lang}.json`)
    try {
      const existing = JSON.parse(readFileSync(file, 'utf8')) as SeedRow[]
      previousChars += existing.reduce((n, r) => n + r.body.length, 0)
    } catch {
      // No previous seed; nothing to compare against.
    }
  }
  const totalChars = [...perLocale.values()].reduce(
    (n, rows) => n + rows.reduce((m, r) => m + r.body.length, 0),
    0,
  )
  if (previousChars > 0) {
    const drift = Math.abs(totalChars - previousChars) / previousChars
    if (drift > MAX_DRIFT && !args.acceptDrift) {
      errors.push(
        `total body length moved ${(drift * 100).toFixed(0)}% ` +
          `(${previousChars} to ${totalChars}); pass --accept-drift if intended`,
      )
    }
  }

  // ── Report ────────────────────────────────────────────────────────────────
  console.log('')
  for (const lang of args.langs) {
    const rows = perLocale.get(lang) ?? []
    const chars = rows.reduce((n, r) => n + r.body.length, 0)
    const anchored = rows.filter((r) => r.anchor).length
    console.log(
      `  ${lang}: ${rows.length} rows (${anchored} anchored), ${(chars / 1000).toFixed(1)}k chars`,
    )
  }

  if (authGated.length > 0) {
    console.log(
      `\n  ${authGated.length} auth-gated route(s) skipped (title and description only): ` +
        authGated.map((r) => routeHref(r) ?? r.route).join(', '),
    )
  }

  if (warnings.length > 0) {
    console.log(`\n  ${warnings.length} warning(s):`)
    for (const warning of warnings.slice(0, 20)) console.log(`    ${warning}`)
    if (args.strict) errors.push(`${warnings.length} translation warning(s) under --strict`)
  }

  if (errors.length > 0) {
    console.error(`\n${errors.length} error(s):`)
    for (const error of errors.slice(0, 30)) console.error(`  ${error}`)
    process.exit(1)
  }

  mkdirSync(OUT_DIR, { recursive: true })
  for (const [lang, rows] of perLocale) {
    writeFileSync(
      path.join(OUT_DIR, `site_docs_${lang}.json`),
      `${JSON.stringify(rows, null, 2)}\n`,
      'utf8',
    )
  }
  console.log(`\nwrote ${perLocale.size} seed files to ${OUT_DIR}`)
}

void main().catch((error) => {
  console.error(error)
  process.exit(1)
})
