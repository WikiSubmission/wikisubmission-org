import { NextRequest } from 'next/server'

import { portableTextToPlain, searchArticles } from '@/lib/blog-backend'
import { toSanityLanguage } from '@/lib/blog-queries'

export const dynamic = 'force-dynamic'

// Hard caps to limit scraping / query abuse
const MAX_QUERY_LENGTH = 80
const MAX_RESULTS = 8

/** Strip characters that have no place in a plain-text search term. */
function sanitizeQuery(raw: string): string {
  return raw
    .trim()
    .slice(0, MAX_QUERY_LENGTH)
    .replace(/[*@${}()|[\]\\^]/g, '')
    .trim()
}

export interface ArticleResult {
  _id: string
  title: string
  slug: string
  excerpt?: string
  snippets: string[]
  publishedAt?: string
  category?: string
  categorySlug?: string
  thumbnailUrl?: string
  authorName?: string
}

/** Extract up to `max` non-overlapping snippets (~180 chars each) around every match of `query`. */
function extractSnippets(text: string, query: string, max = 5): string[] {
  const snippets: string[] = []
  const lower = text.toLowerCase()
  const lowerQ = query.toLowerCase()
  let searchFrom = 0

  while (snippets.length < max) {
    const idx = lower.indexOf(lowerQ, searchFrom)
    if (idx === -1) break
    const start = Math.max(0, idx - 60)
    const end = Math.min(text.length, idx + query.length + 120)
    snippets.push((start > 0 ? '…' : '') + text.slice(start, end) + (end < text.length ? '…' : ''))
    searchFrom = end
  }

  return snippets
}

// Simple in-memory rate limiter: max 20 requests per IP per 10s window
const rateLimitMap = new Map<string, { count: number; resetAt: number }>()
const RATE_LIMIT = 20
const RATE_WINDOW_MS = 10_000

function isRateLimited(ip: string): boolean {
  const now = Date.now()
  const entry = rateLimitMap.get(ip)
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS })
    return false
  }
  if (entry.count >= RATE_LIMIT) return true
  entry.count++
  return false
}

export async function GET(request: NextRequest) {
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0].trim() ??
    request.headers.get('x-real-ip') ??
    'unknown'

  if (isRateLimited(ip)) {
    return Response.json({ articles: [], error: 'Too many requests' }, { status: 429 })
  }

  const { searchParams } = request.nextUrl
  const rawQ = searchParams.get('q') ?? ''
  const localeParam = searchParams.get('locale') ?? 'en'

  const q = sanitizeQuery(rawQ)
  if (q.length < 2) return Response.json({ articles: [] })

  // Any published language is searchable; toSanityLanguage only rejects codes
  // that are not shaped like a locale, and searchArticles retries in English
  // when the language has no matches.
  const language = toSanityLanguage(localeParam)

  try {
    const posts = await searchArticles(q, language, MAX_RESULTS)

    const articles: ArticleResult[] = posts.map((post) => {
      const bodyText = portableTextToPlain(post.body)
      return {
        _id: post._id,
        title: post.title ?? '',
        slug: post.slug?.current ?? '',
        excerpt: post.excerpt,
        snippets: bodyText ? extractSnippets(bodyText, q) : [],
        publishedAt: post.publishedAt,
        category: post.category,
        categorySlug: post.categoryRef,
        thumbnailUrl: post.thumbnailUrl,
        authorName: post.authorName,
      }
    })

    return Response.json(
      { articles },
      { headers: { 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' } },
    )
  } catch (error) {
    console.error('[search/blog] backend error:', error)
    return Response.json({ articles: [], error: 'Search failed' }, { status: 500 })
  }
}
