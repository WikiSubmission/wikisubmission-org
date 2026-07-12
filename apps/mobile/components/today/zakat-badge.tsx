'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { GsapPresence } from '@/components/gsap-presence'
import { EASE_STANDARD } from '@/lib/gsap'
import { haptic } from '@/lib/haptics'
import { usePrefersReducedMotion } from '@/hooks/use-prefers-reduced-motion'
import { useZakatReminder } from '@/hooks/use-zakat-reminder'
import { cn } from '@/lib/utils'

/** How often the "Zakat" label slides out of the circle as a gentle nudge. */
const LABEL_EVERY_MS = 25_000
/** How long the label stays visible per nudge. */
const LABEL_SHOW_MS = 2_600
/** First nudge fires sooner so a fresh visit sees what the circle means. */
const LABEL_FIRST_MS = 4_000

/**
 * Compact zakat countdown on the prayer card (top-left, mirroring the bell):
 * a circle with the days remaining, replacing the full-width chip once a
 * reminder is configured. A small "Zakat" label periodically animates out of
 * it as a reminder; tapping opens the zakat page.
 */
export function ZakatBadge() {
  const router = useRouter()
  const reducedMotion = usePrefersReducedMotion()
  const { prefs, daysLeft } = useZakatReminder()
  const [labelVisible, setLabelVisible] = useState(false)

  const configured = (prefs?.enabled ?? false) && daysLeft !== null
  const dueToday = configured && daysLeft <= 0

  useEffect(() => {
    if (!configured || reducedMotion) return
    let showTimer = 0
    let hideTimer = 0
    const schedule = (delay: number) => {
      showTimer = window.setTimeout(() => {
        // No nudges while backgrounded; just re-arm.
        if (document.visibilityState !== 'hidden') {
          setLabelVisible(true)
          hideTimer = window.setTimeout(() => setLabelVisible(false), LABEL_SHOW_MS)
        }
        schedule(LABEL_EVERY_MS)
      }, delay)
    }
    schedule(LABEL_FIRST_MS)
    return () => {
      window.clearTimeout(showTimer)
      window.clearTimeout(hideTimer)
    }
  }, [configured, reducedMotion])

  if (!configured) return null

  return (
    <button
      type="button"
      onClick={() => {
        haptic('light')
        router.push('/zakat')
      }}
      className="absolute top-4 left-4 z-10 flex items-center gap-1.5"
      aria-label={
        dueToday ? 'Zakat due today' : `Zakat in ${daysLeft} ${daysLeft === 1 ? 'day' : 'days'}`
      }
    >
      <span
        className={cn(
          'border-border/50 bg-background/55 flex size-7 shrink-0 items-center justify-center rounded-full border font-mono text-[10px] font-medium tabular-nums backdrop-blur-md',
          dueToday
            ? 'border-primary/60 text-primary animate-pulse'
            : 'text-foreground/80',
        )}
      >
        {dueToday ? '!' : daysLeft}
      </span>
      <GsapPresence
        show={labelVisible || dueToday}
        enterFrom={reducedMotion ? {} : { x: -6 }}
        enterTo={{ x: 0, duration: 0.45, ease: EASE_STANDARD }}
        exitTo={reducedMotion ? { duration: 0.45 } : { x: -4, duration: 0.45, ease: EASE_STANDARD }}
        className={cn(
          'text-[10px] font-medium tracking-[0.18em] uppercase',
          dueToday ? 'text-primary' : 'text-muted-foreground',
        )}
      >
        {dueToday ? 'Zakat due' : 'Zakat'}
      </GsapPresence>
    </button>
  )
}
