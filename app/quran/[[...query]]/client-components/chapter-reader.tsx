'use client'

import { useEffect, useLayoutEffect, useRef, useState, useCallback, useMemo } from 'react'
import Link from 'next/link'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { Spinner } from '@/components/ui/spinner'
import { Button } from '@/components/ui/button'
import { useQuranPreferences } from '@/hooks/use-quran-preferences'
import { useLanguagesStore } from '@/hooks/use-languages-store'
import {
  useChapterReader,
  type QuranResponse,
  type ChapterReaderOptions,
} from '@/hooks/use-chapter-reader'
import { VerseCard, toQuranVerse } from '../mini-components/verse-card'
import { VerseMinimap } from '../mini-components/verse-minimap'
import { ReadingView } from '../mini-components/reading-view'
import { useTranslations } from 'next-intl'
import { useWindowVirtualizer } from '@tanstack/react-virtual'
import {
  useQuranPlayer,
  useQuranPlayerCallbacks,
} from '@/lib/quran-audio-context'
import { useChapterBorderLoader } from '@/hooks/use-chapter-border-loader'
import { ZOOM_WIDTH_CLASS, ZOOM_WIDTH_PX } from '@/lib/quran-zoom'

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
  const seekDoneRef = useRef(false)
  // Tracks which verse window was active at last seek — resets seekDoneRef when reload replaces it.
  const prevFirstVerseRef = useRef('')
  // Always holds the verse currently at the viewport centre — synced by the scroll
  // listener so any reload (mode switch, language change) can anchor to it without
  // causing the "verses climb to the top" effect.
  const centerVerseRef = useRef(1)
  const readingSeekDoneRef = useRef(false)
  const readingPrevFirstVerseRef = useRef('')

  // Differentiate smooth (user minimap tap) from instant (programmatic/load) seeks.
  const seekBehaviorRef = useRef<'auto' | 'smooth'>('auto')

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
      seekDoneRef.current = false
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

  // ── Window virtualizer (page-level scroll) ────────────────────────────────
  // scrollMargin = distance from document top to the virtual list container.
  // Measured via useLayoutEffect so it's ready before any useEffect seeks fire.
  const listRef = useRef<HTMLDivElement>(null)
  const [scrollMargin, setScrollMargin] = useState(0)

  useLayoutEffect(() => {
    // Reset scroll before measuring — prevents inheriting the previous page's
    // scroll position and ensures scrollMargin is computed from the true top.
    window.scrollTo(0, 0)
    if (listRef.current) {
      const rect = listRef.current.getBoundingClientRect()
      setScrollMargin(rect.top + window.scrollY)
    }
  }, [])

  const virtualizer = useWindowVirtualizer({
    count: reader.verses.length,
    // Per-verse estimate: counts words (for word-by-word mode) and footnote length
    // to get a close initial size before ResizeObserver fires and corrects positions.
    // A flat value under-estimates long-footnote verses and over-estimates short ones.
    estimateSize: (index) => {
      const verse = reader.verses[index]
      const primaryCode = prefs.primaryLanguage !== 'xl' ? prefs.primaryLanguage : 'en'
      const footnoteLen = verse?.tr?.[primaryCode]?.f?.length ?? 0
      const footnoteRows = Math.ceil(footnoteLen / 65)

      if (prefs.wordByWord) {
        const wordCount = verse?.w?.length ?? 8
        // Responsive words-per-row: word cards are ~110px wide + 8px gap = ~118px each.
        // Container = min(vw, 896px) minus outer px-4 (32px) and inner p-6/p-8 (48-64px).
        const vw = typeof window !== 'undefined' ? window.innerWidth : 768
        const innerPad = vw < 640 ? 48 : 64 // p-6 vs p-8 on each side × 2
        const zoomMaxW = ZOOM_WIDTH_PX[prefs.zoomLevel ?? 'comfortable']
        const containerW = Math.min(vw - 32 - innerPad, zoomMaxW - 32 - 64)
        const wordsPerRow = Math.max(2, Math.floor(containerW / 118))
        const wordRows = Math.ceil(wordCount / wordsPerRow)
        // Each row: ~109px item + 32px gap-y-8; py-4 wrapper adds 32px; card overhead ~160px
        return Math.max(320, 160 + wordRows * 141 + footnoteRows * 22)
      }
      // Compact / verse mode: text + Arabic inline, footnotes can be very long
      return Math.max(280, 280 + footnoteRows * 22)
    },
    overscan: 12,
    scrollMargin,
    // scrollPaddingStart keeps scrollToIndex results below the fixed headers
    // (SiteNav 64px + sub-header 56px = 120px).
    scrollPaddingStart: 120,
    // Override the library default of `() => window.scrollY` — without this,
    // navigating from the chapter list while scrolled down causes the virtualizer
    // to initialise with the inherited scroll offset and render items at the wrong
    // position before the useLayoutEffect scroll-reset can take effect.
    initialOffset: 0,
  })

  // GSAP border-glow while loading; completion flash when verses arrive.
  useChapterBorderLoader(listRef, reader.loading)

  // Invalidate all cached item heights when zoom changes — width and font size both
  // change, so every measured height is stale. ResizeObserver corrects as items scroll in.
  const isFirstZoomMount = useRef(true)
  useEffect(() => {
    if (isFirstZoomMount.current) {
      isFirstZoomMount.current = false
      return
    }
    virtualizer.measure()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [zoomLevel])

  const virtualItems = virtualizer.getVirtualItems()
  const lastVirtualIndex = virtualItems[virtualItems.length - 1]?.index ?? -1
  const firstVirtualIndex = virtualItems[0]?.index ?? 0

  // ── Minimap handlers ──────────────────────────────────────────────────────
  // Destructure stable callbacks so ESLint can track them as deps directly.
  // After the stateRef fix in use-chapter-reader, prefetch and seekToVerse are
  // stable references (only change if chapterNumber changes).
  const {
    prefetch: readerPrefetch,
    seekToVerse: readerSeekToVerse,
    verses: readerVerses,
  } = reader

  // Prefetch a verse window while the user is hovering over the minimap.
  // The hook deduplicates concurrent requests via an internal promise cache.
  const handlePreview = useCallback(
    (verseNumber: number) => {
      readerPrefetch(verseNumber, opts)
    },
    [readerPrefetch, opts]
  )

  // On release: if the verse is already in the loaded window, smooth-scroll to
  // it. Otherwise do a direct seekToVerse jump (no incremental batch loading).
  const handleSeek = useCallback(
    (verseNumber: number) => {
      const isLoaded = readerVerses.some(
        (v) => v.vk?.split(':')[1] === String(verseNumber)
      )

      if (isLoaded) {
        seekBehaviorRef.current = 'smooth'
        seekDoneRef.current = false
        setSeekTarget(String(verseNumber))
      } else {
        // Direct jump — replaces verse window, no scrolling through intermediates.
        // seekToVerse consumes the prefetch cache if the user hovered long enough.
        seekBehaviorRef.current = 'auto'
        seekDoneRef.current = false
        setSeekTarget(String(verseNumber))
        readerSeekToVerse(verseNumber, opts)
      }
    },
    [readerVerses, readerSeekToVerse, opts]
  )

  // firstVerseKey changes when reload replaces the entire window (e.g. switching to
  // word-by-word triggers opts change → reload from verse 0). It stays stable when
  // loadMore appends verses. Used to detect window replacement and reset seekDoneRef.
  const firstVerseKey = reader.verses[0]?.vk ?? ''

  // Scroll to seekTarget once the verse is in the loaded data.
  // Also handles post-reload re-seeks: if the verse window was replaced (firstVerseKey
  // changed), seekDoneRef is reset so the seek fires again for the new window.
  useEffect(() => {
    if (!seekTarget) return

    // Verse window replaced by a reload → allow re-seek in the new window
    if (prevFirstVerseRef.current !== firstVerseKey) {
      prevFirstVerseRef.current = firstVerseKey
      seekDoneRef.current = false
    }

    if (seekDoneRef.current) return

    const targetIndex = reader.verses.findIndex(
      (v) => v.vk?.split(':')[1] === seekTarget
    )
    if (targetIndex >= 0) {
      virtualizer.scrollToIndex(targetIndex, {
        align: 'start',
        behavior: seekBehaviorRef.current,
      })
      seekBehaviorRef.current = 'auto'
      seekDoneRef.current = true

      // Retry after two animation frames so ResizeObserver has corrected item
      // heights (especially important in word-by-word mode where estimates can
      // diverge from actual sizes and shift the viewport after the first scroll).
      const rafId = requestAnimationFrame(() =>
        requestAnimationFrame(() => {
          virtualizer.scrollToIndex(targetIndex, { align: 'start', behavior: 'auto' })
        })
      )
      return () => cancelAnimationFrame(rafId)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [firstVerseKey, reader.verses.length, seekTarget])

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

  // Auto-scroll when the audio player advances to the next verse.
  // Only triggers when verse_id actually changes (not on play/pause toggle).
  // Skips if the verse isn't in the current loaded window (no jarring jump).
  useEffect(() => {
    if (!currentVerse || !isPlaying) return
    const idx = reader.verses.findIndex((v) => v.vk === currentVerse.verse_id)
    if (idx < 0) return
    virtualizer.scrollToIndex(idx, { align: 'start', behavior: 'smooth' })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentVerse?.verse_id])

  // Aggressively load more batches when seeking an unloaded verse,
  // or normally when the user is near the end of loaded content.
  // In range mode the initial data IS the full range — no further loading.
  useEffect(() => {
    if (isRangeMode) return
    if (!reader.hasMore || reader.loading) return
    const isSeeking = !!seekTarget && !seekDoneRef.current
    const isNearEnd = lastVirtualIndex >= reader.verses.length - 15
    if (!isSeeking && !isNearEnd) return
    const timer = setTimeout(() => reader.loadMore(opts), isSeeking ? 50 : 0)
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lastVirtualIndex, reader.hasMore, reader.loading, seekTarget])

  // Sync URL ?verse=N with the verse at the centre of the viewport.
  // Debounced 200ms so replaceState only fires when scrolling pauses.
  // Uses window.history.replaceState directly (NOT router.replace) to avoid
  // triggering Next.js router context updates which would re-render all consumers.
  //
  // IMPORTANT: virtualItems includes overscan items (25 above + 25 below the
  // viewport), so (firstVirtualIndex + lastVirtualIndex) / 2 is heavily biased —
  // at the top of a chapter firstVirtualIndex=0 but lastVirtualIndex includes 25
  // overscan items below the fold, making the centre land on verse ~13 instead of 1.
  // Fix: use scroll position to find the item that actually straddles the viewport centre.
  useEffect(() => {
    if (isRangeMode) return
    if (lastVirtualIndex < 0 || reader.verses.length === 0) return
    const timer = setTimeout(() => {
      const centerY = window.scrollY + window.innerHeight / 2
      const items = virtualizer.getVirtualItems()
      const centerItem =
        items.find((v) => v.start <= centerY && v.start + v.size > centerY) ??
        items[Math.floor(items.length / 2)]
      const verse = reader.verses[centerItem?.index ?? 0]
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [firstVirtualIndex, lastVirtualIndex, reader.verses.length])

  // Stable key that changes when language prefs change — propagated to VerseCard
  // so that memo's arePropsEqual can detect reloads vs. same-language seeks.
  const optsKey = `${prefs.primaryLanguage}-${prefs.secondaryLanguage ?? 'none'}-${prefs.arabic}-${prefs.wordByWord}-${displayMode}-${zoomLevel}`

  // Current verse number for minimap highlight.
  // Computed in a dedicated scroll listener (not in the render body) so the
  // minimap syncs immediately on every scroll event rather than waiting for
  // React to re-render from the virtualizer's scroll subscription.
  // stateRef keeps a live reference to verses + virtualizer so the [] listener
  // never closes over stale values.
  const [currentVerseNumber, setCurrentVerseNumber] = useState(1)
  const minimapStateRef = useRef({ verses: reader.verses, virtualizer })
  minimapStateRef.current = { verses: reader.verses, virtualizer }

  useEffect(() => {
    const computeCurrentVerse = () => {
      const { verses, virtualizer: virt } = minimapStateRef.current
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
        const items = virt.getVirtualItems()
        const centerItem =
          items.find((v) => v.start <= centerY && v.start + v.size > centerY) ??
          items[Math.floor(items.length / 2)]
        const centerVerse = verses[centerItem?.index ?? 0]
        vNum = centerVerse ? parseInt(centerVerse.vk?.split(':')[1] ?? '1') : 1
      }
      setCurrentVerseNumber(vNum)
      centerVerseRef.current = vNum
    }

    window.addEventListener('scroll', computeCurrentVerse, { passive: true })
    // Also run once on mount so the initial position is correct.
    computeCurrentVerse()
    return () => window.removeEventListener('scroll', computeCurrentVerse)
  }, [])

  // Show prev/next nav once the last verse is visible
  const [showNav, setShowNav] = useState(false)
  useEffect(() => {
    if (!reader.hasMore && lastVirtualIndex === reader.verses.length - 1) {
      setShowNav(true)
    }
  }, [lastVirtualIndex, reader.hasMore, reader.verses.length])

  const primaryCode = prefs.primaryLanguage !== 'xl' ? prefs.primaryLanguage : 'en'
  const arTitle = reader.chapterTitles?.['ar']
  const primaryTitle =
    reader.chapterTitles?.[primaryCode] ?? t('sura', { number: chapterNumber })
  const secondaryTitle =
    prefs.secondaryLanguage && prefs.secondaryLanguage !== 'xl'
      ? reader.chapterTitles?.[prefs.secondaryLanguage]
      : undefined

  return (
    <div className={`flex flex-col gap-2 ${ZOOM_WIDTH_CLASS[zoomLevel]} mx-auto w-full px-4 pb-32`}>
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
      <div>
        {/* Virtual list container — height drives the page scroll range */}
        <div
          ref={listRef}
          className="bg-muted/30 backdrop-blur-sm rounded-3xl border border-border/40 overflow-hidden"
          style={{
            position: 'relative',
            height: Math.max(virtualizer.getTotalSize(), 300),
          }}
        >
          {reader.verses.length === 0 ? null : (
            virtualItems.map((virtualItem) => {
              const verse = reader.verses[virtualItem.index]
              const isLast =
                virtualItem.index === reader.verses.length - 1 &&
                !reader.hasMore
              return (
                <div
                  key={verse.vk ?? virtualItem.index}
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
                    isCurrentAudio={
                      currentVerse?.verse_id === (verse.vk ?? '')
                    }
                    isPlaying={isPlaying}
                    isBuffering={isBuffering}
                  />
                </div>
              )
            })
          )}
        </div>

        {/* Prev / Next chapter nav — appears below the list once all verses are loaded */}
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
                    <span className="hidden sm:inline">
                      {tCommon('chapter')}{' '}
                    </span>
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
                    <span className="hidden sm:inline">
                      {tCommon('chapter')}{' '}
                    </span>
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
      )}

      {/* Verse number minimap — fixed right overlay (window-scroll compatible) */}
      {displayMode !== 'reading' && !isRangeMode && (
        <VerseMinimap
          chapterNumber={chapterNumber}
          currentVerseNumber={currentVerseNumber}
          verses={reader.verses}
          onSeek={handleSeek}
          onPreview={handlePreview}
        />
      )}

      {reader.error && (
        <p className="text-sm text-destructive text-center py-2">
          {reader.error}
        </p>
      )}
    </div>
  )
}
