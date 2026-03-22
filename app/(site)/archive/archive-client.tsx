'use client'

import { useState, useEffect, useCallback, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import {
  SearchIcon,
  AlertCircleIcon,
  PlayIcon,
  NewspaperIcon,
  ArrowUpRight,
  InfoIcon,
} from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { ws } from '@/lib/wikisubmission-sdk'
import { highlightMarkdown } from '@/lib/highlight-markdown'
import Image from 'next/image'
import Link from 'next/link'
import type { Database } from 'wikisubmission-sdk'
import { useTranslations } from 'next-intl'
import { cn } from '@/lib/utils'

type MediaRow = Database['public']['Tables']['ws_media']['Row']
type NewsletterRow = Database['public']['Tables']['ws_newsletters']['Row']

export default function ArchiveClient() {
  const t = useTranslations('search')
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="border-b border-border/40 bg-muted/30">
        <div className="max-w-5xl mx-auto px-6 py-12">
          <span className="inline-block px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-bold mb-4">
            Archive
          </span>
          <h1 className="font-headline text-4xl md:text-5xl font-extrabold tracking-tight mb-3">
            Media Archive
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl">
            Search sermons, programs, and newsletters from the Submission
            community.
          </p>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-6 py-8">
        <Suspense
          fallback={
            <div className="text-center opacity-20 py-12">
              <PlayIcon className="size-8 mx-auto animate-spin" />
            </div>
          }
        >
          <ArchiveContent />
        </Suspense>
      </div>
    </div>
  )
}

function ArchiveContent() {
  const t = useTranslations('search')
  const tCommon = useTranslations('common')
  const searchParams = useSearchParams()
  const router = useRouter()
  const initialQuery = searchParams.get('q') || ''

  const [searchQuery, setSearchQuery] = useState(initialQuery)
  const [activeType, setActiveType] = useState(
    searchParams.get('type') || 'media'
  )
  const [mediaResults, setMediaResults] = useState<MediaRow[] | null>(null)
  const [newsletterResults, setNewsletterResults] = useState<
    NewsletterRow[] | null
  >(null)
  const [performedQuery, setPerformedQuery] = useState(initialQuery)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedCategories, setSelectedCategories] = useState<string[]>([
    'programs',
    'sermons',
    'audios',
  ])

  const performSearch = useCallback(
    async (q: string) => {
      if (!q.trim()) {
        setMediaResults(null)
        setNewsletterResults(null)
        return
      }
      setLoading(true)
      setError(null)
      try {
        const [mediaResponse, newsletterResponse] = await Promise.all([
          ws.Media.query(q, { highlight: true }),
          ws.Newsletters.query(q, { highlight: true }),
        ])
        setMediaResults(
          mediaResponse?.data ||
            (Array.isArray(mediaResponse) ? mediaResponse : [])
        )
        setNewsletterResults(
          newsletterResponse?.data ||
            (Array.isArray(newsletterResponse) ? newsletterResponse : [])
        )
        setPerformedQuery(q)
      } catch (err) {
        setError(err instanceof Error ? err.message : tCommon('error'))
        setMediaResults(null)
        setNewsletterResults(null)
      } finally {
        setLoading(false)
      }
    },
    [tCommon]
  )

  // Auto-switch tab if current has no results
  useEffect(() => {
    if (loading || !mediaResults || !newsletterResults) return
    const mCount = mediaResults.length
    const nCount = newsletterResults.length
    const currentType = searchParams.get('type') || activeType
    const currentCount = currentType === 'media' ? mCount : nCount
    if (currentCount === 0 && mCount + nCount > 0) {
      setActiveType(mCount > 0 ? 'media' : 'newsletters')
    }
  }, [mediaResults, newsletterResults, loading, searchParams, activeType])

  useEffect(() => {
    if (initialQuery) performSearch(initialQuery)
    setSearchQuery(initialQuery)
  }, [initialQuery, performSearch])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = searchQuery.trim()
    const params = new URLSearchParams(searchParams.toString())
    params.set('q', trimmed)
    router.push(`/archive?${params.toString()}`)
  }

  const handleTypeChange = (value: string) => {
    setActiveType(value)
    const params = new URLSearchParams(searchParams.toString())
    params.set('type', value)
    router.push(`/archive?${params.toString()}`, { scroll: false })
  }

  const mCount = mediaResults?.length ?? 0
  const nCount = newsletterResults?.length ?? 0

  return (
    <div className="space-y-6">
      {/* Search bar */}
      <form onSubmit={handleSearch} className="relative max-w-xl">
        <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <input
          type="search"
          placeholder="Search sermons, programs, newsletters…"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full h-12 rounded-lg bg-muted/50 border border-border pl-11 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 placeholder:text-muted-foreground"
        />
      </form>

      {loading && <ArchiveLoadingSkeleton />}

      {error && (
        <div className="flex items-center gap-2 text-destructive py-8 justify-center">
          <AlertCircleIcon className="size-4" />
          <span className="text-sm font-medium">{error}</span>
        </div>
      )}

      {mediaResults && newsletterResults && (
        <>
          {mCount + nCount === 0 ? (
            <div className="text-center py-20 text-muted-foreground">
              <SearchIcon className="size-12 mx-auto mb-4 opacity-10" />
              <p className="text-lg font-headline font-bold">
                {t('noResults', { query: performedQuery })}
              </p>
              <p className="text-sm opacity-60 mt-1">{t('noResultsHelp')}</p>
            </div>
          ) : (
            <>
              {/* Pill tabs */}
              <div className="flex gap-2 border-b border-border/40 pb-4 overflow-x-auto no-scrollbar">
                {mCount > 0 && (
                  <button
                    onClick={() => handleTypeChange('media')}
                    className={cn(
                      'flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold whitespace-nowrap transition-colors',
                      activeType === 'media'
                        ? 'bg-primary/10 text-primary'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                    )}
                  >
                    <PlayIcon className="size-3.5" />
                    Videos ({mCount})
                  </button>
                )}
                {nCount > 0 && (
                  <button
                    onClick={() => handleTypeChange('newsletters')}
                    className={cn(
                      'flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold whitespace-nowrap transition-colors',
                      activeType === 'newsletters'
                        ? 'bg-primary/10 text-primary'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                    )}
                  >
                    <NewspaperIcon className="size-3.5" />
                    Newsletters ({nCount})
                  </button>
                )}
              </div>

              {activeType === 'media' && mCount > 0 && (
                <MediaSection
                  results={mediaResults}
                  selectedCategories={selectedCategories}
                  setSelectedCategories={setSelectedCategories}
                />
              )}
              {activeType === 'newsletters' && nCount > 0 && (
                <NewsletterSection results={newsletterResults} />
              )}
            </>
          )}
        </>
      )}
    </div>
  )
}

