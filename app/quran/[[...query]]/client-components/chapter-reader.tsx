'use client'

import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  useCallback,
  useMemo,
  type MutableRefObject,
} from 'react'
import Link from 'next/link'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { Spinner } from '@/components/ui/spinner'
import { Button } from '@/components/ui/button'
import {
  useQuranPreferences,
  type DisplayMode,
  type QuranPreferences,
} from '@/hooks/use-quran-preferences'
import { useLanguagesStore } from '@/hooks/use-languages-store'
import {
  useChapterReader,
  type QuranResponse,
  type ChapterReaderOptions,
  type VerseData,
} from '@/hooks/use-chapter-reader'
import { VerseCard, toQuranVerse } from '../mini-components/verse-card'
import { VerseMinimap } from '../mini-components/verse-minimap'
import { ReadingView } from '../mini-components/reading-view'
import { MultiSelectBar } from '../mini-components/multi-select-bar'
import { useVerseSelection } from '@/hooks/use-verse-selection-store'
import { useTranslations } from 'next-intl'
import { useWindowVirtualizer } from '@tanstack/react-virtual'
import {
  useQuranPlayer,
  useQuranPlayerCallbacks,
} from '@/lib/quran-audio-context'
import { useChapterBorderLoader } from '@/hooks/use-chapter-border-loader'
import { ZOOM_WIDTH_CLASS, ZOOM_WIDTH_PX } from '@/lib/quran-zoom'

type VirtualizedVerseListProps = {
  chapterNumber: number
  verses: VerseData[]
  hasMore: boolean
  loading: boolean
  loadMore: (fallbackOpts?: ChapterReaderOptions) => Promise<void>
  prefetch: (targetVerse: number, fallbackOpts?: ChapterReaderOptions) => void
  seekToVerse: (
    targetVerse: number,
    fallbackOpts?: ChapterReaderOptions
  ) => Promise<void>
  opts: ChapterReaderOptions
  prefs: QuranPreferences
  displayMode: DisplayMode
  zoomLevel: QuranPreferences['zoomLevel']
  optsKey: string
  isRangeMode: boolean
  seekTarget: string | null
  setSeekTarget: (target: string | null) => void
  centerVerseRef: MutableRefObject<number>
  currentVerseId?: string
  isPlaying: boolean
  isBuffering: boolean
  chapterLabel: string
}

