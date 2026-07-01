'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useLocale } from 'next-intl'
import { BlogPostArticle } from '@/components/blog/blog-post-article'
import { Spinner } from '@/components/ui/spinner'
import { fetchPostBySlug, fetchRelatedPosts } from '@/lib/blog-client'
import { toSanityLanguage, type BlogPost, type RelatedBlogPost } from '@/lib/blog-queries'

// Article detail. The slug arrives via ?slug= (a static export cannot
// pre-render the unbounded [slug] segment the web route uses); the post and its
// related list are fetched client-side from the Sanity CDN.
function ArticleDetailInner() {
  const router = useRouter()
  const sp = useSearchParams()
  const slug = sp.get('slug')
  const locale = useLocale()

  const [post, setPost] = useState<BlogPost | null>(null)
  const [related, setRelated] = useState<RelatedBlogPost[]>([])
  const [state, setState] = useState<'loading' | 'ready' | 'missing'>('loading')

  useEffect(() => {
    if (!slug) {
      router.replace('/more/articles')
      return
    }
    let cancelled = false
    const language = toSanityLanguage(locale)
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setState('loading')
    fetchPostBySlug(slug, language)
      .then(async (found) => {
        if (cancelled) return
        if (!found) {
          setState('missing')
          return
        }
        setPost(found)
        setState('ready')
        try {
          const rel = await fetchRelatedPosts({
            categoryRef: found.categoryRef,
            excludeId: found._id,
            language: found.language ?? language,
          })
          if (!cancelled) setRelated(rel)
        } catch {
          // related posts are non-critical
        }
      })
      .catch(() => {
        if (!cancelled) setState('missing')
      })
    return () => {
      cancelled = true
    }
  }, [slug, locale, router])

  if (state === 'loading') {
    return (
      <div className="flex flex-1 items-center justify-center py-20">
        <Spinner className="text-muted-foreground size-6" />
      </div>
    )
  }

  if (state === 'missing' || !post) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-2 px-6 py-16 text-center">
        <p className="font-display text-lg">Article not found</p>
        <p className="text-muted-foreground text-sm">It may have been moved or unpublished.</p>
      </div>
    )
  }

  return (
    <BlogPostArticle
      post={post}
      related={related}
      backHref="/more/articles"
      hrefForRelated={(s) => `/more/articles/post?slug=${encodeURIComponent(s)}`}
    />
  )
}

export default function ArticleDetailScreen() {
  return (
    <Suspense fallback={null}>
      <ArticleDetailInner />
    </Suspense>
  )
}
