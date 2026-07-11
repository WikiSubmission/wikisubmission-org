'use client'

import { useEffect, useRef } from 'react'
import { Capacitor } from '@capacitor/core'
import { LocalNotifications } from '@capacitor/local-notifications'
import { Preferences } from '@capacitor/preferences'
import { useStartupZikr } from '@/lib/startup-zikr-context'
import { ensureNotificationPermission } from '@/lib/notification-permission'
import { rescheduleAll } from '@/lib/notifications/local-scheduler'

/**
 * First-launch notification onboarding: prayer notifications default on, so
 * ask for the OS permission once, right after the startup zikr animation
 * settles (never over the splash flight). If granted, follow up once with the
 * Android exact-alarm special access so reminders are not deferred by doze.
 *
 * Renders nothing. Denial is handled passively — the notification preference
 * UIs surface the blocked state.
 */

const PROMPT_ASKED_KEY = 'startup-notification-prompt-v1'
const EXACT_ALARM_ASKED_KEY = 'exact-alarm-prompt-v1'

/** Let the Today screen settle before stacking a system dialog on it. */
const PROMPT_DELAY_MS = 1200

async function oneShot(key: string): Promise<boolean> {
  const { value } = await Preferences.get({ key })
  if (value) return false
  await Preferences.set({ key, value: '1' })
  return true
}

export function NotificationPermissionPrompt() {
  const { phase } = useStartupZikr()
  const ranRef = useRef(false)

  useEffect(() => {
    if (phase !== 'done' && phase !== 'skipped') return
    if (ranRef.current) return
    ranRef.current = true
    if (!Capacitor.isNativePlatform()) return

    const timer = setTimeout(async () => {
      try {
        if (!(await oneShot(PROMPT_ASKED_KEY))) return
        const granted = await ensureNotificationPermission({ force: true })
        if (!granted) return
        void rescheduleAll('prefs-change')

        if (Capacitor.getPlatform() !== 'android') return
        const { exact_alarm } = await LocalNotifications.checkExactNotificationSetting()
        if (exact_alarm === 'granted') return
        if (!(await oneShot(EXACT_ALARM_ASKED_KEY))) return
        await LocalNotifications.changeExactNotificationSetting()
      } catch {
        // Onboarding must never break startup; the settings UI remains the
        // fallback path for permissions.
      }
    }, PROMPT_DELAY_MS)
    return () => clearTimeout(timer)
  }, [phase])

  return null
}
