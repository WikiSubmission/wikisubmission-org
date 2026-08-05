import type { PrayerTimesResponse } from '@/lib/prayer-times'
import { PRAYER_EVENT_ORDER, type PrayerEventKey } from '@/lib/prayer-events'

/**
 * Turns the practices response into concrete event instants for scheduling.
 *
 * The 30-day `schedule[]` carries wall-clock strings in the *city's* timezone.
 * The mobile app always queries by device coordinates, so device timezone ==
 * city timezone in practice and plain local-Date construction is correct (and
 * DST-safe, since each day's wall clock is taken as-is). When the timezones
 * disagree anyway (clock set manually, VPN geolocation, …) we degrade to
 * today's events from `times_in_utc`, which are unambiguous instants — the
 * next app open extends the window again.
 */
export interface PrayerEventInstant {
  event: PrayerEventKey
  at: Date
}

function deviceTimezone(): string | null {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone ?? null
  } catch {
    return null
  }
}

/** Parses "h:mm AM" / "h:mm pm" to 24h {hours, minutes}, or null. */
function parseClock(value: string | undefined): { hours: number; minutes: number } | null {
  if (!value) return null
  const match = /^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i.exec(value.trim())
  if (!match) return null
  let hours = Number.parseInt(match[1], 10)
  const minutes = Number.parseInt(match[2], 10)
  const meridiem = match[3]?.toUpperCase()
  if (meridiem === 'PM' && hours !== 12) hours += 12
  if (meridiem === 'AM' && hours === 12) hours = 0
  if (hours > 23 || minutes > 59) return null
  return { hours, minutes }
}

/** Parses "yyyy-MM-dd" into local-date components, or null. */
function parseDate(value: string | undefined): { y: number; m: number; d: number } | null {
  if (!value) return null
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim())
  if (!match) return null
  return {
    y: Number.parseInt(match[1], 10),
    m: Number.parseInt(match[2], 10),
    d: Number.parseInt(match[3], 10),
  }
}

function todayInstantsFromUtc(data: PrayerTimesResponse, now: Date): PrayerEventInstant[] {
  const utc = data.times_in_utc
  if (!utc) return []
  const instants: PrayerEventInstant[] = []
  for (const event of PRAYER_EVENT_ORDER) {
    const parsed = Date.parse(utc[event] ?? '')
    if (!Number.isFinite(parsed)) continue
    const at = new Date(parsed)
    if (at > now) instants.push({ event, at })
  }
  return instants
}

/**
 * The most recent event instant at or before `now` — the prayer window the
 * user is currently inside. Used to decide which delivered notifications are
 * stale (everything older than the current window). Null when neither the
 * schedule nor times_in_utc covers a past instant.
 */
export function computeCurrentEventInstant(
  data: PrayerTimesResponse,
  now: Date = new Date(),
): PrayerEventInstant | null {
  let latest: PrayerEventInstant | null = null
  const consider = (event: PrayerEventKey, at: Date) => {
    if (at <= now && (!latest || at > latest.at)) latest = { event, at }
  }

  const deviceTz = deviceTimezone()
  const timezoneMismatch =
    Boolean(data.local_timezone_id) && Boolean(deviceTz) && data.local_timezone_id !== deviceTz
  if (timezoneMismatch || !data.schedule?.length) {
    for (const event of PRAYER_EVENT_ORDER) {
      const parsed = Date.parse(data.times_in_utc?.[event] ?? '')
      if (Number.isFinite(parsed)) consider(event, new Date(parsed))
    }
    return latest
  }

  for (const day of data.schedule) {
    const date = parseDate(day.date)
    if (!date) continue
    for (const event of PRAYER_EVENT_ORDER) {
      const clock = parseClock(day.times?.[event])
      if (!clock) continue
      consider(event, new Date(date.y, date.m - 1, date.d, clock.hours, clock.minutes, 0, 0))
    }
  }
  return latest
}

/**
 * Future event instants within the next `days` days, in chronological order.
 * Callers filter by per-event preference and minimum lead time.
 */
export function computeUpcomingEventInstants(
  data: PrayerTimesResponse,
  options: { days: number; now?: Date },
): PrayerEventInstant[] {
  const now = options.now ?? new Date()

  const deviceTz = deviceTimezone()
  if (data.local_timezone_id && deviceTz && data.local_timezone_id !== deviceTz) {
    return todayInstantsFromUtc(data, now)
  }
  if (!data.schedule?.length) {
    return todayInstantsFromUtc(data, now)
  }

  const horizon = new Date(now.getTime() + options.days * 24 * 60 * 60 * 1000)
  const instants: PrayerEventInstant[] = []
  for (const day of data.schedule) {
    const date = parseDate(day.date)
    if (!date) continue
    for (const event of PRAYER_EVENT_ORDER) {
      const clock = parseClock(day.times?.[event])
      if (!clock) continue
      const at = new Date(date.y, date.m - 1, date.d, clock.hours, clock.minutes, 0, 0)
      if (at > now && at <= horizon) instants.push({ event, at })
    }
  }
  instants.sort((a, b) => a.at.getTime() - b.at.getTime())
  return instants
}
