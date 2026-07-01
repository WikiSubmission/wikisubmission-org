import { NextRequest } from 'next/server'
import { sanityServer } from '@/lib/sanity'

export const dynamic = 'force-dynamic'

const ALLOWED_LOCALES = ['en', 'fr', 'ar', 'tr'] as const
type AllowedLocale = (typeof ALLOWED_LOCALES)[number]

// Hard caps to limit scraping / query abuse
const MAX_QUERY_LENGTH = 80
const MAX_RESULTS = 8

/** Strip characters that have no place in a plain-text search term. */
function sanitizeQuery(raw: string): string {
  return raw
    .trim()
    .slice(0, MAX_QUERY_LENGTH)
    // Remove GROQ / regex special chars that could affect query parsing
    .replace(/[*@${}()|[\]\\^]/g, '')
    .trim()
}

interface RawResult {
  _id: string
  title: string
  slug: string
  excerpt?: string
  bodyText?: string
  publishedAt?: string
  category?: string
  categorySlug?: string
  thumbnailUrl?: string
  authorName?: string
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

const SEARCH_QUERY = `
  *[_type == "article" && language == $language && (title match $q || excerpt match $q || pt::text(body) match $q)]
  | order(publishedAt desc)
  [0...${MAX_RESULTS}]
  {
    _id,
    title,
    "slug": slug.current,
    excerpt,
    "bodyText": pt::text(body),
    publishedAt,
    "category": categories[0]->name,
    "categorySlug": categories[0]->slug.current,
    "thumbnailUrl": thumbnail.asset->url,
    "authorName": author->firstName + " " + author->lastName
  }
`

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
  // Rate limit by IP
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

  const language: AllowedLocale = ALLOWED_LOCALES.includes(localeParam as AllowedLocale)
    ? (localeParam as AllowedLocale)
    : 'en'

  try {
    const raw: RawResult[] = await sanityServer.fetch(SEARCH_QUERY, {
      q: `${q}*`,
      language,
    })

    const articles: ArticleResult[] = raw.map(({ bodyText, ...rest }) => {
      const snippets = bodyText ? extractSnippets(bodyText, q) : []
      return { ...rest, snippets }
    })

    return Response.json({ articles }, {
      headers: {
        'Cache-Control': 'no-store',
        'X-Content-Type-Options': 'nosniff',
      },
    })
  } catch (error) {
    console.error('[search/blog] Sanity error:', error)
    return Response.json({ articles: [], error: 'Search failed' }, { status: 500 })
  }
}
