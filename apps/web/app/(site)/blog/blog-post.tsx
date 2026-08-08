import { buildPageMetadata } from '@/constants/metadata'
import type { Metadata } from 'next'
import { fetchArticleBySlug, fetchRelatedArticles } from '@/lib/blog-backend'
import { type BlogPost, type RelatedBlogPost, type SanityLanguage } from '@/lib/blog-queries'

// The article view and its data shapes are shared with mobile. Reads come from
// ws-backend's public endpoints (blog-backend.ts); this module keeps the
// server-only concerns: SEO metadata builders.
//
// Drafts are previewed in /editor, which renders the working copy with the same
// Portable Text schema. There is no public preview link.
export { BlogPostArticle } from '@/components/blog/blog-post-article'
export { SANITY_LANGUAGES, toSanityLanguage } from '@/lib/blog-queries'
export type { BlogPost, RelatedBlogPost, SanityLanguage } from '@/lib/blog-queries'

const BLOG_INDEX_METADATA = buildPageMetadata({
  title: 'Blog | WikiSubmission',
  description: 'Articles, reflections, and research from the WikiSubmission community.',
  url: 'https://wikisubmission.org/blog',
})

// Thumbnails keep a `-<width>x<height>` suffix before the extension — the
// migration derived its CDN keys from that shape — so OG tags can advertise the
// real dimensions without a HEAD request.
function parseImageDimensions(url: string): { width: number; height: number } | null {
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

export async function fetchPublishedBlogPostBySlug(
  slug: string,
  language: SanityLanguage
): Promise<BlogPost | null> {
  return fetchArticleBySlug(slug, language)
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
  { url }: { url?: string } = {}
): Metadata {
  const title = post.title?.trim() || 'Untitled article'
  const description = post.excerpt?.trim() || 'Read the latest article on WikiSubmission.'

  const thumbnailDimensions = post.thumbnailUrl ? parseImageDimensions(post.thumbnailUrl) : null

  const base = buildPageMetadata({
    title: `${title} | WikiSubmission`,
    description,
    url,
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
    openGraph: {
      ...base.openGraph,
      type: 'article',
      ...(post.publishedAt ? { publishedTime: post.publishedAt } : {}),
      ...(post.authorName ? { authors: [post.authorName] } : {}),
    },
  }
}
