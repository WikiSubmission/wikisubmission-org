import type { TimeOfDay } from '@/hooks/use-time-of-day'

export interface PaletteColors {
  bg: string
  fg: string
  accent: string
  rule: string
}

export interface MotifSceneProps {
  colors: PaletteColors
  time: TimeOfDay
  mode: 'light' | 'dark'
}

/** Vertical placement of the luminary: high at zenith, low near the horizon. */
export function luminaryTop(altitude: number): string {
  const top = 58 - altitude * 48 // ~10% at noon, ~58% near the horizon
  return `${top}%`
}

/** A phase-driven tint overlaid on every motif to shift mood through the day. */
export function phaseTint(time: TimeOfDay, mode: 'light' | 'dark'): string {
  const a = mode === 'dark' ? 0.42 : 0.2
  switch (time.phase) {
    case 'dawn':
      return `rgba(255, 154, 122, ${a})`
    case 'morning':
      return `rgba(255, 214, 150, ${a * 0.55})`
    case 'midday':
      return `rgba(255, 248, 222, ${a * 0.35})`
    case 'afternoon':
      return `rgba(255, 198, 128, ${a * 0.5})`
    case 'dusk':
      return `rgba(244, 120, 78, ${a})`
    case 'night':
    default:
      return `rgba(36, 32, 74, ${a + 0.1})`
  }
}
