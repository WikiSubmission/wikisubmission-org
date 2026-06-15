import { sanityClient } from '@/lib/sanity'
import {
  ALL_ARTICLES_QUERY,
  CATEGORIES_QUERY,
  POST_BY_SLUG_QUERY,
  RELATED_QUERY,
  type BlogPost,
  type Category,
  type Post,
  type RelatedBlogPost,
  type SanityLanguage,
} from '@/lib/blog-queries'

// Browser-side blog reads for the mobile static export. The web app uses its
// server-only equivalents in apps/web/app/(site)/blog/blog-post.tsx; these hit
// the public Sanity CDN so they work without a Next server.

export async function fetchAllArticles(language: SanityLanguage): Promise<Post[]> {
  return sanityClient.fetch<Post[]>(ALL_ARTICLES_QUERY, { language })
}

export async function fetchCategories(language: SanityLanguage): Promise<Category[]> {
  return sanityClient.fetch<Category[]>(CATEGORIES_QUERY, { language })
}

export async function fetchPostBySlug(
  slug: string,
  language: SanityLanguage,
): Promise<BlogPost | null> {
  let post = await sanityClient.fetch<BlogPost | null>(POST_BY_SLUG_QUERY, { slug, language })
  if (!post && language !== 'en') {
    post = await sanityClient.fetch<BlogPost | null>(POST_BY_SLUG_QUERY, { slug, language: 'en' })
  }
  return post
}

export async function fetchRelatedPosts({
  categoryRef,
  excludeId,
  language,
}: {
  categoryRef?: string
  excludeId: string
  language: string
}): Promise<RelatedBlogPost[]> {
  if (!categoryRef) return []
  return sanityClient.fetch<RelatedBlogPost[]>(RELATED_QUERY, { categoryRef, excludeId, language })
}
