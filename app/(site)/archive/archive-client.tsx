'use client'

import { useState, useEffect, useCallback, useMemo, Suspense } from 'react'
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
import { F } from '@/app/(site)/_sections/shared'

type MediaRow = Database['public']['Tables']['ws_media']['Row']
type NewsletterRow = Database['public']['Tables']['ws_newsletters']['Row']

// Default seed query for featured content when user hasn't searched.
const FEATURED_QUERY = 'God'

type Tab = 'media' | 'newsletters'

export default function ArchiveClient() {
  const t = useTranslations('archive')
  const heroTitlePrefix = t('heroTitlePrefix')

  return (
    <div
      style={{ backgroundColor: 'var(--ed-bg)', color: 'var(--ed-fg)' }}
      className="min-h-screen"
    >
      {/* Hero */}
      <section
        className="px-4 sm:px-6 md:px-10"
        style={{
          maxWidth: 1240,
          margin: '0 auto',
          paddingTop: 'clamp(56px, 10vw, 96px)',
          paddingBottom: 'clamp(24px, 5vw, 48px)',
        }}
      >
        <h1
          style={{
            fontFamily: F.display,
            fontSize: 'clamp(48px, 10vw, 96px)',
            fontWeight: 400,
            lineHeight: 0.95,
            letterSpacing: '-0.035em',
            color: 'var(--ed-fg)',
          }}
        >
          {heroTitlePrefix ? `${heroTitlePrefix} ` : ''}
          <span style={{ fontStyle: 'italic', color: 'var(--ed-fg-muted)' }}>
            {t('heroTitleAccent')}
          </span>
        </h1>
        <p
          style={{
            fontFamily: F.serif,
            fontSize: 'clamp(15px, 3.6vw, 17px)',
            lineHeight: 1.65,
            color: 'var(--ed-fg-muted)',
            maxWidth: '64ch',
            marginTop: 24,
          }}
        >
          {t('heroDescription')}
        </p>
      </section>

      <div
        className="px-4 sm:px-6 md:px-10"
        style={{
          maxWidth: 1240,
          margin: '0 auto',
          paddingBottom: 'clamp(64px, 10vw, 120px)',
        }}
      >
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
  const tArchive = useTranslations('archive')
  const tCommon = useTranslations('common')
  const searchParams = useSearchParams()
  const router = useRouter()
  const initialQuery = searchParams.get('q') || ''
  const initialTab = (searchParams.get('type') as Tab) || 'media'

  const [searchQuery, setSearchQuery] = useState(initialQuery)
  const [activeTab, setActiveTab] = useState<Tab>(initialTab)
  const [mediaResults, setMediaResults] = useState<MediaRow[] | null>(null)
  const [newsletterResults, setNewsletterResults] = useState<
    NewsletterRow[] | null
  >(null)
  const [performedQuery, setPerformedQuery] = useState(initialQuery)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isFeatured, setIsFeatured] = useState(!initialQuery)
  const [selectedCategories, setSelectedCategories] = useState<string[]>([
    'programs',
    'sermons',
    'audios',
  ])

  const performSearch = useCallback(
    async (q: string, featured = false) => {
      const query = q.trim() || FEATURED_QUERY
      setLoading(true)
      setError(null)
      try {
        const [mediaResponse, newsletterResponse] = await Promise.all([
          ws.Media.query(query, { highlight: !featured }),
          ws.Newsletters.query(query, { highlight: !featured }),
        ])
        setMediaResults(
          mediaResponse?.data ||
          (Array.isArray(mediaResponse) ? mediaResponse : [])
        )
        setNewsletterResults(
          newsletterResponse?.data ||
          (Array.isArray(newsletterResponse) ? newsletterResponse : [])
        )
        setPerformedQuery(featured ? '' : q)
        setIsFeatured(featured)
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

  // Initial load: featured if no query, search otherwise
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSearchQuery(initialQuery)
    performSearch(initialQuery, !initialQuery)
  }, [initialQuery, performSearch])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = searchQuery.trim()
    const params = new URLSearchParams(searchParams.toString())
    if (trimmed) params.set('q', trimmed)
    else params.delete('q')
    router.push(`/archive${params.size ? `?${params.toString()}` : ''}`)
  }

  const handleTabChange = (value: Tab) => {
    setActiveTab(value)
    const params = new URLSearchParams(searchParams.toString())
    params.set('type', value)
    router.push(`/archive?${params.toString()}`, { scroll: false })
  }

  const mCount = mediaResults?.length ?? 0
  const nCount = newsletterResults?.length ?? 0

  // Group media by youtube_id (so same video with multiple matches is one card)
  const mediaGroups = useMemo(() => {
    if (!mediaResults) return []
    const groups: Record<string, MediaRow[]> = {}
    mediaResults.forEach((item) => {
      const id = item.youtube_id
      if (!groups[id]) groups[id] = []
      groups[id].push(item)
    })
    return Object.entries(groups)
  }, [mediaResults])

  // Group newsletters by year+month
  const newsletterGroups = useMemo(() => {
    if (!newsletterResults) return []
    const groups: Record<string, NewsletterRow[]> = {}
    newsletterResults.forEach((item) => {
      const id = `${item.year}_${item.month}`
      if (!groups[id]) groups[id] = []
      groups[id].push(item)
    })
    return Object.entries(groups)
  }, [newsletterResults])

  return (
    <div className="space-y-8">
      {/* Tab bar + search */}
      <div
        className="grid gap-4 items-start"
        style={{
          gridTemplateColumns: 'minmax(0, 1fr)',
        }}
      >
        <div className="flex flex-col lg:flex-row gap-3 lg:items-stretch">
          <div
            role="tablist"
            className="flex items-stretch overflow-x-auto no-scrollbar"
            style={{
              border: '1px solid var(--ed-rule)',
              borderRadius: 3,
              background: 'var(--ed-surface)',
              flex: 1,
            }}
          >
            <ArchiveTab
              tab="media"
              active={activeTab === 'media'}
              num="01"
              label={tArchive('tabMediaLabel')}
              sub={tArchive('tabMediaSub')}
              count={mCount}
              onClick={() => handleTabChange('media')}
            />
            <div style={{ width: 1, background: 'var(--ed-rule)' }} />
            <ArchiveTab
              tab="newsletters"
              active={activeTab === 'newsletters'}
              num="02"
              label={tArchive('tabNewslettersLabel')}
              sub={tArchive('tabNewslettersSub')}
              count={nCount}
              onClick={() => handleTabChange('newsletters')}
            />
          </div>

          <form
            onSubmit={handleSearch}
            className="relative lg:w-[360px]"
            style={{
              border: '1px solid var(--ed-rule)',
              borderRadius: 3,
              background: 'var(--ed-surface)',
              display: 'flex',
              alignItems: 'center',
              padding: '0 14px',
            }}
          >
            <SearchIcon
              className="size-4 shrink-0"
              style={{ color: 'var(--ed-fg-muted)' }}
            />
            <input
              type="search"
              placeholder={
                activeTab === 'media'
                  ? tArchive('placeholderMedia')
                  : tArchive('placeholderNewsletters')
              }
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                flex: 1,
                height: 44,
                border: 'none',
                outline: 'none',
                background: 'transparent',
                padding: '0 12px',
                fontFamily: F.serif,
                fontSize: 14,
                color: 'var(--ed-fg)',
              }}
            />
            <kbd
              style={{
                fontFamily: F.mono,
                fontSize: 10,
                letterSpacing: '0.14em',
                color: 'var(--ed-fg-muted)',
                padding: '3px 6px',
                border: '1px solid var(--ed-rule)',
                borderRadius: 2,
              }}
            >
              ↵
            </kbd>
          </form>
        </div>

        {isFeatured && (
          <div
            style={{
              fontFamily: F.mono,
              fontSize: 10.5,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: 'var(--ed-fg-muted)',
            }}
          >
            {tArchive('featuredLabel')}
          </div>
        )}
      </div>

      {loading && <ArchiveLoadingSkeleton />}

      {error && (
        <div
          className="flex items-center gap-2 py-8 justify-center"
          style={{ color: 'var(--ed-accent)' }}
        >
          <AlertCircleIcon className="size-4" />
          <span style={{ fontFamily: F.mono, fontSize: 12 }}>{error}</span>
        </div>
      )}

      {!loading && !error && mediaResults && newsletterResults && (
        <>
          {activeTab === 'media' ? (
            mediaGroups.length === 0 ? (
              <EmptyState
                label={t('noResults', { query: performedQuery })}
                help={t('noResultsHelp')}
              />
            ) : (
              <>
                <CategoryFilters
                  results={mediaResults}
                  selectedCategories={selectedCategories}
                  setSelectedCategories={setSelectedCategories}
                />
                <div
                  className="grid gap-5"
                  style={{
                    gridTemplateColumns:
                      'repeat(auto-fill, minmax(260px, 1fr))',
                  }}
                >
                  {mediaGroups
                    .filter(([, items]) => {
                      const cat = items[0].category?.toLowerCase()
                      return !cat || selectedCategories.includes(cat)
                    })
                    .map(([id, items]) => (
                      <MediaCardGrid key={id} items={items} />
                    ))}
                </div>
              </>
            )
          ) : newsletterGroups.length === 0 ? (
            <EmptyState
              label={t('noResults', { query: performedQuery })}
              help={t('noResultsHelp')}
            />
          ) : (
            <div
              className="grid gap-5"
              style={{
                gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              }}
            >
              {newsletterGroups.map(([id, items]) => (
                <NewsletterCardGrid key={id} items={items} />
              ))}
            </div>
          )}

          {activeTab === 'media' && mediaGroups.length > 0 && !isFeatured && (
            <p
              className="flex items-start gap-2"
              style={{
                fontFamily: F.mono,
                fontSize: 11,
                letterSpacing: '0.05em',
                color: 'var(--ed-fg-muted)',
              }}
            >
              <InfoIcon
                className="size-3.5 shrink-0 mt-0.5"
                style={{ color: 'var(--ed-accent)' }}
              />
              {t('disclaimer')}
            </p>
          )}
        </>
      )}
    </div>
  )
}

