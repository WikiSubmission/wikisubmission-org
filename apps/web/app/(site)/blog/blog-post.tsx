import { buildPageMetadata } from '@/constants/metadata'
import { sanityPreviewServer } from '@/lib/sanity'
import type { Metadata } from 'next'
import { timingSafeEqual } from 'node:crypto'
import { fetchArticleBySlug, fetchRelatedArticles } from '@/lib/blog-backend'
import {
  PREVIEW_POST_BY_ID_QUERY,
  type BlogPost,
  type RelatedBlogPost,
  type SanityLanguage,
} from '@/lib/blog-queries'

// The article view and its data shapes are shared with mobile. Published reads
// come from ws-backend's public endpoints (blog-backend.ts); this module keeps
// the server-only concerns: the preview-secret gate, the (still Sanity-backed)
// draft preview read, and SEO metadata builders.
export { BlogPostArticle } from '@/components/blog/blog-post-article'
export { SANITY_LANGUAGES, toSanityLanguage } from '@/lib/blog-queries'
export type { BlogPost, RelatedBlogPost, SanityLanguage } from '@/lib/blog-queries'

type PreviewSearchParams = {
  blog_id?: string | string[]
  preview?: string | string[]
}

const BLOG_INDEX_METADATA = buildPageMetadata({
  title: 'Blog | WikiSubmission',
  description: 'Articles, reflections, and research from the WikiSubmission community.',
  url: 'https://wikisubmission.org/blog',
})

function firstParam(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value
}

export function hasBlogPreviewParams(searchParams: PreviewSearchParams) {
  return Boolean(firstParam(searchParams.blog_id) || firstParam(searchParams.preview))
}

function normalizeDocumentId(value?: string | null) {
  if (!value) return null
  const trimmed = value.trim()
  if (!trimmed) return null
  return trimmed.replace(/^drafts\./, '')
}

function matchesSecret(secret: string, expectedSecret: string) {
  const provided = Buffer.from(secret)
  const expected = Buffer.from(expectedSecret)

  if (provided.length !== expected.length) return false

  return timingSafeEqual(provided, expected)
}

function parseSanityImageDimensions(url: string): { width: number; height: number } | null {
  const match = url.match(/-(\d+)x(\d+)\.[a-z0-9]+(?:\?.*)?$/i)
  if (!match) return null
  const width = Number(match[1])
  const height = Number(match[2])
  if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) return null
  return { width, height }
}

export function getBlogIndexMetadata() {
  return BLOG_INDEX_METADATA
}

export function resolveBlogPreviewRequest(searchParams: PreviewSearchParams) {
  const documentId = normalizeDocumentId(firstParam(searchParams.blog_id))
  const providedSecret = firstParam(searchParams.preview)
  const expectedSecret = process.env.BLOG_PREVIEW_SECRET

  if (!documentId || !providedSecret || !expectedSecret || !sanityPreviewServer) {
    return null
  }

  if (!matchesSecret(providedSecret, expectedSecret)) {
    return null
  }

  return { documentId }
}

export async function fetchPublishedBlogPostBySlug(
  slug: string,
  language: SanityLanguage
): Promise<BlogPost | null> {
  return fetchArticleBySlug(slug, language)
}

// Draft preview via a shareable secret link still reads from Sanity. Once the
// content is migrated, previewing happens inside /editor; a secret-gated backend
// draft endpoint can replace this if the public preview link must stay.
export async function fetchPreviewBlogPostById(documentId: string) {
  if (!sanityPreviewServer) return null

  return sanityPreviewServer.fetch<BlogPost | null>(PREVIEW_POST_BY_ID_QUERY, {
    documentId,
  })
}

export async function fetchRelatedBlogPosts({
  slug,
  language,
}: {
  slug: string
  language: string
}): Promise<RelatedBlogPost[]> {
  return fetchRelatedArticles(slug, language)
}

export function buildBlogPostMetadata(
  post: BlogPost,
  {
    preview = false,
    url,
  }: {
    preview?: boolean
    url?: string
  } = {}
): Metadata {
  const title = post.title?.trim() || 'Untitled article'
  const description = post.excerpt?.trim() || 'Read the latest article on WikiSubmission.'
  const metadataTitle = preview
    ? `${title} | Draft Preview | WikiSubmission`
    : `${title} | WikiSubmission`

  const thumbnailDimensions = post.thumbnailUrl ? parseSanityImageDimensions(post.thumbnailUrl) : null

  const base = buildPageMetadata({
    title: metadataTitle,
    description,
    ...(preview ? {} : { url }),
    ...(post.thumbnailUrl
      ? {
          image: post.thumbnailUrl,
          imageAlt: title,
          twitterCard: 'summary_large_image' as const,
          ...(thumbnailDimensions ? { imageSize: thumbnailDimensions } : {}),
        }
      : {}),
  })

  return {
    ...base,
    ...(preview
      ? {
          robots: {
            index: false,
            follow: false,
            googleBot: {
              index: false,
              follow: false,
              'max-video-preview': -1,
              'max-image-preview': 'large' as const,
              'max-snippet': -1,
            },
          },
        }
      : {}),
    openGraph: {
      ...base.openGraph,
      type: 'article',
      ...(post.publishedAt ? { publishedTime: post.publishedAt } : {}),
      ...(post.authorName ? { authors: [post.authorName] } : {}),
    },
  }
}
