'use client'

import { ws } from '@/lib/wikisubmission-sdk'
import { useState, useEffect, useCallback, useRef } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { SearchHitWordByWord } from 'wikisubmission-sdk/lib/quran/v1/query-result'
import { Spinner } from '@/components/ui/spinner'
import { Tabs, TabsTrigger, TabsContent, TabsList } from '@/components/ui/tabs'
import {
  ArrowDownUp,
  ArrowRightIcon,
  CheckIcon,
  ChevronRight,
  SearchIcon,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { useQuranPreferences } from '@/hooks/use-quran-preferences'
import { ZOOM_WIDTH_CLASS } from '@/lib/quran-zoom'
import {
  useVerseSearch,
  type ChapterResult,
} from '@/hooks/use-verse-search'
import Link from 'next/link'
import { QuranRef } from '@/components/quran-ref'
import { parseQuranRef, normalizeQuranInput } from '@/lib/scripture-parser'
import { VerseCard } from '../mini-components/verse-card'
import { MultiSelectBar } from '../mini-components/multi-select-bar'
import { useVerseSelection } from '@/hooks/use-verse-selection-store'
import { useTranslations } from 'next-intl'

/** Click-to-copy text — used to let users grab the active search query. */
function CopyableText({
  text,
  className,
  ariaLabel,
}: {
  text: string
  className?: string
  ariaLabel?: string
}) {
  return (
    <button
      type="button"
      onClick={async (e) => {
        e.stopPropagation()
        try {
          await navigator.clipboard.writeText(text)
          toast.success(`Copied: ${text}`)
        } catch {
          toast.error('Could not copy to clipboard')
        }
      }}
      className={`text-left cursor-copy hover:text-primary active:scale-[0.98] transition-all ${className ?? ''}`}
      title={`Copy: ${text}`}
      aria-label={ariaLabel ?? `Copy ${text}`}
    >
      {text}
    </button>
  )
}

// ─── SearchResultChapter ──────────────────────────────────────────────────────

function SearchResultChapter({
  chapter,
  primaryCode,
}: {
  chapter: ChapterResult
  primaryCode: string
}) {
  const t = useTranslations('quran')
  const title =
    chapter.titles?.[primaryCode] ??
    chapter.titles?.['en'] ??
    t('sura', { number: chapter.cn ?? '' })
  return (
    <Link href={`/quran/${chapter.cn}`} className="group block">
      <div className="flex items-center justify-between gap-3 bg-muted/30 border border-border/40 rounded-2xl px-5 py-4 hover:bg-muted/50 hover:border-border/60 transition-all">
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            {t('sura', { number: chapter.cn ?? '' })}
          </span>
          <span className="text-foreground font-medium">{title}</span>
        </div>
        <ChevronRight className="size-4 text-muted-foreground group-hover:text-foreground group-hover:translate-x-0.5 transition-all shrink-0" />
      </div>
    </Link>
  )
}

// ─── SearchResult (main export) ───────────────────────────────────────────────

export default function SearchResult({ props }: { props: { query: string } }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const searchQuery = decodeURIComponent(props.query)
  const forceTab = searchParams.get('tab')

  const prefs = useQuranPreferences()
  const verseSearch = useVerseSearch()
  const t = useTranslations('search')
  const tQuran = useTranslations('quran')
  const tCommon = useTranslations('common')

  const [searchTab, setSearchTab] = useState<'all' | 'words'>('all')
  const [sortMode, setSortMode] = useState<'relevance' | 'verse-order'>(
    'relevance'
  )
  const [wordMatches, setWordMatches] = useState<SearchHitWordByWord[]>([])
  const [wordLoading, setWordLoading] = useState(false)

  const lastQueryRef = useRef<string | null>(null)
  const lastArabicRef = useRef<boolean>(false)
  const lastPrimaryRef = useRef<string | null>(null)
  const lastSecondaryRef = useRef<string | null | undefined>(null)
  const didInitRef = useRef(false)

  // Clear any active multi-select when the search query changes.
  const clearSelection = useVerseSelection((s) => s.clear)
  useEffect(() => {
    clearSelection()
  }, [searchQuery, clearSelection])

  const optsKey = `${prefs.primaryLanguage}-${prefs.secondaryLanguage ?? ''}-${prefs.zoomLevel ?? 'comfortable'}-${prefs.arabic}-${prefs.wordByWord}`

  // ── Trigger search ────────────────────────────────────────────────────────
  useEffect(() => {
    const wantArabic = prefs.arabic || prefs.wordByWord
    const queryChanged = searchQuery !== lastQueryRef.current
    const arabicChanged = wantArabic !== lastArabicRef.current
    const primaryChanged =
      prefs.primaryLanguage !== lastPrimaryRef.current
    const secondaryChanged =
      (prefs.secondaryLanguage ?? null) !== lastSecondaryRef.current
    if (!queryChanged && !arabicChanged && !primaryChanged && !secondaryChanged)
      return
    lastQueryRef.current = searchQuery
    lastArabicRef.current = wantArabic
    lastPrimaryRef.current = prefs.primaryLanguage
    lastSecondaryRef.current = prefs.secondaryLanguage ?? null

    if (!searchQuery) return

    verseSearch.reset()
    if (queryChanged) {
      setWordMatches([])
      setSearchTab('all')
      if (typeof window !== 'undefined') window.scrollTo({ top: 0 })
    }

    const singleRef = parseQuranRef(normalizeQuranInput(searchQuery))
    if (singleRef && singleRef.vs === singleRef.ve) {
      router.replace(`/quran/${singleRef.cn}?verse=${singleRef.vs}`, {
        scroll: false,
      })
      return
    }

    verseSearch.search(searchQuery, {
      primaryLang: prefs.primaryLanguage,
      secondaryLang: prefs.secondaryLanguage,
      includeArabic: wantArabic,
      // Always include words when arabic is shown so the verse card renders
      // a word breakdown (matching the reader) instead of a raw arabic
      // string with awkward tracking.
      includeWords: wantArabic,
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    searchQuery,
    prefs.wordByWord,
    prefs.arabic,
    prefs.primaryLanguage,
    prefs.secondaryLanguage,
  ])

  // ── Word search ───────────────────────────────────────────────────────────
  const runWordByWordQuery = useCallback(async () => {
    if (wordMatches.length > 0 || !searchQuery) return
    setWordLoading(true)
    setWordMatches([])

    const result = await ws.Quran.query(searchQuery, {
      language: 'english',
      strategy: 'default',
      highlight: true,
      normalizeGodCasing: true,
      adjustments: {
        index: false,
        chapters: false,
        subtitles: false,
        footnotes: false,
        wordByWord: { field: 'english' },
      },
    })

    if (
      result.status === 'success' &&
      result.type === 'search' &&
      result.data?.some((i) => i.hit === 'word_by_word')
    ) {
      setWordMatches(result.data.filter((i) => i.hit === 'word_by_word'))
    } else if (result.status === 'error') {
      const msg = decodeURIComponent(result.error ?? '')
      if (
        !msg.toLowerCase().includes('index') &&
        !msg.toLowerCase().includes('disabled')
      ) {
        toast.error(msg)
      }
    } else {
      toast.error(`No word matches for '${searchQuery}'`)
    }

    setWordLoading(false)
  }, [searchQuery, wordMatches])

  // ── Init tab from URL ─────────────────────────────────────────────────────
  useEffect(() => {
    if (didInitRef.current) return
    didInitRef.current = true
    if (forceTab === 'words') {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSearchTab('words')
      runWordByWordQuery()
    }
  }, [forceTab, runWordByWordQuery])

  // ── Derived ───────────────────────────────────────────────────────────────
  const primaryCode =
    prefs.primaryLanguage !== 'xl' ? prefs.primaryLanguage : 'en'
  const titleMatches = verseSearch.data?.chapters?.filter((ch) => ch.tm) ?? []
  const rawVerses =
    verseSearch.data?.chapters?.flatMap((ch) => ch.verses ?? []) ?? []
  const allVerses =
    sortMode === 'verse-order'
      ? [...rawVerses].sort((a, b) => {
          const [ac, av] = (a.vk ?? '0:0').split(':').map(Number)
          const [bc, bv] = (b.vk ?? '0:0').split(':').map(Number)
          return ac === bc ? av - bv : ac - bc
        })
      : rawVerses

  if (verseSearch.loading && !verseSearch.data) {
    return (
      <div
        className={`${ZOOM_WIDTH_CLASS[prefs.zoomLevel ?? 'comfortable']} mx-auto w-full space-y-3`}
      >
        <SearchHeaderSkeleton query={searchQuery} />
        <SearchResultsSkeleton />
      </div>
    )
  }

  if (verseSearch.error) {
    return (
      <p className="text-sm text-muted-foreground py-8 text-center">
        {verseSearch.error}
      </p>
    )
  }

  if (!verseSearch.data) return null

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div
      className={`space-y-3 ${ZOOM_WIDTH_CLASS[prefs.zoomLevel ?? 'comfortable']} mx-auto w-full`}
    >
      {/* Minimal header — query stands alone */}
      <header className="px-1">
        <CopyableText
          text={`“${searchQuery}”`}
          className="text-3xl sm:text-4xl font-semibold tracking-tight leading-none"
          ariaLabel={`Copy search query ${searchQuery}`}
        />
      </header>

      <Tabs
        value={searchTab}
        onValueChange={(v) => {
          const tab = v as typeof searchTab
          setSearchTab(tab)
          const params = new URLSearchParams(searchParams.toString())
          params.set('tab', tab)
          router.replace(`${window.location.pathname}?${params.toString()}`, {
            scroll: false,
          })
          if (tab === 'words') runWordByWordQuery()
        }}
        className="space-y-2"
      >
        {/* ── Toolbar — flush, sits right above the result list ─────────── */}
        <div className="flex flex-wrap items-center justify-between gap-y-2 gap-x-4 px-1">
          <TabsList className="h-8 bg-transparent p-0 gap-1 *:text-xs">
            <TabsTrigger
              value="all"
              className="h-7 px-2.5 data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:shadow-none"
            >
              {t('resultsTab', { count: verseSearch.total })}
            </TabsTrigger>
            <TabsTrigger
              value="words"
              className="h-7 gap-1 px-2.5 data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:shadow-none"
            >
              <SearchIcon className="size-3" />
              {t('wordSearch')}
              {wordMatches.length > 0 && (
                <span className="text-muted-foreground">
                  {wordMatches.length > 2999 ? '3k+' : wordMatches.length}
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          {searchTab === 'all' && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded-md hover:bg-accent/30"
                  aria-label="Sort results"
                >
                  <ArrowDownUp className="size-3" />
                  <span className="tabular-nums">
                    {sortMode === 'relevance' ? 'Relevance' : 'Verse order'}
                  </span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" sideOffset={6}>
                {(
                  [
                    { value: 'relevance', label: 'Relevance' },
                    { value: 'verse-order', label: 'Verse order' },
                  ] as const
                ).map((opt) => (
                  <DropdownMenuItem
                    key={opt.value}
                    onSelect={() => setSortMode(opt.value)}
                    className={cn(
                      sortMode === opt.value && 'text-primary font-medium'
                    )}
                  >
                    <span className="flex-1">{opt.label}</span>
                    {sortMode === opt.value && (
                      <CheckIcon className="size-3.5" />
                    )}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {/* ── All results ───────────────────────────────────────────────────── */}
        <TabsContent value="all" className="space-y-4 mt-0">
          {/* Chapter title matches */}
          {titleMatches.length > 0 && (
            <div className="space-y-2">
              {titleMatches.map((ch) => (
                <SearchResultChapter
                  key={`title:${ch.cn}`}
                  chapter={ch}
                  primaryCode={primaryCode}
                />
              ))}
            </div>
          )}

          {/* Verse list — wrap in the reader's rounded surface so cards match */}
          {allVerses.length > 0 && (
            <div className="bg-muted/30 backdrop-blur-sm rounded-3xl border border-border/40 overflow-hidden">
              {allVerses.map((verse, index) => {
                const [chNum, vNum] = (verse.vk ?? '').split(':').map(Number)
                const tr = verse.tr?.[primaryCode] ?? verse.tr?.['en']
                return (
                  <VerseCard
                    key={verse.vk ?? index}
                    verse={verse}
                    isLast={index === allVerses.length - 1}
                    optsKey={optsKey}
                    showAudio={false}
                    verseHref={`/quran/${chNum}?verse=${vNum}`}
                    searchHighlight={tr?.hl ?? undefined}
                  />
                )
              })}
            </div>
          )}

          {verseSearch.loading && (
            <div className="flex justify-center py-6">
              <Spinner />
            </div>
          )}

          {verseSearch.hasMore && !verseSearch.loading && (
            <div className="flex justify-center pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const y = window.scrollY
                  verseSearch.loadMore().then(() => {
                    requestAnimationFrame(() =>
                      window.scrollTo({ top: y, behavior: 'instant' })
                    )
                  })
                }}
              >
                {tCommon('loadMore', {
                  shown: verseSearch.loadedCount,
                  total: verseSearch.total,
                })}
              </Button>
            </div>
          )}

          {!verseSearch.hasMore && allVerses.length > 0 && (
            <p className="text-center text-xs text-muted-foreground py-4">
              {t('allResultsShown', { count: verseSearch.total })}
            </p>
          )}
        </TabsContent>

        {/* ── Word search ───────────────────────────────────────────────────── */}
        <TabsContent value="words" className="space-y-4 mt-0">
          {wordLoading && (
            <div className="flex justify-center py-6">
              <Spinner />
            </div>
          )}

          {!wordLoading && wordMatches.length === 0 && (
            <div className="space-y-3">
              <p className="text-muted-foreground text-sm">{t('noMatches')}</p>
              {searchQuery.split(' ').length > 1 && (
                <div className="bg-muted/30 border border-border/40 rounded-2xl p-4 space-y-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <SearchIcon className="size-4" />
                    <span>{t('trySearching')}</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {searchQuery.split(' ').map((q) => (
                      <a
                        key={q}
                        href={`?q=${q}&tab=words`}
                        className="flex items-center gap-1 text-sm text-primary hover:text-primary bg-primary/5 hover:bg-primary/10 rounded-lg px-3 py-1 transition-colors"
                      >
                        {q}
                        <ArrowRightIcon className="size-3" />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {wordMatches.length > 0 && (
            <div className="space-y-3">
              {Array.from(
                new Map(
                  wordMatches.map((item) => [item.root_word, item])
                ).values()
              ).map((item) => (
                <section
                  key={item.root_word}
                  className="bg-muted/30 border border-border/40 rounded-2xl p-5 space-y-3"
                >
                  <div className="flex items-baseline gap-3">
                    <p className="text-lg font-arabic">{item.arabic}</p>
                    <p className="text-sm text-muted-foreground">
                      {item.transliterated}
                    </p>
                  </div>
                  <div className="space-y-1.5 text-sm">
                    <p>
                      <span className="text-muted-foreground">
                        {tQuran('rootWord')}:{' '}
                      </span>
                      <span className="font-medium">{item.root_word}</span>
                    </p>
                    {item.meanings && (
                      <p>
                        <span className="text-muted-foreground">
                          {tQuran('meanings')}:{' '}
                        </span>
                        <span>{item.meanings}</span>
                      </p>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-1 pt-1 border-t border-border/30">
                    <span className="text-xs text-muted-foreground self-center mr-1">
                      {tQuran('occurrences', {
                        count: wordMatches.filter(
                          (r) => r.root_word === item.root_word
                        ).length,
                      })}
                      :
                    </span>
                    {wordMatches
                      .filter((r) => r.root_word === item.root_word)
                      .map((r) => (
                        <QuranRef
                          key={`root:${r.verse_id}:${r.word_index}`}
                          reference={r.verse_id}
                        />
                      ))}
                  </div>
                </section>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <MultiSelectBar />
    </div>
  )
}


// ─── Loading skeletons ────────────────────────────────────────────────────────

function SearchHeaderSkeleton({ query }: { query: string }) {
  return (
    <header className="space-y-3 px-1">
      <p className="text-3xl sm:text-4xl font-semibold tracking-tight leading-none">
        “{query}”
      </p>
      {/* Indeterminate progress strip — a subtle primary sliver moves
          across the bar while the search is in flight. */}
      <div className="relative h-[2px] w-full overflow-hidden rounded-full bg-border/40">
        <div className="absolute inset-y-0 w-1/3 rounded-full bg-primary/70 animate-[search-loading_1.2s_ease-in-out_infinite]" />
      </div>
    </header>
  )
}

function SearchResultsSkeleton() {
  return (
    <div className="bg-muted/30 backdrop-blur-sm rounded-3xl border border-border/40 overflow-hidden divide-y divide-border/30">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="px-6 py-5 sm:px-8 sm:py-6 space-y-3 animate-pulse">
          <div className="h-5 w-12 rounded-full bg-muted/60" />
          <div className="space-y-2">
            <div className="h-3 w-11/12 rounded bg-muted/50" />
            <div className="h-3 w-10/12 rounded bg-muted/40" />
            <div className="h-3 w-7/12 rounded bg-muted/30" />
          </div>
        </div>
      ))}
    </div>
  )
}
