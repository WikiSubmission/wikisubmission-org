'use client'

import React, { useEffect, useRef, useState, useCallback } from 'react'

export interface RulerHeading {
  id: string
  text: string
  level: number
}

interface EditorialRightRulerProps {
  headings?: RulerHeading[]
  targetId?: string
}

export function EditorialRightRuler({
  headings = [],
  targetId = 'main-article',
}: EditorialRightRulerProps) {
  const [ratio, setRatio] = useState(0)
  const [headingPositions, setHeadingPositions] = useState<{ id: string; text: string; ratio: number }[]>([])
  const [hoveredHeading, setHoveredHeading] = useState<string | null>(null)
  const rulerTrackRef = useRef<HTMLDivElement>(null)

  // Compute scroll ratio & heading positions
  const updateMetrics = useCallback(() => {
    const target = document.getElementById(targetId) || document.documentElement
    const scrollY = window.scrollY
    const windowHeight = window.innerHeight
    const docHeight = document.documentElement.scrollHeight
    const maxScroll = Math.max(1, docHeight - windowHeight)
    const currentRatio = Math.min(1, Math.max(0, scrollY / maxScroll))
    setRatio(currentRatio)

    // Calculate heading ratios
    if (headings.length > 0) {
      const positions = headings.map((h) => {
        const el = document.getElementById(h.id)
        if (!el) return null
        const top = el.getBoundingClientRect().top + scrollY
        const r = Math.min(1, Math.max(0, top / maxScroll))
        return {
          id: h.id,
          text: h.text,
          ratio: r,
        }
      }).filter(Boolean) as { id: string; text: string; ratio: number }[]

      setHeadingPositions(positions)
    }
  }, [headings, targetId])

  useEffect(() => {
    let frame = 0
    const onScroll = () => {
      if (frame) return
      frame = window.requestAnimationFrame(() => {
        frame = 0
        updateMetrics()
      })
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll, { passive: true })
    updateMetrics()

    // Short timeout to let layout settle
    const t = setTimeout(updateMetrics, 500)

    return () => {
      clearTimeout(t)
      if (frame) window.cancelAnimationFrame(frame)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [updateMetrics])

  const handleTrackClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = rulerTrackRef.current?.getBoundingClientRect()
    if (!rect) return
    const clickY = e.clientY - rect.top
    const clickedRatio = Math.min(1, Math.max(0, clickY / rect.height))
    const windowHeight = window.innerHeight
    const docHeight = document.documentElement.scrollHeight
    const maxScroll = Math.max(0, docHeight - windowHeight)
    window.scrollTo({
      top: clickedRatio * maxScroll,
      behavior: 'smooth',
    })
  }

  const scrollToHeading = (id: string) => {
    const el = document.getElementById(id)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  // Generate ticks
  const tickCount = 42

  return (
    <div className="relative select-none flex flex-col items-end pr-1 pt-1" aria-hidden="true">
      {/* Real-time Numeric Fractional Indicator (e.g. 0.00 to 1.00) matching Making Software */}
      <div className="mb-2 font-[family-name:var(--font-jetbrains)] text-[11px] font-bold tabular-nums text-[var(--ed-accent)] tracking-wider">
        {ratio.toFixed(2)}
      </div>

      {/* Interactive Calibration Ruler Track */}
      <div
        ref={rulerTrackRef}
        onClick={handleTrackClick}
        className="group relative h-[380px] w-6 cursor-pointer py-1"
        title="Click to jump to position"
      >
        {/* Background ticks */}
        <div className="absolute inset-y-0 right-0 flex flex-col justify-between w-full pointer-events-none">
          {Array.from({ length: tickCount }).map((_, i) => {
            const isMajor = i % 5 === 0
            const tickRatio = i / (tickCount - 1)
            const isPassed = tickRatio <= ratio

            return (
              <div
                key={i}
                className="flex justify-end pr-0"
              >
                <span
                  className={`block transition-colors duration-150 ${
                    isMajor ? 'w-3 h-[1.5px]' : 'w-1.5 h-[1px]'
                  } ${
                    isPassed
                      ? 'bg-[var(--ed-accent)] opacity-80'
                      : 'bg-[var(--ed-rule)] opacity-40 group-hover:opacity-70'
                  }`}
                />
              </div>
            )
          })}
        </div>

        {/* Heading Indicators on the Ruler */}
        {headingPositions.map((hp) => (
          <div
            key={hp.id}
            style={{ top: `${hp.ratio * 100}%` }}
            className="absolute right-0 -translate-y-1/2 flex items-center group/marker z-20"
            onClick={(e) => {
              e.stopPropagation()
              scrollToHeading(hp.id)
            }}
          >
            {/* Tooltip on hover */}
            <div className="pointer-events-none absolute right-7 hidden whitespace-nowrap rounded bg-[var(--ed-surface)] border border-[var(--ed-rule)] px-2 py-0.5 text-[10px] font-[family-name:var(--font-glacial)] font-semibold uppercase tracking-wider text-[var(--ed-fg)] shadow-md group-hover/marker:block">
              {hp.text}
            </div>

            {/* Extended Marker */}
            <span className="block h-[2px] w-4 bg-[var(--ed-accent)] transition-all group-hover/marker:w-5 group-hover/marker:h-[3px]" />
          </div>
        ))}

        {/* Active Needle Slider */}
        <div
          className="absolute right-0 w-4 h-[2px] bg-[var(--ed-accent)] -translate-y-1/2 pointer-events-none z-10 shadow-[0_0_8px_var(--ed-accent)]"
          style={{ top: `${ratio * 100}%` }}
        />
      </div>
    </div>
  )
}