function ArchiveLoadingSkeleton() {
  return (
    <div className="space-y-4 pt-4 animate-pulse">
      {[1, 2, 3].map((i) => (
        <div key={i} className="md:flex gap-6 items-start p-6 bg-muted/30 rounded-xl">
          <Skeleton className="shrink-0 w-32 aspect-video rounded-lg" />
          <div className="flex-1 space-y-3 mt-3 md:mt-0">
            <Skeleton className="h-5 w-2/3 rounded" />
            <Skeleton className="h-4 w-full rounded" />
            <Skeleton className="h-4 w-4/5 rounded" />
          </div>
        </div>
      ))}
    </div>
  )
}

/** Renders <b>…</b> as highlighted spans */
function HighlightText({ text }: { text?: string | null }) {
  if (!text) return null
  return (
    <>
      {text.split(/(<b>.*?<\/b>)/g).map((part, i) =>
        part.startsWith('<b>') && part.endsWith('</b>') ? (
          <span
            key={i}
            className="bg-primary/10 text-primary rounded-sm font-bold"
          >
            {part.slice(3, -4)}
          </span>
        ) : (
          part || null
        )
      )}
    </>
  )
}

function MediaSection({
  results,
  selectedCategories,
  setSelectedCategories,
}: {
  results: MediaRow[]
  selectedCategories: string[]
  setSelectedCategories: (cats: string[]) => void
}) {
  const t = useTranslations('search')
  const categories = ['programs', 'sermons', 'audios']
  const hasCategorySupport = categories.some(
    (cat) => results.filter((item) => item.category?.toLowerCase() === cat).length > 0
  )

  const categoryPriority: Record<string, number> = { programs: 1, sermons: 2, audios: 3 }
  const filtered = results
    .filter(
      (item) =>
        !item.category || selectedCategories.includes(item.category.toLowerCase())
    )
    .sort((a, b) => {
      const aP = categoryPriority[a.category?.toLowerCase() || ''] || 99
      const bP = categoryPriority[b.category?.toLowerCase() || ''] || 99
      return aP - bP
    })

  const groups: Record<string, MediaRow[]> = {}
  filtered.forEach((item) => {
    const id = item.youtube_id
    if (!groups[id]) groups[id] = []
    groups[id].push(item)
  })

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
      {hasCategorySupport && (
        <div className="flex flex-wrap items-center gap-4 py-2">
          {categories.map((cat) => {
            const count = results.filter((item) => item.category?.toLowerCase() === cat).length
            if (count === 0) return null
            return (
              <div key={cat} className="flex items-center gap-2 cursor-pointer">
                <Checkbox
                  id={`cat-${cat}`}
                  checked={selectedCategories.includes(cat)}
                  onCheckedChange={(checked) => {
                    setSelectedCategories(
                      checked
                        ? [...selectedCategories, cat]
                        : selectedCategories.filter((c) => c !== cat)
                    )
                  }}
                  className="border-primary/30 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                />
                <Label
                  htmlFor={`cat-${cat}`}
                  className="text-xs uppercase tracking-widest font-bold cursor-pointer flex items-center gap-1.5"
                >
                  {cat}
                  <span className="bg-muted px-1.5 py-0.5 rounded-full text-muted-foreground">
                    {count}
                  </span>
                </Label>
              </div>
            )
          })}
        </div>
      )}

      <p className="text-xs text-muted-foreground flex items-start gap-2">
        <InfoIcon className="text-primary size-3.5 shrink-0 mt-0.5" />
        {t('disclaimer')}
      </p>

      {filtered.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          {t('noResultsForCategories')}
        </div>
      ) : (
        Object.entries(groups).map(([id, items]) => (
          <MediaCard key={id} items={items} />
        ))
      )}
    </div>
  )
}

