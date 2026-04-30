'use client'

import { useState, useCallback, useEffect, useRef, Suspense } from 'react'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { SearchIcon, XIcon } from 'lucide-react'
import { Spinner } from '@/components/ui/spinner'
import { cn } from '@/lib/utils'
import { useTranslations } from 'next-intl'
import { useLocale } from 'next-intl'
import { motion, AnimatePresence } from 'framer-motion'
import { BlogTutorial } from './blog-tutorial'
import { BookOpenIcon } from 'lucide-react'

export type Post = {
  _id: string
  title: string
  slug: { current: string }
  excerpt?: string
  snippets?: string[]
  publishedAt?: string
  category?: string
  categorySlug?: string
  thumbnailUrl?: string
  authorName?: string
}

// Search API returns slug as a plain string, not { current: string }
type SearchPost = Omit<Post, 'slug'> & { slug: string }

export type Category = {
  name: string
  slug: string
  count: number
}

function formatDate(dateString?: string) {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

// Highlight occurrences of `query` inside `text`
function Highlight({ text, query }: { text: string; query: string }) {
  if (!query.trim()) return <>{text}</>
  const regex = new RegExp(`(${query.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
  const parts = text.split(regex)
  return (
    <>
      {parts.map((part, i) =>
        regex.test(part) ? (
          <mark key={i} className="bg-primary/10 text-primary dark:text-primary rounded-sm font-semibold px-0.5 not-italic">
            {part}
          </mark>
        ) : part
      )}
    </>
  )
}

function PostCard({ post }: { post: Post }) {
  return (
    <Link
      href={`/blog/${post.slug?.current}`}
      className="group flex flex-col bg-background rounded-xl border border-border/40 overflow-hidden transition-colors hover:border-border/80"
    >
      {post.thumbnailUrl && (
        <div className="relative w-full aspect-video overflow-hidden bg-muted shrink-0">
          <Image
            src={post.thumbnailUrl}
            alt={post.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover"
          />
        </div>
      )}
      <div className="flex flex-col flex-1 p-4 gap-1.5">
        {post.category && (
          <span className="text-[10px] font-semibold uppercase tracking-widest text-primary">
            {post.category}
          </span>
        )}
        <h3 className="font-headline font-bold text-sm leading-snug">{post.title}</h3>
        {post.excerpt && (
          <p className="text-xs text-muted-foreground line-clamp-2">{post.excerpt}</p>
        )}
        <p className="text-xs text-muted-foreground mt-auto pt-1">{formatDate(post.publishedAt)}</p>
      </div>
    </Link>
  )
}

function SearchResultRow({ post, query }: { post: SearchPost; query: string }) {
  const hasBodySnippets = post.snippets && post.snippets.length > 0
  const excerptHasMatch = post.excerpt?.toLowerCase().includes(query.toLowerCase())

  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group flex flex-col sm:flex-row sm:items-start bg-background rounded-xl border border-border/40 overflow-hidden transition-colors hover:border-border/80"
    >
      <div className="w-full sm:shrink-0 sm:w-24 sm:h-14 sm:m-3 sm:rounded-lg overflow-hidden bg-muted">
        {post.thumbnailUrl && (
          <Image
            src={post.thumbnailUrl}
            alt={post.title}
            width={320}
            height={180}
            className="object-cover w-full aspect-video sm:h-full sm:aspect-auto"
          />
        )}
      </div>
      <div className="flex flex-col flex-1 min-w-0 gap-1.5 p-4 sm:py-3 sm:pl-0 sm:pr-3">
        {post.category && (
          <span className="text-[10px] font-semibold uppercase tracking-widest text-primary">
            {post.category}
          </span>
        )}
        <h3 className="font-headline font-bold text-sm leading-snug">
          <Highlight text={post.title} query={query} />
        </h3>

        {post.excerpt && excerptHasMatch && (
          <p className="text-xs text-muted-foreground leading-relaxed">
            <Highlight text={post.excerpt} query={query} />
          </p>
        )}

        {hasBodySnippets && (
          <div className="space-y-1 mt-0.5">
            {post.snippets!.map((snippet, i) => (
              <p key={i} className="text-xs text-muted-foreground leading-relaxed border-l-2 border-border/60 pl-2">
                <Highlight text={snippet} query={query} />
              </p>
            ))}
          </div>
        )}

        <p className="text-[10px] text-muted-foreground/70 mt-0.5">
          {[post.authorName, formatDate(post.publishedAt)].filter(Boolean).join(' · ')}
        </p>
      </div>
    </Link>
  )
}

function BlogBrowserInner({
  articles,
  categories,
  tutorial,
}: {
  articles: Post[]
  categories: Category[]
  tutorial?: any
}) {
  const t = useTranslations('blog')
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const locale = useLocale()

  const activeCategory = searchParams.get('category')
  const [query, setQuery] = useState(() => searchParams.get('q') ?? '')
  const [searchResults, setSearchResults] = useState<SearchPost[] | null>(null)
  const [searching, setSearching] = useState(false)
  const [tutorialOpen, setTutorialOpen] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const updateUrl = useCallback(
    (q: string, category: string | null) => {
      const params = new URLSearchParams()
      if (q.trim()) params.set('q', q)
      if (category) params.set('category', category)
      const qs = params.toString()
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false })
    },
    [pathname, router]
  )

  const setActiveCategory = useCallback(
    (slug: string | null) => {
      setQuery('')
      setSearchResults(null)
      setSearching(false)
      if (debounceRef.current) clearTimeout(debounceRef.current)
      updateUrl('', slug)
    },
    [updateUrl]
  )

  const clearSearch = useCallback(() => {
    setQuery('')
    setSearchResults(null)
    setSearching(false)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    updateUrl('', activeCategory)
  }, [updateUrl, activeCategory])

  const handleQueryChange = useCallback(
    (val: string) => {
      setQuery(val)
      updateUrl(val, activeCategory)
    },
    [updateUrl, activeCategory]
  )

  // Full-text search via API
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    const q = query.trim()
    if (q.length < 2) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSearchResults(null)
      setSearching(false)
      return
    }
    setSearching(true)
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search/blog?q=${encodeURIComponent(q)}&locale=${locale}`)
        const data = await res.json()
        setSearchResults(data.articles ?? [])
      } catch {
        setSearchResults([])
      } finally {
        setSearching(false)
      }
    }, 300)
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [query, locale])

  const visibleCategories = categories.filter((c) => c.count > 0)
  const isSearching = query.trim().length >= 2

  const categoryFiltered = activeCategory
    ? articles.filter((a) => a.categorySlug === activeCategory)
    : null

  const grouped = visibleCategories
    .map((cat) => ({ ...cat, posts: articles.filter((a) => a.categorySlug === cat.slug) }))
    .filter((g) => g.posts.length > 0)

  const uncategorised = articles.filter((a) => !a.categorySlug)

  return (
    <div className="min-h-screen">
      {/* ── Header + search ───────────────────────────────────────────────── */}
      <section className="border-b border-border/40 bg-muted/30">
        <div className="max-w-5xl mx-auto px-6 py-12 space-y-6">
          <div>
            <h1 className="font-headline text-4xl md:text-5xl font-extrabold tracking-tight mb-3">
              {t('heading')}
            </h1>
            <p className="text-lg text-muted-foreground max-w-xl">
              {t('description')}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 sm:items-center">
            {/* Search bar */}
            <div className="relative flex-1">
              <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/60 pointer-events-none" />
              <input
                type="text"
                placeholder={t('searchPlaceholder')}
                value={query}
                onChange={(e) => handleQueryChange(e.target.value)}
                className="w-full h-12 rounded-lg bg-background border border-border pl-11 pr-11 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 placeholder:text-muted-foreground"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                {searching ? (
                  <Spinner className="size-4 text-muted-foreground" />
                ) : query ? (
                  <button onClick={clearSearch} className="p-1 rounded text-muted-foreground hover:text-foreground transition-colors">
                    <XIcon className="size-3.5" />
                  </button>
                ) : null}
              </div>
            </div>

            <button 
              onClick={() => setTutorialOpen(true)}
              className="inline-flex items-center justify-center gap-2 h-12 px-6 rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-all shrink-0 shadow-lg shadow-primary/10"
            >
              <BookOpenIcon size={18} />
              Instructions
            </button>
          </div>

          {/* Category pills */}
          {visibleCategories.length > 0 && (
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setActiveCategory(null)}
                className={cn(
                  'px-3 py-1.5 rounded-full text-xs font-medium border transition-colors cursor-pointer',
                  !activeCategory && !query
                    ? 'bg-primary/10 text-primary border-primary/20'
                    : 'bg-muted/60 text-muted-foreground border-border/40 hover:bg-primary/10 hover:text-primary hover:border-primary/20'
                )}
              >
                {t('filterAll')}
              </button>
              {visibleCategories.map((cat) => (
                <button
                  key={cat.slug}
                  onClick={() => setActiveCategory(cat.slug)}
                  className={cn(
                    'px-3 py-1.5 rounded-full text-xs font-medium border transition-colors cursor-pointer',
                    activeCategory === cat.slug && !query
                      ? 'bg-primary/10 text-primary border-primary/20'
                      : 'bg-muted/60 text-muted-foreground border-border/40 hover:bg-primary/10 hover:text-primary hover:border-primary/20'
                  )}
                >
                  {cat.name}
                  <span className="ml-1 opacity-50">{cat.count}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── Content ───────────────────────────────────────────────────────── */}
      <div className="max-w-5xl mx-auto px-6 py-8 space-y-10">

        {/* Search results */}
        {isSearching && (
          searchResults === null ? (
            <div className="flex justify-center py-16">
              <Spinner className="size-5 text-muted-foreground" />
            </div>
          ) : searchResults.length > 0 ? (
            <div className="space-y-3">
              <p className="text-xs text-muted-foreground">
                {searchResults.length} result{searchResults.length !== 1 ? 's' : ''} for &ldquo;{query.trim()}&rdquo;
              </p>
              {searchResults.map((post) => (
                <SearchResultRow key={post._id} post={post} query={query.trim()} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 text-muted-foreground">
              <p className="font-headline font-bold">{t('noResults')}</p>
              <p className="text-sm mt-1">{t('noResultsHelp')}</p>
            </div>
          )
        )}

        {/* Category filter results */}
        {!isSearching && categoryFiltered && (
          categoryFiltered.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {categoryFiltered.map((post) => (
                <PostCard key={post._id} post={post} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 text-muted-foreground">
              <p className="font-headline font-bold">{t('noResults')}</p>
              <p className="text-sm mt-1">{t('noResultsHelp')}</p>
            </div>
          )
        )}

        {/* Default: grouped by category */}
        {!isSearching && !categoryFiltered && (
          <div className="space-y-12">
            {grouped.map((group) => {
              const preview = group.posts.slice(0, 3)
              const hasMore = group.posts.length > 3
              return (
                <section key={group.slug}>
                  <div className="flex items-baseline gap-4 mb-5">
                    <h2 className="font-headline text-lg font-bold shrink-0">{group.name}</h2>
                    <span className="text-xs text-muted-foreground font-medium">{group.posts.length}</span>
                    <div className="h-px flex-1 bg-border/60" />
                    {hasMore && (
                      <button
                        onClick={() => setActiveCategory(group.slug)}
                        className="text-xs text-primary hover:text-primary/80 font-medium transition-colors shrink-0"
                      >
                        {t('viewAll')}
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {preview.map((post) => (
                      <PostCard key={post._id} post={post} />
                    ))}
                  </div>
                </section>
              )
            })}

            {uncategorised.length > 0 && (
              <section>
                <div className="flex items-baseline gap-4 mb-5">
                  <h2 className="font-headline text-lg font-bold shrink-0 text-muted-foreground">{t('uncategorised')}</h2>
                  <div className="h-px flex-1 bg-border/60" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {uncategorised.map((post) => (
                    <PostCard key={post._id} post={post} />
                  ))}
                </div>
              </section>
            )}

            {articles.length === 0 && (
              <div className="text-center py-20 text-muted-foreground">
                <p className="font-headline font-bold">{t('noPosts')}</p>
                <p className="text-sm mt-1">{t('noPostsHelp')}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Tutorial Overlay */}
      <AnimatePresence>
        {tutorialOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-8">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setTutorialOpen(false)}
              className="absolute inset-0 bg-background/40 backdrop-blur-md cursor-pointer"
            />
            <BlogTutorial onClose={() => setTutorialOpen(false)} />
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

export function BlogBrowser({
  articles,
  categories,
  tutorial,
}: {
  articles: Post[]
  categories: Category[]
  tutorial?: any
}) {
  return (
    <Suspense>
      <BlogBrowserInner articles={articles} categories={categories} tutorial={tutorial} />
    </Suspense>
  )
}