function ArchiveTab({
  tab,
  active,
  num,
  label,
  sub,
  count,
  onClick,
}: {
  tab: Tab
  active: boolean
  num: string
  label: string
  sub: string
  count: number
  onClick: () => void
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      aria-controls={`archive-panel-${tab}`}
      onClick={onClick}
      style={{
        flex: 1,
        padding: '14px 18px',
        display: 'grid',
        gridTemplateColumns: 'auto 1fr auto',
        alignItems: 'center',
        gap: 14,
        textAlign: 'left',
        background: active ? 'var(--ed-bg)' : 'transparent',
        border: 'none',
        cursor: 'pointer',
        minWidth: 220,
      }}
    >
      <span
        style={{
          fontFamily: F.display,
          fontStyle: 'italic',
          fontSize: 22,
          color: active ? 'var(--ed-accent)' : 'var(--ed-fg-muted)',
          lineHeight: 1,
        }}
      >
        {num}
      </span>
      <span className="flex flex-col gap-0.5">
        <span
          style={{
            fontFamily: F.display,
            fontSize: 17,
            fontWeight: 500,
            color: active ? 'var(--ed-fg)' : 'var(--ed-fg)',
            letterSpacing: '-0.01em',
          }}
        >
          {label}
        </span>
        <span
          style={{
            fontFamily: F.mono,
            fontSize: 10,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: 'var(--ed-fg-muted)',
          }}
        >
          {sub}
        </span>
      </span>
      <span
        style={{
          fontFamily: F.mono,
          fontSize: 11,
          letterSpacing: '0.1em',
          padding: '4px 10px',
          borderRadius: 2,
          background: active
            ? 'color-mix(in oklab, var(--ed-accent), transparent 85%)'
            : 'color-mix(in oklab, var(--ed-fg), transparent 94%)',
          color: active ? 'var(--ed-accent)' : 'var(--ed-fg-muted)',
        }}
      >
        {count}
      </span>
    </button>
  )
}

