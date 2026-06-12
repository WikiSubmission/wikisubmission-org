/**
 * Web Push client helpers shared by the subscription hook and settings UI.
 */

export const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? ''

/** True when this browser can register push subscriptions. */
export function isPushSupported(): boolean {
  return (
    typeof window !== 'undefined' &&
    'serviceWorker' in navigator &&
    'PushManager' in window &&
    'Notification' in window
  )
}

/**
 * Convert a base64url VAPID public key into the Uint8Array that
 * PushManager.subscribe expects as applicationServerKey.
 */
export function urlBase64ToUint8Array(base64String: string): Uint8Array<ArrayBuffer> {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const raw = atob(base64)
  // Back the view with a concrete ArrayBuffer so it satisfies BufferSource
  // (PushManager.subscribe's applicationServerKey) under TS 5.7+ typed arrays.
  const buffer = new ArrayBuffer(raw.length)
  const output = new Uint8Array(buffer)
  for (let i = 0; i < raw.length; i++) {
    output[i] = raw.charCodeAt(i)
  }
  return output
}

/** Extract the p256dh/auth keys from a PushSubscription as base64url strings. */
export function extractKeys(sub: PushSubscription): { p256dh: string; auth: string } {
  const json = sub.toJSON()
  return {
    p256dh: json.keys?.p256dh ?? '',
    auth: json.keys?.auth ?? '',
  }
}
