export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { getTranslations } from 'next-intl/server'
import { fetchArticles } from '@/lib/blog-backend'
import { type Post } from '@/lib/blog-queries'
import { APPENDICES } from '@/constants/appendices'
import {
  SITE_ROUTES,
  routeDescription,
  routeHref,
  routeTitle,
} from '@/lib/site-routes'

const BASE = 'https://wikisubmission.org'

export async function GET() {
  let posts: Post[] = []
  try {
    posts = await fetchArticles('en')
  } catch {
    // non-critical — llms.txt still renders without blog posts
  }

  // Always English: this file is a machine-readable summary, and the site has no
  // locale path segment to describe alternates with.
  const t = await getTranslations({ locale: 'en' })

  // Projected from the route manifest, so a new page appears here automatically.
  // The chapter and appendix sections below were already data-driven and stay
  // that way — they carry detail (verse refs) the manifest does not model.
  const corePages = SITE_ROUTES.filter((r) => r.indexable && !r.expand)
    .map((route) => {
      const href = routeHref(route)
      if (href === null) return null
      const url = href === '/' ? BASE : `${BASE}${href}`
      const description = routeDescription(route, t)
      return `- [${routeTitle(route, t)}](${url})${description ? `: ${description}` : ''}`
    })
    .filter((line): line is string => line !== null)

  const lines: string[] = [
    '# WikiSubmission',
    '',
    '> WikiSubmission is a faith-based nonprofit providing free and open-source tools for the Quran (Final Testament), Bible, and religious education.',
    '',
    'WikiSubmission offers a multilingual Quran reader with word-by-word translations, audio recitations, appendices, blog articles, and a media archive. All content is freely accessible and open source.',
    '',
    '## Core Pages',
    '',
    ...corePages,
    '',
    '## Quran Chapters',
    '',
    ...Array.from({ length: 114 }, (_, i) =>
      `- [Chapter ${i + 1}](${BASE}/quran/${i + 1}): Quran chapter ${i + 1}`
    ),
    '',
    '## Appendices',
    '',
    ...APPENDICES.map((a) =>
      `- [Appendix ${a.number}: ${a.title}](${BASE}/appendices/${a.number})${a.quranRef ? ` — Quran ref: ${a.quranRef}` : ''}`
    ),
  ]

  if (posts.length > 0) {
    lines.push('', '## Blog Articles', '')
    for (const post of posts) {
      const desc = post.excerpt ? `: ${post.excerpt}` : ''
      lines.push(`- [${post.title}](${BASE}/blog/${post.slug.current})${desc}`)
    }
  }

  return new NextResponse(lines.join('\n'), {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
    },
  })
}