function EmptyState({ label, help }: { label: string; help: string }) {
  return (
    <div
      className="text-center py-20"
      style={{ color: 'var(--ed-fg-muted)' }}
    >
      <SearchIcon className="size-12 mx-auto mb-4 opacity-20" />
      <p
        style={{
          fontFamily: F.display,
          fontSize: 20,
          fontWeight: 500,
          letterSpacing: '-0.01em',
        }}
      >
        {label}
      </p>
      <p
        className="mt-1"
        style={{
          fontFamily: F.serif,
          fontSize: 14,
          opacity: 0.7,
        }}
      >
        {help}
      </p>
    </div>
  )
}

function ArchiveLoadingSkeleton() {
  return (
    <div
      className="grid gap-5 animate-pulse"
      style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))' }}
    >
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div
          key={i}
          style={{
            border: '1px solid var(--ed-rule)',
            borderRadius: 3,
            background: 'var(--ed-surface)',
            overflow: 'hidden',
          }}
        >
          <Skeleton className="aspect-video w-full rounded-none" />
          <div className="p-4 space-y-2">
            <Skeleton className="h-4 w-1/3 rounded" />
            <Skeleton className="h-5 w-5/6 rounded" />
            <Skeleton className="h-4 w-2/3 rounded" />
          </div>
        </div>
      ))}
    </div>
  )
}

