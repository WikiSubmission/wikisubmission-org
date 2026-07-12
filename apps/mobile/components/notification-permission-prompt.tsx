'use client'

import { useEffect, useRef, useState } from 'react'
import { Capacitor } from '@capacitor/core'
import { LocalNotifications } from '@capacitor/local-notifications'
import { Preferences } from '@capacitor/preferences'
import { BellRing } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { GsapPresence } from '@/components/gsap-presence'
import { useStartupZikr } from '@/lib/startup-zikr-context'
import { ensureNotificationPermission } from '@/lib/notification-permission'
import { rescheduleAll } from '@/lib/notifications/local-scheduler'

/**
 * First-launch notification onboarding, in two stages: a soft in-app card
 * explains what notifications are for BEFORE the one-shot OS dialog is spent.
 * The OS prompt only fires if the user taps "Enable" — declining the card
 * costs nothing (the settings screen can still trigger the real prompt later),
 * whereas an OS-level "Don't allow" is near-permanent on both platforms.
 *
 * Shown once, right after the startup zikr animation settles (never over the
 * splash flight). If the OS permission is already granted — reinstall with a
 * persisted grant — the card is skipped entirely.
 */

const PROMPT_ASKED_KEY = 'startup-notification-prompt-v1'
const EXACT_ALARM_ASKED_KEY = 'exact-alarm-prompt-v1'

/** Let the Today screen settle before sliding the card over it. */
const PROMPT_DELAY_MS = 1200

async function oneShot(key: string): Promise<boolean> {
  const { value } = await Preferences.get({ key })
  if (value) return false
  await Preferences.set({ key, value: '1' })
  return true
}

/** Android 12+ exact-alarm special access, asked once after a grant. */
async function maybeAskExactAlarm(): Promise<void> {
  if (Capacitor.getPlatform() !== 'android') return
  const { exact_alarm } = await LocalNotifications.checkExactNotificationSetting()
  if (exact_alarm === 'granted') return
  if (!(await oneShot(EXACT_ALARM_ASKED_KEY))) return
  await LocalNotifications.changeExactNotificationSetting()
}

export function NotificationPermissionPrompt() {
  const { phase } = useStartupZikr()
  const ranRef = useRef(false)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (phase !== 'done' && phase !== 'skipped') return
    if (ranRef.current) return
    ranRef.current = true
    if (!Capacitor.isNativePlatform()) return

    const timer = setTimeout(async () => {
      try {
        if (!(await oneShot(PROMPT_ASKED_KEY))) return
        const { display } = await LocalNotifications.checkPermissions()
        if (display === 'granted') {
          // Nothing to ask — make sure the schedule exists and follow up on
          // the Android exact-alarm access if needed.
          void rescheduleAll('prefs-change')
          await maybeAskExactAlarm()
          return
        }
        setVisible(true)
      } catch {
        // Onboarding must never break startup; the settings UI remains the
        // fallback path for permissions.
      }
    }, PROMPT_DELAY_MS)
    return () => clearTimeout(timer)
  }, [phase])

  const decline = () => setVisible(false)

  const enable = async () => {
    setVisible(false)
    try {
      const granted = await ensureNotificationPermission({ force: true })
      if (!granted) return
      void rescheduleAll('prefs-change')
      await maybeAskExactAlarm()
    } catch {
      // Same contract as above: never let permission plumbing throw.
    }
  }

  return (
    <GsapPresence
      show={visible}
      as="div"
      className="fixed inset-x-3 bottom-[calc(env(safe-area-inset-bottom)+4.75rem)] z-50"
      enterFrom={{ y: 24, scale: 0.98 }}
      enterTo={{ y: 0, scale: 1, duration: 0.45, ease: 'power3.out' }}
      exitTo={{ y: 16, duration: 0.25, ease: 'power2.in' }}
    >
      <div
        role="dialog"
        aria-label="Enable prayer notifications"
        className="bg-background/95 glass-nav rounded-2xl border p-4 shadow-lg"
      >
        <div className="flex items-start gap-3">
          <div className="bg-primary/10 text-primary mt-0.5 rounded-full p-2">
            <BellRing className="size-5" aria-hidden="true" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-display text-base leading-snug">Prayer reminders</p>
            <p className="text-muted-foreground mt-1 text-sm leading-snug">
              Get a gentle notification at each prayer time. You can fine-tune
              or turn these off anytime in Settings.
            </p>
          </div>
        </div>
        <div className="mt-3 flex justify-end gap-2">
          <Button variant="ghost" size="sm" onClick={decline}>
            Not now
          </Button>
          <Button size="sm" onClick={enable}>
            Enable
          </Button>
        </div>
      </div>
    </GsapPresence>
  )
}
