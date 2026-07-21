import { Capacitor } from '@capacitor/core'
import {
  LocalNotifications,
  type LocalNotificationSchema,
} from '@capacitor/local-notifications'
import { Preferences } from '@capacitor/preferences'
import { fetchPrayerTimes, type PrayerTimesResponse } from '@/lib/prayer-times'
import {
  readCachedPrayerResponse,
  writeCachedPrayerResponse,
} from '@/lib/prayer-times-cache'
import { PRAYER_EVENT_ORDER, type PrayerEventKey } from '@/lib/prayer-events'
import { anyEventEnabled, prefsHash, readNotificationPrefs } from './prefs'
import { PRAYER_SOUNDS } from './sounds'
import { computeCurrentEventInstant, computeUpcomingEventInstants } from './schedule-times'

/**
 * On-device prayer notification scheduler. Schedules the next few days of
 * enabled prayer events as local notifications (exact where the OS allows,
 * inexact fallback otherwise) and reschedules on launch, resume, preference
 * changes, and location changes. Scheduled notifications survive app kill and
 * reboot (the plugin restores them via BOOT_COMPLETED); the only gap is a user
 * who does not open the app past the scheduled window.
 */

export type RescheduleReason = 'launch' | 'resume' | 'prefs-change' | 'location-change'

/** Days of events scheduled ahead (≤ 42 alarms — well under Android's cap). */
const WINDOW_DAYS = 7

/** Reserved id range for prayer notifications; ids elsewhere in the app must
 * stay outside it. id = BASE + (epochDay % 1000) * 10 + eventIndex. */
const ID_BASE = 100_000
const ID_RANGE_END = 199_999

/** Skip events closer than this — the OS may drop near-past alarms. */
const MIN_LEAD_MS = 90 * 1000

const STATE_KEY = 'notification-schedule-state'

/** Reuse the persisted response while it is fresher than this. */
const RESPONSE_MAX_AGE_MS = 12 * 60 * 60 * 1000

interface ScheduleState {
  location: string
  prefsHash: string
  scheduledUntil: number
  scheduledAt: number
}

const EVENT_LABELS: Record<PrayerEventKey, string> = {
  fajr: 'Fajr',
  sunrise: 'Sunrise',
  dhuhr: 'Dhuhr',
  asr: 'Asr',
  maghrib: 'Maghrib',
  isha: 'Isha',
}

function notificationId(at: Date, event: PrayerEventKey): number {
  const epochDay = Math.floor(at.getTime() / (24 * 60 * 60 * 1000))
  return ID_BASE + (epochDay % 1000) * 10 + PRAYER_EVENT_ORDER.indexOf(event)
}

function notificationBody(event: PrayerEventKey, city: string | undefined): string {
  const where = city ? ` in ${city}` : ''
  if (event === 'sunrise') return `The sun has risen${where}. The Fajr window has ended.`
  return `It is time for the ${EVENT_LABELS[event]} prayer${where}.`
}

async function readState(): Promise<ScheduleState | null> {
  try {
    const { value } = await Preferences.get({ key: STATE_KEY })
    if (!value) return null
    const parsed = JSON.parse(value) as ScheduleState
    return typeof parsed?.location === 'string' ? parsed : null
  } catch {
    return null
  }
}

async function writeState(state: ScheduleState | null): Promise<void> {
  try {
    if (state) await Preferences.set({ key: STATE_KEY, value: JSON.stringify(state) })
    else await Preferences.remove({ key: STATE_KEY })
  } catch {
    // Losing the dedupe state only costs an extra reschedule.
  }
}

/** Grace period around "now" when deciding the current prayer window, so a
 * notification delivered a few seconds before its nominal instant (inexact
 * alarms, clock skew) is not treated as belonging to the previous window. */
const CURRENT_EVENT_SLACK_MS = 60 * 1000

/**
 * Removes delivered prayer notifications whose window has passed — every
 * *prayer* notification in the tray except the one for the prayer event we
 * are currently inside. Scoped strictly to the prayer id range: other
 * notification types (zakat, future zikr, …) allocate ids outside it and are
 * never touched. Best-effort tray hygiene: runs on launch/resume/reschedule
 * and on foreground delivery; while the app is killed, Android gives us no JS
 * at delivery time, so stale entries linger until the next app open.
 */
