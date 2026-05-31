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
import gsap from 'gsap'
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

function formatDate(dateString: string | undefined, locale: string) {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString(locale, {
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

function PostCard({ post, locale }: { post: Post; locale: string }) {
  return (
    <Link
      href={`/blog/${post.slug?.current}`}
      className="group flex flex-col bg-card rounded-2xl border border-border/60 overflow-hidden transition-colors hover:border-border"
    >
      <div className="relative w-full aspect-[16/9] overflow-hidden bg-muted shrink-0">
        {post.thumbnailUrl && (
          <Image
            src={post.thumbnailUrl}
            alt={post.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-contain transition-transform duration-500 group-hover:scale-[1.02]"
          />
        )}
      </div>
      <div className="flex flex-col flex-1 p-6 gap-2">
        {post.category && (
          <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-primary">
            {post.category}
          </span>
        )}
        <h3 className="font-headline text-xl tracking-[-0.01em] leading-snug group-hover:text-muted-foreground transition-colors">
          {post.title}
        </h3>
        {post.excerpt && (
          <p className="text-sm text-muted-foreground leading-[1.55] flex-1 line-clamp-3">
            {post.excerpt}
          </p>
        )}
        <div className="mt-4 pt-3.5 border-t border-border/50 flex justify-between items-center text-xs text-muted-foreground/80">
          <span className="truncate">{post.authorName ?? ''}</span>
          <span className="shrink-0">{formatDate(post.publishedAt, locale)}</span>
        </div>
      </div>
    </Link>
  )
}

function SearchResultRow({ post, query, locale }: { post: SearchPost; query: string; locale: string }) {
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
          {[post.authorName, formatDate(post.publishedAt, locale)].filter(Boolean).join(' · ')}
        </p>
      </div>
    </Link>
  )
}

function BlogBrowserInner({
  articles,
  categories,
}: {
  articles: Post[]
  categories: Category[]
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
      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section className="px-6 md:px-12 pt-16 pb-8 max-w-[1200px] mx-auto">
        <h1 className="font-headline tracking-[-0.02em] leading-none text-[clamp(40px,5vw,72px)] mb-4">
          {t('heading')}
        </h1>
        <p className="text-muted-foreground text-lg max-w-[60ch]">
          {t('description')}
        </p>
      </section>

      {/* ── Search + tutorial ─────────────────────────────────────────────── */}
      <section className="px-6 md:px-12 max-w-[1200px] mx-auto">
        <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
          <div className="relative flex-1">
            <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/60 pointer-events-none" />
            <input
              type="text"
              placeholder={t('searchPlaceholder')}
              value={query}
              onChange={(e) => handleQueryChange(e.target.value)}
              className="w-full h-12 rounded-full bg-card border border-border/60 pl-11 pr-11 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 placeholder:text-muted-foreground transition-colors"
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
            className="inline-flex items-center justify-center gap-2 h-12 px-5 rounded-full bg-card border border-border/60 text-sm font-medium text-foreground hover:bg-primary/5 hover:text-primary hover:border-primary/30 transition-colors shrink-0"
          >
            <BookOpenIcon size={16} />
            {t('instructions')}
          </button>
        </div>
      </section>

      {/* ── Category chips ────────────────────────────────────────────────── */}
      {visibleCategories.length > 0 && (
        <section className="px-6 md:px-12 max-w-[1200px] mx-auto">
          <div className="flex flex-wrap gap-1.5 py-4 mt-6 border-y border-border/50">
            <button
              onClick={() => setActiveCategory(null)}
              className={cn(
                'cursor-pointer px-3.5 py-2 rounded-full text-[11px] font-semibold uppercase tracking-[0.14em] border transition-colors',
                !activeCategory && !query
                  ? 'border-primary text-primary bg-primary/10'
                  : 'border-border/50 text-muted-foreground hover:border-border hover:text-foreground'
              )}
            >
              {t('filterAll')}
            </button>
            {visibleCategories.map((cat) => (
              <button
                key={cat.slug}
                onClick={() => setActiveCategory(cat.slug)}
                className={cn(
                  'cursor-pointer px-3.5 py-2 rounded-full text-[11px] font-semibold uppercase tracking-[0.14em] border transition-colors',
                  activeCategory === cat.slug && !query
                    ? 'border-primary text-primary bg-primary/10'
                    : 'border-border/50 text-muted-foreground hover:border-border hover:text-foreground'
                )}
              >
                {cat.name}
                <span className="ml-1.5 opacity-50">{cat.count}</span>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* ── Content ───────────────────────────────────────────────────────── */}
      <div className="px-6 md:px-12 max-w-[1200px] mx-auto py-8 space-y-12">

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
                <SearchResultRow key={post._id} post={post} query={query.trim()} locale={locale} />
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {categoryFiltered.map((post) => (
                <PostCard key={post._id} post={post} locale={locale} />
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
                  <div className="flex items-baseline gap-4 mb-6">
                    <h2 className="font-headline text-2xl tracking-[-0.01em] shrink-0">{group.name}</h2>
                    <span className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground/70 font-medium">{group.posts.length}</span>
                    <div className="h-px flex-1 bg-border/50" />
                    {hasMore && (
                      <button
                        onClick={() => setActiveCategory(group.slug)}
                        className="text-[11px] uppercase tracking-[0.14em] font-semibold text-primary hover:text-primary/80 transition-colors shrink-0"
                      >
                        {t('viewAll')} →
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {preview.map((post) => (
                      <PostCard key={post._id} post={post} locale={locale} />
                    ))}
                  </div>
                </section>
              )
            })}

            {uncategorised.length > 0 && (
              <section>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {uncategorised.map((post) => (
                    <PostCard key={post._id} post={post} locale={locale} />
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
      <TutorialOverlay open={tutorialOpen} onClose={() => setTutorialOpen(false)} />
    </div>
  )
}

function TutorialOverlay({ open, onClose }: { open: boolean; onClose: () => void }) {
  const backdropRef = useRef<HTMLDivElement | null>(null)
  const [render, setRender] = useState(open)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (open) setRender(true)
  }, [open])

  useEffect(() => {
    const el = backdropRef.current
    if (!el) return
    if (open) {
      gsap.fromTo(el, { opacity: 0 }, { opacity: 1, duration: 0.2, ease: 'power2.out' })
    } else if (render) {
      gsap.to(el, {
        opacity: 0,
        duration: 0.2,
        ease: 'power2.out',
        onComplete: () => setRender(false),
      })
    }
  }, [open, render])

  if (!render) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-stretch sm:items-center justify-center sm:p-6">
      <div
        ref={backdropRef}
        onClick={onClose}
        className="absolute inset-0 bg-background/60 backdrop-blur-md cursor-pointer"
      />
      <BlogTutorial onClose={onClose} />
    </div>
  )
}

export function BlogBrowser({
  articles,
  categories,
}: {
  articles: Post[]
  categories: Category[]
}) {
  return (
    <Suspense>
      <BlogBrowserInner articles={articles} categories={categories} />
    </Suspense>
  )
}
