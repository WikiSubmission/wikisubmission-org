/**
 * The site's route manifest — one source of truth for every consumer that needs
 * to know what pages exist: the command menu's navigation commands, `sitemap.ts`,
 * `llms.txt`, and the search-catalogue extractor.
 *
 * Deliberately dependency-free (no React, no `next/*`, no API client) so it can
 * be imported from a server component, a client component, a build script, and
 * vitest alike.
 *
 * Route patterns use `:param` for a dynamic segment and `:param*` for a
 * catch-all, mirroring the App Router directory names (`[number]` → `:number`,
 * `[[...query]]` → `:query*`). `routePatternFromDir` performs that conversion so
 * the coverage test can compare the manifest against the filesystem.
 *
 * There is no locale segment anywhere in the site: the UI locale lives in a
 * cookie, so one route has exactly one URL across all locales. Anything indexed
 * per-locale is keyed by (route, lang) downstream, never by a localized path.
 */

export type RouteKind =
  | 'page' // ordinary content page
  | 'practice' // the /practices family
  | 'legal' // privacy, terms
  | 'library' // introduction, proclamation, appendices
  | 'reader' // Quran and Bible readers
  | 'tool' // word lab, games, chat
  | 'account' // signed-in surfaces

export type NavGroup = 'scripture' | 'explore' | 'organization'

/** Marks routes whose concrete URLs are generated from data, not from the manifest. */
export type ExpandKind = 'quranChapters' | 'appendices' | 'blogSlugs'

/** A translated label: either a dotted message key, or a literal for copy that has no catalog entry yet. */
export type Label = { key: string } | { literal: string }

export interface SiteRoute {
  /** Path with no origin and no locale segment. Dynamic segments use `:param` / `:param*`. */
  route: string
  title: Label
  /** One-line summary. Feeds the menu subtitle, llms.txt, and the catalogue's description column. */
  description?: Label
  kind: RouteKind
  /** Grouping for the nav and the command menu. Absent means searchable but not a nav destination. */
  navGroup?: NavGroup
  navOrder?: number
  /** The route this nests under in the nav tree. */
  navParent?: string
  requiresAuth?: boolean
  /** false keeps the route out of the sitemap, llms.txt, and the search catalogue. */
  indexable: boolean
  /** What the extractor should expect to find. `none` means title and description only. */
  bodySource: 'ssr' | 'metadata' | 'backend' | 'none'
  /** Editorial weight, 0..100. Drives sitemap priority and catalogue ranking. */
  priority: number
  changeFrequency?: 'daily' | 'weekly' | 'monthly' | 'yearly'
  /** Set on a dynamic route whose concrete URLs come from data. */
  expand?: ExpandKind
  /**
   * false for rows that carry no `page.tsx` of their own, i.e. URL families
   * served by a catch-all route. Only the manifest-to-filesystem half of the
   * coverage test reads this; defaults to true.
   */
  hasDiskRoute?: false
}

/**
 * Routes that exist on disk but must never be indexed, listed explicitly so the
 * coverage test can tell "deliberately excluded" from "someone forgot".
 * `:path*` matches the segment and everything below it.
 */
export const NOT_INDEXED: readonly string[] = [
  '/admin/:path*',
  '/editor/:path*',
  '/auth/:path*',
  '/me/:path*',
  '/collections/:shareToken',
  '/share/:path*',
  '/donate/manage',
  '/offline',
  '/offline-check',
  '/quran/games/fill-blank/:path*',
  '/quran/games/leaderboard',
  // Per-root Word Lab pages: 1,500+ URLs of generated concordance data, not
  // content worth indexing individually. The /quran/words landing page is.
  '/quran/words/:letters',
]

