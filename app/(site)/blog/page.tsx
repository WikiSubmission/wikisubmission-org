export const dynamic = 'force-dynamic'

import { sanityServer } from '@/lib/sanity'
import { Metadata } from 'next'
import { getLocale } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { BlogBrowser } from './blog-browser'
import type { Post, Category } from './blog-browser'
import {
  BlogPostArticle,
  type RelatedBlogPost,
  buildBlogPostMetadata,
  fetchPreviewBlogPostById,
  fetchRelatedBlogPosts,
  getBlogIndexMetadata,
  hasBlogPreviewParams,
  resolveBlogPreviewRequest,
  toSanityLanguage,
} from './blog-post'

const ALL_ARTICLES_QUERY = `*[_type == "article" && language == $language] | order(publishedAt desc) {
  _id, title, slug, excerpt, publishedAt,
  "category": categories[0]->name,
  "categorySlug": categories[0]->slug.current,
  "thumbnailUrl": thumbnail.asset->url,
  "authorName": author->firstName + " " + author->lastName
}`

const CATEGORIES_QUERY = `*[_type == "category"] | order(name asc) {
  name,
  "slug": slug.current,
  "count": count(*[_type == "article" && language == $language && references(^._id)])
}`

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

    let related: RelatedBlogPost[] = []
    try {
      related = await fetchRelatedBlogPosts({
        categoryRef: post.categoryRef,
        excludeId: post._id,
        language: post.language ?? 'en',
      })
    } catch {
      // non-critical — preview still renders without related posts
    }

    return <BlogPostArticle post={post} related={related} preview />
  }

  const locale = await getLocale()
  const language = toSanityLanguage(locale)

  let allArticles: Post[] = []
  let categories: Category[] = []
  let tutorialPost = null

  try {
    const [articlesData, categoriesData, tutorialData] = await Promise.all([
      sanityServer.fetch<Post[]>(ALL_ARTICLES_QUERY, { language }),
      sanityServer.fetch<Category[]>(CATEGORIES_QUERY, { language }),
      sanityServer.fetch(`*[_type == "article" && slug.current == "tutorial" && language == $language][0] {
        title,
        body
      }`, { language })
    ])
    allArticles = articlesData
    categories = categoriesData
    tutorialPost = tutorialData
  } catch (err) {
    console.error('[blog] Sanity fetch failed:', err)
  }

  return <BlogBrowser articles={allArticles} categories={categories} tutorial={tutorialPost} />
}
