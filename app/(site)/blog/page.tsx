export const dynamic = 'force-dynamic'

import { sanityServer } from '@/lib/sanity'
import { Metadata } from 'next'
import { getLocale } from 'next-intl/server'
import { BlogBrowser } from './blog-browser'
import type { Post, Category } from './blog-browser'
import { buildPageMetadata } from '@/constants/metadata'

const SANITY_LANGUAGES = ['en', 'fr', 'ar', 'tr'] as const
type SanityLanguage = typeof SANITY_LANGUAGES[number]
function toSanityLanguage(locale: string): SanityLanguage {
  return (SANITY_LANGUAGES as readonly string[]).includes(locale)
    ? (locale as SanityLanguage)
    : 'en'
}

export const metadata: Metadata = buildPageMetadata({
  title: 'Blog | WikiSubmission',
  description: 'Articles, reflections, and research from the WikiSubmission community.',
  url: 'https://wikisubmission.org/blog',
})

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

export default async function BlogPage() {
  const locale = await getLocale()
  const language = toSanityLanguage(locale)

  let allArticles: Post[] = []
  let categories: Category[] = []

  try {
    ;[allArticles, categories] = await Promise.all([
      sanityServer.fetch<Post[]>(ALL_ARTICLES_QUERY, { language }),
      sanityServer.fetch<Category[]>(CATEGORIES_QUERY, { language }),
    ])
  } catch (err) {
    console.error('[blog] Sanity fetch failed:', err)
  }

  return <BlogBrowser articles={allArticles} categories={categories} />
}
