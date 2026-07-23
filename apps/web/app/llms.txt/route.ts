export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { sanityServer } from '@/lib/sanity'
import { APPENDICES } from '@/constants/appendices'

const BASE = 'https://wikisubmission.org'

const POSTS_QUERY = `*[_type == "article" && language == "en"] | order(publishedAt desc) {
  title,
  "slug": slug.current,
  excerpt
}`

type Post = { title: string; slug: string; excerpt?: string }

export async function GET() {
  let posts: Post[] = []
  try {
    posts = await sanityServer.fetch<Post[]>(POSTS_QUERY)
  } catch {
    // non-critical — llms.txt still renders without blog posts
  }

  const lines: string[] = [
    '# WikiSubmission',
    '',
    '> WikiSubmission is a faith-based nonprofit providing free and open-source tools for the Quran (Final Testament), Bible, and religious education.',
    '',
    'WikiSubmission offers a multilingual Quran reader with word-by-word translations, audio recitations, appendices, blog articles, and a media archive. All content is freely accessible and open source.',
    '',
    '## Core Pages',
    '',
    `- [Home](${BASE}): Main landing page`,
    `- [Quran Reader](${BASE}/quran): Full Quran with 114 chapters, multilingual translations, word-by-word breakdown, and audio recitation`,
    `- [Introduction](${BASE}/introduction): Introduction to Submission (Islam) and the Final Testament`,
    `- [Miracle of the Quran](${BASE}/miracle): Mathematical miracle of the Quran based on the number 19`,
    `- [Practices](${BASE}/practices): Religious practices and guidance`,
    `- [Blog](${BASE}/blog): Articles, reflections, and research from the WikiSubmission community`,
    `- [Music / Zikr](${BASE}/music): Devotional audio and recitations`,
    `- [Archive](${BASE}/archive): Media archive`,
    `- [Downloads](${BASE}/downloads): Free downloadable resources`,
    `- [Donate](${BASE}/donate): Support the mission`,
    `- [Contact](${BASE}/contact): Get in touch`,
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
      lines.push(`- [${post.title}](${BASE}/blog/${post.slug})${desc}`)
    }
  }

  return new NextResponse(lines.join('\n'), {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
    },
  })
}
