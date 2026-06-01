'use client'

import { useCallback, useEffect, useState } from 'react'
import { meApi } from '@/src/api/me-client'
import {
  VAPID_PUBLIC_KEY,
  extractKeys,
  isPushSupported,
  urlBase64ToUint8Array,
} from '@/lib/push'

type PushPermission = 'default' | 'granted' | 'denied' | 'unsupported'

interface UsePushNotifications {
  supported: boolean
  permission: PushPermission
  subscribed: boolean
  busy: boolean
  subscribe: () => Promise<boolean>
  unsubscribe: () => Promise<void>
  sendTest: () => Promise<void>
}

/**
 * Manages the browser push subscription lifecycle and syncs it with the
 * backend. Works in Android Chrome and inside the Trusted Web Activity (the
 * Play Store target). No-ops gracefully where push is unsupported.
 *
 * Permission is only requested when the user explicitly calls subscribe(),
 * never on mount — auto-prompting is poor UX and hurts opt-in rates.
 */
export function usePushNotifications(): UsePushNotifications {
  const [supported, setSupported] = useState(false)
  const [permission, setPermission] = useState<PushPermission>('default')
  const [subscribed, setSubscribed] = useState(false)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (!isPushSupported()) {
      setSupported(false)
      setPermission('unsupported')
      return
    }
    setSupported(true)
    setPermission(Notification.permission as PushPermission)

    // Reflect any existing subscription so the UI starts in the right state.
    navigator.serviceWorker.ready
      .then((reg) => reg.pushManager.getSubscription())
      .then((sub) => setSubscribed(sub !== null))
      .catch(() => setSubscribed(false))
  }, [])

  const subscribe = useCallback(async (): Promise<boolean> => {
    if (!isPushSupported() || !VAPID_PUBLIC_KEY) return false
    setBusy(true)
    try {
      const result = await Notification.requestPermission()
      setPermission(result as PushPermission)
      if (result !== 'granted') return false

      const reg = await navigator.serviceWorker.ready
      const existing = await reg.pushManager.getSubscription()
      const sub =
        existing ??
        (await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
        }))

      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone

      await meApi.push.subscribe({
        endpoint: sub.endpoint,
        keys: extractKeys(sub),
        categories: ['general'],
        locale: navigator.language,
        timezone,
      })
      setSubscribed(true)
      return true
    } catch (error) {
      console.error('push subscribe failed', error)
      return false
    } finally {
      setBusy(false)
    }
  }, [])

  const unsubscribe = useCallback(async (): Promise<void> => {
    if (!isPushSupported()) return
    setBusy(true)
    try {
      const reg = await navigator.serviceWorker.ready
      const sub = await reg.pushManager.getSubscription()
      if (sub) {
        await meApi.push.unsubscribe(sub.endpoint).catch(() => undefined)
        await sub.unsubscribe()
      }
      setSubscribed(false)
    } catch (error) {
      console.error('push unsubscribe failed', error)
    } finally {
      setBusy(false)
    }
  }, [])

  const sendTest = useCallback(async (): Promise<void> => {
    try {
      await meApi.push.sendTest()
    } catch (error) {
      console.error('push test failed', error)
    }
  }, [])

  return { supported, permission, subscribed, busy, subscribe, unsubscribe, sendTest }
}
