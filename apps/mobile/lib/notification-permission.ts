import { LocalNotifications } from '@capacitor/local-notifications'
import { Preferences } from '@capacitor/preferences'

// Android 13+ gates the media playback notification (lock screen controls)
// behind POST_NOTIFICATIONS. @capacitor/local-notifications is used purely for
// its permission API — the media notification itself comes from the
// media-session plugin's foreground service.

const ASKED_KEY = 'notification-permission-asked'

/**
 * Ask for notification permission once, lazily. Called on the first playback
 * (not app start) so the prompt appears in a context the user understands.
 * Denial degrades gracefully: playback and Quick-Settings media controls keep
 * working, only the lock-screen notification is withheld by the OS.
 */
export async function ensureNotificationPermission(): Promise<void> {
  try {
    const { display } = await LocalNotifications.checkPermissions()
    if (display === 'granted') return

    const { value: asked } = await Preferences.get({ key: ASKED_KEY })
    if (asked) return

    await Preferences.set({ key: ASKED_KEY, value: '1' })
    await LocalNotifications.requestPermissions()
  } catch {
    // Permission plumbing must never break playback.
  }
}