function CategoryFilters({
  results,
  selectedCategories,
  setSelectedCategories,
}: {
  results: MediaRow[]
  selectedCategories: string[]
  setSelectedCategories: (cats: string[]) => void
}) {
  const t = useTranslations('archive')
  const categories = ['programs', 'sermons', 'audios']
  const labels: Record<string, string> = {
    programs: t('categoryPrograms'),
    sermons: t('categorySermons'),
    audios: t('categoryAudios'),
  }
  const hasCategorySupport = categories.some(
    (cat) =>
      results.filter((item) => item.category?.toLowerCase() === cat).length > 0
  )
  if (!hasCategorySupport) return null

  return (
    <div className="flex flex-wrap items-center gap-4 py-2">
      {categories.map((cat) => {
        const count = results.filter(
          (item) => item.category?.toLowerCase() === cat
        ).length
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
              className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
              style={{ borderColor: 'var(--ed-rule)' }}
            />
            <Label
              htmlFor={`cat-${cat}`}
              className="cursor-pointer flex items-center gap-1.5"
              style={{
                fontFamily: F.mono,
                fontSize: 10.5,
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                color: 'var(--ed-fg-muted)',
              }}
            >
              {labels[cat] ?? cat}
              <span
                style={{
                  padding: '2px 6px',
                  borderRadius: 2,
                  background: 'color-mix(in oklab, var(--ed-fg), transparent 94%)',
                  color: 'var(--ed-fg-muted)',
                  fontSize: 10,
                }}
              >
                {count}
              </span>
            </Label>
          </div>
        )
      })}
    </div>
  )
}

