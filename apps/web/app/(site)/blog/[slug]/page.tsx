import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import { getLocale } from 'next-intl/server'
import {
  BlogPostArticle,
  type RelatedBlogPost,
  buildBlogPostMetadata,
  fetchPublishedBlogPostBySlug,
  fetchRelatedBlogPosts,
  toSanityLanguage,
} from '../blog-post'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const locale = await getLocale()
  const language = toSanityLanguage(locale)
  try {
    const post = await fetchPublishedBlogPostBySlug(slug, language)
    if (!post) return {}
    return buildBlogPostMetadata(post, {
      url: `https://wikisubmission.org/blog/${slug}`,
    })
  } catch {
    return {}
  }
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const locale = await getLocale()
  const language = toSanityLanguage(locale)

  let post = null
  try {
    post = await fetchPublishedBlogPostBySlug(slug, language)
  } catch (err) {
    console.error('[blog/slug] Sanity fetch failed:', err)
    notFound()
  }

  if (!post) notFound()

  let related: RelatedBlogPost[] = []
  try {
    related = await fetchRelatedBlogPosts({
      categoryRef: post.categoryRef,
      excludeId: post._id,
      language: post.language ?? language,
    })
  } catch {
    // non-critical — page still renders without related posts
  }

  return <BlogPostArticle post={post} related={related} />
}
