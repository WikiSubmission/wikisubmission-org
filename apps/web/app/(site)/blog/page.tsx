export const dynamic = 'force-dynamic'

import { Metadata } from 'next'
import { getLocale } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { BlogBrowser } from '@/components/blog/blog-browser'
import { deriveCategories, fetchArticles } from '@/lib/blog-backend'
import { type Post, type Category } from '@/lib/blog-queries'
import {
  BlogPostArticle,
  buildBlogPostMetadata,
  fetchPreviewBlogPostById,
  getBlogIndexMetadata,
  hasBlogPreviewParams,
  resolveBlogPreviewRequest,
  toSanityLanguage,
} from './blog-post'

type BlogPageProps = {
  searchParams: Promise<{
    blog_id?: string | string[]
    preview?: string | string[]
  }>
}

export async function generateMetadata({
  searchParams,
}: BlogPageProps): Promise<Metadata> {
  const resolvedSearchParams = await searchParams
  const previewRequest = resolveBlogPreviewRequest(resolvedSearchParams)

  if (!previewRequest) {
    if (hasBlogPreviewParams(resolvedSearchParams)) {
      return {
        ...getBlogIndexMetadata(),
        title: 'Preview unavailable | WikiSubmission',
        robots: {
          index: false,
          follow: false,
        },
      }
    }
    return getBlogIndexMetadata()
  }

  try {
    const post = await fetchPreviewBlogPostById(previewRequest.documentId)
    if (!post) return getBlogIndexMetadata()
    return buildBlogPostMetadata(post, { preview: true })
  } catch {
    return getBlogIndexMetadata()
  }
}

export default async function BlogPage({
  searchParams,
}: BlogPageProps) {
  const resolvedSearchParams = await searchParams
  const previewRequested = hasBlogPreviewParams(resolvedSearchParams)
  const previewRequest = resolveBlogPreviewRequest(resolvedSearchParams)

  if (previewRequested && !previewRequest) {
    notFound()
  }

  if (previewRequest) {
    let post = null
    try {
      post = await fetchPreviewBlogPostById(previewRequest.documentId)
    } catch (err) {
      console.error('[blog] Draft preview fetch failed:', err)
      notFound()
    }

    if (!post) notFound()

    // Draft previews render without related posts (related is a published-only
    // backend lookup; drafts are not published).
    return <BlogPostArticle post={post} related={[]} preview />
  }

  const locale = await getLocale()
  const language = toSanityLanguage(locale)

  let allArticles: Post[] = []
  let categories: Category[] = []

  try {
    allArticles = await fetchArticles(language)
    categories = deriveCategories(allArticles)
  } catch (err) {
    console.error('[blog] backend fetch failed:', err)
  }

  return <BlogBrowser articles={allArticles} categories={categories} />
}
