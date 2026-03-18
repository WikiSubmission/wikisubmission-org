'use client'

import { ws } from '@/lib/wikisubmission-sdk'
import { useState, useEffect, useCallback, useRef } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { SearchHitWordByWord } from 'wikisubmission-sdk/lib/quran/v1/query-result'
import { Spinner } from '@/components/ui/spinner'
import { Tabs, TabsTrigger, TabsContent, TabsList } from '@/components/ui/tabs'
import {
  ArrowRightIcon,
  ArrowUpRightIcon,
  ChevronRight,
  SearchIcon,
} from 'lucide-react'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { toast } from 'sonner'
import { useQuranPreferences } from '@/hooks/use-quran-preferences'
import {
  useVerseSearch,
  type ChapterResult,
  type VerseResult,
} from '@/hooks/use-verse-search'
import Link from 'next/link'
import { QuranRef } from '@/components/quran-ref'
import { useTranslations } from 'next-intl'

// ─── New API renderers ────────────────────────────────────────────────────────

/** Parses <b>…</b> from backend highlights into styled spans (no dangerouslySetInnerHTML) */
function HighlightText({ text }: { text?: string | null }) {
  if (!text) return null
  return (
    <>
      {text.split(/(<b>.*?<\/b>)/g).map((part, i) => {
        if (part.startsWith('<b>') && part.endsWith('</b>')) {
          return (
            <span
              key={i}
              className="bg-violet-600/10 text-violet-600 dark:text-violet-400 rounded-sm font-bold"
            >
              {part.slice(3, -4)}
            </span>
          )
        }
        return part || null
      })}
    </>
  )
}

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
    <Link href={`/quran/${chapter.cn}`}>
      <div className="flex items-center gap-1 bg-muted/50 p-4 rounded-2xl w-fit hover:bg-muted/80">
        <p>
          <strong>{t('sura', { number: chapter.cn ?? '' })}:</strong> {title}
        </p>
        <ChevronRight className="size-4" />
      </div>
    </Link>
  )
}

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
  const [chNum, vNum] = (verse.vk ?? '').split(':').map(Number)
  const tr = verse.tr?.[primaryCode]
  const arTr = verse.tr?.['ar']

  return (
    <div className="space-y-2 bg-muted/50 rounded-2xl p-4">
      <Link
        href={`/quran/${chNum}?verse=${vNum}`}
        target="_blank"
        className="flex items-center gap-1 w-fit text-xs text-muted-foreground tracking-wider text-violet-600 hover:cursor-pointer"
      >
        <p>{verse.vk}</p>
        <ArrowUpRightIcon className="size-4" />
      </Link>

      {showText && tr && (
        <p>
          <strong>[{verse.vk}]</strong>{' '}
          {tr.hl ? <HighlightText text={tr.hl} /> : tr.tx}
        </p>
      )}

      {showSubtitles && tr?.s && (
        <p className="text-sm text-muted-foreground italic">
          <HighlightText text={tr.s} />
        </p>
      )}

      {showFootnotes && tr?.f && (
        <p className="text-sm text-muted-foreground">
          <HighlightText text={tr.f} />
        </p>
      )}

      {showArabic && arTr?.tx && (
        <p className="text-right text-xl tracking-widest" dir="rtl">
          {arTr.tx}
        </p>
      )}
    </div>
  )
}

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

  // Word search (still SDK — backend word scope is a different feature)
  const [searchTab, setSearchTab] = useState<'all' | 'words'>('all')
  const [wordMatches, setWordMatches] = useState<SearchHitWordByWord[]>([])
  const [wordLoading, setWordLoading] = useState(false)

  const lastQueryRef = useRef<string | null>(null)
  const lastStrictRef = useRef<string | null>(null)
  const didInitRef = useRef(false)

  // ── Primary query effect ─────────────────────────────────────────────────────
  useEffect(() => {
    const currentStrict = searchParams.get('strict')
    const isNewQuery = searchQuery !== lastQueryRef.current
    const isNewStrict = currentStrict !== lastStrictRef.current

    if (!isNewQuery && !isNewStrict) return

    lastQueryRef.current = searchQuery
    lastStrictRef.current = currentStrict

    if (!searchQuery) return

    verseSearch.reset()
    setWordMatches([])
    setSearchTab('all')

    // Direct verse ref (e.g. "2:255") → redirect to chapter reader
    if (/^\d+:\d+$/.test(searchQuery)) {
      const [cn, vn] = searchQuery.split(':')
      router.replace(`/quran/${cn}?verse=${vn}`, { scroll: false })
      return
    }

    // Text search → new API
    verseSearch.search(searchQuery, {
      primaryLang: prefs.primaryLanguage,
      secondaryLang: prefs.secondaryLanguage,
      includeArabic: prefs.arabic,
      strict,
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, searchParams])

  // ── Word search (SDK) ────────────────────────────────────────────────────────
  const runWordByWordQuery = useCallback(async () => {
    if (wordMatches.length > 0) return
    if (!searchQuery) return

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
      toast.error(decodeURIComponent(result.error))
    } else {
      toast.error(`No word matches for '${searchQuery}'`)
    }

    setWordLoading(false)
  }, [searchQuery, wordMatches])

  // ── Init tab from URL ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!didInitRef.current) {
      didInitRef.current = true
      if (forceTab === 'words') {
        setSearchTab('words')
        runWordByWordQuery()
      }
    }
  }, [forceTab, runWordByWordQuery])

  // ── Derived ──────────────────────────────────────────────────────────────────
  const primaryCode = prefs.primaryLanguage !== 'xl' ? prefs.primaryLanguage : 'en'
  const titleMatches = verseSearch.data?.chapters?.filter((ch) => ch.tm) ?? []
  const allVerses =
    verseSearch.data?.chapters?.flatMap((ch) => ch.verses ?? []) ?? []
  const isLoading = verseSearch.loading && !verseSearch.data

  // ── Render ───────────────────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <div className="p-4 flex justify-center items-center">
        <Spinner />
      </div>
    )
  }

  // Text search results (new API)
  if (verseSearch.data) {
    return (
      <div className="space-y-2">
        <h2 className="text-xl font-bold">{searchQuery}</h2>

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
          {/* Tab header */}
          <div className="flex justify-between items-center">
            <TabsList className="flex [&>*]:text-xs">
              <TabsTrigger value="all">
                {t('resultsTab', { count: verseSearch.total })}
              </TabsTrigger>
              <TabsTrigger value="words">
                <SearchIcon className="size-3" />
                {t('wordSearch')}
                {wordMatches.length > 0
                  ? wordMatches.length > 2999
                    ? ` ${t('moreThan3000')}`
                    : ` (${wordMatches.length})`
                  : ''}
              </TabsTrigger>
            </TabsList>

            {/* Strict mode */}
            <div className="flex items-center gap-2">
              <Switch
                id="strict-mode"
                checked={strict}
                onCheckedChange={(checked) => {
                  const params = new URLSearchParams(searchParams.toString())
                  if (checked) params.set('strict', 'true')
                  else params.delete('strict')
                  router.replace(
                    `${window.location.pathname}?${params.toString()}`,
                    { scroll: false }
                  )
                }}
                disabled={searchQuery.split(' ').length <= 1}
              />
              <Label
                htmlFor="strict-mode"
                className="text-xs text-muted-foreground select-none cursor-pointer"
              >
                {t('strictSearch')}
              </Label>
            </div>
          </div>

          {/* Display filters — toggle what fields are shown per verse */}
          <section className="flex items-center gap-4">
            <div className="flex items-center gap-2 [&>*]:text-xs">
              <Checkbox
                checked={prefs.text}
                onCheckedChange={(v) =>
                  prefs.setPreferences({ ...prefs, text: !!v })
                }
                id="filter-text"
              />
              <Label htmlFor="filter-text">{t('text')}</Label>
            </div>
            <div className="flex items-center gap-2 [&>*]:text-xs">
              <Checkbox
                checked={prefs.subtitles}
                onCheckedChange={(v) =>
                  prefs.setPreferences({ ...prefs, subtitles: !!v })
                }
                id="filter-subtitles"
              />
              <Label htmlFor="filter-subtitles">{tSettings('subtitles')}</Label>
            </div>
            <div className="flex items-center gap-2 [&>*]:text-xs">
              <Checkbox
                checked={prefs.footnotes}
                onCheckedChange={(v) =>
                  prefs.setPreferences({ ...prefs, footnotes: !!v })
                }
                id="filter-footnotes"
              />
              <Label htmlFor="filter-footnotes">{tSettings('footnotes')}</Label>
            </div>
          </section>

          {/* Main results */}
          <TabsContent value="all" className="space-y-2">
            {titleMatches.map((ch) => (
              <SearchResultChapter
                key={`title:${ch.cn}`}
                chapter={ch}
                primaryCode={primaryCode}
              />
            ))}

            {/* Flat verse list — no virtualizer to avoid scroll glitching */}
            <div className="space-y-2">
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
              <div className="flex justify-center py-4">
                <Spinner />
              </div>
            )}

            {verseSearch.hasMore && !verseSearch.loading && (
              <div className="flex justify-center pt-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => verseSearch.loadMore()}
                >
                  {tCommon('loadMore', { shown: verseSearch.loadedCount, total: verseSearch.total })}
                </Button>
              </div>
            )}

            {!verseSearch.hasMore && allVerses.length > 0 && (
              <p className="text-center text-xs text-muted-foreground py-2">
                {t('allResultsShown', { count: verseSearch.total })}
              </p>
            )}
          </TabsContent>

          {/* Word search (SDK) */}
          <TabsContent value="words">
            <div className="space-y-2">
              {wordLoading && <Spinner />}

              {wordMatches.length === 0 && !wordLoading && (
                <div className="space-y-2">
                  <p className="text-muted-foreground">{t('noMatches')}</p>
                  {searchQuery.split(' ').length > 1 && (
                    <div className="bg-muted/50 p-4 rounded-2xl space-y-2">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <SearchIcon className="size-4" />
                        <p>{t('trySearching')}</p>
                      </div>
                      <div>
                        {searchQuery.split(' ').map((q) => (
                          <div
                            key={q}
                            className="flex items-center gap-2 text-violet-600 hover:text-violet-700 hover:cursor-pointer"
                          >
                            <a href={`?q=${q}&tab=words`}>{q}</a>
                            <ArrowRightIcon className="size-4" />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {wordMatches.length > 0 && (
                <div className="space-y-2">
                  {Array.from(
                    new Map(
                      wordMatches.map((item) => [item.root_word, item])
                    ).values()
                  ).map((item) => (
                    <section
                      key={item.root_word}
                      className="bg-muted/50 p-4 rounded-2xl space-y-2"
                    >
                      <p className="text-xl text-muted-foreground tracking-wider">
                        {item.transliterated} / {item.arabic}
                      </p>
                      <p className="w-fit rounded-2xl">
                        <strong>{tQuran('rootWord')}:</strong> {item.root_word}
                      </p>
                      <p className="w-fit rounded-2xl gap-1 flex flex-wrap">
                        <strong>
                          {tQuran('occurrences', {
                            count: wordMatches.filter(
                              (r) => r.root_word === item.root_word
                            ).length,
                          })}:
                        </strong>{' '}
                        {wordMatches
                          .filter((r) => r.root_word === item.root_word)
                          .map((r) => (
                            <QuranRef
                              key={`root:${r.verse_id}:${r.word_index}`}
                              reference={r.verse_id}
                            />
                          ))}
                      </p>
                      {item.meanings && (
                        <p className="rounded-2xl">
                          <strong>{tQuran('meanings')}:</strong> {item.meanings}
                        </p>
                      )}
                    </section>
                  ))}
                </div>
              )}

            </div>
          </TabsContent>
        </Tabs>
      </div>
    )
  }

  return null
}
