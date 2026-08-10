import { readFileSync, readdirSync } from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import {
  NOT_INDEXED,
  SITE_ROUTES,
  expandFromConstants,
  isExcluded,
  matchesPattern,
  routeHref,
  routePatternFromDir,
  staticRoutes,
} from '@/lib/site-routes'

const APP_DIR = path.resolve(__dirname, '../app')

/** Every route pattern that has a `page.tsx` on disk. */
function diskRoutes(): string[] {
  const found: string[] = []
  const walk = (dir: string) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name)
      if (entry.isDirectory()) walk(full)
      else if (entry.name === 'page.tsx') {
        found.push(routePatternFromDir(path.relative(APP_DIR, dir)))
      }
    }
  }
  walk(APP_DIR)
  return found.sort()
}

/** Site-relative hrefs referenced in a source file, query and hash stripped. */
function hrefsIn(relativePath: string): string[] {
  const source = readFileSync(path.resolve(__dirname, '..', relativePath), 'utf8')
  const found = new Set<string>()
  for (const match of source.matchAll(/(?:href|url):\s*'([^']+)'/g)) {
    const raw = match[1]
    if (!raw?.startsWith('/')) continue // external links are not ours to cover
    found.add(raw.split(/[?#]/)[0] ?? raw)
  }
  return [...found].sort()
}

/** True when the manifest accounts for `route`, either as a page or as an exclusion. */
function isCovered(route: string): boolean {
  if (isExcluded(route)) return true
  return SITE_ROUTES.some((r) => matchesPattern(r.route, route) || r.route === route)
}

describe('routePatternFromDir', () => {
  it('strips route groups and converts dynamic segments', () => {
    expect(routePatternFromDir('')).toBe('/')
    expect(routePatternFromDir('(site)/contact')).toBe('/contact')
    expect(routePatternFromDir('(site)/appendices/[number]')).toBe('/appendices/:number')
    expect(routePatternFromDir('quran/[[...query]]')).toBe('/quran/:query*')
    expect(routePatternFromDir('quran/words/[letters]')).toBe('/quran/words/:letters')
    expect(routePatternFromDir(path.join('(editor)', 'editor', '[module]', '[docId]'))).toBe(
      '/editor/:module/:docId',
    )
  })
})

describe('matchesPattern', () => {
  it('matches exact and single dynamic segments', () => {
    expect(matchesPattern('/contact', '/contact')).toBe(true)
    expect(matchesPattern('/contact', '/donate')).toBe(false)
    expect(matchesPattern('/appendices/:number', '/appendices/12')).toBe(true)
    expect(matchesPattern('/appendices/:number', '/appendices/12/notes')).toBe(false)
  })

  it('lets a catch-all absorb the remaining segments, including none', () => {
    expect(matchesPattern('/quran/:query*', '/quran')).toBe(true)
    expect(matchesPattern('/quran/:query*', '/quran/2')).toBe(true)
    expect(matchesPattern('/quran/:query*', '/quran/2/deep')).toBe(true)
    expect(matchesPattern('/me/:path*', '/me')).toBe(true)
    expect(matchesPattern('/me/:path*', '/me/settings')).toBe(true)
    expect(matchesPattern('/me/:path*', '/mercy')).toBe(false)
  })
})

describe('route manifest covers the filesystem', () => {
  // The guard that matters: this is how sitemap.ts drifted into omitting eight
  // live routes. A new page must be added to SITE_ROUTES or to NOT_INDEXED.
  it.each(diskRoutes())('%s is in the manifest or explicitly excluded', (route) => {
    expect(isCovered(route)).toBe(true)
  })

  it('indexes the routes the hardcoded sitemap used to omit', () => {
    // These eight were live pages absent from sitemap.ts before the manifest.
    const previouslyMissing = [
      '/community',
      '/brand',
      '/chat',
      '/bible/:query*',
      '/quran/words',
      '/quran/games',
      '/practices/contact-prayers',
      '/practices/hajj',
      '/practices/ramadan',
      '/practices/zakat',
    ]
    for (const route of previouslyMissing) {
      const row = SITE_ROUTES.find((r) => r.route === route)
      expect(row, `${route} missing from the manifest`).toBeDefined()
      expect(row!.indexable, `${route} must be indexable`).toBe(true)
    }
  })

  it('finds every route group in the app directory', () => {
    const routes = diskRoutes()
    expect(routes).toContain('/')
    expect(routes).toContain('/quran/:query*')
    expect(routes).toContain('/practices/zakat')
    expect(routes.length).toBeGreaterThan(50)
  })
})

describe('manifest rows point at real pages', () => {
  it('every non-synthetic row has a page.tsx behind it', () => {
    const disk = new Set(diskRoutes())
    const missing = SITE_ROUTES.filter((r) => r.hasDiskRoute !== false)
      .map((r) => r.route)
      .filter((route) => !disk.has(route))
    expect(missing).toEqual([])
  })

  it('no route is both indexed and excluded', () => {
    const contradictions = SITE_ROUTES.filter((r) => r.indexable && isExcluded(r.route)).map(
      (r) => r.route,
    )
    expect(contradictions).toEqual([])
  })

  it('has no duplicate routes', () => {
    const seen = SITE_ROUTES.map((r) => r.route)
    expect(new Set(seen).size).toBe(seen.length)
  })

  it('keeps priority within 0..100', () => {
    for (const route of SITE_ROUTES) {
      expect(route.priority).toBeGreaterThanOrEqual(0)
      expect(route.priority).toBeLessThanOrEqual(100)
    }
  })

  it('gives every grouped route an order, and every concrete one an href', () => {
    for (const route of SITE_ROUTES.filter((r) => r.navGroup)) {
      expect(route.navOrder, `${route.route} needs navOrder`).toBeGreaterThan(0)
      // `expand` rows are URL families, so they have no single href of their own.
      if (route.expand) continue
      expect(routeHref(route), `${route.route} needs a linkable href`).not.toBeNull()
    }
  })

  it('points every navParent at an existing row', () => {
    const routes = new Set(SITE_ROUTES.map((r) => r.route))
    for (const route of SITE_ROUTES.filter((r) => r.navParent)) {
      expect(routes.has(route.navParent!), `${route.route} → ${route.navParent}`).toBe(true)
    }
  })
})

describe('nav, footer, and PWA manifest agree with the route manifest', () => {
  const surfaces: [string, string][] = [
    ['site nav', 'components/site-nav.tsx'],
    ['site footer', 'components/site-footer.tsx'],
    ['pwa manifest', 'app/manifest.ts'],
  ]

  for (const [name, file] of surfaces) {
    it(`${name} links only to known routes`, () => {
      const unknown = hrefsIn(file).filter((href) => !isCovered(href))
      expect(unknown, `${file} links to routes absent from the manifest`).toEqual([])
    })
  }

  // Deliberately not asserted: that every grouped route is linked from the nav
  // or footer. Two indexable pages are reachable only by direct URL today —
  // /community, and the appendices, which have no index route on web (mobile has
  // one). `navGroup` describes where a route belongs conceptually, which is what
  // the command menu groups by; it does not claim the chrome links it.
  it('documents which grouped routes the chrome does not link', () => {
    const linked = new Set([
      ...hrefsIn('components/site-nav.tsx'),
      ...hrefsIn('components/site-footer.tsx'),
    ])
    const unlinked = SITE_ROUTES.filter((r) => r.navGroup && !r.expand)
      .map((r) => routeHref(r))
      .filter((href): href is string => href !== null && !linked.has(href))
    expect(unlinked).toEqual(['/community'])
  })
})

describe('expansion', () => {
  it('expands 114 chapters, using titles when supplied', () => {
    const row = SITE_ROUTES.find((r) => r.expand === 'quranChapters')!
    const expanded = expandFromConstants(row, {
      chapterTitles: ['Al-Faatehah', 'Al-Baqarah'],
      verseCounts: [7, 286],
    })
    expect(expanded).toHaveLength(114)
    expect(expanded[0]).toMatchObject({ route: '/quran/1', title: '1. Al-Faatehah', description: '7 verses' })
    expect(expanded[2]).toMatchObject({ route: '/quran/3', title: 'Chapter 3' })
    expect(expanded[113]?.route).toBe('/quran/114')
  })

  it('expands appendices from the supplied list', () => {
    const row = SITE_ROUTES.find((r) => r.expand === 'appendices')!
    const expanded = expandFromConstants(row, {
      appendices: [{ number: 1, title: 'One of the Great Miracles' }],
    })
    expect(expanded).toEqual([
      {
        route: '/appendices/1',
        title: 'Appendix 1: One of the Great Miracles',
        priority: row.priority,
        changeFrequency: row.changeFrequency,
      },
    ])
  })

  it('returns nothing for blog slugs, which need a backend fetch', () => {
    const row = SITE_ROUTES.find((r) => r.expand === 'blogSlugs')!
    expect(expandFromConstants(row, {})).toEqual([])
  })
})

describe('helpers', () => {
  it('collapses a catch-all to its parent and refuses other dynamic patterns', () => {
    expect(routeHref({ ...SITE_ROUTES[0]!, route: '/quran/:query*' })).toBe('/quran')
    expect(routeHref({ ...SITE_ROUTES[0]!, route: '/appendices/:number' })).toBeNull()
    expect(routeHref({ ...SITE_ROUTES[0]!, route: '/contact' })).toBe('/contact')
  })

  it('excludes account and admin surfaces', () => {
    for (const route of ['/admin', '/admin/offline', '/editor/quran', '/me/settings', '/auth/sign-in']) {
      expect(isExcluded(route), route).toBe(true)
    }
    for (const route of ['/', '/quran', '/practices/zakat']) {
      expect(isExcluded(route), route).toBe(false)
    }
  })

  it('lists only concrete URLs in staticRoutes', () => {
    for (const route of staticRoutes()) {
      expect(route.route).not.toContain(':')
      expect(route.expand).toBeUndefined()
    }
  })

  it('keeps NOT_INDEXED patterns rooted', () => {
    for (const pattern of NOT_INDEXED) expect(pattern.startsWith('/')).toBe(true)
  })
})