export const SITE_ROUTES: readonly SiteRoute[] = [
  {
    route: '/',
    title: { key: 'navbar.home' },
    description: { literal: 'Free and open-source tools for the Quran, the Bible, and religious education.' },
    kind: 'page',
    indexable: true,
    bodySource: 'ssr',
    priority: 100,
    changeFrequency: 'weekly',
  },

  // ── Scripture ──────────────────────────────────────────────────────────────
  {
    route: '/quran/:query*',
    title: { key: 'nav.quran' },
    description: { key: 'navbar.quranSub' },
    kind: 'reader',
    navGroup: 'scripture',
    navOrder: 1,
    indexable: true,
    bodySource: 'metadata',
    priority: 90,
    changeFrequency: 'weekly',
  },
  {
    // Synthetic: the reader is one catch-all on disk (`/quran/[[...query]]`),
    // but the 114 chapter URLs need their own sitemap and catalogue rows. This
    // row exists only to carry `expand`, so `hasDiskRoute` is false.
    route: '/quran/:chapter',
    title: { literal: 'Quran chapters' },
    kind: 'reader',
    indexable: true,
    bodySource: 'backend',
    priority: 45,
    changeFrequency: 'monthly',
    expand: 'quranChapters',
    hasDiskRoute: false,
  },
  {
    route: '/quran/words',
    title: { key: 'navbar.wordLab' },
    description: { key: 'navbar.wordLabSub' },
    kind: 'tool',
    navGroup: 'scripture',
    navOrder: 2,
    navParent: '/quran/:query*',
    indexable: true,
    bodySource: 'metadata',
    priority: 60,
    changeFrequency: 'monthly',
  },
  {
    route: '/quran/games',
    title: { key: 'navbar.games' },
    description: { key: 'navbar.gamesSub' },
    kind: 'tool',
    navGroup: 'scripture',
    navOrder: 3,
    navParent: '/quran/:query*',
    requiresAuth: true,
    indexable: true,
    bodySource: 'metadata',
    priority: 50,
    changeFrequency: 'monthly',
  },
  {
    route: '/bible/:query*',
    title: { key: 'navbar.bible' },
    description: { key: 'navbar.bibleSub' },
    kind: 'reader',
    navGroup: 'scripture',
    navOrder: 4,
    indexable: true,
    bodySource: 'metadata',
    priority: 70,
    changeFrequency: 'weekly',
  },
  {
    route: '/introduction',
    title: { key: 'nav.introduction' },
    description: { literal: 'Introduction to Submission and the Final Testament.' },
    kind: 'library',
    navGroup: 'scripture',
    navOrder: 5,
    indexable: true,
    bodySource: 'ssr',
    priority: 70,
    changeFrequency: 'monthly',
  },
  {
    route: '/proclamation',
    title: { key: 'nav.proclamation' },
    kind: 'library',
    navGroup: 'scripture',
    navOrder: 6,
    indexable: true,
    bodySource: 'ssr',
    priority: 60,
    changeFrequency: 'monthly',
  },
  {
    route: '/appendices/:number',
    title: { literal: 'Appendices' },
    description: { literal: 'The 38 appendices of Quran: The Final Testament.' },
    kind: 'library',
    navGroup: 'scripture',
    navOrder: 7,
    indexable: true,
    bodySource: 'backend',
    priority: 55,
    changeFrequency: 'monthly',
    expand: 'appendices',
  },
  {
    route: '/miracle',
    title: { key: 'navbar.miracle' },
    description: { key: 'footer.linkMiracle' },
    kind: 'page',
    navGroup: 'scripture',
    navOrder: 8,
    indexable: true,
    bodySource: 'ssr',
    priority: 70,
    changeFrequency: 'monthly',
  },

  // ── Explore ────────────────────────────────────────────────────────────────
  {
    route: '/practices',
    title: { key: 'navbar.practices' },
    description: { literal: 'Religious practices and guidance.' },
    kind: 'practice',
    navGroup: 'explore',
    navOrder: 1,
    indexable: true,
    bodySource: 'ssr',
    priority: 80,
    changeFrequency: 'weekly',
  },
  {
    route: '/practices/contact-prayers',
    title: { key: 'navbar.contactPrayers' },
    description: { literal: 'Five Daily Prayers' },
    kind: 'practice',
    navGroup: 'explore',
    navOrder: 2,
    navParent: '/practices',
    indexable: true,
    bodySource: 'ssr',
    priority: 70,
    changeFrequency: 'monthly',
  },
  {
    route: '/practices/zakat',
    title: { key: 'navbar.zakat' },
    description: { literal: 'Obligatory Charity' },
    kind: 'practice',
    navGroup: 'explore',
    navOrder: 3,
    navParent: '/practices',
    indexable: true,
    bodySource: 'ssr',
    priority: 65,
    changeFrequency: 'monthly',
  },
  {
    route: '/practices/ramadan',
    title: { key: 'navbar.ramadan' },
    description: { literal: 'Fasting Schedule' },
    kind: 'practice',
    navGroup: 'explore',
    navOrder: 4,
    navParent: '/practices',
    indexable: true,
    bodySource: 'ssr',
    priority: 65,
    changeFrequency: 'monthly',
  },
  {
    route: '/practices/hajj',
    title: { key: 'navbar.hajj' },
    description: { literal: 'Pilgrimage to Mecca' },
    kind: 'practice',
    navGroup: 'explore',
    navOrder: 5,
    navParent: '/practices',
    indexable: true,
    bodySource: 'ssr',
    priority: 60,
    changeFrequency: 'monthly',
  },
  {
    route: '/archive',
    title: { key: 'navbar.archive' },
    description: { literal: 'Media archive and newsletters.' },
    kind: 'page',
    navGroup: 'explore',
    navOrder: 6,
    indexable: true,
    bodySource: 'metadata',
    priority: 50,
    changeFrequency: 'weekly',
  },
  {
    route: '/music',
    title: { key: 'navbar.music' },
    description: { literal: 'Devotional audio and recitations.' },
    kind: 'page',
    navGroup: 'explore',
    navOrder: 7,
    indexable: true,
    bodySource: 'metadata',
    priority: 80,
    changeFrequency: 'weekly',
  },
  {
    route: '/blog',
    title: { key: 'navbar.blog' },
    description: { literal: 'Articles, reflections, and research.' },
    kind: 'page',
    navGroup: 'explore',
    navOrder: 8,
    indexable: true,
    bodySource: 'backend',
    priority: 80,
    changeFrequency: 'weekly',
  },
  {
    route: '/blog/:slug',
    title: { literal: 'Blog articles' },
    kind: 'page',
    indexable: true,
    bodySource: 'backend',
    priority: 60,
    changeFrequency: 'monthly',
    expand: 'blogSlugs',
  },
  {
    route: '/chat',
    title: { key: 'navbar.chat' },
    description: { key: 'navbar.submissionAI' },
    kind: 'tool',
    navGroup: 'explore',
    navOrder: 9,
    indexable: true,
    bodySource: 'metadata',
    priority: 50,
    changeFrequency: 'monthly',
  },
  {
    route: '/downloads',
    title: { key: 'nav.downloads' },
    description: { literal: 'Free downloadable resources.' },
    kind: 'page',
    navGroup: 'explore',
    navOrder: 10,
    indexable: true,
    bodySource: 'ssr',
    priority: 70,
    changeFrequency: 'monthly',
  },

  // ── Organization ───────────────────────────────────────────────────────────
  {
    route: '/community',
    title: { key: 'navbar.community' },
    description: { literal: 'Communities and study groups around the world.' },
    kind: 'page',
    navGroup: 'organization',
    navOrder: 1,
    indexable: true,
    bodySource: 'backend',
    priority: 55,
    changeFrequency: 'weekly',
  },
  {
    route: '/contact',
    title: { key: 'nav.contact' },
    kind: 'page',
    navGroup: 'organization',
    navOrder: 2,
    indexable: true,
    bodySource: 'ssr',
    priority: 60,
    changeFrequency: 'monthly',
  },
  {
    route: '/donate',
    title: { key: 'nav.donate' },
    description: { literal: 'Support the mission.' },
    kind: 'page',
    navGroup: 'organization',
    navOrder: 3,
    indexable: true,
    bodySource: 'ssr',
    priority: 60,
    changeFrequency: 'monthly',
  },
  {
    route: '/brand',
    title: { key: 'footer.linkBrand' },
    description: { literal: 'Brand guidelines, logos, and typography.' },
    kind: 'page',
    navGroup: 'organization',
    navOrder: 4,
    indexable: true,
    bodySource: 'ssr',
    priority: 30,
    changeFrequency: 'yearly',
  },
  {
    route: '/legal/privacy-policy',
    title: { key: 'footer.linkPrivacy' },
    kind: 'legal',
    navGroup: 'organization',
    navOrder: 5,
    indexable: true,
    bodySource: 'ssr',
    priority: 30,
    changeFrequency: 'yearly',
  },
  {
    route: '/legal/terms-of-use',
    title: { key: 'footer.linkTerms' },
    kind: 'legal',
    navGroup: 'organization',
    navOrder: 6,
    indexable: true,
    bodySource: 'ssr',
    priority: 30,
    changeFrequency: 'yearly',
  },
]

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Translate function shape. `useTranslations()` / `getTranslations()` with no
 *  namespace both satisfy this, which is why keys here are fully dotted. */
