/**
 * Sunrise-aware event cycle shared by web and mobile.
 *
 * The practices API exposes `current_event`/`upcoming_event` (the 5 prayers
 * plus sunrise between fajr and dhuhr). This module provides the canonical
 * event order and a client-side fallback that derives the same cycle from
 * `times_in_utc`, for responses served by an API deployed before those fields
 * existed — and for callers that need live seconds (e.g. the mobile gauge).
 */

import type { PrayerTimesResponse } from './prayer-times'

export type PrayerEventKey = 'fajr' | 'sunrise' | 'dhuhr' | 'asr' | 'maghrib' | 'isha'

/** The daily event cycle in order: the 5 prayers with sunrise after fajr. */
export const PRAYER_EVENT_ORDER: readonly PrayerEventKey[] = [
  'fajr',
  'sunrise',
  'dhuhr',
  'asr',
  'maghrib',
  'isha',
]

export interface EventCycle {
  currentEvent: PrayerEventKey
  upcomingEvent: PrayerEventKey
  /** Seconds until the upcoming event. */
  secondsLeft: number
  /** Seconds since the current event began. */
  secondsElapsed: number
}

const DAY_MS = 24 * 60 * 60 * 1000

/**
 * Derives the current/upcoming event from `times_in_utc` at a given instant.
 * Overnight is approximated by shifting fajr/isha one day, matching the API's
 * own "time to next occurrence" behavior. Returns null when the response has
 * no parseable `times_in_utc`.
 */
export function deriveEventCycle(
  data: PrayerTimesResponse,
  nowMs: number = Date.now(),
): EventCycle | null {
  const utc = data.times_in_utc
  if (!utc) return null

  const times: number[] = []
  for (const key of PRAYER_EVENT_ORDER) {
    const parsed = Date.parse(utc[key] ?? '')
    if (!Number.isFinite(parsed)) return null
    times.push(parsed)
  }

  const fajrMs = times[0]
  const ishaMs = times[times.length - 1]

  if (nowMs < fajrMs) {
    // Pre-dawn: still the isha period, counting from yesterday's isha.
    return buildCycle('isha', 'fajr', nowMs, ishaMs - DAY_MS, fajrMs)
  }
  if (nowMs >= ishaMs) {
    // After isha: counting to tomorrow's fajr.
    return buildCycle('isha', 'fajr', nowMs, ishaMs, fajrMs + DAY_MS)
  }
  for (let i = 0; i < times.length - 1; i++) {
    if (nowMs >= times[i] && nowMs < times[i + 1]) {
      return buildCycle(PRAYER_EVENT_ORDER[i], PRAYER_EVENT_ORDER[i + 1], nowMs, times[i], times[i + 1])
    }
  }
  return null
}

function buildCycle(
  currentEvent: PrayerEventKey,
  upcomingEvent: PrayerEventKey,
  nowMs: number,
  currentStartMs: number,
  upcomingAtMs: number,
): EventCycle {
  return {
    currentEvent,
    upcomingEvent,
    secondsLeft: Math.max(0, Math.floor((upcomingAtMs - nowMs) / 1000)),
    secondsElapsed: Math.max(0, Math.floor((nowMs - currentStartMs) / 1000)),
  }
}
