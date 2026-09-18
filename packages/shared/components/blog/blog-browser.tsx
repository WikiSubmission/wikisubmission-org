'use client'

import { useState, useCallback, useEffect, useRef, Suspense } from 'react'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import {
  SearchIcon,
  XIcon,
  BookOpenIcon,
  LayoutGrid,
  List,
  Clock,
  Calendar,
  ArrowRight,
  Sparkles,
  User,
  Tag,
} from 'lucide-react'
import { Spinner } from '../ui/spinner'
import { cn } from '../../lib/utils'
import { useTranslations, useLocale } from 'next-intl'
import gsap from 'gsap'
import { BlogTutorial } from './blog-tutorial'
import type { Category, Post, SearchPost } from '../../lib/blog-queries'

export type { Category, Post, SearchPost } from '../../lib/blog-queries'

// Default full-text search (web)
async function defaultSearchArticles(q: string, locale: string): Promise<SearchPost[]> {
  const res = await fetch(`/api/search/blog?q=${encodeURIComponent(q)}&locale=${locale}`)
  const data = await res.json()
  return data.articles ?? []
}

type BlogBrowserOptions = {
  hrefForSlug?: (slug: string) => string
  disableSearch?: boolean
  showTutorial?: boolean
  searchArticles?: (q: string, locale: string) => Promise<SearchPost[]>
}

const defaultHrefForSlug = (slug: string) => `/blog/${slug}`

function formatDate(dateString: string | undefined, locale: string) {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

function estimateReadingTime(text?: string): number {
  if (!text) return 5
  const words = text.trim().split(/\s+/).length
  return Math.max(3, Math.round(words / 40) + 4)
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
          <mark key={i} className="bg-[var(--ed-accent)]/20 text-[var(--ed-accent)] rounded-xs font-semibold px-0.5 not-italic">
            {part}
          </mark>
        ) : part
      )}
    </>
  )
}

/**
 * Modern Featured Lead Story Card
 */
