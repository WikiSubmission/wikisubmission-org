'use client'

import { motion } from 'framer-motion'
import { AmbientBackdrop } from '@/components/today/ambient-backdrop'
import { PrayerSchedule } from '@/components/today/prayer-schedule'
import { ZakatCountdown } from '@/components/today/zakat-countdown'
import { ZikrStrip } from '@/components/today/zikr-strip'
import { usePrefersReducedMotion } from '@/hooks/use-prefers-reduced-motion'
import { useZikr } from '@/hooks/use-zikr'
import { useStartupZikr, ZIKR_HERO_LAYOUT_ID } from '@/lib/startup-zikr-context'

/**
 * Today is the mobile home: a themed, time-of-day ambient backdrop behind the
 * zikr strip, the zakat countdown chip, and the day's prayer schedule. On a
 * cold start the startup overlay's zikr flies into the strip (shared layoutId)
 * while the prayer card and chip animate open underneath.
 */
export function TodayScreen() {
  const { phase, initialIndex } = useStartupZikr()
  const { items } = useZikr()
  const reducedMotion = usePrefersReducedMotion()

  // While the overlay owns the zikr (phase 'overlay'), the strip stays
  // unmounted; it mounts in the same commit the overlay's hero unmounts
  // ('flying'), which is what triggers the layoutId flight.
  const startupPlaying = phase === 'overlay' || phase === 'flying'
  const cardVisible = phase !== 'overlay'

  return (
    <div className="relative flex flex-1 flex-col">
      <AmbientBackdrop />
      <div className="relative z-10 flex flex-1 flex-col gap-4 py-6">
        {phase === 'overlay' ? (
          // Reserve the strip's height so the flight target position is stable.
          <div className="min-h-[5.5rem]" aria-hidden="true" />
        ) : (
          <ZikrStrip
            items={items}
            initialIndex={initialIndex}
            // Shared with the overlay hero only during the flight; afterwards
            // the id is dropped so rotations don't trigger layout morphs.
            layoutId={startupPlaying ? ZIKR_HERO_LAYOUT_ID : undefined}
            paused={startupPlaying}
          />
        )}

        <motion.div
          initial={false}
          animate={
            cardVisible ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 24, scale: 0.98 }
          }
          transition={{
            duration: reducedMotion || phase === 'skipped' ? 0 : 0.5,
            ease: [0.32, 0.72, 0, 1],
          }}
          className="flex flex-col gap-4"
        >
          <ZakatCountdown />
          <PrayerSchedule />
        </motion.div>
      </div>
    </div>
  )
}
