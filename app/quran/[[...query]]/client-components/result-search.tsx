'use client'

import { ws } from '@/lib/wikisubmission-sdk'
import { useState, useEffect, useCallback, useRef } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { SearchHitWordByWord } from 'wikisubmission-sdk/lib/quran/v1/query-result'
import { Spinner } from '@/components/ui/spinner'
import { Tabs, TabsTrigger, TabsContent, TabsList } from '@/components/ui/tabs'
import { ArrowRightIcon, ArrowUpRightIcon, ChevronRight, SearchIcon } from 'lucide-react'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { toast } from 'sonner'
import { useQuranPreferences } from '@/hooks/use-quran-preferences'
import { ZOOM_WIDTH_CLASS, ZOOM_FONT } from '@/lib/quran-zoom'
import {
  useVerseSearch,
  type ChapterResult,
  type VerseResult,
} from '@/hooks/use-verse-search'
import Link from 'next/link'
import { QuranRef } from '@/components/quran-ref'
import { QuranRefText } from '@/components/quran-ref-text'
import { useTranslations } from 'next-intl'

// ─── HighlightText ────────────────────────────────────────────────────────────

function HighlightText({ text }: { text?: string | null }) {
  if (!text) return null
  return (
    <>
      {text.split(/(<b>.*?<\/b>)/g).map((part, i) =>
        part.startsWith('<b>') && part.endsWith('</b>') ? (
          <mark
            key={i}
            className="bg-violet-600/10 text-violet-600 dark:text-violet-400 rounded-sm not-italic font-semibold px-0.5"
          >
            {part.slice(3, -4)}
          </mark>
        ) : (
          part || null
        )
      )}
    </>
  )
}

// ─── SearchResultChapter ──────────────────────────────────────────────────────