function MediaCardGrid({ items }: { items: MediaRow[] }) {
  const t = useTranslations('archive')
  const first = items[0]
  const category = first.category?.toLowerCase()
  const categoryLabel =
    category === 'programs'
      ? t('categoryPrograms')
      : category === 'sermons'
        ? t('categorySermons')
        : category === 'audios'
          ? t('categoryAudios')
          : first.category || t('categoryVideo')
  const kind = categoryLabel.toUpperCase()
  const timestamp = first.start_timestamp
  return (
    <Link
      href={`https://www.youtube.com/watch?v=${first.youtube_id}&t=${first.youtube_timestamp}`}
      target="_blank"
      rel="noopener noreferrer"
      className="ed-card group"
      style={{
        display: 'flex',
        flexDirection: 'column',
        background: 'var(--ed-surface)',
        overflow: 'hidden',
        textDecoration: 'none',
      }}
    >
      {/* Thumbnail */}
      <div
        style={{
          position: 'relative',
          aspectRatio: '16 / 9',
          overflow: 'hidden',
          background: 'var(--ed-bg-alt)',
        }}
      >
        <Image
          src={`https://img.youtube.com/vi/${first.youtube_id}/mqdefault.jpg`}
          alt={first.title}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <span
          style={{
            position: 'absolute',
            top: 10,
            left: 10,
            padding: '3px 8px',
            borderRadius: 2,
            fontFamily: F.mono,
            fontSize: 9.5,
            letterSpacing: '0.16em',
            textTransform: 'uppercase',
            background: 'rgba(0,0,0,0.65)',
            color: '#fff',
          }}
        >
          {kind}
        </span>
        {timestamp && (
          <span
            style={{
              position: 'absolute',
              bottom: 10,
              right: 10,
              padding: '3px 8px',
              borderRadius: 2,
              fontFamily: F.mono,
              fontSize: 10,
              letterSpacing: '0.1em',
              background: 'rgba(0,0,0,0.65)',
              color: '#fff',
            }}
          >
            {timestamp}
          </span>
        )}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: 0,
            transition: 'opacity 200ms',
            background:
              'linear-gradient(to bottom, transparent 40%, rgba(0,0,0,0.35))',
          }}
          className="group-hover:opacity-100"
        >
          <span
            style={{
              width: 48,
              height: 48,
              borderRadius: '50%',
              background: 'var(--ed-accent)',
              color: 'var(--ed-bg)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <PlayIcon className="size-5" />
          </span>
        </div>
      </div>

      {/* Body */}
      <div
        style={{
          padding: '16px 18px 20px',
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
          flex: 1,
        }}
      >
        <div
          style={{
            fontFamily: F.mono,
            fontSize: 10,
            letterSpacing: '0.16em',
            textTransform: 'uppercase',
            color: 'var(--ed-accent)',
          }}
        >
          {categoryLabel}
        </div>
        <h3
          style={{
            fontFamily: F.display,
            fontSize: 17,
            fontWeight: 500,
            letterSpacing: '-0.01em',
            lineHeight: 1.25,
            color: 'var(--ed-fg)',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {first.title}
        </h3>
        {items.length > 1 && (
          <div
            style={{
              fontFamily: F.mono,
              fontSize: 10.5,
              letterSpacing: '0.1em',
              color: 'var(--ed-fg-muted)',
            }}
          >
            {t('matchingSegments', { count: items.length })}
          </div>
        )}
        {items[0].transcript && (
          <p
            style={{
              fontFamily: F.serif,
              fontSize: 13,
              lineHeight: 1.55,
              color: 'var(--ed-fg-muted)',
              margin: 0,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {highlightMarkdown(items[0].transcript)}
          </p>
        )}
      </div>
    </Link>
  )
}

function NewsletterCardGrid({ items }: { items: NewsletterRow[] }) {
  const t = useTranslations('archive')
  const first = items[0]
  const month = first.month ? String(first.month) : ''
  return (
    <Link
      href={`https://library.wikisubmission.org/file/sp/${first.year}_${first.month}`}
      target="_blank"
      rel="noopener noreferrer"
      className="ed-card group"
      style={{
        display: 'flex',
        flexDirection: 'column',
        background: 'var(--ed-surface)',
        overflow: 'hidden',
        textDecoration: 'none',
      }}
    >
      {/* Paper visual */}
      <div
        style={{
          aspectRatio: '3 / 4',
          background: 'var(--ed-bg-alt)',
          borderBottom: '1px solid var(--ed-rule)',
          padding: 28,
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
        }}
      >
        <div
          style={{
            fontFamily: F.display,
            fontSize: 13,
            letterSpacing: '0.16em',
            textTransform: 'uppercase',
            color: 'var(--ed-fg-muted)',
            textAlign: 'center',
            fontStyle: 'italic',
          }}
        >
          {t('newsletterMasthead')}
        </div>
        <div style={{ height: 1, background: 'var(--ed-rule)' }} />
        <div
          style={{
            fontFamily: F.mono,
            fontSize: 10,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: 'var(--ed-accent)',
            textAlign: 'center',
          }}
        >
          {month} · {first.year}
        </div>
        <div
          style={{
            fontFamily: F.display,
            fontSize: 20,
            lineHeight: 1.2,
            fontWeight: 500,
            color: 'var(--ed-fg)',
            textAlign: 'center',
            letterSpacing: '-0.01em',
            marginTop: 6,
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {t('readingPages', { count: items.length })}
        </div>
        <div
          style={{
            marginTop: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: 4,
          }}
        >
          {[88, 79, 84, 70, 82, 66, 74].map((w, k) => (
            <span
              key={k}
              style={{
                display: 'block',
                height: 2,
                width: `${w}%`,
                background: 'var(--ed-rule)',
              }}
            />
          ))}
        </div>
      </div>

      <div
        style={{
          padding: '16px 18px 20px',
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
        }}
      >
        <div
          style={{
            fontFamily: F.mono,
            fontSize: 10,
            letterSpacing: '0.16em',
            textTransform: 'uppercase',
            color: 'var(--ed-accent)',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <NewspaperIcon className="size-3.5" />
          <span>{t('newsletterLabel')}</span>
        </div>
        <h3
          style={{
            fontFamily: F.display,
            fontSize: 17,
            fontWeight: 500,
            letterSpacing: '-0.01em',
            lineHeight: 1.25,
            color: 'var(--ed-fg)',
          }}
        >
          <span className="capitalize">{month}</span> {first.year}
        </h3>
        {first.content && (
          <p
            style={{
              fontFamily: F.serif,
              fontSize: 13,
              lineHeight: 1.55,
              color: 'var(--ed-fg-muted)',
              margin: 0,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {highlightMarkdown(first.content)}
          </p>
        )}
        <div
          className={cn('flex items-center gap-1.5')}
          style={{
            fontFamily: F.mono,
            fontSize: 11,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: 'var(--ed-accent)',
            marginTop: 4,
          }}
        >
          <ArrowUpRight className="size-3.5" />
          {t('readIssue')}
        </div>
      </div>
    </Link>
  )
}
