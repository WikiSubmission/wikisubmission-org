'use client'

import { useCallback, useEffect, useState } from 'react'
import type { PrayerEventKey } from '@/lib/prayer-events'
import { ensureNotificationPermission } from '@/lib/notification-permission'
import { syncFcmRegistration } from '@/lib/notifications/fcm'
import { rescheduleAll } from '@/lib/notifications/local-scheduler'
import {
  DEFAULT_NOTIFICATION_PREFS,
  readNotificationPrefs,
  writeNotificationPrefs,
  type NotificationPrefs,
} from '@/lib/notifications/prefs'

export interface UseNotificationPrefsResult {
  prefs: NotificationPrefs
  loading: boolean
  /** True after the OS refused the permission prompt — the user must enable
   * notifications for the app in system settings. */
  permissionBlocked: boolean
  setMaster: (on: boolean) => Promise<void>
  setEvent: (event: PrayerEventKey, on: boolean) => Promise<void>
  setAnnouncements: (on: boolean) => Promise<void>
}

/**
 * Notification preference state shared by the Today-screen sheet and the
 * settings screen. Every write persists, then re-syncs the local prayer
 * schedule and the FCM registration (fire-and-forget).
 */
export function useNotificationPrefs(): UseNotificationPrefsResult {
  const [prefs, setPrefs] = useState<NotificationPrefs>(DEFAULT_NOTIFICATION_PREFS)
  const [loading, setLoading] = useState(true)
  const [permissionBlocked, setPermissionBlocked] = useState(false)

  useEffect(() => {
    let alive = true
    readNotificationPrefs().then((stored) => {
      if (!alive) return
      setPrefs(stored)
      setLoading(false)
    })
    return () => {
      alive = false
    }
  }, [])

  const apply = useCallback(async (next: NotificationPrefs) => {
    setPrefs(next)
    await writeNotificationPrefs(next)
    void rescheduleAll('prefs-change')
    void syncFcmRegistration()
  }, [])

  const setMaster = useCallback(
    async (on: boolean) => {
      if (on) {
        const granted = await ensureNotificationPermission({ force: true })
        setPermissionBlocked(!granted)
        if (!granted) return
      }
      await apply({ ...prefs, master: on })
    },
    [apply, prefs],
  )

  const setEvent = useCallback(
    async (event: PrayerEventKey, on: boolean) => {
      await apply({ ...prefs, events: { ...prefs.events, [event]: on } })
    },
    [apply, prefs],
  )

  const setAnnouncements = useCallback(
    async (on: boolean) => {
      await apply({ ...prefs, announcements: on })
    },
    [apply, prefs],
  )

  return { prefs, loading, permissionBlocked, setMaster, setEvent, setAnnouncements }
}
