import type { PortableTextBlock } from '@portabletext/types'

import { resolveBrowserApiBaseUrl, resolveServerApiBaseUrl } from '@/src/api/base-url'
import { DEFAULT_BLOG_LANGUAGE } from '@/lib/blog-queries'
import type {
  BlogPost,
  Category,
  Post,
  RelatedBlogPost,
  SanityLanguage,
} from '@/lib/blog-queries'

// First-party blog reads from ws-backend's public editorial endpoints (Sanity
// replacement). Shared by web SSR (server base URL) and the mobile static
// export (absolute browser base URL). The backend returns only published
// snapshots; the shapes below map its snake_case DTO onto the existing public
// view shapes so the rendering components are unchanged.

interface PublicArticleDTO {
  id: number
  translation_group: string
  slug: string
  language: string
  title: string
  excerpt: string
  thumbnail_url: string
  thumbnail_text: PortableTextBlock[]
  body?: PortableTextBlock[]
  enable_scripture_refs?: boolean
  category: string
  category_slug: string
  author_name: string
  author_photo_url: string
  author_slug: string
  published_at: string | null
  updated_at: string
}

function apiBase(): string {
  return typeof window === 'undefined' ? resolveServerApiBaseUrl() : resolveBrowserApiBaseUrl()
}

async function getData<T>(path: string): Promise<T | null> {
  const base = apiBase()
  if (!base) return null
  try {
    const res = await fetch(`${base}${path}`, { cache: 'no-store' })
    if (!res.ok) return null
    const json = (await res.json()) as { data?: T }
    return json.data ?? null
  } catch {
    return null
  }
}

const orEmpty = (value: string): string | undefined => value || undefined

function toPost(dto: PublicArticleDTO): Post {
  return {
    _id: String(dto.id),
    title: dto.title,
    slug: { current: dto.slug },
    excerpt: orEmpty(dto.excerpt),
    publishedAt: dto.published_at ?? undefined,
    category: orEmpty(dto.category),
    categorySlug: orEmpty(dto.category_slug),
    thumbnailUrl: orEmpty(dto.thumbnail_url),
    authorName: orEmpty(dto.author_name),
  }
}

function toBlogPost(dto: PublicArticleDTO): BlogPost {
  return {
    _id: String(dto.id),
    title: dto.title,
    slug: { current: dto.slug },
    excerpt: orEmpty(dto.excerpt),
    publishedAt: dto.published_at ?? undefined,
    updatedAt: dto.updated_at,
    language: dto.language,
    // Absent means on: articles predating the field keep linkifying.
    enableScriptureRefs: dto.enable_scripture_refs ?? true,
    category: orEmpty(dto.category),
    categoryRef: orEmpty(dto.category_slug),
    body: dto.body ?? [],
    thumbnailUrl: orEmpty(dto.thumbnail_url),
    authorName: orEmpty(dto.author_name),
    authorPhotoUrl: orEmpty(dto.author_photo_url),
  }
}

function toRelated(dto: PublicArticleDTO): RelatedBlogPost {
  return {
    _id: String(dto.id),
    title: dto.title,
    slug: { current: dto.slug },
    publishedAt: dto.published_at ?? undefined,
    category: orEmpty(dto.category),
    thumbnailUrl: orEmpty(dto.thumbnail_url),
  }
}

/**
 * Run a language-scoped list read, retrying in English when the reader's
 * language has nothing to show.
 *
 * Articles are authored per language, and any language in the editorial
 * registry can be published to. Rather than keeping a frontend list of which
 * languages have content (which goes stale the moment an editor publishes a new
 * one), a read asks for the reader's language and falls back only on an empty
 * result. An outage also yields an empty result, so the retry covers that too,
 * which is the same trade fetchArticleBySlug already makes per slug.
 */
async function withEnglishFallback<T>(
  language: SanityLanguage,
  load: (lang: SanityLanguage) => Promise<T[]>,
): Promise<T[]> {
  const rows = await load(language)
  if (rows.length > 0 || language === DEFAULT_BLOG_LANGUAGE) return rows
  return load(DEFAULT_BLOG_LANGUAGE)
}

/** All published articles for a language, newest first, English if it has none. */
export async function fetchArticles(language: SanityLanguage): Promise<Post[]> {
  return withEnglishFallback(language, async (lang) => {
    const data = await getData<PublicArticleDTO[]>(
      `/editorial/public/articles?language=${encodeURIComponent(lang)}`,
    )
    return (data ?? []).map(toPost)
  })
}

/** One published article by slug, with an English fallback. */
export async function fetchArticleBySlug(
  slug: string,
  language: SanityLanguage,
): Promise<BlogPost | null> {
  const path = (lang: string) =>
    `/editorial/public/articles/${encodeURIComponent(lang)}/${encodeURIComponent(slug)}`
  let dto = await getData<PublicArticleDTO>(path(language))
  if (!dto && language !== DEFAULT_BLOG_LANGUAGE) {
    dto = await getData<PublicArticleDTO>(path(DEFAULT_BLOG_LANGUAGE))
  }
  return dto ? toBlogPost(dto) : null
}

/** Related published articles sharing the primary category and language. */
export async function fetchRelatedArticles(
  slug: string,
  language: string,
): Promise<RelatedBlogPost[]> {
  if (!slug) return []
  const data = await getData<PublicArticleDTO[]>(
    `/editorial/public/articles/${encodeURIComponent(language)}/${encodeURIComponent(slug)}/related`,
  )
  return (data ?? []).map(toRelated)
}

/**
 * Full-text-ish article search; results include body for snippet extraction.
 * Falls back to English on an empty result for the same reason the list does:
 * the reader is looking at English articles, so search has to find them.
 */
export async function searchArticles(
  q: string,
  language: SanityLanguage,
  limit = 8,
): Promise<BlogPost[]> {
  return withEnglishFallback(language, async (lang) => {
    const data = await getData<PublicArticleDTO[]>(
      `/editorial/public/search?q=${encodeURIComponent(q)}&language=${encodeURIComponent(lang)}&limit=${limit}`,
    )
    return (data ?? []).map(toBlogPost)
  })
}

/** Derives category facets (with counts) from a list of posts. */
export function deriveCategories(posts: Post[]): Category[] {
  const bySlug = new Map<string, Category>()
  for (const post of posts) {
    if (!post.category || !post.categorySlug) continue
    const existing = bySlug.get(post.categorySlug)
    if (existing) existing.count += 1
    else bySlug.set(post.categorySlug, { name: post.category, slug: post.categorySlug, count: 1 })
  }
  return [...bySlug.values()].sort((a, b) => a.name.localeCompare(b.name))
}

/** Plain-text flatten of a Portable Text array (for search snippets). */
export function portableTextToPlain(body?: PortableTextBlock[]): string {
  if (!Array.isArray(body)) return ''
  return body
    .flatMap((block) => (block as { children?: { text?: string }[] }).children ?? [])
    .map((child) => child.text ?? '')
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim()
}