function VirtualizedVerseList({
  chapterNumber,
  verses,
  hasMore,
  loading,
  loadMore,
  prefetch,
  seekToVerse,
  opts,
  prefs,
  displayMode,
  zoomLevel,
  optsKey,
  isRangeMode,
  seekTarget,
  setSeekTarget,
  centerVerseRef,
  currentVerseId,
  isPlaying,
  isBuffering,
  chapterLabel,
}: VirtualizedVerseListProps) {
  const listRef = useRef<HTMLDivElement>(null)
  const [scrollMargin, setScrollMargin] = useState(0)
  const [viewportWidth, setViewportWidth] = useState<number | null>(null)
  const seekDoneRef = useRef(false)
  const prevFirstVerseRef = useRef('')
  const seekBehaviorRef = useRef<'auto' | 'smooth'>('auto')

  useLayoutEffect(() => {
    if (!listRef.current) return
    const rect = listRef.current.getBoundingClientRect()
    setScrollMargin(rect.top + window.scrollY)
  }, [])

  useEffect(() => {
    const updateViewportWidth = () => setViewportWidth(window.innerWidth)
    updateViewportWidth()
    window.addEventListener('resize', updateViewportWidth)
    return () => window.removeEventListener('resize', updateViewportWidth)
  }, [])

  const virtualizer = useWindowVirtualizer({
    count: verses.length,
    estimateSize: (index) => {
      const verse = verses[index]
      const primaryCode =
        prefs.primaryLanguage !== 'xl' ? prefs.primaryLanguage : 'en'
      const footnoteLen = verse?.tr?.[primaryCode]?.f?.length ?? 0
      const footnoteRows = Math.ceil(footnoteLen / 65)
      const wordCount = verse?.w?.length ?? 8
      // Keep the first client render identical to SSR to avoid hydration mismatch.
      const vw = viewportWidth ?? 768
      const innerPad = vw < 640 ? 48 : 64
      const zoomMaxW = ZOOM_WIDTH_PX[prefs.zoomLevel ?? 'comfortable']
      const containerW = Math.min(vw - 32 - innerPad, zoomMaxW - 32 - 64)

      if (displayMode === 'word') {
        const wordsPerRow = Math.max(2, Math.floor(containerW / 118))
        const wordRows = Math.ceil(wordCount / wordsPerRow)
        return Math.max(320, 160 + wordRows * 141 + footnoteRows * 22)
      }

      if (prefs.arabic && verse?.w && verse.w.length > 0) {
        const wordsPerRow = Math.max(3, Math.floor(containerW / 72))
        const wordRows = Math.ceil(wordCount / wordsPerRow)
        return Math.max(320, 240 + wordRows * 58 + footnoteRows * 22)
      }

      return Math.max(280, 280 + footnoteRows * 22)
    },
    overscan: 12,
    scrollMargin,
    scrollPaddingStart: 120,
    // Use the live scroll position for keyed remounts (mode/layout changes).
    // The parent resets scroll to 0 once on initial page entry, so we keep the
    // original navigation fix without breaking in-place remounts mid-chapter.
    initialOffset: () => (typeof window !== 'undefined' ? window.scrollY : 0),
  })

  useChapterBorderLoader(listRef, loading)

  const isFirstZoomMount = useRef(true)
  useEffect(() => {
    if (isFirstZoomMount.current) {
      isFirstZoomMount.current = false
      return
    }
    virtualizer.measure()
  }, [virtualizer, zoomLevel])

  useEffect(() => {
    if (viewportWidth === null) return
    virtualizer.measure()
  }, [viewportWidth, virtualizer])

  const virtualItems = virtualizer.getVirtualItems()
  const lastVirtualIndex = virtualItems[virtualItems.length - 1]?.index ?? -1
  const firstVirtualIndex = virtualItems[0]?.index ?? 0
  const firstVerseKey = verses[0]?.vk ?? ''

  const handlePreview = useCallback(
    (verseNumber: number) => {
      prefetch(verseNumber, opts)
    },
    [prefetch, opts]
  )

  const handleSeek = useCallback(
    (verseNumber: number) => {
      const isLoaded = verses.some(
        (v) => v.vk?.split(':')[1] === String(verseNumber)
      )

      if (isLoaded) {
        seekBehaviorRef.current = 'smooth'
        seekDoneRef.current = false
        setSeekTarget(String(verseNumber))
      } else {
        seekBehaviorRef.current = 'auto'
        seekDoneRef.current = false
        setSeekTarget(String(verseNumber))
        void seekToVerse(verseNumber, opts)
      }
    },
    [opts, seekToVerse, setSeekTarget, verses]
  )

  useEffect(() => {
    if (!seekTarget) return

    if (prevFirstVerseRef.current !== firstVerseKey) {
      prevFirstVerseRef.current = firstVerseKey
      seekDoneRef.current = false
    }

    if (seekDoneRef.current) return

    const targetIndex = verses.findIndex(
      (v) => v.vk?.split(':')[1] === seekTarget
    )
    if (targetIndex < 0) return

    virtualizer.scrollToIndex(targetIndex, {
      align: 'start',
      behavior: seekBehaviorRef.current,
    })
    seekBehaviorRef.current = 'auto'
    seekDoneRef.current = true

    const rafId = requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        virtualizer.scrollToIndex(targetIndex, {
          align: 'start',
          behavior: 'auto',
        })
      })
    )
    return () => cancelAnimationFrame(rafId)
  }, [firstVerseKey, seekTarget, verses, virtualizer])

  useEffect(() => {
    if (!currentVerseId || !isPlaying) return
    const idx = verses.findIndex((v) => v.vk === currentVerseId)
    if (idx < 0) return
    virtualizer.scrollToIndex(idx, { align: 'start', behavior: 'smooth' })
  }, [currentVerseId, isPlaying, verses, virtualizer])

  useEffect(() => {
    if (isRangeMode) return
    if (!hasMore || loading) return
    const isSeeking = !!seekTarget && !seekDoneRef.current
    const isNearEnd = lastVirtualIndex >= verses.length - 15
    if (!isSeeking && !isNearEnd) return
    const timer = setTimeout(() => void loadMore(opts), isSeeking ? 50 : 0)
    return () => clearTimeout(timer)
  }, [hasMore, isRangeMode, lastVirtualIndex, loadMore, loading, opts, seekTarget, verses.length])

  useEffect(() => {
    if (isRangeMode) return
    if (lastVirtualIndex < 0 || verses.length === 0) return
    const timer = setTimeout(() => {
      const centerY = window.scrollY + window.innerHeight / 2
      const items = virtualizer.getVirtualItems()
      const centerItem =
        items.find((v) => v.start <= centerY && v.start + v.size > centerY) ??
        items[Math.floor(items.length / 2)]
      const verse = verses[centerItem?.index ?? 0]
      if (!verse?.vk) return
      const vNum = verse.vk.split(':')[1]
      const params = new URLSearchParams(window.location.search)
      if (params.get('verse') === vNum) return
      params.set('verse', vNum)
      window.history.replaceState(
        null,
        '',
        `${window.location.pathname}?${params}`
      )
    }, 200)
    return () => clearTimeout(timer)
  }, [firstVirtualIndex, isRangeMode, lastVirtualIndex, verses, virtualizer])

  const [currentVerseNumber, setCurrentVerseNumber] = useState(1)
  useEffect(() => {
    const computeCurrentVerse = () => {
      if (verses.length === 0) return
      const scrollY = window.scrollY
      const viewportH = window.innerHeight
      const docH = document.documentElement.scrollHeight
      const isAtTop = scrollY <= 8
      const isAtBottom = scrollY + viewportH >= docH - 8

      let vNum: number
      if (isAtTop) {
        const first = verses[0]
        vNum = first ? parseInt(first.vk?.split(':')[1] ?? '1') : 1
      } else if (isAtBottom) {
        const last = verses[verses.length - 1]
        vNum = last ? parseInt(last.vk?.split(':')[1] ?? '1') : 1
      } else {
        const centerY = scrollY + viewportH / 2
        const items = virtualizer.getVirtualItems()
        const centerItem =
          items.find((v) => v.start <= centerY && v.start + v.size > centerY) ??
          items[Math.floor(items.length / 2)]
        const centerVerse = verses[centerItem?.index ?? 0]
        vNum = centerVerse
          ? parseInt(centerVerse.vk?.split(':')[1] ?? '1')
          : 1
      }
      setCurrentVerseNumber(vNum)
      centerVerseRef.current = vNum
    }

    window.addEventListener('scroll', computeCurrentVerse, { passive: true })
    computeCurrentVerse()
    return () => window.removeEventListener('scroll', computeCurrentVerse)
  }, [centerVerseRef, verses, virtualizer])

  const showNav = !hasMore && lastVirtualIndex === verses.length - 1

  return (
    <>
      <div>
        <div
          ref={listRef}
          className="bg-muted/30 backdrop-blur-sm rounded-3xl border border-border/40 overflow-hidden"
          style={{
            position: 'relative',
            height: Math.max(virtualizer.getTotalSize(), 300),
          }}
        >
          {verses.length === 0
            ? null
            : virtualItems.map((virtualItem) => {
                const verse = verses[virtualItem.index]
                const isLast =
                  virtualItem.index === verses.length - 1 && !hasMore
                return (
                  <div
                    key={`${optsKey}-${verse.vk ?? virtualItem.index}`}
                    data-index={virtualItem.index}
                    ref={virtualizer.measureElement}
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      transform: `translateY(${virtualItem.start - virtualizer.options.scrollMargin}px)`,
                    }}
                  >
                    <VerseCard
                      verse={verse}
                      isLast={isLast}
                      isScrollTarget={
                        seekTarget !== null &&
                        verse.vk?.split(':')[1] === seekTarget
                      }
                      optsKey={optsKey}
                      isCurrentAudio={currentVerseId === (verse.vk ?? '')}
                      isPlaying={isPlaying}
                      isBuffering={isBuffering}
                    />
                  </div>
                )
              })}
        </div>

        <div
          className={`overflow-hidden transition-all duration-500 ease-in-out ${
            showNav ? 'max-h-48 opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="flex justify-between items-center gap-4 p-6">
            {chapterNumber > 1 ? (
              <Link href={`/quran/${chapterNumber - 1}`} prefetch>
                <Button
                  variant="secondary"
                  size="lg"
                  className="flex items-center gap-2"
                >
                  <ArrowLeft className="size-4 shrink-0" />
                  <span>
                    <span className="hidden sm:inline">{chapterLabel} </span>
                    {chapterNumber - 1}
                  </span>
                </Button>
              </Link>
            ) : (
              <span />
            )}

            {chapterNumber < 114 ? (
              <Link
                href={`/quran/${chapterNumber + 1}`}
                prefetch
                className="ml-auto"
              >
                <Button
                  variant="secondary"
                  size="lg"
                  className="flex items-center gap-2"
                >
                  <span>
                    <span className="hidden sm:inline">{chapterLabel} </span>
                    {chapterNumber + 1}
                  </span>
                  <ArrowRight className="size-4 shrink-0" />
                </Button>
              </Link>
            ) : (
              <span />
            )}
          </div>
        </div>
      </div>

      {!isRangeMode && (
        <VerseMinimap
          chapterNumber={chapterNumber}
          currentVerseNumber={currentVerseNumber}
          verses={verses}
          onSeek={handleSeek}
          onPreview={handlePreview}
        />
      )}
    </>
  )
}

export function ChapterReader({
  chapterNumber,
  initialData,
  initialVerse,
  rangeStart,
  rangeEnd,
}: {
  chapterNumber: number
  initialData: QuranResponse | null
  initialVerse?: string
  rangeStart?: number
  rangeEnd?: number
}) {
  const isRangeMode = rangeStart !== undefined && rangeEnd !== undefined
  const prefs = useQuranPreferences()
  const { displayMode } = prefs
  const zoomLevel = prefs.zoomLevel ?? 'comfortable'
  const { getDirection } = useLanguagesStore()
  const reader = useChapterReader(chapterNumber, initialData, rangeStart, rangeEnd)
  // Selection is session-only and should not persist across chapter changes.
  const clearSelection = useVerseSelection((s) => s.clear)
  useEffect(() => {
    clearSelection()
  }, [chapterNumber, clearSelection])
  const t = useTranslations('quran')
  const tCommon = useTranslations('common')
  // State context: subscribe to currentVerse/isPlaying/isBuffering to compute
  // per-card isCurrentAudio and pass play state as props (not read inside each card).
  const { currentVerse, isPlaying, isBuffering } = useQuranPlayer()
  // Callbacks context: stable reference, used for setChapterQueue.
  const { setChapterQueue } = useQuranPlayerCallbacks()

  // Read the initial verse from the prop (passed by the Server Component),
  // NOT from useSearchParams(). useSearchParams() subscribes to Next.js router
  // contexts and causes ChapterReader (+ all VerseCards) to re-render on every
  // window.history.replaceState call from the URL sync effect — causing 46x
  // VerseCard re-renders and the QuranSidebar's 160 links to re-render on each scroll.
  const [seekTarget, setSeekTarget] = useState<string | null>(
    () => initialVerse ?? null
  )
  // Always holds the verse currently at the viewport centre — synced by the scroll
  // listener so any reload (mode switch, language change) can anchor to it without
  // causing the "verses climb to the top" effect.
  const centerVerseRef = useRef(1)
  const readingSeekDoneRef = useRef(false)
  const readingPrevFirstVerseRef = useRef('')

  // Memoized so that callbacks listing `opts` as a dep remain stable across
  // renders where unrelated state changes (scroll position, seek target, etc.).
  // wordByWord implies we need Arabic + word data even if `arabic` is toggled off.
  // Reading mode needs Arabic text but NOT word-by-word data (saves bandwidth).
  const needsArabic = prefs.arabic || prefs.wordByWord || displayMode === 'reading'
  const opts = useMemo<ChapterReaderOptions>(
    () => ({
      primaryLang: prefs.primaryLanguage,
      secondaryLang: displayMode === 'word' ? undefined : prefs.secondaryLanguage,
      includeArabic: needsArabic,
      includeWords: needsArabic && displayMode !== 'reading',
      includeRoot: needsArabic && displayMode !== 'reading',
      includeMeaning: needsArabic && displayMode !== 'reading',
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [prefs.primaryLanguage, prefs.secondaryLanguage, prefs.arabic, prefs.wordByWord, displayMode]
  )

  // Keep the audio player queue in sync with loaded verses.
  const audioQueue = useMemo(
    () => reader.verses.map(toQuranVerse),
    [reader.verses]
  )
  useEffect(() => {
    if (audioQueue.length > 0) setChapterQueue(audioQueue)
  }, [audioQueue, setChapterQueue])

  // Re-fetch when API-relevant preferences change. `opts` is memoized on the
  // same deps, so it only gets a new reference when prefs actually change —
  // the isFirstMount guard prevents a spurious reload on mount.
  const isFirstMount = useRef(true)
  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false
      return
    }
    const anchor = centerVerseRef.current
    // Anchor to the current viewport centre on mode/language switch so the reader
    // doesn't jump back to verse 1 or the original seek target.
    if (anchor > 1) {
      readingSeekDoneRef.current = false
      setSeekTarget(String(anchor))
      reader.reload(opts, anchor)
    } else {
      reader.reload(opts, seekTarget ? parseInt(seekTarget) : undefined)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opts])

  // Initial load if SSR returned nothing, or if SSR data (always en+ar) doesn't
  // contain the user's primary or secondary language. SSR can't know client prefs,
  // so it always fetches English + Arabic. If the user's stored pref is e.g. French
  // primary or a secondary language, reload immediately so the correct translation shows.
  useEffect(() => {
    const primaryCode = opts.primaryLang !== 'xl' ? opts.primaryLang : 'en'
    const secondaryCode =
      opts.secondaryLang && opts.secondaryLang !== 'xl' ? opts.secondaryLang : null
    const firstVerse = reader.verses[0]
    const needsReload =
      reader.verses.length === 0 ||
      firstVerse?.tr?.[primaryCode] === undefined ||
      (secondaryCode !== null && firstVerse?.tr?.[secondaryCode] === undefined)
    if (needsReload) reader.reload(opts, seekTarget ? parseInt(seekTarget) : undefined)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useLayoutEffect(() => {
    // Reset once on initial entry so chapter navigation never inherits the
    // previous page's scroll position. The keyed virtualized child uses the
    // live scrollY on later remounts, so in-reader mode switches stay anchored.
    window.scrollTo(0, 0)
  }, [])

  const firstVerseKey = reader.verses[0]?.vk ?? ''

  // Reading mode: scroll to the target verse by ID once it appears in the DOM.
  // ReadingView auto-loads all verses; this fires on each new batch until found.
  useEffect(() => {
    if (displayMode !== 'reading') return
    if (!seekTarget) return

    // Verse window replaced by reload → allow re-seek in the new window
    if (readingPrevFirstVerseRef.current !== firstVerseKey) {
      readingPrevFirstVerseRef.current = firstVerseKey
      readingSeekDoneRef.current = false
    }

    if (readingSeekDoneRef.current) return
    const el = document.getElementById(`${chapterNumber}:${seekTarget}`)
    if (!el) return

    // Two frames let the browser fully lay out the prose block.
    // We then normalize scroll to 0 before measuring so that the inherited
    // window.scrollY from a previous mode (virtualizer) doesn't corrupt the
    // calculation. Both scrollTo calls are synchronous within the same frame,
    // so the browser renders only once at the final position — no visible flash.
    const rafId = requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        window.scrollTo(0, 0)
        const top = el.getBoundingClientRect().top - 120
        window.scrollTo({ top: Math.max(0, top), behavior: 'instant' })
        readingSeekDoneRef.current = true
      })
    )
    return () => cancelAnimationFrame(rafId)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [displayMode, firstVerseKey, reader.verses.length, seekTarget])

  // Stable key that changes when language prefs change — propagated to VerseCard
  // so that memo's arePropsEqual can detect reloads vs. same-language seeks.
  const optsKey = `${prefs.primaryLanguage}-${prefs.secondaryLanguage ?? 'none'}-${prefs.arabic}-${prefs.wordByWord}-${displayMode}-${zoomLevel}`
  const layoutKey = `${optsKey}-${prefs.text}-${prefs.footnotes}-${prefs.subtitles}-${prefs.transliteration}`

  const primaryCode = prefs.primaryLanguage !== 'xl' ? prefs.primaryLanguage : 'en'
  const arTitle = reader.chapterTitles?.['ar']
  const primaryTitle =
    reader.chapterTitles?.[primaryCode] ?? t('sura', { number: chapterNumber })
  const secondaryTitle =
    prefs.secondaryLanguage && prefs.secondaryLanguage !== 'xl'
      ? reader.chapterTitles?.[prefs.secondaryLanguage]
      : undefined

  return (
    <div className={`flex flex-col gap-2 ${ZOOM_WIDTH_CLASS[zoomLevel]} mx-auto w-full px-4 pt-3 pb-32`}>
      {/* Chapter title */}
      <div className="shrink-0 flex justify-between items-center p-4 bg-muted/50 rounded-2xl">
        <div className="flex flex-col gap-1 flex-1 min-w-0">
          {/* Two-column row: LTR primary on the left, Arabic on the right */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex flex-col gap-0.5 min-w-0">
              <h1
                className="text-xl font-bold"
                dir={getDirection(primaryCode)}
              >
                {t('chapter', { number: chapterNumber, title: primaryTitle })}
              </h1>
              {secondaryTitle && (
                <p
                  className="text-sm text-muted-foreground italic"
                  dir={prefs.secondaryLanguage ? getDirection(prefs.secondaryLanguage) : undefined}
                >
                  {secondaryTitle}
                </p>
              )}
              {reader.loading && reader.verses.length > 0 && (
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Spinner className="size-3" />
                  {tCommon('loading')}
                </p>
              )}
            </div>
            {arTitle && (
              <p
                className="font-arabic text-2xl text-right text-foreground/90 shrink-0"
                dir="rtl"
              >
                {arTitle}
              </p>
            )}
          </div>

          {/* Range mode: show verse range + link to full chapter */}
          {isRangeMode && rangeStart !== undefined && rangeEnd !== undefined && (
            <div className="mt-2 pt-2 border-t border-border/30 flex items-center justify-between gap-2">
              <span className="text-xs text-muted-foreground">
                {t('versesRange', { start: rangeStart, end: rangeEnd })}
              </span>
              <Link
                href={`/quran/${chapterNumber}?verse=${rangeStart}`}
                className="text-xs text-primary hover:underline flex items-center gap-1 shrink-0"
              >
                {tCommon('viewFullChapter')}
                <ArrowRight className="size-3" />
              </Link>
            </div>
          )}

          {/* Verse anchor: show rendered range + link to full chapter (only when not starting from beginning) */}
          {!isRangeMode && initialVerse && (reader.verses[0]?.vi ?? 0) > 1 && (
            <div className="mt-2 pt-2 border-t border-border/30 flex items-center justify-between gap-2">
              <span className="text-xs text-muted-foreground">
                {(() => {
                  const first = reader.verses[0]?.vi
                  const last = reader.verses[reader.verses.length - 1]?.vi
                  return first !== undefined && last !== undefined
                    ? t('versesRange', { start: first, end: last })
                    : null
                })()}
              </span>
              <Link
                href={`/quran/${chapterNumber}`}
                className="text-xs text-primary hover:underline flex items-center gap-1 shrink-0"
              >
                {tCommon('viewFullChapter')}
                <ArrowRight className="size-3" />
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Reading mode — full prose view, window scrolls naturally */}
      {displayMode === 'reading' && (
        <div className="bg-muted/30 backdrop-blur-sm rounded-3xl border border-border/40">
          <ReadingView
            verses={reader.verses}
            hasMore={reader.hasMore}
            loading={reader.loading}
            loadMore={reader.loadMore}
            opts={opts}
          />
        </div>
      )}

      {/* Verse/Word mode — window virtualizer, page scrolls naturally. */}
      {displayMode !== 'reading' && (
        <VirtualizedVerseList
          key={layoutKey}
          chapterNumber={chapterNumber}
          verses={reader.verses}
          hasMore={reader.hasMore}
          loading={reader.loading}
          loadMore={reader.loadMore}
          prefetch={reader.prefetch}
          seekToVerse={reader.seekToVerse}
          opts={opts}
          prefs={prefs}
          displayMode={displayMode}
          zoomLevel={zoomLevel}
          optsKey={optsKey}
          isRangeMode={isRangeMode}
          seekTarget={seekTarget}
          setSeekTarget={setSeekTarget}
          centerVerseRef={centerVerseRef}
          currentVerseId={currentVerse?.verse_id}
          isPlaying={isPlaying}
          isBuffering={isBuffering}
          chapterLabel={tCommon('chapter')}
        />
      )}

      {reader.error && (
        <p className="text-sm text-destructive text-center py-2">
          {reader.error}
        </p>
      )}

      <MultiSelectBar />
    </div>
  )
}