function SearchResultChapter({ chapter, primaryCode }: { chapter: ChapterResult; primaryCode: string }) {
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

// ─── SearchResultVerse ────────────────────────────────────────────────────────

function SearchResultVerse({
  verse,
  primaryCode,
  showArabic,
  showSubtitles,
  showFootnotes,
  showText,
}: {
  verse: VerseResult
  primaryCode: string
  showArabic: boolean
  showSubtitles: boolean
  showFootnotes: boolean
  showText: boolean
}) {
  const { zoomLevel } = useQuranPreferences()
  const zoomFont = ZOOM_FONT[zoomLevel ?? 'comfortable']
  const [chNum, vNum] = (verse.vk ?? '').split(':').map(Number)
  const tr = verse.tr?.[primaryCode] ?? verse.tr?.['en']
  const arTr = verse.tr?.['ar']

  // hl is either the full text with <b> highlights, or a shorter snippet.
  const hlStripped = tr?.hl?.replace(/<\/?b>/g, '') ?? ''
  const hlIsFullText = !!tr?.hl && !!tr?.tx && hlStripped.length >= tr.tx.length * 0.9

  return (
    <div className="bg-muted/30 backdrop-blur-sm rounded-2xl border border-border/40 px-5 py-4 space-y-3">

      {/* Subtitle */}
      {showSubtitles && tr?.s && (
        <p className="text-violet-600 text-xs font-semibold text-center tracking-wide">
          <HighlightText text={tr.s} />
        </p>
      )}

      {/* Verse key + open link */}
      <Link
        href={`/quran/${chNum}?verse=${vNum}`}
        target="_blank"
        className="group flex items-center gap-1.5 w-fit"
      >
        <div className="flex items-center gap-0.5 border px-2 py-0.5 bg-muted/40 rounded-full group-hover:bg-violet-600/10 group-hover:border-violet-600/20 transition-colors">
          <span className="text-sm font-semibold tabular-nums">{chNum}</span>
          <span className="text-muted-foreground text-sm">:</span>
          <span className="text-sm font-semibold text-primary/80 tabular-nums">{vNum}</span>
        </div>
        <ArrowUpRightIcon className="size-3.5 text-muted-foreground group-hover:text-violet-600 transition-colors" />
      </Link>

      {/* Translation */}
      {showText && (tr?.tx || tr?.hl) && (
        <div className="space-y-2">
          <p className={`${zoomFont.translation} leading-relaxed text-foreground/90`}>
            {hlIsFullText ? <HighlightText text={tr!.hl} /> : tr?.tx}
          </p>
          {tr?.hl && !hlIsFullText && (
            <p className="text-sm text-muted-foreground italic border-l-2 border-violet-600/30 pl-3">
              <HighlightText text={tr.hl} />
            </p>
          )}
        </div>
      )}

      {/* Footnote */}
      {showFootnotes && tr?.f && (
        <p className="text-sm text-muted-foreground leading-relaxed italic border-t border-border/30 pt-3">
          <QuranRefText text={tr.f} from={verse.vk ?? ''} />
        </p>
      )}

      {/* Arabic */}
      {showArabic && arTr?.tx && (
        <p dir="rtl" className={`font-arabic ${zoomFont.arabic} leading-loose text-foreground/90 text-right border-t border-border/30 pt-3`}>
          {arTr.tx}
        </p>
      )}
    </div>
  )
}

// ─── SearchResult (main export) ───────────────────────────────────────────────

export default function SearchResult({ props }: { props: { query: string } }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const searchQuery = decodeURIComponent(props.query)
  const strict = searchParams.get('strict') === 'true'
  const forceTab = searchParams.get('tab')

  const prefs = useQuranPreferences()
  const verseSearch = useVerseSearch()
  const t = useTranslations('search')
  const tQuran = useTranslations('quran')
  const tSettings = useTranslations('settings')
  const tCommon = useTranslations('common')

  const [searchTab, setSearchTab] = useState<'all' | 'words'>('all')
  const [wordMatches, setWordMatches] = useState<SearchHitWordByWord[]>([])
  const [wordLoading, setWordLoading] = useState(false)

  const lastQueryRef = useRef<string | null>(null)
  const lastStrictRef = useRef<string | null>(null)
  const didInitRef = useRef(false)

  // ── Trigger search ────────────────────────────────────────────────────────
  useEffect(() => {
    const currentStrict = searchParams.get('strict')
    if (
      searchQuery === lastQueryRef.current &&
      currentStrict === lastStrictRef.current
    ) return

    lastQueryRef.current = searchQuery
    lastStrictRef.current = currentStrict

    if (!searchQuery) return

    verseSearch.reset()
    setWordMatches([])
    setSearchTab('all')

    if (/^\d+:\d+$/.test(searchQuery)) {
      const [cn, vn] = searchQuery.split(':')
      router.replace(`/quran/${cn}?verse=${vn}`, { scroll: false })
      return
    }

    verseSearch.search(searchQuery, {
      primaryLang: prefs.primaryLanguage,
      secondaryLang: prefs.secondaryLanguage,
      includeArabic: prefs.arabic,
      strict,
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, searchParams])

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
      if (!msg.toLowerCase().includes('index') && !msg.toLowerCase().includes('disabled')) {
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
      setSearchTab('words')
      runWordByWordQuery()
    }
  }, [forceTab, runWordByWordQuery])

  // ── Derived ───────────────────────────────────────────────────────────────
  const primaryCode = prefs.primaryLanguage !== 'xl' ? prefs.primaryLanguage : 'en'
  const titleMatches = verseSearch.data?.chapters?.filter((ch) => ch.tm) ?? []
  const allVerses = verseSearch.data?.chapters?.flatMap((ch) => ch.verses ?? []) ?? []

  if (verseSearch.loading && !verseSearch.data) {
    return (
      <div className="flex justify-center items-center py-16">
        <Spinner />
      </div>
    )
  }

  if (verseSearch.error) {
    return <p className="text-sm text-muted-foreground py-8 text-center">{verseSearch.error}</p>
  }

  if (!verseSearch.data) return null

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className={`space-y-5 ${ZOOM_WIDTH_CLASS[prefs.zoomLevel ?? 'comfortable']} mx-auto w-full`}>

      {/* Header */}
      <div className="flex items-baseline gap-3">
        <h2 className="text-xl font-semibold">{searchQuery}</h2>
        <span className="text-sm text-muted-foreground">{verseSearch.total} results</span>
      </div>

      <Tabs
        value={searchTab}
        onValueChange={(v) => {
          const tab = v as typeof searchTab
          setSearchTab(tab)
          const params = new URLSearchParams(searchParams.toString())
          params.set('tab', tab)
          router.replace(`${window.location.pathname}?${params.toString()}`, { scroll: false })
          if (tab === 'words') runWordByWordQuery()
        }}
        className="space-y-4"
      >
        {/* ── Toolbar ──────────────────────────────────────────────────────── */}
        <div className="flex flex-wrap items-center justify-between gap-y-3 gap-x-4 bg-muted/30 border border-border/40 rounded-2xl px-4 py-3">

          {/* Tabs */}
          <TabsList className="h-8 [&>*]:text-xs gap-0.5">
            <TabsTrigger value="all" className="h-7">
              {t('resultsTab', { count: verseSearch.total })}
            </TabsTrigger>
            <TabsTrigger value="words" className="h-7 gap-1">
              <SearchIcon className="size-3" />
              {t('wordSearch')}
              {wordMatches.length > 0 && (
                <span>({wordMatches.length > 2999 ? '3k+' : wordMatches.length})</span>
              )}
            </TabsTrigger>
          </TabsList>

          {/* Filters row */}
          <div className="flex items-center gap-5 text-xs">
            {/* Display toggles */}
            <div className="flex items-center gap-4">
              {[
                { id: 'f-text', label: t('text'), key: 'text' as const },
                { id: 'f-sub', label: tSettings('subtitles'), key: 'subtitles' as const },
                { id: 'f-fn', label: tSettings('footnotes'), key: 'footnotes' as const },
              ].map(({ id, label, key }) => (
                <div key={id} className="flex items-center gap-1.5">
                  <Checkbox
                    id={id}
                    checked={prefs[key]}
                    onCheckedChange={(v) => prefs.setPreferences({ ...prefs, [key]: !!v })}
                    className="size-3.5"
                  />
                  <Label htmlFor={id} className="text-xs cursor-pointer select-none text-muted-foreground">
                    {label}
                  </Label>
                </div>
              ))}
            </div>

            {/* Divider */}
            <div className="w-px h-4 bg-border/60 hidden sm:block" />

            {/* Strict mode */}
            <div className="flex items-center gap-1.5">
              <Switch
                id="strict-mode"
                checked={strict}
                disabled={searchQuery.split(' ').length <= 1}
                onCheckedChange={(checked) => {
                  const params = new URLSearchParams(searchParams.toString())
                  if (checked) params.set('strict', 'true')
                  else params.delete('strict')
                  router.replace(`${window.location.pathname}?${params.toString()}`, { scroll: false })
                }}
                className="scale-75 origin-left"
              />
              <Label htmlFor="strict-mode" className="text-xs cursor-pointer select-none text-muted-foreground">
                {t('strictSearch')}
              </Label>
            </div>
          </div>
        </div>

        {/* ── All results ───────────────────────────────────────────────────── */}
        <TabsContent value="all" className="space-y-4 mt-0">

          {/* Chapter title matches */}
          {titleMatches.length > 0 && (
            <div className="space-y-2">
              {titleMatches.map((ch) => (
                <SearchResultChapter key={`title:${ch.cn}`} chapter={ch} primaryCode={primaryCode} />
              ))}
            </div>
          )}

          {/* Verse list */}
          <div className="space-y-3">
            {allVerses.map((verse, index) => (
              <SearchResultVerse
                key={verse.vk ?? index}
                verse={verse}
                primaryCode={primaryCode}
                showText={prefs.text}
                showSubtitles={prefs.subtitles}
                showFootnotes={prefs.footnotes}
                showArabic={prefs.arabic}
              />
            ))}
          </div>

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
                    requestAnimationFrame(() => window.scrollTo({ top: y, behavior: 'instant' }))
                  })
                }}
              >
                {tCommon('loadMore', { shown: verseSearch.loadedCount, total: verseSearch.total })}
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
                        className="flex items-center gap-1 text-sm text-violet-600 hover:text-violet-700 bg-violet-600/5 hover:bg-violet-600/10 rounded-lg px-3 py-1 transition-colors"
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
                new Map(wordMatches.map((item) => [item.root_word, item])).values()
              ).map((item) => (
                <section
                  key={item.root_word}
                  className="bg-muted/30 border border-border/40 rounded-2xl p-5 space-y-3"
                >
                  <div className="flex items-baseline gap-3">
                    <p className="text-lg font-arabic">{item.arabic}</p>
                    <p className="text-sm text-muted-foreground">{item.transliterated}</p>
                  </div>
                  <div className="space-y-1.5 text-sm">
                    <p>
                      <span className="text-muted-foreground">{tQuran('rootWord')}: </span>
                      <span className="font-medium">{item.root_word}</span>
                    </p>
                    {item.meanings && (
                      <p>
                        <span className="text-muted-foreground">{tQuran('meanings')}: </span>
                        <span>{item.meanings}</span>
                      </p>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-1 pt-1 border-t border-border/30">
                    <span className="text-xs text-muted-foreground self-center mr-1">
                      {tQuran('occurrences', {
                        count: wordMatches.filter((r) => r.root_word === item.root_word).length,
                      })}:
                    </span>
                    {wordMatches
                      .filter((r) => r.root_word === item.root_word)
                      .map((r) => (
                        <QuranRef key={`root:${r.verse_id}:${r.word_index}`} reference={r.verse_id} />
                      ))}
                  </div>
                </section>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
