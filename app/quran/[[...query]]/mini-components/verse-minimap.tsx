'use client'

import { useRef, useMemo, useCallback, useState } from 'react'
import { VERSE_COUNTS } from '@/constants/quran-chapters'
import type { VerseData } from '@/hooks/use-chapter-reader'

interface VerseMinimap {
  chapterNumber: number
  currentVerseNumber: number
  verses: VerseData[]
  onSeek: (verseNumber: number) => void
}

/**
 * Compute milestone verse numbers to label on the timeline.
 * Step size scales with chapter length to avoid overcrowding.
 */
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
}: VerseMinimap) {
  const totalVerses = VERSE_COUNTS[chapterNumber - 1] ?? 0

  // The inner track element — used for pointer-to-verse mapping
  const trackRef = useRef<HTMLDivElement>(null)
  const isDragging = useRef(false)

  // Verse being previewed while dragging (not yet committed)
  const [previewVerse, setPreviewVerse] = useState<number | null>(null)

  const loadedNumbers = useMemo(
    () => new Set(verses.map((v) => parseInt(v.vk?.split(':')[1] ?? '-1'))),
    [verses]
  )

  const milestones = useMemo(() => getMilestones(totalVerses), [totalVerses])

  /** Map verse number → percentage down the track (0–100) */
  const verseToPercent = useCallback(
    (vNum: number) =>
      totalVerses <= 1 ? 0 : ((vNum - 1) / (totalVerses - 1)) * 100,
    [totalVerses]
  )

  /** Map pointer clientY → verse number, clamped to valid range */
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

  // Pointer down: start drag, show preview (do NOT seek yet)
  const handlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      isDragging.current = true
      e.currentTarget.setPointerCapture(e.pointerId)
      setPreviewVerse(pointToVerse(e.clientY))
    },
    [pointToVerse]
  )

  // Pointer move: update preview position (do NOT seek)
  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!isDragging.current) return
      setPreviewVerse(pointToVerse(e.clientY))
    },
    [pointToVerse]
  )

  // Pointer up: commit seek to the final position, clear preview
  const handlePointerUp = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (isDragging.current) {
        onSeek(pointToVerse(e.clientY))
      }
      isDragging.current = false
      setPreviewVerse(null)
    },
    [onSeek, pointToVerse]
  )

  // Pointer cancel: abort without seeking
  const handlePointerCancel = useCallback(() => {
    isDragging.current = false
    setPreviewVerse(null)
  }, [])

  const progressPct = verseToPercent(currentVerseNumber)
  const previewPct = previewVerse !== null ? verseToPercent(previewVerse) : null

  return (
    /**
     * Mobile  (< sm): absolute transparent overlay on the right edge of the
     *   reader container — verse content is full-width, minimap floats over it.
     * Desktop (≥ sm): relative sidebar column next to the reader.
     * The parent flex container must have `relative` set.
     */
    <div className="absolute inset-y-0 right-0 w-9 z-10 sm:relative sm:inset-auto sm:h-full sm:w-7 sm:shrink-0">
      {/* Full-height tap / drag target */}
      <div
        className="relative h-full cursor-pointer select-none touch-none"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerCancel}
      >
        {/* Inner track — vertically inset so the line doesn't reach the edges.
            trackRef lives here so pointToVerse uses the correct bounding rect. */}
        <div ref={trackRef} className="absolute inset-x-0 top-3 bottom-3">
          {/* Background track line */}
          <div className="absolute top-0 bottom-0 left-1.5 w-px bg-border/40" />

          {/* Progress fill: top of track → current verse */}
          <div
            className="absolute top-0 left-1.5 w-px bg-violet-500/60 pointer-events-none"
            style={{ height: `${progressPct}%` }}
          />

          {/* Current verse dot */}
          <div
            className="absolute left-1.5 -translate-x-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-violet-500 ring-2 ring-background/80 z-10 pointer-events-none"
            style={{ top: `${progressPct}%` }}
          />

          {/* Preview indicator while dragging — shows where the seek will land */}
          {previewPct !== null && (
            <>
              {/* Ghost dot at preview position */}
              <div
                className="absolute left-1.5 -translate-x-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-violet-400/30 ring-2 ring-violet-500/70 pointer-events-none z-20"
                style={{ top: `${previewPct}%` }}
              />
              {/* Verse number badge — floats to the left of the track */}
              <div
                className="absolute right-full mr-2 px-2 py-0.5 text-xs font-semibold tabular-nums bg-popover/95 border border-violet-500/30 text-violet-500 rounded-md shadow-md pointer-events-none whitespace-nowrap z-30"
                style={{ top: `${previewPct}%`, transform: 'translateY(-50%)' }}
              >
                {previewVerse}
              </div>
            </>
          )}

          {/* Milestone ticks + labels */}
          {milestones.map((vNum) => {
            const pct = verseToPercent(vNum)
            const isLoaded = loadedNumbers.has(vNum)
            const isCurrent = vNum === currentVerseNumber

            return (
              <div
                key={vNum}
                className="absolute left-0 w-full flex items-center pointer-events-none"
                style={{ top: `${pct}%`, transform: 'translateY(-50%)' }}
              >
                {/* Tick on the line */}
                <div
                  className={`h-px ${isCurrent ? 'w-2 bg-violet-500' : 'w-1.5 bg-border/40'}`}
                  style={{ marginLeft: '3px' }}
                />
                {/* Verse number label */}
                <span
                  className={`ml-0.5 text-[7px] leading-none tabular-nums ${
                    isCurrent
                      ? 'text-violet-500 font-bold'
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
