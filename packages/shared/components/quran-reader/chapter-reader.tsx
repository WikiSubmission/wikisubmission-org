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
import { useQuranPreferences } from '@/hooks/use-quran-preferences'
import { useLanguagesStore } from '@/hooks/use-languages-store'
import {
  useChapterReader,
  type QuranResponse,
  type ChapterReaderOptions,
  type VerseData,
} from '@/hooks/use-chapter-reader'
import { VerseCard, toQuranVerse } from './verse-card'
import { VerseMinimap } from './verse-minimap'
import { ReadingView } from './reading-view'
import { MultiSelectBar } from './multi-select-bar'
import { useVerseSelection } from '@/hooks/use-verse-selection-store'
import { useTranslations } from 'next-intl'
import { Virtuoso, type VirtuosoHandle } from 'react-virtuoso'
import gsap from 'gsap'
import {
  useQuranPlayer,
  useQuranPlayerCallbacks,
} from '@/lib/quran-audio-context'
import { ZOOM_WIDTH_CLASS } from '@/lib/quran-zoom'
import { useScriptureState } from '@/hooks/use-scripture-state'
import { useQuranPrefsSync } from '@/hooks/use-prefs-sync'
import type { ScriptureState } from '@/types/bookmarks'

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
  optsKey: string
  isRangeMode: boolean
  seekTarget: string | null
  setSeekTarget: (target: string | null) => void
  centerVerseRef: MutableRefObject<number>
  currentVerseId?: string
  isPlaying: boolean
  isBuffering: boolean
  chapterLabel: string
  scriptureState?: ScriptureState
  onVerseVisible?: (verseKey: string) => void
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
  optsKey,
  isRangeMode,
  seekTarget,
  setSeekTarget,
  centerVerseRef,
  currentVerseId,
  isPlaying,
  isBuffering,
  chapterLabel,
  scriptureState,
  onVerseVisible,
}: VirtualizedVerseListProps) {
  const virtuosoRef = useRef<VirtuosoHandle>(null)
  const seekDoneRef = useRef(false)
  const seekActiveRef = useRef(false)
  const prevFirstVerseRef = useRef('')
  const seekBehaviorRef = useRef<'auto' | 'smooth'>('auto')
  // Rendered-range tracking lives in refs; only the two booleans below are
  // state. The previous setLastRenderedIndex(range.endIndex) re-rendered this
  // whole component (and rebuilt Virtuoso's itemContent) on every scroll frame.
  const lastRenderedIndexRef = useRef(-1)
  const [nearEnd, setNearEnd] = useState(false)
  const [atEnd, setAtEnd] = useState(false)
  const visibleRangeRef = useRef<{ startIndex: number; endIndex: number }>({
    startIndex: 0,
    endIndex: 0,
  })
  const urlSyncTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

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
    const targetIndex = verses.findIndex(
      (v) => v.vk?.split(':')[1] === seekTarget
    )
    if (targetIndex < 0) return

    prevFirstVerseRef.current = firstVerseKey
    seekDoneRef.current = false
    seekBehaviorRef.current = 'auto'

    seekActiveRef.current = true
    const verseId = `${chapterNumber}:${seekTarget}`
    const TARGET_TOP = 120
    let attempts = 0
    let stable = 0
    let rafId = 0
    let cancelled = false
    const MAX_FRAMES = 120
    const STABLE_THRESHOLD = 6
    const tick = () => {
      if (cancelled) return
      attempts += 1
      const el = document.getElementById(verseId)
      if (el) {
        const rect = el.getBoundingClientRect()
        const delta = rect.top - TARGET_TOP
        if (Math.abs(delta) > 0.5) {
          window.scrollTo(0, Math.max(0, window.scrollY + delta))
          stable = 0
        } else {
          stable += 1
        }
      } else {
        virtuosoRef.current?.scrollToIndex({
          index: targetIndex,
          align: 'start',
          behavior: 'auto',
        })
        stable = 0
      }
      const done =
        attempts >= MAX_FRAMES ||
        (stable >= STABLE_THRESHOLD && attempts >= 8)
      if (!done) {
        rafId = requestAnimationFrame(tick)
      } else {
        seekDoneRef.current = true
        seekActiveRef.current = false
      }
    }
    rafId = requestAnimationFrame(tick)
    return () => {
      cancelled = true
      seekActiveRef.current = false
      cancelAnimationFrame(rafId)
    }
  }, [firstVerseKey, seekTarget, verses, chapterNumber])

  useEffect(() => {
    if (!currentVerseId || !isPlaying) return
    const idx = verses.findIndex((v) => v.vk === currentVerseId)
    if (idx < 0) return
    virtuosoRef.current?.scrollToIndex({ index: idx, align: 'center', behavior: 'smooth' })
  }, [currentVerseId, isPlaying, verses])

  useEffect(() => {
    if (isRangeMode) return
    if (!hasMore || loading) return
    const isSeeking = !!seekTarget && !seekDoneRef.current
    const isNearEnd = lastRenderedIndexRef.current >= verses.length - 15
    // The nearEnd flag can go stale when a batch appends (rendered range stays
    // put while verses.length grows). Clear it so the next true transition
    // from rangeChanged re-fires this effect.
    if (nearEnd && !isNearEnd) setNearEnd(false)
    if (!isSeeking && !isNearEnd) return
    const timer = setTimeout(() => void loadMore(opts), isSeeking ? 50 : 0)
    return () => clearTimeout(timer)
  }, [hasMore, isRangeMode, nearEnd, loadMore, loading, opts, seekTarget, verses.length])

  // Gate URL sync on an actual user scroll gesture to avoid rewriting the
  // URL from an inherited scroll position on initial mount.
  const userScrolledRef = useRef(false)
  useEffect(() => {
    userScrolledRef.current = false
    const onScroll = () => {
      userScrolledRef.current = true
    }
    window.addEventListener('scroll', onScroll, { passive: true, once: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [chapterNumber])

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
      let visibleVk: string | undefined
      if (isAtTop) {
        const first = verses[0]
        vNum = first ? parseInt(first.vk?.split(':')[1] ?? '1') : 1
        visibleVk = first?.vk
      } else if (isAtBottom) {
        const last = verses[verses.length - 1]
        vNum = last ? parseInt(last.vk?.split(':')[1] ?? '1') : 1
        visibleVk = last?.vk
      } else {
        const centerY = scrollY + viewportH / 2
        const { startIndex, endIndex } = visibleRangeRef.current
        let centerVerse: VerseData | undefined
        for (let i = startIndex; i <= endIndex; i++) {
          const v = verses[i]
          if (!v?.vk) continue
          const el = document.getElementById(v.vk)
          if (!el) continue
          const rect = el.getBoundingClientRect()
          const absTop = rect.top + scrollY
          const absBottom = absTop + rect.height
          if (absTop <= centerY && absBottom > centerY) {
            centerVerse = v
            break
          }
        }
        if (!centerVerse) {
          const midIndex = Math.floor((startIndex + endIndex) / 2)
          centerVerse = verses[midIndex]
        }
        vNum = centerVerse ? parseInt(centerVerse.vk?.split(':')[1] ?? '1') : 1
        visibleVk = centerVerse?.vk
      }
      setCurrentVerseNumber(vNum)
      centerVerseRef.current = vNum
      if (visibleVk) onVerseVisible?.(visibleVk)

      // Debounced URL sync — merged here to avoid a separate range-dep effect.
      if (!isRangeMode && userScrolledRef.current && visibleVk) {
        if (urlSyncTimerRef.current !== null) clearTimeout(urlSyncTimerRef.current)
        const vkToSync = visibleVk
        urlSyncTimerRef.current = setTimeout(() => {
          if (seekActiveRef.current) return
          const vNum = vkToSync.split(':')[1]
          const params = new URLSearchParams(window.location.search)
          if (params.get('verse') === vNum) return
          params.set('verse', vNum)
          window.history.replaceState(null, '', `${window.location.pathname}?${params}`)
        }, 200)
      }
    }

    window.addEventListener('scroll', computeCurrentVerse, { passive: true })
    // Intentionally NOT calling computeCurrentVerse() here — seeding
    // centerVerseRef on mount would override the URL's ?verse=N target.
    return () => window.removeEventListener('scroll', computeCurrentVerse)
  }, [centerVerseRef, verses, onVerseVisible, isRangeMode])

  useEffect(
    () => () => {
      if (urlSyncTimerRef.current !== null) clearTimeout(urlSyncTimerRef.current)
    },
    []
  )

  const showNav = !hasMore && atEnd

  // First-load skeleton → staggered reveal. On mobile there is no SSR data,
  // so the initial fetch (network or SQLite) paints into an empty container;
  // skeleton cards hold the space and the real verses cascade in when they
  // land. Web with SSR data never enters the empty state, so this is inert.
  const listContainerRef = useRef<HTMLDivElement>(null)
  const wasEmptyRef = useRef(verses.length === 0)
  useLayoutEffect(() => {
    if (verses.length === 0) {
      wasEmptyRef.current = true
      return
    }
    if (!wasEmptyRef.current) return
    wasEmptyRef.current = false
    // Virtuoso commits its item wrappers in this same frame; query on the
    // next one so the cards exist, then cascade them in.
    const raf = requestAnimationFrame(() => {
      const cards = listContainerRef.current?.querySelectorAll<HTMLElement>('[data-index]')
      if (!cards || cards.length === 0) return
      gsap.fromTo(
        cards,
        { autoAlpha: 0, y: 10 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.35,
          ease: 'power2.out',
          stagger: 0.03,
          clearProps: 'transform,opacity,visibility',
        },
      )
    })
    return () => cancelAnimationFrame(raf)
  }, [verses.length])

  const showSkeleton = verses.length === 0 && loading

  return (
    <>
      <div>
        <div
          ref={listContainerRef}
          className="relative bg-muted/30 backdrop-blur-sm rounded-3xl border border-border/40 overflow-hidden"
        >
          {/* Loading glow — pulsing inset ring along the card border. Pure CSS
              opacity animation (compositor-only); the previous GSAP box-shadow
              tween repainted the full-height list container every frame. */}
          <div
            aria-hidden
            className={`pointer-events-none absolute inset-0 z-10 rounded-3xl transition-opacity duration-700 [box-shadow:inset_0_0_0_1.5px_color-mix(in_oklab,var(--primary),transparent_55%),inset_0_0_26px_color-mix(in_oklab,var(--primary),transparent_85%)] ${
              loading ? 'animate-pulse opacity-100' : 'opacity-0'
            }`}
          />
          {showSkeleton && (
            <div aria-hidden className="divide-y divide-border/30" data-verse-skeleton>
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="animate-pulse space-y-3 p-5"
                  // Cascading delays read as a wave moving down the card.
                  style={{ animationDelay: `${i * 120}ms` }}
                >
                  <div className="bg-muted-foreground/15 h-3 w-14 rounded" />
                  <div className="bg-muted-foreground/15 h-4 w-full rounded" />
                  <div className="bg-muted-foreground/15 h-4 w-11/12 rounded" />
                  <div className="bg-muted-foreground/10 h-4 w-2/3 rounded" />
                </div>
              ))}
            </div>
          )}
          <Virtuoso
            ref={virtuosoRef}
            useWindowScroll
            data={verses}
            // Keyed by verse only — a language/zoom reload updates cards in
            // place instead of unmounting and remounting all of them (the old
            // `${optsKey}-` prefix forced a full remount on prefs hydration).
            computeItemKey={(index, verse) => verse.vk ?? `i-${index}`}
            increaseViewportBy={{ top: 400, bottom: 1000 }}
            rangeChanged={(range) => {
              visibleRangeRef.current = { startIndex: range.startIndex, endIndex: range.endIndex }
              lastRenderedIndexRef.current = range.endIndex
              // Boolean flips only — setState with an unchanged value bails
              // out, so scrolling doesn't re-render the list component.
              setNearEnd(range.endIndex >= verses.length - 15)
              setAtEnd(range.endIndex >= verses.length - 1)
            }}
            itemContent={(index, verse) => {
              const isLast = index === verses.length - 1 && !hasMore
              return (
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
                  showBookmark
                  entries={scriptureState?.bookmarks[verse.vk ?? ''] ?? []}
                  showNotes
                  note={scriptureState?.notes[verse.vk ?? ''] ?? null}
                  scripture="quran"
                />
              )
            }}
          />
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

  const scriptureState = useScriptureState('quran', chapterNumber)
  useQuranPrefsSync()

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
  // Tracks whether the user has performed a real scroll-input gesture. Pure
  // scroll events fire for programmatic seeks too, so we listen for the
  // intent-bearing inputs (wheel, touch, key) to disambiguate. Used to gate
  // anchor-to-viewport behavior on mode/language change.
  const userMovedRef = useRef(false)
  useEffect(() => {
    const mark = () => {
      userMovedRef.current = true
    }
    window.addEventListener('wheel', mark, { passive: true })
    window.addEventListener('touchmove', mark, { passive: true })
    window.addEventListener('keydown', mark)
    return () => {
      window.removeEventListener('wheel', mark)
      window.removeEventListener('touchmove', mark)
      window.removeEventListener('keydown', mark)
    }
  }, [])
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
      secondaryLang: prefs.secondaryLanguage,
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
    // If the user has not made a real navigation gesture yet, we are still
    // honoring the URL's ?verse=N target — most often this effect fires
    // because zustand's persist middleware finished hydrating prefs from
    // localStorage right after first paint, NOT because the user changed
    // anything. Preserve the seek target so we don't pull the reader back
    // to wherever the SSR window happened to start.
    if (!userMovedRef.current && seekTarget) {
      reader.reload(opts, parseInt(seekTarget))
      return
    }
    const anchor = centerVerseRef.current
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
    const primaryCode =
      opts.primaryLang !== 'xl' && opts.primaryLang !== 'none'
        ? opts.primaryLang
        : undefined
    const secondaryCode =
      opts.secondaryLang && opts.secondaryLang !== 'xl' && opts.secondaryLang !== 'none'
        ? opts.secondaryLang
        : null
    const firstVerse = reader.verses[0]
    const needsReload =
      reader.verses.length === 0 ||
      (primaryCode !== undefined && firstVerse?.tr?.[primaryCode] === undefined) ||
      (secondaryCode !== null && firstVerse?.tr?.[secondaryCode] === undefined)
    if (needsReload) reader.reload(opts, seekTarget ? parseInt(seekTarget) : undefined)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useLayoutEffect(() => {
    // Reset on initial entry and whenever the chapter changes (e.g. clicking a
    // chapter card from inside the reader) so navigation never inherits the
    // previous page's scroll position. Skip when a specific verse is targeted —
    // the seek logic anchors to that verse instead.
    //
    // Re-assert across the next few frames: the document's height grows as the
    // virtualizer measures items and the browser may re-apply an inherited
    // scrollY mid-layout, which would otherwise be picked up by the URL-sync
    // listener and rewritten into the URL as ?verse=N.
    if (seekTarget) return
    window.scrollTo(0, 0)
    let frames = 0
    let rafId = 0
    const tick = () => {
      if (window.scrollY !== 0) window.scrollTo(0, 0)
      frames += 1
      if (frames < 6) rafId = requestAnimationFrame(tick)
    }
    rafId = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafId)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chapterNumber])

  const firstVerseKey = reader.verses[0]?.vk ?? ''

  // Re-assert top alignment once verses first render. The initial useLayoutEffect
  // fires before content lays out, so the browser can re-apply an inherited
  // scroll position from the previous route once the page grows tall. Without
  // this, the URL-sync scroll listener would then capture that stale offset and
  // rewrite the URL to a mid-chapter verse.
  const didInitialScrollRef = useRef(false)
  useLayoutEffect(() => {
    if (didInitialScrollRef.current) return
    if (!firstVerseKey) return
    didInitialScrollRef.current = true
    if (seekTarget) return
    window.scrollTo(0, 0)
  }, [firstVerseKey, seekTarget])

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
  const optsKey = `v2-${prefs.primaryLanguage}-${prefs.secondaryLanguage ?? 'none'}-${prefs.arabic}-${prefs.wordByWord}-${displayMode}-${zoomLevel}`

  const primaryCode =
    prefs.primaryLanguage !== 'xl' && prefs.primaryLanguage !== 'none'
      ? prefs.primaryLanguage
      : undefined
  const arTitle = reader.chapterTitles?.['ar']
  const primaryTitle =
    (primaryCode ? reader.chapterTitles?.[primaryCode] : undefined) ??
    t('sura', { number: chapterNumber })
  const secondaryTitle =
    prefs.secondaryLanguage &&
    prefs.secondaryLanguage !== 'xl' &&
    prefs.secondaryLanguage !== 'none'
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
                className="text-xl font-bold flex items-center gap-2"
                dir={getDirection(primaryCode ?? 'en')}
              >
                {/* data-flip-id: landing target for the mobile app's
                    index-card → reader title continuity (GSAP Flip). Inert
                    on web. */}
                <span className="min-w-0" data-flip-id="chapter-title">
                  {t('chapter', { number: chapterNumber, title: primaryTitle })}
                </span>
                {reader.loading && reader.verses.length > 0 && (
                  <Spinner
                    className="size-3.5 shrink-0 text-muted-foreground"
                    aria-label={tCommon('loading')}
                  />
                )}
              </h1>
              {secondaryTitle && (
                <p
                  className="text-sm text-muted-foreground italic"
                  dir={
                    prefs.secondaryLanguage &&
                    prefs.secondaryLanguage !== 'none'
                      ? getDirection(prefs.secondaryLanguage)
                      : undefined
                  }
                >
                  {secondaryTitle}
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
            chapterNumber={chapterNumber}
            chapterLabel={tCommon('chapter')}
            currentVerseId={currentVerse?.verse_id}
            isPlaying={isPlaying}
          />
        </div>
      )}

      {displayMode !== 'reading' && (
        <VirtualizedVerseList
          chapterNumber={chapterNumber}
          verses={reader.verses}
          hasMore={reader.hasMore}
          loading={reader.loading}
          loadMore={reader.loadMore}
          prefetch={reader.prefetch}
          seekToVerse={reader.seekToVerse}
          opts={opts}
          optsKey={optsKey}
          isRangeMode={isRangeMode}
          seekTarget={seekTarget}
          setSeekTarget={setSeekTarget}
          centerVerseRef={centerVerseRef}
          currentVerseId={currentVerse?.verse_id}
          isPlaying={isPlaying}
          isBuffering={isBuffering}
          chapterLabel={tCommon('chapter')}
          scriptureState={scriptureState}
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
