import { Capacitor } from '@capacitor/core'
import { LocalNotifications } from '@capacitor/local-notifications'
import {
  readZakatReminderPrefs,
  upcomingDueDates,
  type ZakatReminderPrefs,
} from '@/lib/zakat-reminder'
import { ANNOUNCEMENTS_CHANNEL_ID } from './channels'

/**
 * Zakat reminder notifications. Capacitor has no native biweekly/monthly
 * repeat, so the next few concrete occurrences are scheduled under a reserved
 * id range and topped up on every app launch (the bridge calls
 * refreshZakatReminder).
 */

const ID_BASE = 4100
const OCCURRENCES = 6

function zakatIds(): { id: number }[] {
  return Array.from({ length: OCCURRENCES }, (_, i) => ({ id: ID_BASE + i }))
}

export async function cancelZakatReminder(): Promise<void> {
  if (!Capacitor.isNativePlatform()) return
  try {
    await LocalNotifications.cancel({ notifications: zakatIds() })
  } catch {
    // Nothing pending is fine.
  }
}

/** Idempotent cancel-then-schedule of the next occurrences. */
export async function scheduleZakatReminder(prefs: ZakatReminderPrefs): Promise<void> {
  if (!Capacitor.isNativePlatform()) return
  await cancelZakatReminder()
  if (!prefs.enabled) return

  const dues = upcomingDueDates(prefs, OCCURRENCES)
  await LocalNotifications.schedule({
    notifications: dues.map((at, index) => ({
      id: ID_BASE + index,
      title: 'Zakat reminder',
      body: 'Your zakat is due today. God loves the charitable. (2:276)',
      channelId: ANNOUNCEMENTS_CHANNEL_ID,
      schedule: { at, allowWhileIdle: true },
      extra: { type: 'zakat', route: '/zakat' },
    })),
  })
}

/** Re-syncs scheduled occurrences with stored prefs (called on app launch). */
export async function refreshZakatReminder(): Promise<void> {
  if (!Capacitor.isNativePlatform()) return
  try {
    const prefs = await readZakatReminderPrefs()
    if (!prefs?.enabled) return
    const { display } = await LocalNotifications.checkPermissions()
    if (display !== 'granted') return
    await scheduleZakatReminder(prefs)
  } catch {
    // Next launch retries.
  }
}