export type TranslateFn = (key: string) => string

export function resolveLabel(label: Label, t: TranslateFn): string {
  return 'literal' in label ? label.literal : t(label.key)
}

export function routeTitle(route: SiteRoute, t: TranslateFn): string {
  return resolveLabel(route.title, t)
}

export function routeDescription(route: SiteRoute, t: TranslateFn): string | undefined {
  return route.description ? resolveLabel(route.description, t) : undefined
}

export function indexableRoutes(): SiteRoute[] {
  return SITE_ROUTES.filter((r) => r.indexable)
}

/** Routes that render as a concrete URL, i.e. everything except the dynamic
 *  patterns whose URLs are generated from data. */
export function staticRoutes(): SiteRoute[] {
  return SITE_ROUTES.filter((r) => !r.expand && !r.route.includes(':'))
}

/** Nav destinations in display order, honouring `requiresAuth`. */
export function navRoutes(group: NavGroup, isAuthed: boolean): SiteRoute[] {
  return SITE_ROUTES.filter(
    (r) => r.navGroup === group && (isAuthed || !r.requiresAuth),
  ).sort((a, b) => (a.navOrder ?? 0) - (b.navOrder ?? 0))
}

/**
 * The URL a route pattern points at when linked directly. A catch-all collapses
 * to its parent (`/quran/:query*` → `/quran`); other dynamic patterns have no
 * single URL and return null.
 */
