'use client'

import { useEffect, useRef, useState, useCallback, useMemo } from 'react'
import Link from 'next/link'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { Spinner } from '@/components/ui/spinner'
import { Button } from '@/components/ui/button'
import { useQuranPreferences } from '@/hooks/use-quran-preferences'
import {
  useChapterReader,
  type QuranResponse,
  type ChapterReaderOptions,
} from '@/hooks/use-chapter-reader'
import { VerseCard, toQuranVerse } from '../mini-components/verse-card'
import { VerseMinimap } from '../mini-components/verse-minimap'
import { useTranslations } from 'next-intl'
import { useVirtualizer } from '@tanstack/react-virtual'
import {
  useQuranPlayer,
  useQuranPlayerCallbacks,
} from '@/lib/quran-audio-context'


export function ChapterReader({
  chapterNumber,
  initialData,
  initialVerse,
}: {
  chapterNumber: number
  initialData: QuranResponse | null
  initialVerse?: string
}) {
  const prefs = useQuranPreferences()
  const reader = useChapterReader(chapterNumber, initialData)
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

  // Differentiate smooth (user minimap tap) from instant (programmatic/load) seeks.
  const seekBehaviorRef = useRef<'auto' | 'smooth'>('auto')

  // Memoized so that callbacks listing `opts` as a dep remain stable across
  // renders where unrelated state changes (scroll position, seek target, etc.).
  const opts = useMemo<ChapterReaderOptions>(
    () => ({
      primaryLang: prefs.primaryLanguage,
      secondaryLang: prefs.secondaryLanguage,
      includeArabic: prefs.arabic,
      includeWords: prefs.arabic,
      includeRoot: prefs.arabic,
      includeMeaning: prefs.arabic,
    }),
    [prefs.primaryLanguage, prefs.secondaryLanguage, prefs.arabic]
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
    reader.reload(opts)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opts])

  // Initial load if SSR returned nothing, or if SSR data (always en+ar) doesn't
  // contain the user's primary language. SSR can't know client prefs, so it always
  // fetches English + Arabic. If the user's stored pref is e.g. French, the verses
  // would show in English until a preference is toggled. Reload immediately instead.
  useEffect(() => {
    const primaryCode = opts.primaryLang !== 'xl' ? opts.primaryLang : 'en'
    const needsReload =
      reader.verses.length === 0 ||
      reader.verses[0]?.tr?.[primaryCode] === undefined
    if (needsReload) reader.reload(opts)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── Fixed-container virtualizer ───────────────────────────────────────────
  const parentRef = useRef<HTMLDivElement>(null)

  const virtualizer = useVirtualizer({
    count: reader.verses.length,
    getScrollElement: () => parentRef.current,
    // Conservative high estimate — better to overshoot than undershoot.
    // Underestimates cause scroll-position jumps when items are measured;
    // overshoots just leave a little extra space that self-corrects.
    estimateSize: () => 400,
    // 25 was too aggressive: it rendered 50 extra cards (25 above + 25 below)
    // and biased the centre-verse calculation used by the URL sync and minimap.
    overscan: 12,
  })

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

  // Scroll to seekTarget once the verse is in the loaded data
  useEffect(() => {
    if (!seekTarget || seekDoneRef.current) return
    const targetIndex = reader.verses.findIndex(
      (v) => v.vk?.split(':')[1] === seekTarget
    )
    if (targetIndex >= 0) {
      virtualizer.scrollToIndex(targetIndex, {
        align: 'start',
        behavior: seekBehaviorRef.current,
      })
      seekBehaviorRef.current = 'auto' // reset for next programmatic seek
      seekDoneRef.current = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reader.verses.length, seekTarget])

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
  useEffect(() => {
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
    if (lastVirtualIndex < 0 || reader.verses.length === 0) return
    const timer = setTimeout(() => {
      const container = parentRef.current
      if (!container) return
      const centerY = container.scrollTop + container.clientHeight / 2
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
  const optsKey = `${prefs.primaryLanguage}-${prefs.secondaryLanguage ?? 'none'}-${prefs.arabic}`

  // Current verse number for minimap highlight.
  // Same overscan bias fix: use scroll position to find the item at the viewport centre
  // rather than the midpoint of all rendered items (which includes overscan).
  const scrollTop = parentRef.current?.scrollTop ?? 0
  const clientH = parentRef.current?.clientHeight ?? 0
  const centerY = scrollTop + clientH / 2
  const centerVirtualItem =
    virtualItems.find(
      (v) => v.start <= centerY && v.start + v.size > centerY
    ) ?? virtualItems[Math.floor(virtualItems.length / 2)]
  const centerVerse = reader.verses[centerVirtualItem?.index ?? 0]
  const currentVerseNumber = centerVerse
    ? parseInt(centerVerse.vk?.split(':')[1] ?? '1')
    : 1

  // Show prev/next nav once the last verse is visible
  const [showNav, setShowNav] = useState(false)
  useEffect(() => {
    if (!reader.hasMore && lastVirtualIndex === reader.verses.length - 1) {
      setShowNav(true)
    }
  }, [lastVirtualIndex, reader.hasMore, reader.verses.length])

  const chapterTitle =
    reader.chapterTitles?.['en'] ??
    reader.chapterTitles?.[prefs.primaryLanguage] ??
    t('sura', { number: chapterNumber })

  return (
    <div className="flex flex-col flex-1 min-h-0 gap-2">
      {/* Chapter title */}
      <div className="shrink-0 flex justify-between items-center p-4 bg-muted/50 rounded-2xl">
        <div className="flex flex-col">
          <h1 className="text-xl font-bold pl-1">
            {t('chapter', { number: chapterNumber, title: chapterTitle })}
          </h1>
          {reader.loading && reader.verses.length > 0 && (
            <p className="text-xs text-muted-foreground pl-1 flex items-center gap-1">
              <Spinner className="size-3" />
              {tCommon('loading')}
            </p>
          )}
        </div>
        {reader.chapterTitles?.['ar'] && (
          <h1 className="text-2xl font-bold font-arabic">
            {reader.chapterTitles['ar']}
          </h1>
        )}
      </div>

      {/* Verse viewport + minimap. `relative` anchors the minimap's absolute
          position on mobile; `items-stretch` lets the desktop sidebar fill height.
          `overflow-hidden` clips minimap milestone labels/badges so they cannot
          cause a page-level scrollbar when the minimap is active. */}
      <div
        className="relative flex flex-1 min-h-0 gap-2 items-stretch overflow-hidden"
      >
        {/* Fixed-height scrollable container — the document never scrolls */}
        <div
          ref={parentRef}
          className="flex-1 min-w-0 h-full bg-muted/30 backdrop-blur-sm rounded-3xl border border-border/40 overflow-y-auto overscroll-contain"
          style={{ scrollbarWidth: 'none' }}
        >
          {reader.verses.length === 0 ? (
            <div className="p-12 flex justify-center">
              <Spinner />
            </div>
          ) : (
            <>
              {/* Virtual list */}
              <div
                style={{
                  height: virtualizer.getTotalSize(),
                  position: 'relative',
                }}
              >
                {virtualItems.map((virtualItem) => {
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
                        transform: `translateY(${virtualItem.start}px)`,
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
                })}
              </div>

              {/* Prev / Next chapter nav — lives inside the scroll container
                  so it never causes the outer page to grow. Appears after the
                  last verse when the user scrolls to the end. */}
              <div
                className={`overflow-hidden transition-all duration-500 ease-in-out ${
                  showNav ? 'max-h-48 opacity-100' : 'max-h-0 opacity-0'
                }`}
              >
                <div className="flex justify-between items-center gap-4 p-6 pb-24">
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
            </>
          )}
        </div>

        {/* Verse number minimap */}
        <VerseMinimap
          chapterNumber={chapterNumber}
          currentVerseNumber={currentVerseNumber}
          verses={reader.verses}
          onSeek={handleSeek}
          onPreview={handlePreview}
        />
      </div>

      {reader.error && (
        <p className="text-sm text-destructive text-center py-2">
          {reader.error}
        </p>
      )}
    </div>
  )
}
