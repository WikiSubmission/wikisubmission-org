import { LocalNotifications } from '@capacitor/local-notifications'
import { Preferences } from '@capacitor/preferences'

// Android 13+ gates all notifications (media playback controls, prayer
// reminders, FCM) behind the single POST_NOTIFICATIONS permission.
// @capacitor/local-notifications is used for its permission API; whichever
// feature asks first unblocks the others.

const ASKED_KEY = 'notification-permission-asked'

/**
 * Ask for notification permission, lazily. The media path calls this with no
 * arguments on first playback and only ever asks once (the one-shot guard
 * keeps the prompt in a context the user understands). The notification
 * settings UI passes `force: true` — an explicit toggle is always a valid
 * moment to re-prompt, until the OS itself reports a permanent denial.
 *
 * Returns whether notification permission is granted.
 */
export async function ensureNotificationPermission(
  options: { force?: boolean } = {},
): Promise<boolean> {
  try {
    const { display } = await LocalNotifications.checkPermissions()
    if (display === 'granted') return true

    if (!options.force) {
      const { value: asked } = await Preferences.get({ key: ASKED_KEY })
      if (asked) return false
      await Preferences.set({ key: ASKED_KEY, value: '1' })
    }

    const result = await LocalNotifications.requestPermissions()
    return result.display === 'granted'
  } catch {
    // Permission plumbing must never break the caller (e.g. playback).
    return false
  }
}