function NewsletterSection({ results }: { results: NewsletterRow[] }) {
  const groups: Record<string, NewsletterRow[]> = {}
  results.forEach((item) => {
    const id = `${item.year}_${item.month}`
    if (!groups[id]) groups[id] = []
    groups[id].push(item)
  })

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
      {Object.entries(groups).map(([id, items]) => (
        <NewsletterCard key={id} items={items} />
      ))}
    </div>
  )
}

function MediaCard({ items }: { items: MediaRow[] }) {
  return (
    <div className="group bg-background rounded-xl editorial-shadow border border-border/40 overflow-hidden transition-all hover:-translate-y-0.5">
      <div className="md:flex gap-0">
        {/* Thumbnail */}
        <div className="relative shrink-0 w-full md:w-48 aspect-video md:aspect-auto overflow-hidden bg-muted">
          <Image
            src={`https://img.youtube.com/vi/${items[0].youtube_id}/mqdefault.jpg`}
            alt={items[0].title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>

        {/* Content */}
        <div className="flex-1 p-5 space-y-3 min-w-0">
          <h3 className="font-headline font-bold text-base leading-snug">
            {items[0].title}
          </h3>
          <div className="space-y-2">
            {items.map((item, idx) => (
              <div key={idx} className="flex items-start gap-3 text-sm text-muted-foreground">
                <Link
                  href={`https://www.youtube.com/watch?v=${item.youtube_id}&t=${item.youtube_timestamp}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 bg-primary/10 text-primary px-2.5 py-1 rounded-full hover:bg-primary/20 transition-colors shrink-0 mt-0.5"
                >
                  <PlayIcon className="size-3" />
                  <span className="text-[10px] font-mono font-bold">{item.start_timestamp}</span>
                </Link>
                <p className="leading-relaxed flex-1 min-w-0">
                  <HighlightText text={item.transcript} />
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function NewsletterCard({ items }: { items: NewsletterRow[] }) {
  const firstItem = items[0]
  return (
    <div className="group bg-background rounded-xl editorial-shadow border border-border/40 p-6 transition-all hover:-translate-y-0.5">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2">
          <NewspaperIcon className="size-4 text-primary" />
          <h3 className="font-headline font-bold">
            {firstItem.month} {firstItem.year}
          </h3>
        </div>
        <Link
          href={`https://library.wikisubmission.org/file/sp/${firstItem.year}_${firstItem.month}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 bg-muted px-2.5 py-1 rounded-full text-xs font-bold hover:bg-muted/80 transition-colors"
        >
          <ArrowUpRight className="size-3" />
          PDF
        </Link>
      </div>
      <div className="space-y-2">
        {items.map((item, idx) => (
          <div key={idx} className="flex items-start gap-3 text-sm text-muted-foreground">
            <Link
              href={`https://masjidtucson.org/publications/books/sp/${item.year}/${item.month}/page${item.page}.html`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 bg-primary/10 text-primary px-2.5 py-1 rounded-full hover:bg-primary/20 transition-colors shrink-0 mt-0.5"
            >
              <ArrowUpRight className="size-3" />
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider">
                P.{item.page}
              </span>
            </Link>
            <p className="leading-relaxed flex-1 min-w-0">
              {highlightMarkdown(item.content || '')}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
