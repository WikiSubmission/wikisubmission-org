'use client'

import { useTheme } from 'next-themes'
import { PALETTES, usePalette } from '@/lib/theme-palette-context'
import { useMounted } from '@/hooks/use-mounted'
import { useTimeOfDay } from '@/hooks/use-time-of-day'
import { ParchmentScene } from '@/components/today/motifs/parchment-scene'
import { CrystalScene } from '@/components/today/motifs/crystal-scene'
import { ChromeScene } from '@/components/today/motifs/chrome-scene'

/**
 * Full-bleed ambient backdrop for the Today screen. The motif is chosen by the
 * active palette (ink = parchment, violet = crystals, mono = chrome), recolored
 * for light/dark mode, and shifted slowly across the day by the time-of-day
 * hook. Rendered client-only to avoid an export hydration mismatch.
 */
export function AmbientBackdrop() {
  const { palette } = usePalette()
  const { resolvedTheme } = useTheme()
  const time = useTimeOfDay()
  const mounted = useMounted()

  if (!mounted) {
    return <div className="fixed inset-0 z-0" aria-hidden="true" />
  }

  const mode: 'light' | 'dark' = resolvedTheme === 'dark' ? 'dark' : 'light'
  const colors = PALETTES[palette][mode]
  const props = { colors, time, mode }

  return (
    <div className="fixed inset-0 z-0" aria-hidden="true">
      {palette === 'violet' ? (
        <CrystalScene {...props} />
      ) : palette === 'mono' ? (
        <ChromeScene {...props} />
      ) : (
        <ParchmentScene {...props} />
      )}
    </div>
  )
}
