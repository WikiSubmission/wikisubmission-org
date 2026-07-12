'use client'

import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'
import { normalizePath } from '@/constants/navigation'
import { usePrefersReducedMotion } from '@/hooks/use-prefers-reduced-motion'
import { EASE_SETTLE, Flip, gsap } from '@/lib/gsap'
import { hideNativeSplash } from '@/lib/splash-handoff'
import { setZikrFlightState, ZIKR_FLIP_ID } from '@/lib/zikr-flight'
import { useStartupZikr } from '@/lib/startup-zikr-context'

// Timeline (ms): text settles 0-700, holds to 900, flight begins at 900 and
// the whole startup is over by ~1500. Tap anywhere skips.
const FLIGHT_AT_MS = 900
const FINISH_AT_MS = 1500
const NON_TODAY_FADE_AT_MS = 900

/**
 * Full-screen startup overlay: the chosen zikr settles in centered, then (on
 * the Today screen) flies up into the zikr strip — the overlay captures a GSAP
 * Flip state of its hero just before unmounting and the strip animates its own
 * text in from that position — while the backdrop fades and the prayer card
 * opens underneath. On any other launch route it simply fades out. Sibling of
 * MobileShell in MobileProviders.
 */
export function StartupZikrOverlay() {
  const { phase, items, initialIndex, beginFlight, finish, skip } = useStartupZikr()
  const pathname = usePathname()
  const reducedMotion = usePrefersReducedMotion()

  const rootRef = useRef<HTMLDivElement>(null)
  const heroWrapRef = useRef<HTMLDivElement>(null)
  const heroRef = useRef<HTMLParagraphElement>(null)
  const skippingRef = useRef(false)

  const active = phase === 'overlay' || phase === 'flying'
  const onToday = normalizePath(pathname) === '/'
  // Capture launch conditions once; route changes mid-animation must not
  // re-trigger effects.
  const modeRef = useRef<'flight' | 'fade' | null>(null)
  if (active && modeRef.current === null) {
    modeRef.current = onToday && !reducedMotion ? 'flight' : 'fade'
  }

  // Lift the native splash only after the overlay has painted (double rAF =
  // the frame containing it is committed) so there is no blank flash between.
  useEffect(() => {
    if (phase !== 'overlay') return
    let raf2 = 0
    const raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => hideNativeSplash())
    })
    return () => {
      cancelAnimationFrame(raf1)
      cancelAnimationFrame(raf2)
    }
  }, [phase])

  // Hero settle-in.
  useEffect(() => {
    const el = heroWrapRef.current
    if (phase !== 'overlay' || !el) return
    const tween = reducedMotion
      ? gsap.fromTo(el, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.7 })
      : gsap.fromTo(
          el,
          { autoAlpha: 0, filter: 'blur(8px)', letterSpacing: '0.12em' },
          {
            autoAlpha: 1,
            filter: 'blur(0px)',
            letterSpacing: '0.05em',
            duration: 0.7,
            ease: EASE_SETTLE,
          },
        )
    return () => {
      tween.kill()
    }
  }, [phase, reducedMotion])

  // Drive the timeline. The flight branch captures the hero's Flip state at
  // the moment of handoff; the strip (mounted in the same commit the hero
  // unmounts) consumes it and animates from this exact position.
  useEffect(() => {
    if (phase !== 'overlay') return
    if (modeRef.current === 'flight') {
      const flightTimer = window.setTimeout(() => {
        if (heroRef.current) setZikrFlightState(Flip.getState(heroRef.current))
        beginFlight()
      }, FLIGHT_AT_MS)
      return () => window.clearTimeout(flightTimer)
    }
    const fadeTimer = window.setTimeout(skip, NON_TODAY_FADE_AT_MS)
    return () => window.clearTimeout(fadeTimer)
  }, [phase, beginFlight, skip])

  // Backdrop fade while the text flies; the overlay unmounts at finish.
  useEffect(() => {
    const el = rootRef.current
    if (phase !== 'flying' || !el) return
    const fade = gsap.to(el, { autoAlpha: 0, duration: 0.55, ease: 'power1.out' })
    const finishTimer = window.setTimeout(finish, FINISH_AT_MS - FLIGHT_AT_MS)
    return () => {
      fade.kill()
      window.clearTimeout(finishTimer)
    }
  }, [phase, finish])

  // Tap to skip: a quick fade, then release the phase (idempotent if the
  // flight started meanwhile).
  const onSkip = () => {
    if (skippingRef.current || phase !== 'overlay') return
    skippingRef.current = true
    const el = rootRef.current
    if (!el) {
      skip()
      return
    }
    gsap.to(el, { autoAlpha: 0, duration: 0.2, ease: 'power1.out', onComplete: skip })
  }

  const item = items[initialIndex]
  if (!active || !item) return null

  return (
    <div
      ref={rootRef}
      className="bg-background fixed inset-0 z-[100] flex flex-col items-center justify-center px-8"
      style={{ pointerEvents: phase === 'overlay' ? 'auto' : 'none' }}
      onPointerDown={onSkip}
    >
      {/* The hero unmounts when the flight starts; the Today strip mounts its
          Flip twin in the same commit and animates from the captured state. */}
      {phase === 'overlay' && (
        <div
          ref={heroWrapRef}
          className="flex flex-col items-center text-center"
          style={{ visibility: 'hidden' }}
        >
          <p
            ref={heroRef}
            data-flip-id={modeRef.current === 'flight' ? ZIKR_FLIP_ID : undefined}
            className="font-display text-foreground/90 max-w-md text-2xl leading-snug text-balance"
          >
            {item.text}
          </p>
          {item.source && (
            <p className="text-muted-foreground/70 mt-2 font-mono text-[9px] tracking-[0.25em] uppercase">
              {item.source}
            </p>
          )}
        </div>
      )}
    </div>
  )
}
