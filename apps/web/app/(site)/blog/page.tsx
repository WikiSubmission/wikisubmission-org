export const dynamic = 'force-dynamic'

import { Metadata } from 'next'
import { getLocale } from 'next-intl/server'
import { BlogBrowser } from '@/components/blog/blog-browser'
import { deriveCategories, fetchArticles } from '@/lib/blog-backend'
import { type Post, type Category } from '@/lib/blog-queries'
import { getBlogIndexMetadata, toSanityLanguage } from './blog-post'

// This route used to double as a secret-link draft preview, reading unpublished
// documents straight from Sanity. Drafts now live in ws-backend and are
// previewed in /editor, so stale ?blog_id=&preview= links simply land on the
// index rather than 404ing.
export async function generateMetadata(): Promise<Metadata> {
  return getBlogIndexMetadata()
}

export default async function BlogPage() {
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
