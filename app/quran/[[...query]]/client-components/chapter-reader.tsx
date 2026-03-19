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
import { useQuranPlayer } from '@/lib/quran-audio-context'

// Height of the verse viewport container.
// Subtracts: sticky header (4rem) + layout padding-top (1rem) +
//            layout padding-bottom/pb-24 (6rem) + chapter title bar (~4rem) +
//            space-y-2 gap (0.5rem) + small buffer (0.5rem).
const VIEWPORT_HEIGHT = 'calc(100svh - 16rem)'

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
  const { setChapterQueue } = useQuranPlayer()

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

  const opts: ChapterReaderOptions = {
    primaryLang: prefs.primaryLanguage,
    secondaryLang: prefs.secondaryLanguage,
    includeArabic: prefs.arabic,
    includeWords: prefs.arabic,
    includeRoot: prefs.arabic,
    includeMeaning: prefs.arabic,
  }

  // Keep the audio player queue in sync with loaded verses.
  const audioQueue = useMemo(
    () => reader.verses.map(toQuranVerse),
    [reader.verses]
  )
  useEffect(() => {
    if (audioQueue.length > 0) setChapterQueue(audioQueue)
  }, [audioQueue, setChapterQueue])

  // Re-fetch when API-relevant preferences change
  const prevOptsRef = useRef(opts)
  useEffect(() => {
    const prev = prevOptsRef.current
    const changed =
      prev.primaryLang !== opts.primaryLang ||
      prev.secondaryLang !== opts.secondaryLang ||
      prev.includeArabic !== opts.includeArabic

    if (changed) reader.reload(opts)
    prevOptsRef.current = opts
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prefs.primaryLanguage, prefs.secondaryLanguage, prefs.arabic])

  // Initial load if SSR returned nothing
  useEffect(() => {
    if (reader.verses.length === 0) reader.reload(opts)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── Fixed-container virtualizer ───────────────────────────────────────────
  const parentRef = useRef<HTMLDivElement>(null)

  const virtualizer = useVirtualizer({
    count: reader.verses.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 280,
    overscan: 25,
  })

  const virtualItems = virtualizer.getVirtualItems()
  const lastVirtualIndex = virtualItems[virtualItems.length - 1]?.index ?? -1
  const firstVirtualIndex = virtualItems[0]?.index ?? 0

  // ── Minimap seek handler ──────────────────────────────────────────────────
  // Uses smooth scroll (user intentionally navigated via minimap).
  const handleSeek = useCallback((verseNumber: number) => {
    seekBehaviorRef.current = 'smooth'
    seekDoneRef.current = false
    setSeekTarget(String(verseNumber))
  }, [])

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
  useEffect(() => {
    if (lastVirtualIndex < 0 || reader.verses.length === 0) return
    const timer = setTimeout(() => {
      const centerIndex = Math.floor((firstVirtualIndex + lastVirtualIndex) / 2)
      const centerVerse = reader.verses[centerIndex]
      if (!centerVerse?.vk) return
      const vNum = centerVerse.vk.split(':')[1]
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

  // Current verse number for minimap highlight
  const centerIndex = Math.floor((firstVirtualIndex + lastVirtualIndex) / 2)
  const centerVerse = reader.verses[centerIndex]
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
    <div className="space-y-2">
      {/* Chapter title */}
      <div className="flex justify-between items-center p-4 bg-muted/50 rounded-2xl">
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
          position on mobile; `items-stretch` lets the desktop sidebar fill height. */}
      <div
        className="relative flex gap-2 items-stretch"
        style={{ height: VIEWPORT_HEIGHT }}
      >
        {/* Fixed-height scrollable container — the document never scrolls */}
        <div
          ref={parentRef}
          className="flex-1 min-w-0 h-full bg-muted/30 backdrop-blur-sm rounded-3xl border border-border/40 overflow-y-auto"
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
