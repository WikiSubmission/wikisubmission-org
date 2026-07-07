import { Capacitor } from '@capacitor/core'
import { LocalNotifications } from '@capacitor/local-notifications'

/**
 * Android notification channels. Created client-side and idempotently: the
 * backend's FCM payloads address the `announcements` channel by id, and
 * Android 8+ silently drops notifications sent to a channel that does not
 * exist on the device.
 *
 * Channel settings (importance, sound) are immutable after creation — pick
 * before shipping; changing later requires a new channel id.
 */
export const PRAYER_CHANNEL_ID = 'prayer-times'
export const ANNOUNCEMENTS_CHANNEL_ID = 'announcements'

export async function ensureNotificationChannels(): Promise<void> {
  if (Capacitor.getPlatform() !== 'android') return
  try {
    await LocalNotifications.createChannel({
      id: PRAYER_CHANNEL_ID,
      name: 'Prayer times',
      description: 'Reminders at each prayer time',
      importance: 4, // HIGH: heads-up with sound
      visibility: 1, // public on the lock screen
    })
    await LocalNotifications.createChannel({
      id: ANNOUNCEMENTS_CHANNEL_ID,
      name: 'Announcements',
      description: 'News and reminders from WikiSubmission',
      importance: 3, // DEFAULT
      visibility: 1,
    })
  } catch {
    // Channel creation must never break app start; notifications degrade to
    // the plugin's default channel.
  }
}
