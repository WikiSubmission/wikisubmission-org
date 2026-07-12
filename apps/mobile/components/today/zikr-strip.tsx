'use client'

import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import type { ZikrItem } from '@/lib/zikr'
import { ZikrRevealText } from '@/components/today/zikr-reveal-text'
import { usePrefersReducedMotion } from '@/hooks/use-prefers-reduced-motion'
import { EASE_STANDARD, Flip, gsap } from '@/lib/gsap'
import { takeZikrFlightState, ZIKR_FLIP_ID } from '@/lib/zikr-flight'

export interface ZikrStripProps {
  items: ZikrItem[]
  /** Seed index (the splash flight hands over the zikr it displayed). */
  initialIndex?: number
  intervalMs?: number
  /** How long the first (daily) zikr holds before rotation begins. Longer than
   *  intervalMs so the day's zikr lingers before the per-user shuffle starts. */
  firstHoldMs?: number
  /** While true the strip is the splash flight's landing target: the text is
   *  one stable element (no per-word reveal) and Flip animates it in from the
   *  overlay's captured position. */
  flightTarget?: boolean
  /** Rotation holds until the startup animation finishes. */
  paused?: boolean
}

/** Duration of the splash-to-strip flight (overlay fade matches it). */
const FLIGHT_DURATION_S = 0.6

/** A uniformly random index other than `prev`, so rotation never repeats the
 *  same zikr back-to-back. Each client shuffles independently. */
function pickNextRandomIndex(prev: number, length: number): number {
  if (length <= 1) return 0
  let next = Math.floor(Math.random() * (length - 1))
  if (next >= prev) next += 1
  return next
}

/**
 * Rotating zikr display above the prayer card: one short remembrance of God
 * at a time, breathing in and out (fade + blur + letter-spacing). Purely
 * presentational — data comes from useZikr in the parent.
 */
export function ZikrStrip({
  items,
  initialIndex = 0,
  intervalMs = 8000,
  firstHoldMs = 15000,
  flightTarget = false,
  paused = false,
}: ZikrStripProps) {
  const reducedMotion = usePrefersReducedMotion()
  const [index, setIndex] = useState(() =>
    items.length > 0 ? Math.min(initialIndex, items.length - 1) : 0,
  )
  // The index actually on screen. Trails `index` by one exit tween so the
  // outgoing zikr can breathe out before the next writes itself in.
  const [displayedIndex, setDisplayedIndex] = useState(index)
  const blockRef = useRef<HTMLDivElement>(null)
  const heroRef = useRef<HTMLParagraphElement>(null)

  // The first item is the shared "zikr of the day" handed over by the splash;
  // it holds for firstHoldMs, then each client shuffles its own random order at
  // intervalMs. setTimeout (not setInterval) so the first hold can be longer.
  useEffect(() => {
    if (paused || items.length <= 1) return
    let timer = 0
    let firstHold = true
    const schedule = () => {
      timer = window.setTimeout(
        () => {
          // Don't advance while backgrounded; just re-arm for the next tick.
          if (document.visibilityState !== 'hidden') {
            setIndex((prev) => pickNextRandomIndex(prev, items.length))
          }
          firstHold = false
          schedule()
        },
        firstHold ? firstHoldMs : intervalMs,
      )
    }
    schedule()
    return () => window.clearTimeout(timer)
  }, [paused, items.length, intervalMs, firstHoldMs])

  // Rotation exit: breathe the current zikr out, then hand over to the next.
  useEffect(() => {
    if (index === displayedIndex) return
    const el = blockRef.current
    if (!el || reducedMotion) {
      setDisplayedIndex(index)
      return
    }
    const tween = gsap.to(el, {
      autoAlpha: 0,
      y: -6,
      filter: 'blur(6px)',
      letterSpacing: '0.14em',
      duration: 0.9,
      ease: EASE_STANDARD,
      onComplete: () => setDisplayedIndex(index),
    })
    return () => {
      tween.kill()
    }
  }, [index, displayedIndex, reducedMotion])

  // Entrance for each displayed zikr. Three variants: the splash flight
  // (Flip from the overlay's captured position), the per-word reveal (block
  // fades fast, words write themselves in), or the plain breathe-in.
  useLayoutEffect(() => {
    const el = blockRef.current
    if (!el) return
    const flightState = flightTarget ? takeZikrFlightState() : null
    if (flightState && heroRef.current) {
      gsap.set(el, { clearProps: 'all', autoAlpha: 1 })
      const flight = Flip.from(flightState, {
        targets: heroRef.current,
        duration: FLIGHT_DURATION_S,
        ease: 'power3.inOut',
        scale: true,
      })
      return () => {
        flight.kill()
      }
    }
    const wordReveal = !flightTarget && !reducedMotion
    const tween = reducedMotion
      ? gsap.fromTo(el, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.3 })
      : wordReveal
        ? gsap.fromTo(
            el,
            { autoAlpha: 0, y: 0, filter: 'blur(0px)', letterSpacing: '0.05em' },
            { autoAlpha: 1, duration: 0.25, ease: EASE_STANDARD },
          )
        : gsap.fromTo(
            el,
            { autoAlpha: 0, y: 8, filter: 'blur(6px)', letterSpacing: '0.01em' },
            {
              autoAlpha: 1,
              y: 0,
              filter: 'blur(0px)',
              letterSpacing: '0.05em',
              duration: 0.9,
              ease: EASE_STANDARD,
            },
          )
    return () => {
      tween.kill()
    }
    // Re-run per displayed zikr; flightTarget/reducedMotion only gate variants.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [displayedIndex])

  const item = items[displayedIndex]
  if (!item) return null

  // Once the splash flight is over the per-word reveal (ZikrRevealText) owns
  // the entrance; during the flight the hero must be one stable element.
  const wordReveal = !flightTarget && !reducedMotion

  return (
    <div className="mx-auto w-full max-w-md px-4">
      {/* Height reserved so rotation never reflows the widgets below. */}
      <div className="flex min-h-[5.5rem] flex-col items-center justify-center text-center">
        <div ref={blockRef} className="flex flex-col items-center">
          <p
            ref={heroRef}
            data-flip-id={flightTarget ? ZIKR_FLIP_ID : undefined}
            className="font-display text-foreground/85 text-[1.35rem] leading-snug text-balance"
          >
            {wordReveal ? <ZikrRevealText text={item.text} /> : item.text}
          </p>
          {item.source && (
            <p className="text-muted-foreground/70 mt-1.5 font-mono text-[9px] tracking-[0.25em] uppercase">
              {item.source}
            </p>
          )}
        </div>
        <div className="border-border/60 mt-3 w-8 border-t" aria-hidden="true" />
      </div>
    </div>
  )
}