export function routeHref(route: SiteRoute): string | null {
  if (route.route.endsWith('/:query*')) return route.route.slice(0, -'/:query*'.length) || '/'
  if (route.route.includes(':')) return null
  return route.route
}

/**
 * Converts an App Router directory path to a manifest route pattern:
 * strips `(group)` segments, `[x]` → `:x`, `[...x]` / `[[...x]]` → `:x*`.
 */
export function routePatternFromDir(dirRelativeToApp: string): string {
  const segments = dirRelativeToApp
    .split(/[\\/]/)
    .filter((s) => s && !(s.startsWith('(') && s.endsWith(')')))
    .map((s) => {
      const inner = s.replace(/^\[+|\]+$/g, '')
      if (s.startsWith('[')) {
        return inner.startsWith('...') ? `:${inner.slice(3)}*` : `:${inner}`
      }
      return s
    })
  return `/${segments.join('/')}`
}

/** True when `pattern` covers `route`. `:path*` matches the segment and below. */
export function matchesPattern(pattern: string, route: string): boolean {
  if (pattern === route) return true
  const p = pattern.split('/')
  const r = route.split('/')
  for (let i = 0; i < p.length; i++) {
    const seg = p[i]
    if (seg?.endsWith('*')) return r.length >= i // catch-all absorbs the rest
    if (i >= r.length) return false
    if (seg?.startsWith(':')) continue // single dynamic segment
    if (seg !== r[i]) return false
  }
  return p.length === r.length
}

/** True when the route is deliberately excluded from indexing. */
export function isExcluded(route: string): boolean {
  return NOT_INDEXED.some((p) => matchesPattern(p, route))
}

// ─── Expansion ───────────────────────────────────────────────────────────────

/** One concrete URL produced by expanding a dynamic route. */
export interface ExpandedRoute {
  route: string
  title: string
  description?: string
  priority: number
  changeFrequency?: SiteRoute['changeFrequency']
  /** ISO date, when the source knows one. */
  lastModified?: string
}

/**
 * Expands the two data families that need no network: chapters and appendices.
 * `blogSlugs` is intentionally absent — it requires a backend fetch, so callers
 * that want blog URLs supply them.
 */
export function expandFromConstants(
  route: SiteRoute,
  data: {
    chapterTitles?: readonly string[]
    verseCounts?: readonly number[]
    appendices?: readonly { number: number; title: string }[]
  },
): ExpandedRoute[] {
  if (route.expand === 'quranChapters') {
    const titles = data.chapterTitles ?? []
    return Array.from({ length: 114 }, (_, i) => ({
      route: `/quran/${i + 1}`,
      title: titles[i] ? `${i + 1}. ${titles[i]}` : `Chapter ${i + 1}`,
      description: data.verseCounts?.[i] ? `${data.verseCounts[i]} verses` : undefined,
      priority: route.priority,
      changeFrequency: route.changeFrequency,
    }))
  }
  if (route.expand === 'appendices') {
    return (data.appendices ?? []).map((a) => ({
      route: `/appendices/${a.number}`,
      title: `Appendix ${a.number}: ${a.title}`,
      priority: route.priority,
      changeFrequency: route.changeFrequency,
    }))
  }
  return []
}