function FeaturedStoryCard({
  post,
  locale,
  hrefForSlug,
}: {
  post: Post
  locale: string
  hrefForSlug: (slug: string) => string
}) {
  const readingTime = estimateReadingTime(post.excerpt)

  return (
    <Link
      href={hrefForSlug(post.slug.current)}
      className="group relative block overflow-hidden rounded-2xl border border-[var(--ed-rule)] bg-[var(--ed-surface)] shadow-sm transition-all duration-300 hover:border-[var(--ed-accent)] hover:shadow-xl"
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
        {/* Cover Artwork */}
        <div className="relative lg:col-span-7 aspect-[16/10] lg:aspect-auto min-h-[260px] sm:min-h-[340px] overflow-hidden bg-gradient-to-br from-[var(--ed-accent)]/10 via-[var(--ed-surface)] to-[var(--ed-accent)]/5">
          {post.thumbnailUrl ? (
            <Image
              src={post.thumbnailUrl}
              alt={post.title}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 60vw"
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center relative">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,var(--ed-accent)_1px,transparent_1px)] bg-[size:24px_24px] opacity-15" />
              <div className="relative z-10 space-y-2 max-w-md">
                <BookOpenIcon className="w-10 h-10 mx-auto text-[var(--ed-accent)] opacity-60" />
                <div className="font-[family-name:var(--font-cormorant)] text-2xl sm:text-3xl font-bold tracking-tight text-[var(--ed-fg)]">
                  {post.category || 'Editorial Monograph'}
                </div>
                <div className="font-[family-name:var(--font-jetbrains)] text-[11px] text-[var(--ed-fg-muted)] tracking-widest uppercase">
                  WikiSubmission Archive
                </div>
              </div>
            </div>
          )}
          <div className="absolute top-4 left-4 flex items-center gap-2 z-10">
            <span className="inline-flex items-center gap-1.5 rounded-md border border-[var(--ed-accent)]/40 bg-[var(--ed-bg)]/90 backdrop-blur-md px-2.5 py-1 font-[family-name:var(--font-glacial)] text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--ed-accent)] shadow-xs">
              <Sparkles size={12} />
              Featured Story
            </span>
          </div>
        </div>

        {/* Story Metadata & Prose */}
        <div className="lg:col-span-5 p-6 sm:p-8 lg:p-10 flex flex-col justify-between border-t lg:border-t-0 lg:border-l border-[var(--ed-rule)]">
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-[11px] font-[family-name:var(--font-glacial)] font-semibold uppercase tracking-[0.14em] text-[var(--ed-accent)]">
              {post.category && <span>{post.category}</span>}
              <span className="text-[var(--ed-rule)]">•</span>
              <span className="flex items-center gap-1 text-[var(--ed-fg-muted)] font-[family-name:var(--font-jetbrains)] text-[10.5px]">
                <Clock size={12} />
                {readingTime} min read
              </span>
            </div>

            <h2 className="font-[family-name:var(--font-cormorant)] text-[clamp(26px,2.8vw,38px)] font-semibold tracking-[-0.02em] leading-[1.12] text-[var(--ed-fg)] group-hover:text-[var(--ed-accent)] transition-colors">
              {post.title}
            </h2>

            {post.excerpt && (
              <p className="font-[family-name:var(--font-source-serif)] text-[15px] sm:text-[16px] leading-[1.65] text-[var(--ed-fg-muted)] line-clamp-4">
                {post.excerpt}
              </p>
            )}
          </div>

          <div className="pt-6 mt-6 border-t border-[var(--ed-rule)]/70 flex items-center justify-between">
            <div className="space-y-0.5">
              {post.authorName && (
                <div className="font-[family-name:var(--font-glacial)] font-bold text-xs uppercase tracking-wider text-[var(--ed-fg)]">
                  {post.authorName}
                </div>
              )}
              <div className="font-[family-name:var(--font-jetbrains)] text-[11px] text-[var(--ed-fg-muted)]">
                {formatDate(post.publishedAt, locale)}
              </div>
            </div>

            <span className="inline-flex items-center gap-1.5 font-[family-name:var(--font-glacial)] text-xs font-bold uppercase tracking-[0.14em] text-[var(--ed-accent)] group-hover:translate-x-1 transition-transform">
              Read Story <ArrowRight size={14} />
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}

/**
 * Modern Visual Article Card (Grid View)
 */
function ModernPostCard({
  post,
  locale,
  hrefForSlug,
}: {
  post: Post
  locale: string
  hrefForSlug: (slug: string) => string
}) {
  const readingTime = estimateReadingTime(post.excerpt)

  return (
    <Link
      href={hrefForSlug(post.slug.current)}
      className="group flex flex-col rounded-2xl border border-[var(--ed-rule)] bg-[var(--ed-surface)] overflow-hidden shadow-xs transition-all duration-300 hover:border-[var(--ed-accent)] hover:shadow-xl hover:-translate-y-1"
    >
      {/* Thumbnail */}
      <div className="relative w-full aspect-[16/10] overflow-hidden bg-gradient-to-br from-[var(--ed-accent)]/10 via-[var(--ed-surface)] to-[var(--ed-accent)]/5 shrink-0">
        {post.thumbnailUrl ? (
          <Image
            src={post.thumbnailUrl}
            alt={post.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center relative">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,var(--ed-accent)_1px,transparent_1px)] bg-[size:20px_20px] opacity-15" />
            <BookOpenIcon className="w-6 h-6 text-[var(--ed-accent)] opacity-40 mb-1" />
            <span className="relative z-10 font-[family-name:var(--font-glacial)] text-[10px] uppercase tracking-widest text-[var(--ed-fg-muted)] font-semibold">
              {post.category || 'Article'}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-5 sm:p-6 justify-between gap-4">
        <div className="space-y-2.5">
          <div className="flex items-center justify-between gap-2 text-[10px] font-[family-name:var(--font-glacial)] font-semibold uppercase tracking-[0.14em] text-[var(--ed-accent)]">
            <span>{post.category || 'Monograph'}</span>
            <span className="font-[family-name:var(--font-jetbrains)] text-[9.5px] text-[var(--ed-fg-muted)]">
              {readingTime}m read
            </span>
          </div>

          <h3 className="font-[family-name:var(--font-cormorant)] text-[20px] sm:text-[22px] font-semibold tracking-[-0.015em] leading-[1.2] text-[var(--ed-fg)] group-hover:text-[var(--ed-accent)] transition-colors line-clamp-2">
            {post.title}
          </h3>

          {post.excerpt && (
            <p className="font-[family-name:var(--font-source-serif)] text-[14px] leading-[1.6] text-[var(--ed-fg-muted)] line-clamp-3">
              {post.excerpt}
            </p>
          )}
        </div>

        <div className="pt-3.5 border-t border-[var(--ed-rule)]/60 flex items-center justify-between text-xs">
          <div className="truncate pr-2">
            <span className="font-[family-name:var(--font-glacial)] font-semibold uppercase tracking-wider text-[11px] text-[var(--ed-fg)] block truncate">
              {post.authorName || 'Anonymous'}
            </span>
            <span className="font-[family-name:var(--font-jetbrains)] text-[10.5px] text-[var(--ed-fg-muted)] block">
              {formatDate(post.publishedAt, locale)}
            </span>
          </div>

          <span className="shrink-0 p-1.5 rounded-full text-[var(--ed-fg-muted)] group-hover:text-[var(--ed-accent)] group-hover:translate-x-0.5 transition-all">
            <ArrowRight size={15} />
          </span>
        </div>
      </div>
    </Link>
  )
}

/**
 * Modern Compact Editorial Row (List View)
 */
function ModernPostRow({
  post,
  locale,
  hrefForSlug,
}: {
  post: Post
  locale: string
  hrefForSlug: (slug: string) => string
}) {
  const readingTime = estimateReadingTime(post.excerpt)

  return (
    <Link
      href={hrefForSlug(post.slug.current)}
      className="group flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 p-4 sm:p-5 rounded-xl border border-[var(--ed-rule)] bg-[var(--ed-surface)] transition-all duration-200 hover:border-[var(--ed-accent)] hover:shadow-md"
    >
      <div className="relative w-full sm:w-44 aspect-[16/10] sm:aspect-[4/3] rounded-lg overflow-hidden bg-gradient-to-br from-[var(--ed-accent)]/10 via-[var(--ed-surface)] to-[var(--ed-accent)]/5 shrink-0">
        {post.thumbnailUrl ? (
          <Image
            src={post.thumbnailUrl}
            alt={post.title}
            fill
            sizes="176px"
            className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-3 text-center relative">
            <BookOpenIcon className="w-5 h-5 text-[var(--ed-accent)] opacity-40 mb-1" />
            <span className="font-[family-name:var(--font-glacial)] text-[9.5px] uppercase tracking-wider text-[var(--ed-fg-muted)] font-semibold truncate max-w-[90%]">
              {post.category || 'Article'}
            </span>
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0 space-y-1.5">
        <div className="flex items-center gap-2.5 text-[10.5px] font-[family-name:var(--font-glacial)] font-semibold uppercase tracking-[0.14em] text-[var(--ed-accent)]">
          <span>{post.category || 'Article'}</span>
          <span className="text-[var(--ed-rule)]">•</span>
          <span className="font-[family-name:var(--font-jetbrains)] text-[10px] text-[var(--ed-fg-muted)]">
            {readingTime} min read
          </span>
        </div>

        <h3 className="font-[family-name:var(--font-cormorant)] text-[20px] font-semibold tracking-[-0.01em] leading-snug text-[var(--ed-fg)] group-hover:text-[var(--ed-accent)] transition-colors truncate">
          {post.title}
        </h3>

        {post.excerpt && (
          <p className="font-[family-name:var(--font-source-serif)] text-[13.5px] leading-relaxed text-[var(--ed-fg-muted)] line-clamp-2">
            {post.excerpt}
          </p>
        )}

        <div className="flex items-center gap-3 pt-1 text-[11px] font-[family-name:var(--font-jetbrains)] text-[var(--ed-fg-muted)]">
          {post.authorName && <span className="text-[var(--ed-fg)] font-sans font-medium">{post.authorName}</span>}
          <span>{formatDate(post.publishedAt, locale)}</span>
        </div>
      </div>

      <span className="hidden sm:inline-flex p-2 rounded-full text-[var(--ed-fg-muted)] group-hover:text-[var(--ed-accent)] group-hover:translate-x-1 transition-all shrink-0">
        <ArrowRight size={16} />
      </span>
    </Link>
  )
}

function SearchResultRow({
  post,
  query,
  locale,
  hrefForSlug,
}: {
  post: SearchPost
  query: string
  locale: string
  hrefForSlug: (slug: string) => string
}) {
  const hasBodySnippets = post.snippets && post.snippets.length > 0
  const excerptHasMatch = post.excerpt?.toLowerCase().includes(query.toLowerCase())

  return (
    <Link
      href={hrefForSlug(post.slug)}
      className="group flex flex-col sm:flex-row sm:items-start bg-[var(--ed-surface)] rounded-xl border border-[var(--ed-rule)] overflow-hidden transition-colors hover:border-[var(--ed-accent)] p-4 gap-4"
    >
      <div className="w-full sm:shrink-0 sm:w-28 sm:h-20 rounded-lg overflow-hidden bg-gradient-to-br from-[var(--ed-accent)]/10 via-[var(--ed-surface)] to-[var(--ed-accent)]/5 relative">
        {post.thumbnailUrl ? (
          <Image
            src={post.thumbnailUrl}
            alt={post.title}
            fill
            sizes="112px"
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[var(--ed-accent)] opacity-40">
            <BookOpenIcon size={18} />
          </div>
        )}
      </div>
      <div className="flex flex-col flex-1 min-w-0 gap-1.5">
        {post.category && (
          <span className="font-[family-name:var(--font-glacial)] text-[10px] font-semibold uppercase tracking-widest text-[var(--ed-accent)]">
            {post.category}
          </span>
        )}
        <h3 className="font-[family-name:var(--font-cormorant)] font-semibold text-[18px] leading-snug text-[var(--ed-fg)] group-hover:text-[var(--ed-accent)] transition-colors">
          <Highlight text={post.title} query={query} />
        </h3>

        {post.excerpt && excerptHasMatch && (
          <p className="text-xs font-[family-name:var(--font-source-serif)] text-[var(--ed-fg-muted)] leading-relaxed">
            <Highlight text={post.excerpt} query={query} />
          </p>
        )}

        {hasBodySnippets && (
          <div className="space-y-1 mt-0.5">
            {post.snippets!.map((snippet: string, i: number) => (
              <p key={i} className="text-xs font-[family-name:var(--font-source-serif)] text-[var(--ed-fg-muted)] leading-relaxed border-l-2 border-[var(--ed-accent)]/50 pl-2">
                <Highlight text={snippet} query={query} />
              </p>
            ))}
          </div>
        )}

        <p className="font-[family-name:var(--font-jetbrains)] text-[10.5px] text-[var(--ed-fg-muted)] mt-1">
          {[post.authorName, formatDate(post.publishedAt, locale)].filter(Boolean).join(' · ')}
        </p>
      </div>
    </Link>
  )
}

function BlogBrowserInner({
  articles,
  categories,
  hrefForSlug = defaultHrefForSlug,
  disableSearch = false,
  showTutorial = true,
  searchArticles = defaultSearchArticles,
}: {
  articles: Post[]
  categories: Category[]
} & BlogBrowserOptions) {
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
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [navHeight, setNavHeight] = useState(55)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Dynamically track SiteNav height to eliminate any gap/leak under the sticky header when scrolling
  useEffect(() => {
    const nav = document.querySelector<HTMLElement>('nav[data-site-nav]')
    if (!nav) return

    const update = () => {
      const rect = nav.getBoundingClientRect()
      // 1px overlap seamlessly aligns with the header border without subpixel gap
      setNavHeight(Math.max(0, Math.floor(rect.height) - 1))
    }

    update()
    const ro = new ResizeObserver(update)
    ro.observe(nav)
    window.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)
    return () => {
      ro.disconnect()
      window.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
    }
  }, [])

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

  useEffect(() => {
    if (disableSearch) return
    if (debounceRef.current) clearTimeout(debounceRef.current)
    const q = query.trim()
    if (q.length < 2) {
      setSearchResults(null)
      setSearching(false)
      return
    }
    setSearching(true)
    debounceRef.current = setTimeout(async () => {
      try {
        setSearchResults(await searchArticles(q, locale))
      } catch {
        setSearchResults([])
      } finally {
        setSearching(false)
      }
    }, 300)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [query, locale, disableSearch, searchArticles])

  // Order articles with newest first.
  // In the backend seed migration, the newest article was inserted first (id 1: "you-always-deal-with-god").
  // If published timestamps are within 60s (bulk migration batch), sort by id ASC so id 1 comes first.
  // Otherwise sort by publishedAt descending.
  const sortedArticles = [...articles].sort((a, b) => {
    const dateA = a.publishedAt ? new Date(a.publishedAt).getTime() : 0
    const dateB = b.publishedAt ? new Date(b.publishedAt).getTime() : 0
    const diff = dateB - dateA
    if (Math.abs(diff) < 60000) {
      return Number(a._id) - Number(b._id)
    }
    return diff
  })

  const visibleCategories = categories.filter((c) => c.count > 0)
  const isSearching = !disableSearch && query.trim().length >= 2

  const categoryFiltered = activeCategory
    ? sortedArticles.filter((a) => a.categorySlug === activeCategory)
    : null

  const grouped = visibleCategories
    .map((cat) => ({ ...cat, posts: sortedArticles.filter((a) => a.categorySlug === cat.slug) }))
    .filter((g) => g.posts.length > 0)

  const headingText = t('heading') || 'Articles & Essays'
  const words = headingText.split(' ')
  const firstPart = words.slice(0, -1).join(' ')
  const lastWord = words[words.length - 1]

  // If viewing all with no search, pick the newest article as featured lead story
  const featuredArticle = !activeCategory && !isSearching && sortedArticles.length > 0 ? sortedArticles[0] : null
  const secondaryArticles = featuredArticle ? sortedArticles.slice(1) : sortedArticles

  return (
    <div className="min-h-screen bg-[var(--ed-bg-alt)] text-[var(--ed-fg)] font-[family-name:var(--font-source-serif)] pb-24 antialiased">
      {/* ── Editorial Hero Header (Preserved exactly as requested) ────────── */}
      <section className="border-b border-[var(--ed-rule)] bg-[var(--ed-bg)]">
        <div className="max-w-6xl mx-auto px-6 pt-14 pb-12 sm:pt-20 sm:pb-16">
          <div className="flex items-center gap-2 text-[11px] font-[family-name:var(--font-jetbrains)] tracking-widest text-[var(--ed-accent)] uppercase mb-4">
            <span>ARTICLES &amp; REFLECTIONS</span>
            <span>·</span>
            <span>WIKISUBMISSION</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_300px] gap-8 lg:gap-14 items-end">
            <div>
              <h1
                style={{
                  fontFamily: 'var(--font-cormorant), Georgia, serif',
                  fontSize: 'clamp(48px, 9vw, 88px)',
                  fontWeight: 400,
                  lineHeight: 0.95,
                  letterSpacing: '-0.035em',
                }}
                className="text-[var(--ed-fg)]"
              >
                {firstPart ? `${firstPart} ` : ''}
                <span className="italic text-[var(--ed-fg-muted)] font-light">{lastWord}</span>
              </h1>
              <p
                style={{
                  fontFamily: 'var(--font-source-serif), Georgia, serif',
                  fontSize: 'clamp(15px, 3.6vw, 17px)',
                  lineHeight: 1.65,
                }}
                className="text-[var(--ed-fg-muted)] max-w-[64ch] mt-6 leading-relaxed"
              >
                {t('description')}
              </p>
            </div>

            {/* Quick Metadata Summary Card */}
            <div className="border-t lg:border-t-0 lg:border-l border-[var(--ed-rule)] pt-5 lg:pt-0 lg:pl-8 flex flex-col gap-3 font-[family-name:var(--font-jetbrains)] text-xs text-[var(--ed-fg-muted)]">
              <div className="flex items-center justify-between">
                <span className="uppercase tracking-wider text-[10px]">Published</span>
                <span className="font-semibold text-[var(--ed-fg)]">{articles.length} Articles</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="uppercase tracking-wider text-[10px]">Topics</span>
                <span className="font-semibold text-[var(--ed-fg)]">{visibleCategories.length} Categories</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="uppercase tracking-wider text-[10px]">Edition</span>
                <span className="text-[var(--ed-accent)] font-semibold uppercase">{locale}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Modern Interactive Controls Deck (Search, Category Filters, Views) ── */}
      <section
        style={{ top: `${navHeight}px` }}
        className="sticky z-30 border-b border-[var(--ed-rule)]/80 bg-[var(--ed-surface)]/95 backdrop-blur-md shadow-xs transition-[top] duration-150 ease-out"
      >
        <div className="max-w-6xl mx-auto px-6 py-4 space-y-4">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            {/* Search Input */}
            {!disableSearch && (
              <div className="relative flex-1 max-w-lg">
                <SearchIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-[var(--ed-fg-muted)] pointer-events-none" />
                <input
                  type="text"
                  placeholder={t('searchPlaceholder')}
                  value={query}
                  onChange={(e) => handleQueryChange(e.target.value)}
                  className="w-full h-10 rounded-xl bg-[var(--ed-bg)] border border-[var(--ed-rule)] pl-10 pr-10 text-sm font-[family-name:var(--font-source-serif)] text-[var(--ed-fg)] placeholder:text-[var(--ed-fg-muted)] focus:outline-none focus:border-[var(--ed-accent)] focus:ring-2 focus:ring-[var(--ed-accent)]/20 transition-all shadow-xs"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  {searching ? (
                    <Spinner className="size-3.5 text-[var(--ed-fg-muted)]" />
                  ) : query ? (
                    <button
                      onClick={clearSearch}
                      className="p-1 rounded text-[var(--ed-fg-muted)] hover:text-[var(--ed-fg)] transition-colors"
                      aria-label="Clear search"
                    >
                      <XIcon className="size-3.5" />
                    </button>
                  ) : null}
                </div>
              </div>
            )}

            {/* Right action tools: View Switcher & Instructions */}
            <div className="flex items-center gap-2 self-end md:self-auto shrink-0">
              {/* Grid / List Switcher */}
              <div className="flex items-center rounded-lg border border-[var(--ed-rule)] bg-[var(--ed-bg)] p-0.5">
                <button
                  type="button"
                  onClick={() => setViewMode('grid')}
                  aria-label="Grid view"
                  className={cn(
                    'p-1.5 rounded-md transition-colors',
                    viewMode === 'grid'
                      ? 'bg-[var(--ed-surface)] text-[var(--ed-accent)] shadow-xs font-bold'
                      : 'text-[var(--ed-fg-muted)] hover:text-[var(--ed-fg)]'
                  )}
                >
                  <LayoutGrid size={15} />
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('list')}
                  aria-label="List view"
                  className={cn(
                    'p-1.5 rounded-md transition-colors',
                    viewMode === 'list'
                      ? 'bg-[var(--ed-surface)] text-[var(--ed-accent)] shadow-xs font-bold'
                      : 'text-[var(--ed-fg-muted)] hover:text-[var(--ed-fg)]'
                  )}
                >
                  <List size={15} />
                </button>
              </div>

              {/* Instructions / Tutorial */}
              {showTutorial && (
                <button
                  onClick={() => setTutorialOpen(true)}
                  className="inline-flex items-center justify-center h-10 px-4 rounded-xl border border-[var(--ed-rule)] bg-[var(--ed-bg)] text-xs font-[family-name:var(--font-glacial)] font-semibold uppercase tracking-wider text-[var(--ed-fg)] hover:border-[var(--ed-accent)] hover:text-[var(--ed-accent)] transition-colors shadow-xs"
                >
                  <span>{t('instructions')}</span>
                </button>
              )}
            </div>
          </div>

          {/* Category Filter Chips */}
          {visibleCategories.length > 0 && (
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 pt-1 text-xs">
              <button
                onClick={() => setActiveCategory(null)}
                className={cn(
                  'cursor-pointer px-3 py-1.5 rounded-lg text-[11px] font-[family-name:var(--font-glacial)] font-semibold uppercase tracking-[0.14em] border transition-all whitespace-nowrap',
                  !activeCategory && !query
                    ? 'border-[var(--ed-accent)] text-[var(--ed-accent)] bg-[var(--ed-accent)]/15 shadow-xs'
                    : 'border-[var(--ed-rule)] text-[var(--ed-fg-muted)] hover:border-[var(--ed-fg-muted)] hover:text-[var(--ed-fg)] bg-[var(--ed-bg)]'
                )}
              >
                {t('filterAll')} ({articles.length})
              </button>

              {visibleCategories.map((cat) => (
                <button
                  key={cat.slug}
                  onClick={() => setActiveCategory(cat.slug)}
                  className={cn(
                    'cursor-pointer px-3 py-1.5 rounded-lg text-[11px] font-[family-name:var(--font-glacial)] font-semibold uppercase tracking-[0.14em] border transition-all whitespace-nowrap flex items-center gap-1.5',
                    activeCategory === cat.slug && !query
                      ? 'border-[var(--ed-accent)] text-[var(--ed-accent)] bg-[var(--ed-accent)]/15 shadow-xs'
                      : 'border-[var(--ed-rule)] text-[var(--ed-fg-muted)] hover:border-[var(--ed-fg-muted)] hover:text-[var(--ed-fg)] bg-[var(--ed-bg)]'
                  )}
                >
                  <span>{cat.name}</span>
                  <span className="opacity-60 text-[10px] font-[family-name:var(--font-jetbrains)]">{cat.count}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── Main Content Area ────────────────────────────────────────────── */}
      <main className="max-w-6xl mx-auto px-6 pt-10 space-y-12">
        {/* 1. Search Results Mode */}
        {isSearching && (
          <div>
            {searchResults === null ? (
              <div className="flex justify-center py-20">
                <Spinner className="size-6 text-[var(--ed-accent)]" />
              </div>
            ) : searchResults.length > 0 ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[var(--ed-rule)]">
                  <p className="font-[family-name:var(--font-jetbrains)] text-xs text-[var(--ed-fg-muted)]">
                    {searchResults.length} result{searchResults.length !== 1 ? 's' : ''} for &ldquo;{query.trim()}&rdquo;
                  </p>
                  <button
                    onClick={clearSearch}
                    className="font-[family-name:var(--font-glacial)] text-xs font-semibold uppercase tracking-wider text-[var(--ed-accent)] hover:underline"
                  >
                    Clear Search
                  </button>
                </div>
                <div className="space-y-3">
                  {searchResults.map((post) => (
                    <SearchResultRow
                      key={post._id}
                      post={post}
                      query={query.trim()}
                      locale={locale}
                      hrefForSlug={hrefForSlug}
                    />
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-24 text-[var(--ed-fg-muted)] space-y-2">
                <p className="font-[family-name:var(--font-cormorant)] text-2xl font-semibold text-[var(--ed-fg)]">{t('noResults')}</p>
                <p className="text-sm font-[family-name:var(--font-source-serif)]">{t('noResultsHelp')}</p>
                <button
                  onClick={clearSearch}
                  className="mt-4 inline-block px-4 py-2 rounded-lg border border-[var(--ed-rule)] text-xs font-[family-name:var(--font-glacial)] font-semibold uppercase tracking-wider text-[var(--ed-accent)] hover:border-[var(--ed-accent)]"
                >
                  Reset Filter
                </button>
              </div>
            )}
          </div>
        )}

        {/* 2. Category Filter Mode */}
        {!isSearching && categoryFiltered && (
          <div>
            <div className="flex items-baseline justify-between mb-8 pb-3 border-b border-[var(--ed-rule)]">
              <div className="flex items-baseline gap-3">
                <h2 className="font-[family-name:var(--font-cormorant)] text-3xl font-semibold text-[var(--ed-fg)]">
                  {visibleCategories.find((c) => c.slug === activeCategory)?.name || activeCategory}
                </h2>
                <span className="font-[family-name:var(--font-jetbrains)] text-xs text-[var(--ed-fg-muted)]">
                  {categoryFiltered.length} articles
                </span>
              </div>
              <button
                onClick={() => setActiveCategory(null)}
                className="font-[family-name:var(--font-glacial)] text-xs font-semibold uppercase tracking-wider text-[var(--ed-accent)] hover:underline"
              >
                View All Categories
              </button>
            </div>

            {categoryFiltered.length > 0 ? (
              viewMode === 'grid' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {categoryFiltered.map((post) => (
                    <ModernPostCard key={post._id} post={post} locale={locale} hrefForSlug={hrefForSlug} />
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {categoryFiltered.map((post) => (
                    <ModernPostRow key={post._id} post={post} locale={locale} hrefForSlug={hrefForSlug} />
                  ))}
                </div>
              )
            ) : (
              <div className="text-center py-20 text-[var(--ed-fg-muted)]">
                <p className="font-[family-name:var(--font-cormorant)] text-2xl">{t('noResults')}</p>
              </div>
            )}
          </div>
        )}

        {/* 3. Default All Articles Mode with Featured Lead Story */}
        {!isSearching && !categoryFiltered && (
          <div className="space-y-14">
            {/* Featured Story Spotlight */}
            {featuredArticle && (
              <section>
                <FeaturedStoryCard
                  post={featuredArticle}
                  locale={locale}
                  hrefForSlug={hrefForSlug}
                />
              </section>
            )}

            {/* Remaining Articles Archive */}
            {secondaryArticles.length > 0 && (
              <section className="space-y-6">
                <div className="flex items-baseline justify-between pb-3 border-b border-[var(--ed-rule)]">
                  <h2 className="font-[family-name:var(--font-cormorant)] text-2xl sm:text-3xl font-semibold text-[var(--ed-fg)]">
                    All Monographs &amp; Research
                  </h2>
                  <span className="font-[family-name:var(--font-jetbrains)] text-xs text-[var(--ed-fg-muted)]">
                    {articles.length} publications
                  </span>
                </div>

                {viewMode === 'grid' ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {secondaryArticles.map((post: Post) => (
                      <ModernPostCard key={post._id} post={post} locale={locale} hrefForSlug={hrefForSlug} />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-3.5">
                    {secondaryArticles.map((post: Post) => (
                      <ModernPostRow key={post._id} post={post} locale={locale} hrefForSlug={hrefForSlug} />
                    ))}
                  </div>
                )}
              </section>
            )}

            {articles.length === 0 && (
              <div className="text-center py-24 text-[var(--ed-fg-muted)]">
                <p className="font-[family-name:var(--font-cormorant)] text-2xl font-bold text-[var(--ed-fg)]">{t('noPosts')}</p>
                <p className="text-sm mt-1">{t('noPostsHelp')}</p>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Tutorial Overlay */}
      <TutorialOverlay open={tutorialOpen} onClose={() => setTutorialOpen(false)} />
    </div>
  )
}

function TutorialOverlay({ open, onClose }: { open: boolean; onClose: () => void }) {
  const backdropRef = useRef<HTMLDivElement | null>(null)
  const [render, setRender] = useState(open)

  useEffect(() => {
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
        className="absolute inset-0 bg-background/70 backdrop-blur-md cursor-pointer"
      />
      <BlogTutorial onClose={onClose} />
    </div>
  )
}

export function BlogBrowser({
  articles,
  categories,
  ...options
}: {
  articles: Post[]
  categories: Category[]
} & BlogBrowserOptions) {
  return (
    <Suspense>
      <BlogBrowserInner articles={articles} categories={categories} {...options} />
    </Suspense>
  )
}
