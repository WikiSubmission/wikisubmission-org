'use client'

import { useRef, useMemo, useCallback, useState } from 'react'
import { VERSE_COUNTS } from '@/constants/quran-chapters'
import type { VerseData } from '@/hooks/use-chapter-reader'

interface VerseMinimap {
  chapterNumber: number
  currentVerseNumber: number
  verses: VerseData[]
  onSeek: (verseNumber: number) => void
  /** Called while dragging so the parent can prefetch the hovered verse window. */
  onPreview?: (verseNumber: number) => void
}

function getMilestones(totalVerses: number): number[] {
  const step =
    totalVerses > 200 ? 50
    : totalVerses > 100 ? 20
    : totalVerses > 50  ? 10
    : totalVerses > 20  ? 5
    : 1

  const result = new Set<number>([1])
  for (let v = step; v < totalVerses; v += step) result.add(v)
  result.add(totalVerses)
  return Array.from(result).sort((a, b) => a - b)
}

export function VerseMinimap({
  chapterNumber,
  currentVerseNumber,
  verses,
  onSeek,
  onPreview,
}: VerseMinimap) {
  const totalVerses = VERSE_COUNTS[chapterNumber - 1] ?? 0
  const trackRef = useRef<HTMLDivElement>(null)
  const isDragging = useRef(false)

  const [previewVerse, setPreviewVerse] = useState<number | null>(null)
  // Mobile: low opacity until press, then fully visible
  const [isActive, setIsActive] = useState(false)

  const loadedNumbers = useMemo(
    () => new Set(verses.map((v) => parseInt(v.vk?.split(':')[1] ?? '-1'))),
    [verses]
  )

  const milestones = useMemo(() => getMilestones(totalVerses), [totalVerses])

  const verseToPercent = useCallback(
    (vNum: number) =>
      totalVerses <= 1 ? 0 : ((vNum - 1) / (totalVerses - 1)) * 100,
    [totalVerses]
  )

  const pointToVerse = useCallback(
    (clientY: number): number => {
      const el = trackRef.current
      if (!el || totalVerses <= 1) return 1
      const rect = el.getBoundingClientRect()
      const pct = Math.max(0, Math.min(1, (clientY - rect.top) / rect.height))
      return Math.round(1 + pct * (totalVerses - 1))
    },
    [totalVerses]
  )

  const handlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      isDragging.current = true
      setIsActive(true)
      e.currentTarget.setPointerCapture(e.pointerId)
      const v = pointToVerse(e.clientY)
      setPreviewVerse(v)
      onPreview?.(v)
    },
    [pointToVerse, onPreview]
  )

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!isDragging.current) return
      const v = pointToVerse(e.clientY)
      setPreviewVerse(v)
      onPreview?.(v)
    },
    [pointToVerse, onPreview]
  )

  const handlePointerUp = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (isDragging.current) {
        onSeek(pointToVerse(e.clientY))
      }
      isDragging.current = false
      setPreviewVerse(null)
      // Brief delay before fading out so the user sees the confirmed position
      setTimeout(() => setIsActive(false), 300)
    },
    [onSeek, pointToVerse]
  )

  const handlePointerCancel = useCallback(() => {
    isDragging.current = false
    setPreviewVerse(null)
    setIsActive(false)
  }, [])

  const progressPct = verseToPercent(currentVerseNumber)
  const previewPct = previewVerse !== null ? verseToPercent(previewVerse) : null

  return (
    /**
     * Fixed overlay anchored to the right edge of the viewport.
     * top-30 (120px) = SiteNav (64) + sub-header (56), matching the fixed header stack.
     * Mobile: low opacity until press. Desktop (≥ sm): always fully visible.
     */
    <div
      className={`fixed right-0 z-30 w-9 top-30 bottom-0 transition-opacity duration-200
        sm:w-10 sm:opacity-100
        ${isActive ? 'opacity-100' : 'opacity-[0.15]'}`}
    >
      <div
        className="relative h-full cursor-pointer select-none touch-none"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerCancel}
      >
        <div ref={trackRef} className="absolute inset-x-0 top-3 bottom-3">
          {/* Background tube — full height pill */}
          <div className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-3 rounded-full bg-border/30" />

          {/* Progress fill tube */}
          <div
            className="absolute left-1/2 -translate-x-1/2 top-0 w-3 rounded-full bg-primary/60 pointer-events-none"
            style={{ height: `${progressPct}%`, transition: 'height 0.08s linear' }}
          />

          {/* Current verse thumb — 14px dot */}
          <div
            className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-primary ring-2 ring-background/80 z-10 pointer-events-none"
            style={{ top: `${progressPct}%`, transition: 'top 0.08s linear' }}
          />

          {/* Preview indicator while dragging */}
          {previewPct !== null && (
            <>
              {/* Ghost dot — 18px */}
              <div
                className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 w-4.5 h-4.5 rounded-full bg-primary/25 ring-2 ring-primary/80 pointer-events-none z-20"
                style={{ top: `${previewPct}%` }}
              />
              {/* Verse badge */}
              <div
                className="absolute right-full mr-2 px-2 py-0.5 text-xs font-semibold tabular-nums bg-popover/95 border border-primary/30 text-primary rounded-md shadow-md pointer-events-none whitespace-nowrap z-30"
                style={{ top: `${previewPct}%`, transform: 'translateY(-50%)' }}
              >
                {previewVerse}
              </div>
            </>
          )}

          {/* Milestone labels — only shown while holding */}
          {isActive && milestones.map((vNum) => {
            const pct = verseToPercent(vNum)
            const isLoaded = loadedNumbers.has(vNum)
            const isCurrent = vNum === currentVerseNumber

            return (
              <div
                key={vNum}
                className="absolute right-full pr-1.5 flex items-center pointer-events-none"
                style={{ top: `${pct}%`, transform: 'translateY(-50%)' }}
              >
                <span
                  className={`text-[7px] leading-none tabular-nums ${
                    isCurrent
                      ? 'text-primary font-bold'
                      : isLoaded
                        ? 'text-foreground/35'
                        : 'text-muted-foreground/20'
                  }`}
                >
                  {vNum}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
