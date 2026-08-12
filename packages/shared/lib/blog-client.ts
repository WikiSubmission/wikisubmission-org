import {
  deriveCategories,
  fetchArticleBySlug,
  fetchArticles,
  fetchRelatedArticles,
} from '@/lib/blog-backend'
import type { BlogLanguage, BlogPost, Category, Post, RelatedBlogPost } from '@/lib/blog-queries'

// Browser-side blog reads for the mobile static export. Thin wrappers over the
// shared ws-backend public client (blog-backend.ts); the web app calls the same
// backend from its server components. Reads hit the public editorial endpoints,
// so they work without a Next server.

export async function fetchAllArticles(language: BlogLanguage): Promise<Post[]> {
  return fetchArticles(language)
}

export async function fetchCategories(language: BlogLanguage): Promise<Category[]> {
  return deriveCategories(await fetchArticles(language))
}

export async function fetchPostBySlug(
  slug: string,
  language: BlogLanguage,
): Promise<BlogPost | null> {
  return fetchArticleBySlug(slug, language)
}

export async function fetchRelatedPosts({
  slug,
  language,
}: {
  slug: string
  language: string
}): Promise<RelatedBlogPost[]> {
  return fetchRelatedArticles(slug, language)
}
