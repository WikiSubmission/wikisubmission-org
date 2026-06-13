/**
 * Prayer-times data layer shared by web and mobile.
 *
 * The web app reaches the upstream service through a Next route handler proxy
 * (apps/web/app/api/practices/prayer-times/[location]/route.ts). A static
 * export has no route handlers, so the mobile app calls the upstream directly.
 * This module holds the response type and a direct-fetch helper both can use.
 */

const DEFAULT_UPSTREAM_BASE = 'https://practices.wikisubmission.org'
const FETCH_TIMEOUT_MS = 20_000

/** Public upstream base; overridable via NEXT_PUBLIC_PRACTICES_URL. */
export const PRACTICES_BASE_URL =
  process.env.NEXT_PUBLIC_PRACTICES_URL?.replace(/\/$/, '') ?? DEFAULT_UPSTREAM_BASE

export type PrayerKey = 'fajr' | 'dhuhr' | 'asr' | 'maghrib' | 'isha'

/** The five contact prayers in daily order — the canonical schedule order. */
export const PRAYER_ORDER: readonly PrayerKey[] = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha']

/** Cities offered as quick picks (mirrors the web prayer-times client). */
export const FEATURED_CITIES: readonly string[] = [
  'Mecca',
  'Medina',
  'Cairo',
  'Istanbul',
  'London',
  'New York',
  'Algiers',
  'Jakarta',
]

export const DEFAULT_PRAYER_LOCATION = 'Mecca'

/** localStorage key reused from the web client so a shared device stays in sync. */
export const PRAYER_LOCATION_STORAGE_KEY = 'pt_location'

interface PrayerTimeSet {
  fajr: string
  dhuhr: string
  asr: string
  maghrib: string
  isha: string
  sunrise: string
  sunset: string
}

export interface PrayerTimesResponse {
  status_string: string
  location_string: string
  country: string
  country_code: string
  city: string
  region: string
  local_time: string
  local_timezone: string
  local_timezone_id: string
  coordinates?: { latitude: number; longitude: number }
  times?: PrayerTimeSet
  times_in_utc?: PrayerTimeSet
  times_left?: PrayerTimeSet
  current_prayer?: string
  upcoming_prayer?: string
  current_prayer_time_elapsed?: string
  upcoming_prayer_time_left?: string
  schedule?: Array<{ date: string; day: string; times: PrayerTimeSet }>
}

export interface FetchPrayerTimesOptions {
  asrAdjustment?: boolean
  includeSchedule?: boolean
  signal?: AbortSignal
}

export class PrayerTimesError extends Error {
  constructor(
    message: string,
    readonly status?: number,
  ) {
    super(message)
    this.name = 'PrayerTimesError'
  }
}

/**
 * Fetch prayer times for a location string (e.g. "Mecca", "London, UK").
 * Calls the upstream service directly; safe to run in a static-export client.
 */
export async function fetchPrayerTimes(
  location: string,
  options: FetchPrayerTimesOptions = {},
): Promise<PrayerTimesResponse> {
  const trimmed = location.trim()
  if (!trimmed) {
    throw new PrayerTimesError('Location is required.')
  }

  const url = new URL(`/prayer-times/${encodeURIComponent(trimmed)}`, PRACTICES_BASE_URL)
  if (options.asrAdjustment) url.searchParams.set('asr_adjustment', 'true')
  if (options.includeSchedule) url.searchParams.set('include_schedule', 'true')

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS)
  if (options.signal) {
    options.signal.addEventListener('abort', () => controller.abort(), { once: true })
  }

  try {
    const response = await fetch(url, { cache: 'no-store', signal: controller.signal })
    if (!response.ok) {
      throw new PrayerTimesError(
        `Prayer times service returned ${response.status}.`,
        response.status,
      )
    }
    return (await response.json()) as PrayerTimesResponse
  } catch (error) {
    if (error instanceof PrayerTimesError) throw error
    const aborted = error instanceof Error && error.name === 'AbortError'
    throw new PrayerTimesError(
      aborted ? 'Prayer times service timed out.' : 'Prayer times service is unavailable.',
    )
  } finally {
    clearTimeout(timeout)
  }
}
