'use client'

import { useLayoutEffect, useRef } from 'react'
import { PrayerSchedule } from '@/components/today/prayer-schedule'
import { ZakatCountdown } from '@/components/today/zakat-countdown'
import { ZikrStrip } from '@/components/today/zikr-strip'
import { usePrefersReducedMotion } from '@/hooks/use-prefers-reduced-motion'
import { gsap } from '@/lib/gsap'
import { useZikr } from '@/hooks/use-zikr'
import { useStartupZikr } from '@/lib/startup-zikr-context'

/**
 * Today is the mobile home: a themed, time-of-day ambient backdrop behind the
 * zikr strip, the zakat countdown chip, and the day's prayer schedule. On a
 * cold start the startup overlay's zikr flies into the strip (GSAP Flip)
 * while the prayer card and chip animate open underneath.
 */
export function TodayScreen() {
  const { phase, initialIndex } = useStartupZikr()
  const { items } = useZikr()
  const reducedMotion = usePrefersReducedMotion()

  // While the overlay owns the zikr (phase 'overlay'), the strip stays
  // unmounted; it mounts in the same commit the overlay's hero unmounts
  // ('flying'), which is what triggers the Flip flight.
  const startupPlaying = phase === 'overlay' || phase === 'flying'
  const cardVisible = phase !== 'overlay'

  // Prayer card + zakat chip open underneath the flight. Instant (no tween)
  // under reduced motion or when the startup was skipped.
  const cardRef = useRef<HTMLDivElement>(null)
  useLayoutEffect(() => {
    const el = cardRef.current
    if (!el) return
    if (!cardVisible) {
      gsap.set(el, { autoAlpha: 0, y: 24, scale: 0.98 })
      return
    }
    if (reducedMotion || phase === 'skipped') {
      gsap.set(el, { autoAlpha: 1, y: 0, scale: 1 })
      return
    }
    const tween = gsap.to(el, {
      autoAlpha: 1,
      y: 0,
      scale: 1,
      duration: 0.5,
      ease: 'power3.out',
    })
    return () => {
      tween.kill()
    }
  }, [cardVisible, phase, reducedMotion])

  return (
    <div className="relative flex flex-1 flex-col">
      {/* Ambient backdrop is mounted app-wide by MobileShell. */}
      <div className="relative z-10 flex flex-1 flex-col gap-4 py-6">
        {phase === 'overlay' ? (
          // Reserve the strip's height so the flight target position is stable.
          <div className="min-h-[5.5rem]" aria-hidden="true" />
        ) : (
          <ZikrStrip
            items={items}
            initialIndex={initialIndex}
            // The strip is the Flip landing target only during the flight;
            // afterwards rotations use their own entrances.
            flightTarget={startupPlaying}
            paused={startupPlaying}
          />
        )}

        <div ref={cardRef} className="flex flex-col gap-4">
          <ZakatCountdown />
          <PrayerSchedule />
        </div>
      </div>
    </div>
  )
}
