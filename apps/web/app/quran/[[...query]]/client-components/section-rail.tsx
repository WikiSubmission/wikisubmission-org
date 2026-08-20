'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useTranslations } from 'next-intl'

export interface RailSection {
  /** DOM id of the section this bar jumps to. */
  id: string
  label: string
}

/**
 * Fraction of the viewport height at which a section counts as "current" —
 * a section is active once its top has crossed this line and no later section
 * has. Sits below the 64px fixed header so the switch happens when the heading
 * is actually readable, not when it is still tucked under the chrome.
 */
const ACTIVE_LINE = 0.3

/** Fixed-header height plus a little air, subtracted from every jump target. */
const HEADER_OFFSET = 80

/** How long the rail stays fully opaque after the last scroll event. */
const IDLE_MS = 1200

/** Bar widths, in px — the active section's bar is the wider one. */
const ACTIVE_BAR_PX = 24
const IDLE_BAR_PX = 14

/**
 * Right-edge section navigator for the /quran landing page. One thin bar per
 * section, the current one wider and darker, labels revealed on hover.
 *
 * Sections are filtered against the DOM on every layout change rather than
 * trusted from props: the continue-cover-to-cover card resolves client side and
 * renders nothing for readers with no progress, and the chapter/appendix
 * accordions change the page height as they open. A ResizeObserver on <body>
 * catches both without this component knowing about either.
 */
export function QuranSectionRail({ sections }: { sections: RailSection[] }) {
  const t = useTranslations('quran')
  const [present, setPresent] = useState<RailSection[]>([])
  const [activeId, setActiveId] = useState<string | null>(null)
  const [scrolling, setScrolling] = useState(false)
  const idleTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Which sections actually rendered, and with what height.
  useEffect(() => {
    let frame = 0

    const measure = () => {
      frame = 0
      setPresent((prev) => {
        const next = sections.filter((s) => {
          const el = document.getElementById(s.id)
          return !!el && el.getBoundingClientRect().height > 0
        })
        // Keep the old array when nothing changed so the rail does not
        // re-render on every accordion toggle or window resize.
        const same =
          prev.length === next.length && prev.every((s, i) => s.id === next[i].id)
        return same ? prev : next
      })
    }

    const schedule = () => {
      if (frame) return
      frame = requestAnimationFrame(measure)
    }

    measure()
    const observer = new ResizeObserver(schedule)
    observer.observe(document.body)
    return () => {
      observer.disconnect()
      if (frame) cancelAnimationFrame(frame)
    }
  }, [sections])

  // Current section, recomputed from live rects so it stays correct as the
  // accordions grow and shrink under the reader.
  useEffect(() => {
    if (present.length === 0) return
    let frame = 0

    const measure = () => {
      frame = 0
      const line = window.innerHeight * ACTIVE_LINE
      let current = present[0].id
      for (const s of present) {
        const el = document.getElementById(s.id)
        if (!el) continue
        if (el.getBoundingClientRect().top <= line) current = s.id
      }
      setActiveId(current)
    }

    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(measure)
      setScrolling(true)
      if (idleTimer.current) clearTimeout(idleTimer.current)
      idleTimer.current = setTimeout(() => setScrolling(false), IDLE_MS)
    }

    measure()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (frame) cancelAnimationFrame(frame)
      if (idleTimer.current) clearTimeout(idleTimer.current)
    }
  }, [present])

  const jumpTo = useCallback((id: string) => {
    const el = document.getElementById(id)
    if (!el) return
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    window.scrollTo({
      top: Math.max(0, el.getBoundingClientRect().top + window.scrollY - HEADER_OFFSET),
      behavior: reduced ? 'auto' : 'smooth',
    })
  }, [])

  if (present.length < 2) return null

  return (
    <nav
      aria-label={t('sectionsNav')}
      className={`hidden lg:flex fixed top-1/2 end-4 xl:end-8 z-30 -translate-y-1/2 flex-col items-end transition-opacity duration-300 hover:opacity-100 focus-within:opacity-100 ${
        scrolling ? 'opacity-100' : 'opacity-40'
      }`}
    >
      {present.map((s) => {
        const isActive = s.id === activeId
        return (
          <button
            key={s.id}
            type="button"
            onClick={() => jumpTo(s.id)}
            aria-label={s.label}
            aria-current={isActive ? 'true' : undefined}
            /* Fixed-size hit target so every bar is equally clickable and the
               rail's width never shifts as the active bar grows. */
            className="group/rail relative flex h-5 w-6 items-center justify-end outline-none"
          >
            {/* Absolutely positioned: a label in flow would shrink the bar it
                sits next to, and would make the hit targets ragged. */}
            <span className="pointer-events-none absolute end-full me-2 whitespace-nowrap rounded-md border border-border/60 bg-background/95 px-2 py-0.5 text-[11px] text-muted-foreground opacity-0 transition-opacity group-hover/rail:opacity-100 group-focus-visible/rail:opacity-100">
              {s.label}
            </span>
            {/* Width is inline rather than a w-* class: the class pair was being
                resolved against the wrong rule inside the flex button, leaving
                the active bar the same width as the rest. */}
            <span
              style={{ width: isActive ? ACTIVE_BAR_PX : IDLE_BAR_PX }}
              className={`h-0.5 shrink-0 rounded-full transition-all ${
                isActive
                  ? 'bg-foreground'
                  : 'bg-muted-foreground/50 group-hover/rail:bg-muted-foreground group-focus-visible/rail:bg-muted-foreground'
              }`}
            />
          </button>
        )
      })}
    </nav>
  )
}
