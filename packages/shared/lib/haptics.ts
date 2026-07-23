/**
 * Lightweight haptic feedback via the Vibration API.
 *
 * Supported in Android Chrome (and therefore inside the Trusted Web Activity),
 * which is the Play Store target. No-ops where unsupported (iOS Safari, desktop)
 * and when the user prefers reduced motion, so callers can fire it freely.
 */

type HapticPattern = 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error'

const PATTERNS: Record<HapticPattern, number | number[]> = {
  light: 10,
  medium: 20,
  heavy: 35,
  success: [15, 40, 15],
  warning: [20, 60, 20],
  error: [40, 60, 40, 60],
}

function prefersReducedMotion(): boolean {
  return (
    typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches === true
  )
}

export function haptic(pattern: HapticPattern = 'light'): void {
  if (typeof navigator === 'undefined' || typeof navigator.vibrate !== 'function') {
    return
  }
  if (prefersReducedMotion()) {
    return
  }
  try {
    navigator.vibrate(PATTERNS[pattern])
  } catch {
    // Vibration can throw in restricted contexts; haptics are non-essential.
  }
}
