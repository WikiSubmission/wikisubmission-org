import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import { getLocale } from 'next-intl/server'
import {
  BlogPostArticle,
  type BlogLanguage,
  type Post,
  type RelatedBlogPost,
  buildBlogPostMetadata,
  fetchPublishedBlogPostBySlug,
  fetchPublishedArticlesList,
  fetchRelatedBlogPosts,
  toBlogLanguage,
} from '../blog-post'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const locale = await getLocale()
  const language = toBlogLanguage(locale)
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
  const language = toBlogLanguage(locale)

  let post = null
  try {
    post = await fetchPublishedBlogPostBySlug(slug, language)
  } catch (err) {
    console.error('[blog/slug] article fetch failed:', err)
    notFound()
  }

  if (!post) notFound()

  let related: RelatedBlogPost[] = []
  try {
    related = await fetchRelatedBlogPosts({
      slug,
      language: post.language ?? language,
    })
  } catch {
    // non-critical — page still renders without related posts
  }

  let allArticles: Post[] = []

  try {
    const list = await fetchPublishedArticlesList((post.language as BlogLanguage) ?? language)
    allArticles = list
  } catch {
    // non-critical
  }

  // 1. Other articles by the same author
  const authorArticles: RelatedBlogPost[] = post.authorName
    ? allArticles
        .filter((a) => {
          const itemSlug = a.slug?.current
          return (
            Boolean(itemSlug) &&
            itemSlug !== slug &&
            Boolean(a.authorName) &&
            a.authorName?.trim().toLowerCase() === post.authorName?.trim().toLowerCase()
          )
        })
        .map((a) => ({
          _id: String(a._id || a.slug?.current || ''),
          title: a.title,
          slug: a.slug,
          publishedAt: a.publishedAt,
          category: a.category,
          thumbnailUrl: a.thumbnailUrl,
        }))
    : []

  // 2. Other articles (from other authors / other topics)
  const otherArticles: RelatedBlogPost[] = allArticles
    .filter((a) => {
      const itemSlug = a.slug?.current
      const isSameAuthor = Boolean(
        post.authorName &&
        a.authorName &&
        a.authorName.trim().toLowerCase() === post.authorName.trim().toLowerCase()
      )
      return Boolean(itemSlug) && itemSlug !== slug && !isSameAuthor
    })
    .map((a) => ({
      _id: String(a._id || a.slug?.current || ''),
      title: a.title,
      slug: a.slug,
      publishedAt: a.publishedAt,
      category: a.category,
      thumbnailUrl: a.thumbnailUrl,
      authorName: a.authorName,
    }))

  // 3. All other blogs for the "More from the Archive" section
  const allOtherBlogs: RelatedBlogPost[] = allArticles
    .filter((a) => a.slug?.current && a.slug.current !== slug)
    .map((a) => ({
      _id: String(a._id || a.slug?.current || ''),
      title: a.title,
      slug: a.slug,
      publishedAt: a.publishedAt,
      category: a.category,
      thumbnailUrl: a.thumbnailUrl,
      authorName: a.authorName,
    }))

  return (
    <BlogPostArticle
      post={post}
      related={related}
      authorArticles={authorArticles}
      otherArticles={otherArticles}
      allBlogs={allOtherBlogs}
    />
  )
}
