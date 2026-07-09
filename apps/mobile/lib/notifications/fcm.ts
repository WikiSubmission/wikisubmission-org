import { Capacitor } from '@capacitor/core'
import { Preferences } from '@capacitor/preferences'
import { resolveBrowserApiBaseUrl } from '@/src/api/base-url'
import { readNotificationPrefs } from './prefs'

/**
 * FCM device registration for admin-scheduled (broadcast) notifications.
 * Anonymous-friendly: the backend endpoint accepts unauthenticated devices.
 * Delivery itself is handled natively by FCM; this module only keeps the
 * backend's token registry in sync with the user's preference.
 */

const REGISTRATION_KEY = 'fcm-registration'

/** Re-POST an unchanged token after this long so updated_at works as last-seen. */
const REFRESH_INTERVAL_MS = 7 * 24 * 60 * 60 * 1000

const DEVICES_ENDPOINT = `${resolveBrowserApiBaseUrl()}/devices/fcm`

interface FcmRegistrationState {
  token: string
  sentAt: number
}

let latestToken: string | null = null

async function readRegistration(): Promise<FcmRegistrationState | null> {
  try {
    const { value } = await Preferences.get({ key: REGISTRATION_KEY })
    if (!value) return null
    const parsed = JSON.parse(value) as FcmRegistrationState
    return typeof parsed?.token === 'string' ? parsed : null
  } catch {
    return null
  }
}

async function writeRegistration(state: FcmRegistrationState | null): Promise<void> {
  try {
    if (state) await Preferences.set({ key: REGISTRATION_KEY, value: JSON.stringify(state) })
    else await Preferences.remove({ key: REGISTRATION_KEY })
  } catch {
    // Worst case: an extra registration POST next launch.
  }
}

/** Called by the bridge's `registration` listener (initial + token refresh). */
export async function handleFcmToken(token: string): Promise<void> {
  latestToken = token
  await syncFcmRegistration()
}

async function postDeviceRegistration(token: string): Promise<void> {
  const existing = await readRegistration()
  if (existing?.token === token && Date.now() - existing.sentAt < REFRESH_INTERVAL_MS) return

  const response = await fetch(DEVICES_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      token,
      platform: Capacitor.getPlatform(),
      locale: navigator.language || undefined,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || undefined,
      categories: ['announcements'],
    }),
  })
  if (!response.ok) throw new Error(`FCM registration failed with ${response.status}`)
  await writeRegistration({ token, sentAt: Date.now() })
}

async function deleteDeviceRegistration(): Promise<void> {
  const existing = await readRegistration()
  if (!existing) return
  try {
    await fetch(DEVICES_ENDPOINT, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: existing.token }),
    })
  } finally {
    // Clear local state regardless; the backend prunes dead tokens on send.
    await writeRegistration(null)
  }
}

/**
 * Aligns FCM state with preferences: registers (asking FCM for a token if
 * needed) when broadcasts are enabled, unregisters when disabled. Safe to call
 * often; every path is idempotent.
 */
export async function syncFcmRegistration(): Promise<void> {
  if (!Capacitor.isNativePlatform()) return
  try {
    const prefs = await readNotificationPrefs()
    const wantsPush = prefs.master && prefs.announcements

    if (!wantsPush) {
      await deleteDeviceRegistration()
      return
    }

    const { PushNotifications } = await import('@capacitor/push-notifications')
    const { receive } = await PushNotifications.checkPermissions()
    if (receive !== 'granted') return // POST_NOTIFICATIONS drives this; UI asks

    if (latestToken) {
      await postDeviceRegistration(latestToken)
    } else {
      // Triggers the `registration` listener, which calls handleFcmToken.
      await PushNotifications.register()
    }
  } catch {
    // Missing google-services.json (dev builds) or offline — retry next launch.
  }
}
