'use client'

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { GsapPresence } from '@/components/gsap-presence'
import { EASE_STANDARD } from '@/lib/gsap'
import { usePrefersReducedMotion } from '@/hooks/use-prefers-reduced-motion'
import type { QuranModeId } from '@/components/quran-reader/mode-selector'

const SHOW_MS = 1400

const MODE_LABEL_KEY: Record<QuranModeId, string> = {
  verse: 'modeVerse',
  word: 'modeWordByWord',
  reading: 'modeReading',
}

/** One switch event; a fresh object per switch so repeats of the same mode
 * (verse → word → verse) still re-announce. */
export interface ModeAnnouncement {
  mode: QuranModeId
}

/**
 * Transient label naming the display mode the user just switched to, so the
 * icon-only segmented control gets a readable confirmation. Floats just below
 * the (relative) chapter toolbar and dismisses itself.
 */
export function ModeChangeToast({
  announcement,
}: {
  announcement: ModeAnnouncement | null
}) {
  const t = useTranslations('quran')
  const reducedMotion = usePrefersReducedMotion()
  // Visibility is derived: an announcement shows until its dismiss timer marks
  // that exact announcement object as expired.
  const [dismissed, setDismissed] = useState<ModeAnnouncement | null>(null)

  useEffect(() => {
    if (!announcement) return
    const timer = setTimeout(() => setDismissed(announcement), SHOW_MS)
    return () => clearTimeout(timer)
  }, [announcement])

  const visible: QuranModeId | null =
    announcement && announcement !== dismissed ? announcement.mode : null

  return (
    <div className="pointer-events-none absolute top-full left-1/2 z-30 -translate-x-1/2 pt-2">
      <GsapPresence
        show={visible !== null}
        enterFrom={reducedMotion ? {} : { y: -6, scale: 0.96 }}
        enterTo={{ y: 0, scale: 1, duration: 0.22, ease: EASE_STANDARD }}
        exitTo={
          reducedMotion
            ? { duration: 0.22 }
            : { y: -4, scale: 0.98, duration: 0.22, ease: EASE_STANDARD }
        }
        className="border-border/50 bg-background/90 text-foreground inline-block rounded-full border px-3 py-1 text-xs font-medium shadow-sm backdrop-blur-md"
      >
        {/* announcement (not visible): the label must survive the exit fade. */}
        {announcement ? t(MODE_LABEL_KEY[announcement.mode]) : null}
      </GsapPresence>
    </div>
  )
}
