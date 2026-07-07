'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Capacitor, type PluginListenerHandle } from '@capacitor/core'
import { toast } from 'sonner'
import { ensureNotificationChannels } from '@/lib/notifications/channels'
import { handleFcmToken, syncFcmRegistration } from '@/lib/notifications/fcm'
import { rescheduleAll } from '@/lib/notifications/local-scheduler'
import { refreshZakatReminder } from '@/lib/notifications/zakat'

/**
 * Lifecycle wiring for notifications, mounted once in MobileProviders (native
 * only, renders nothing): creates Android channels, keeps the local prayer
 * schedule and FCM registration fresh, and routes notification taps.
 */

/** Static-export route prefixes a notification is allowed to open. */
const ROUTE_WHITELIST = [
  '/',
  '/quran',
  '/appendices',
  '/more',
  '/me',
  '/proclamation',
  '/introduction',
  '/zakat',
]

function safeRoute(candidate: unknown): string | null {
  if (typeof candidate !== 'string' || !candidate.startsWith('/')) return null
  const normalized = candidate.replace(/\/+$/, '') || '/'
  return ROUTE_WHITELIST.some((prefix) =>
    prefix === '/' ? normalized === '/' : normalized === prefix || normalized.startsWith(`${prefix}/`),
  )
    ? normalized
    : null
}

export function MobileNotificationsBridge() {
  const router = useRouter()

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return

    let cancelled = false
    const handles: PluginListenerHandle[] = []

    const track = (promise: Promise<PluginListenerHandle>) => {
      promise.then((handle) => {
        if (cancelled) handle.remove()
        else handles.push(handle)
      })
    }

    const setup = async () => {
      await ensureNotificationChannels()

      const { LocalNotifications } = await import('@capacitor/local-notifications')
      track(
        LocalNotifications.addListener('localNotificationActionPerformed', ({ notification }) => {
          const route = safeRoute(notification.extra?.route)
          if (route) router.push(route)
        }),
      )

      try {
        const { PushNotifications } = await import('@capacitor/push-notifications')
        track(
          PushNotifications.addListener('registration', ({ value }) => {
            void handleFcmToken(value)
          }),
        )
        track(
          PushNotifications.addListener('pushNotificationActionPerformed', ({ notification }) => {
            const route = safeRoute(notification.data?.route)
            if (route) router.push(route)
          }),
        )
        track(
          // Android does not display remote notification-messages while the
          // app is foregrounded; a toast keeps parity.
          PushNotifications.addListener('pushNotificationReceived', (notification) => {
            if (notification.title || notification.body) {
              toast(notification.title ?? 'WikiSubmission', {
                description: notification.body,
              })
            }
          }),
        )
      } catch {
        // Push plugin unavailable (e.g. no google-services.json in dev builds).
      }

      void rescheduleAll('launch')
      void refreshZakatReminder()
      void syncFcmRegistration()

      const { App } = await import('@capacitor/app')
      track(
        App.addListener('appStateChange', ({ isActive }) => {
          if (isActive) void rescheduleAll('resume')
        }),
      )
    }

    void setup()

    const onLocationChanged = () => void rescheduleAll('location-change')
    window.addEventListener('prayer-location-changed', onLocationChanged)

    return () => {
      cancelled = true
      handles.forEach((handle) => void handle.remove())
      window.removeEventListener('prayer-location-changed', onLocationChanged)
    }
  }, [router])

  return null
}
