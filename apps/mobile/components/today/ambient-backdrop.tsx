'use client'

import { useTheme } from 'next-themes'
import { PALETTES, usePalette } from '@/lib/theme-palette-context'
import { useMounted } from '@/hooks/use-mounted'
import { useTimeOfDay } from '@/hooks/use-time-of-day'
import { ParchmentScene } from '@/components/today/motifs/parchment-scene'
import { CrystalScene } from '@/components/today/motifs/crystal-scene'
import { ChromeScene } from '@/components/today/motifs/chrome-scene'
import { cn } from '@/lib/utils'

/**
 * Full-bleed ambient backdrop, mounted app-wide by MobileShell. The motif is
 * chosen by the active palette (ink = parchment, violet = crystals, mono =
 * chrome), recolored for light/dark mode, and shifted slowly across the day by
 * the time-of-day hook. Rendered client-only to avoid an export hydration
 * mismatch. `subdued` fades the scene back for content-dense pages (reader,
 * settings) where the Today screen's full treatment would fight legibility.
 */
export function AmbientBackdrop({ subdued = false }: { subdued?: boolean }) {
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
    <div
      className={cn(
        'fixed inset-0 z-0 transition-opacity duration-500',
        subdued && 'opacity-50',
      )}
      aria-hidden="true"
    >
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
