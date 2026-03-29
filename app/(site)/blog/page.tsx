export const dynamic = 'force-dynamic'

import { sanityServer } from '@/lib/sanity'
import Link from 'next/link'
import Image from 'next/image'
import { Metadata } from 'next'
import { getLocale, getTranslations } from 'next-intl/server'
import { BlogBrowser } from './blog-browser'
import type { Post, Category } from './blog-browser'

// Must match @sanity/document-internationalization supportedLanguages in studio
const SANITY_LANGUAGES = ['en', 'fr', 'ar', 'tr'] as const
type SanityLanguage = typeof SANITY_LANGUAGES[number]
function toSanityLanguage(locale: string): SanityLanguage {
  return (SANITY_LANGUAGES as readonly string[]).includes(locale)
    ? (locale as SanityLanguage)
    : 'en'
}

export const metadata: Metadata = {
  title: 'Blog | WikiSubmission',
  description: 'Articles, reflections, and research from the WikiSubmission community.',
  openGraph: {
    title: 'Blog | WikiSubmission',
    description: 'Articles, reflections, and research from the WikiSubmission community.',
  },
}

// Top 3 newest for the Featured strip
const FEATURED_QUERY = `*[_type == "article" && language == $language] | order(publishedAt desc) [0...3] {
  _id, title, slug, excerpt, publishedAt,
  "category": categories[0]->name,
  "categorySlug": categories[0]->slug.current,
  "thumbnailUrl": thumbnail.asset->url,
  "authorName": author->firstName + " " + author->lastName
}`

// All articles passed to the client browser for search / filtering
const ALL_ARTICLES_QUERY = `*[_type == "article" && language == $language] | order(publishedAt desc) {
  _id, title, slug, excerpt, publishedAt,
  "category": categories[0]->name,
  "categorySlug": categories[0]->slug.current,
  "thumbnailUrl": thumbnail.asset->url,
  "authorName": author->firstName + " " + author->lastName
}`

// Categories with counts for filter pills (counts scoped to current language)
const CATEGORIES_QUERY = `*[_type == "category"] | order(name asc) {
  name,
  "slug": slug.current,
  "count": count(*[_type == "article" && language == $language && references(^._id)])
}`

function formatDate(dateString?: string) {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export default async function BlogPage() {
  let featured: Post[] = []
  let allArticles: Post[] = []
  let categories: Category[] = []

  const [locale, t] = await Promise.all([getLocale(), getTranslations('blog')])
  const language = toSanityLanguage(locale)

  try {
    ;[featured, allArticles, categories] = await Promise.all([
      sanityServer.fetch<Post[]>(FEATURED_QUERY, { language }),
      sanityServer.fetch<Post[]>(ALL_ARTICLES_QUERY, { language }),
      sanityServer.fetch<Category[]>(CATEGORIES_QUERY, { language }),
    ])
  } catch (err) {
    console.error('[blog] Sanity fetch failed:', err)
    return (
      <div className="min-h-screen max-w-7xl mx-auto px-6 py-16 text-center">
        <p className="text-muted-foreground">{t('error')}</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {/* ── Featured ──────────────────────────────────────────────────────── */}
      {featured.length > 0 && (
        <section className="max-w-7xl mx-auto px-6 pt-10 pb-2">
          <div className="flex items-baseline gap-6 mb-8">
            <h2 className="font-headline text-2xl font-bold shrink-0">{t('featured')}</h2>
            <div className="h-px grow bg-border/60" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featured.map((post, i) => (
              <FeaturedCard key={post._id} post={post} large={i === 0} />
            ))}
          </div>
        </section>
      )}

      {/* ── Browse — search + category groups ────────────────────────────── */}
      <BlogBrowser articles={allArticles} categories={categories} />
    </div>
  )
}

function FeaturedCard({ post, large }: { post: Post; large?: boolean }) {
  return (
    <Link
      href={`/blog/${post.slug?.current}`}
      className={`group relative bg-background rounded-xl editorial-shadow border border-border/40 overflow-hidden transition-all hover:-translate-y-1 ${large ? 'md:col-span-2' : ''}`}
    >
      {post.thumbnailUrl && (
        <div className={`relative w-full overflow-hidden bg-muted ${large ? 'aspect-video' : 'aspect-video'}`}>
          <Image
            src={post.thumbnailUrl}
            alt={post.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 66vw, 800px"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>
      )}
      <div className="p-6 space-y-3">
        {post.category && (
          <span className="inline-block px-2.5 py-0.5 bg-primary/10 text-primary rounded-full text-xs font-bold">
            {post.category}
          </span>
        )}
        <h3 className={`font-headline font-extrabold leading-snug group-hover:text-primary transition-colors ${large ? 'text-2xl' : 'text-lg'}`}>
          {post.title}
        </h3>
        {post.excerpt && (
          <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
            {post.excerpt}
          </p>
        )}
        <div className="flex items-center gap-2 text-xs text-muted-foreground pt-1">
          {post.authorName && <span>{post.authorName}</span>}
          {post.authorName && post.publishedAt && <span>·</span>}
          {post.publishedAt && <span>{formatDate(post.publishedAt)}</span>}
        </div>
      </div>
    </Link>
  )
}