export async function removeStaleDeliveredPrayerNotifications(): Promise<void> {
  if (!Capacitor.isNativePlatform()) return
  try {
    const delivered = await LocalNotifications.getDeliveredNotifications()
    const prayer = delivered.notifications.filter(
      (n) => n.id >= ID_BASE && n.id <= ID_RANGE_END,
    )
    if (prayer.length === 0) return

    // Without a schedule we cannot tell which window is current — keep the
    // tray untouched rather than dismiss a possibly-live notification.
    const cached = readCachedPrayerResponse()
    if (!cached) return
    const current = computeCurrentEventInstant(
      cached.response,
      new Date(Date.now() + CURRENT_EVENT_SLACK_MS),
    )
    if (!current) return

    const keepId = notificationId(current.at, current.event)
    const stale = prayer.filter((n) => n.id !== keepId)
    if (stale.length > 0) {
      await LocalNotifications.removeDeliveredNotifications({ notifications: stale })
    }
  } catch {
    // Tray cleanup is cosmetic; it must never break scheduling.
  }
}

/** Cancels every pending notification in the prayer id range. */
export async function cancelAllPrayerNotifications(): Promise<void> {
  const pending = await LocalNotifications.getPending()
  const prayerIds = pending.notifications.filter((n) => n.id >= ID_BASE && n.id <= ID_RANGE_END)
  if (prayerIds.length > 0) {
    await LocalNotifications.cancel({ notifications: prayerIds.map((n) => ({ id: n.id })) })
  }
}

async function resolveResponse(): Promise<{
  location: string
  response: PrayerTimesResponse
} | null> {
  const cached = readCachedPrayerResponse()
  if (!cached) return null
  const fresh = Date.now() - cached.savedAt < RESPONSE_MAX_AGE_MS
  if (fresh && cached.response.schedule?.length) {
    return { location: cached.location, response: cached.response }
  }
  try {
    const response = await fetchPrayerTimes(cached.location, { includeSchedule: true })
    writeCachedPrayerResponse(cached.location, response)
    return { location: cached.location, response }
  } catch {
    // Offline: stale schedule data beats none at all.
    return cached.response.schedule?.length
      ? { location: cached.location, response: cached.response }
      : null
  }
}

let rescheduleInFlight: Promise<void> | null = null

/**
 * Cancel-and-reschedule the prayer notification window. Serialized: concurrent
 * triggers (launch + resume + prefs) collapse into one pass.
 */
export function rescheduleAll(reason: RescheduleReason): Promise<void> {
  if (!Capacitor.isNativePlatform()) return Promise.resolve()
  if (rescheduleInFlight) return rescheduleInFlight
  rescheduleInFlight = doReschedule(reason).finally(() => {
    rescheduleInFlight = null
  })
  return rescheduleInFlight
}

async function doReschedule(reason: RescheduleReason): Promise<void> {
  try {
    // Tray hygiene first: every trigger (launch, resume, prefs, location) is a
    // moment the user may be looking at a stale delivered notification, and the
    // dedupe below can return before the scheduling work runs.
    await removeStaleDeliveredPrayerNotifications()

    const prefs = await readNotificationPrefs()
    if (!prefs.master || !anyEventEnabled(prefs)) {
      await cancelAllPrayerNotifications()
      await writeState(null)
      return
    }

    const { display } = await LocalNotifications.checkPermissions()
    if (display !== 'granted') return // the UI drives permission requests

    const resolved = await resolveResponse()
    if (!resolved) return
    const { location, response } = resolved

    // Resume dedupe: skip the cancel/reschedule churn when nothing changed and
    // the window still reaches comfortably ahead.
    const now = Date.now()
    const hash = prefsHash(prefs)
    if (reason === 'resume') {
      const state = await readState()
      if (
        state &&
        state.location === location &&
        state.prefsHash === hash &&
        state.scheduledUntil > now + 48 * 60 * 60 * 1000 &&
        state.scheduledAt > now - 6 * 60 * 60 * 1000
      ) {
        return
      }
    }

    const instants = computeUpcomingEventInstants(response, { days: WINDOW_DAYS })
    const toSchedule = instants.filter(
      ({ event, at }) => prefs.events[event] && at.getTime() > now + MIN_LEAD_MS,
    )

    await cancelAllPrayerNotifications()
    if (toSchedule.length === 0) {
      await writeState(null)
      return
    }

    const notifications: LocalNotificationSchema[] = toSchedule.map(({ event, at }) => ({
      id: notificationId(at, event),
      title: EVENT_LABELS[event],
      body: notificationBody(event, response.city),
      channelId: PRAYER_SOUNDS[prefs.sound].channelId,
      schedule: { at, allowWhileIdle: true },
      extra: { type: 'prayer', event, route: '/' },
    }))
    await LocalNotifications.schedule({ notifications })

    await writeState({
      location,
      prefsHash: hash,
      scheduledUntil: toSchedule[toSchedule.length - 1].at.getTime(),
      scheduledAt: now,
    })
  } catch {
    // Scheduling must never take the app down; the next trigger retries.
  }
}
