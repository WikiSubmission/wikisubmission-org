import { Preferences } from '@capacitor/preferences'
import type { PrayerEventKey } from '@/lib/prayer-events'
import { isPrayerSoundId, type PrayerSoundId } from './sounds'

/**
 * Notification preferences (device-local, anonymous-friendly). `master` is the
 * single opt-in gate; the per-event flags refine which prayer events schedule
 * local notifications, `sound` picks the prayer notification sound (channel),
 * and `announcements` controls FCM registration for admin-scheduled messages.
 */
export interface NotificationPrefs {
  version: 1
  master: boolean
  events: Record<PrayerEventKey, boolean>
  sound: PrayerSoundId
  announcements: boolean
}

const PREFS_KEY = 'notification-prefs'

/** Master on by default — the startup prompt asks for OS permission, and
 * nothing fires without it, so this is still consent-gated. Users who
 * explicitly toggled master off have a persisted blob that wins over this
 * default. The 5 prayers on so one toggle is enough; sunrise off by default —
 * it marks the end of the Fajr window, not a prayer. */
export const DEFAULT_NOTIFICATION_PREFS: NotificationPrefs = {
  version: 1,
  master: true,
  events: {
    fajr: true,
    sunrise: false,
    dhuhr: true,
    asr: true,
    maghrib: true,
    isha: true,
  },
  sound: 'default',
  announcements: true,
}

export async function readNotificationPrefs(): Promise<NotificationPrefs> {
  try {
    const { value } = await Preferences.get({ key: PREFS_KEY })
    if (!value) return DEFAULT_NOTIFICATION_PREFS
    const parsed = JSON.parse(value) as Partial<NotificationPrefs>
    if (parsed?.version !== 1 || typeof parsed.master !== 'boolean') {
      return DEFAULT_NOTIFICATION_PREFS
    }
    return {
      ...DEFAULT_NOTIFICATION_PREFS,
      ...parsed,
      events: { ...DEFAULT_NOTIFICATION_PREFS.events, ...(parsed.events ?? {}) },
      sound: isPrayerSoundId(parsed.sound) ? parsed.sound : DEFAULT_NOTIFICATION_PREFS.sound,
    }
  } catch {
    return DEFAULT_NOTIFICATION_PREFS
  }
}

export async function writeNotificationPrefs(prefs: NotificationPrefs): Promise<void> {
  try {
    await Preferences.set({ key: PREFS_KEY, value: JSON.stringify(prefs) })
  } catch {
    // Storage failure only loses persistence, not this session's behavior.
  }
}

/** Stable fingerprint of the scheduling-relevant prefs, for the reschedule
 * dedupe guard. */
export function prefsHash(prefs: NotificationPrefs): string {
  const events = Object.entries(prefs.events)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, on]) => `${key}:${on ? 1 : 0}`)
    .join(',')
  return `${prefs.master ? 1 : 0}|${events}|${prefs.sound}`
}

export function anyEventEnabled(prefs: NotificationPrefs): boolean {
  return Object.values(prefs.events).some(Boolean)
}
