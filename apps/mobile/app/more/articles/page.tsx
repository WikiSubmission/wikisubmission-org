'use client'

import { useEffect, useState } from 'react'
import { useLocale } from 'next-intl'
import { BlogBrowser } from '@/components/blog/blog-browser'
import { Spinner } from '@/components/ui/spinner'
import { fetchAllArticles, fetchCategories } from '@/lib/blog-client'
import { toSanityLanguage, type Category, type Post } from '@/lib/blog-queries'

// Articles index. The shared BlogBrowser runs without the web search route
// (list + category filter only) and points article links at the mobile detail
// route. Data is read client-side from the public Sanity CDN.
export default function ArticlesScreen() {
  const locale = useLocale()
  const [data, setData] = useState<{ articles: Post[]; categories: Category[] } | null>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    let cancelled = false
    const language = toSanityLanguage(locale)
    Promise.all([fetchAllArticles(language), fetchCategories(language)])
      .then(([articles, categories]) => {
        if (!cancelled) setData({ articles, categories })
      })
      .catch(() => {
        if (!cancelled) setError(true)
      })
    return () => {
      cancelled = true
    }
  }, [locale])

  if (error) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-2 px-6 py-16 text-center">
        <p className="font-display text-lg">Could not load articles</p>
        <p className="text-muted-foreground text-sm">Check your connection and try again.</p>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="flex flex-1 items-center justify-center py-20">
        <Spinner className="text-muted-foreground size-6" />
      </div>
    )
  }

  return (
    <BlogBrowser
      articles={data.articles}
      categories={data.categories}
      disableSearch
      showTutorial={false}
      hrefForSlug={(slug) => `/more/articles/post?slug=${encodeURIComponent(slug)}`}
    />
  )
}
