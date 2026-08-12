import { MetadataRoute } from 'next'
import { fetchArticles } from '@/lib/blog-backend'
import { APPENDICES } from '@/constants/appendices'
import { CHAPTER_TRANSLITERATIONS, VERSE_COUNTS } from '@/constants/quran-chapters'
import {
  SITE_ROUTES,
  expandFromConstants,
  routeHref,
} from '@/lib/site-routes'

const BASE_URL = 'https://wikisubmission.org'

/**
 * Projected from the route manifest (`packages/shared/lib/site-routes.ts`) so a
 * new page can never be shipped without appearing here. The previous version
 * hardcoded 14 URLs and silently omitted /community, /brand, /chat, /bible,
 * /quran/words, /quran/games, and all four /practices pages.
 *
 * Manifest priority is 0..100; the sitemap's is 0..1.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date()

  const pages: MetadataRoute.Sitemap = []

  for (const route of SITE_ROUTES) {
    if (!route.indexable) continue

    if (route.expand) {
      // Blog slugs need a backend fetch and are handled below.
      if (route.expand === 'blogSlugs') continue
      for (const expanded of expandFromConstants(route, {
        chapterTitles: CHAPTER_TRANSLITERATIONS,
        verseCounts: VERSE_COUNTS,
        appendices: APPENDICES,
      })) {
        pages.push({
          url: `${BASE_URL}${expanded.route}`,
          lastModified: now,
          changeFrequency: expanded.changeFrequency,
          priority: expanded.priority / 100,
        })
      }
      continue
    }

    const href = routeHref(route)
    if (href === null) continue

    pages.push({
      url: href === '/' ? BASE_URL : `${BASE_URL}${href}`,
      lastModified: now,
      changeFrequency: route.changeFrequency,
      priority: route.priority / 100,
    })
  }

  const blogRoute = SITE_ROUTES.find((r) => r.expand === 'blogSlugs')
  let blogPosts: MetadataRoute.Sitemap = []
  if (blogRoute) {
    try {
      const posts = await fetchArticles('en')
      blogPosts = posts
        .filter((p) => p.slug.current)
        .map((p) => ({
          url: `${BASE_URL}/blog/${p.slug.current}`,
          lastModified: p.publishedAt ? new Date(p.publishedAt) : now,
          changeFrequency: blogRoute.changeFrequency,
          priority: blogRoute.priority / 100,
        }))
    } catch {
      // non-critical — sitemap still works without blog posts
    }
  }

  return [...pages, ...blogPosts]
}
