/**
 * Persists the last successful prayer-times response so a relaunch paints the
 * card instantly (React Query placeholderData) and the notification scheduler
 * can reschedule offline from the included 30-day schedule. localStorage (not
 * Preferences) because the placeholder must be readable synchronously during
 * the first render.
 */

import type { PrayerTimesResponse } from '@/lib/prayer-times'

const STORAGE_KEY = 'pt_last_response'

/** Stale prayer data is worse than a brief spinner beyond this age. */
const MAX_AGE_MS = 24 * 60 * 60 * 1000

export interface CachedPrayerResponse {
  location: string
  response: PrayerTimesResponse
  savedAt: number
}

export function readCachedPrayerResponse(): CachedPrayerResponse | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as CachedPrayerResponse
    if (
      typeof parsed?.location !== 'string' ||
      typeof parsed?.savedAt !== 'number' ||
      typeof parsed?.response !== 'object' ||
      parsed.response === null
    ) {
      return null
    }
    if (Date.now() - parsed.savedAt > MAX_AGE_MS) return null
    return parsed
  } catch {
    return null
  }
}

export function writeCachedPrayerResponse(location: string, response: PrayerTimesResponse): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ location, response, savedAt: Date.now() } satisfies CachedPrayerResponse),
    )
  } catch {
    // Storage full / private mode — instant paint just won't happen next launch.
  }
}
