'use client'

import { useEffect, useState } from 'react'
import { Capacitor } from '@capacitor/core'
import { LocalNotifications } from '@capacitor/local-notifications'
import { Switch } from '@/components/ui/switch'
import { PRAYER_EVENT_ORDER, type PrayerEventKey } from '@/lib/prayer-events'
import { useNotificationPrefs } from '@/hooks/use-notification-prefs'
import { cn } from '@/lib/utils'

const EVENT_LABELS: Record<PrayerEventKey, string> = {
  fajr: 'Fajr',
  sunrise: 'Sunrise',
  dhuhr: 'Dhuhr',
  asr: 'Asr',
  maghrib: 'Maghrib',
  isha: 'Isha',
}

const EVENT_HINTS: Partial<Record<PrayerEventKey, string>> = {
  sunrise: 'Marks the end of the Fajr window',
}

/**
 * The notification toggle list shared by the Today-screen sheet and the
 * settings screen. Owns nothing but presentation; state lives in
 * useNotificationPrefs.
 */
export function NotificationPreferencesList() {
  const { prefs, loading, permissionBlocked, setMaster, setEvent, setAnnouncements } =
    useNotificationPrefs()
  const [exactAlarmDenied, setExactAlarmDenied] = useState(false)

  // Android 14+ denies SCHEDULE_EXACT_ALARM by default; without it the OS may
  // deliver reminders minutes late in deep doze. Offer the special-access
  // screen when relevant.
  useEffect(() => {
    if (!prefs.master || Capacitor.getPlatform() !== 'android') {
      setExactAlarmDenied(false)
      return
    }
    LocalNotifications.checkExactNotificationSetting()
      .then(({ exact_alarm }) => setExactAlarmDenied(exact_alarm !== 'granted'))
      .catch(() => setExactAlarmDenied(false))
  }, [prefs.master])

  const openExactAlarmSettings = async () => {
    try {
      const { exact_alarm } = await LocalNotifications.changeExactNotificationSetting()
      setExactAlarmDenied(exact_alarm !== 'granted')
    } catch {
      // Settings screen unavailable — leave the hint visible.
    }
  }

  return (
    <div className={cn('space-y-1', loading && 'pointer-events-none opacity-60')}>
      <div className="flex items-center justify-between py-3">
        <div className="pr-4">
          <p className="text-foreground text-sm font-medium">Prayer notifications</p>
          <p className="text-muted-foreground mt-0.5 text-xs">
            Reminders at each prayer time for your location
          </p>
        </div>
        <Switch
          checked={prefs.master}
          onCheckedChange={(on) => void setMaster(on)}
          aria-label="Prayer notifications"
        />
      </div>

      {permissionBlocked && (
        <p className="text-destructive pb-2 text-xs">
          Notifications are blocked. Enable them for WikiSubmission in system settings, then try
          again.
        </p>
      )}

      <ul className="divide-border/40 border-border/40 divide-y border-y">
        {PRAYER_EVENT_ORDER.map((event) => (
          <li key={event} className="flex items-center justify-between py-2.5">
            <div className="pr-4">
              <p
                className={cn(
                  'text-sm',
                  prefs.master ? 'text-foreground' : 'text-muted-foreground',
                )}
              >
                {EVENT_LABELS[event]}
              </p>
              {EVENT_HINTS[event] && (
                <p className="text-muted-foreground mt-0.5 text-xs">{EVENT_HINTS[event]}</p>
              )}
            </div>
            <Switch
              checked={prefs.events[event]}
              disabled={!prefs.master}
              onCheckedChange={(on) => void setEvent(event, on)}
              aria-label={`${EVENT_LABELS[event]} notification`}
            />
          </li>
        ))}
      </ul>

      {exactAlarmDenied && (
        <div className="flex items-center justify-between py-3">
          <div className="pr-4">
            <p className="text-foreground text-sm font-medium">Exact timing</p>
            <p className="text-muted-foreground mt-0.5 text-xs">
              Without the alarm permission, reminders can arrive a few minutes late
            </p>
          </div>
          <button
            type="button"
            onClick={() => void openExactAlarmSettings()}
            className="text-primary shrink-0 text-sm font-medium"
          >
            Allow
          </button>
        </div>
      )}

      <div className="flex items-center justify-between py-3">
        <div className="pr-4">
          <p
            className={cn(
              'text-sm font-medium',
              prefs.master ? 'text-foreground' : 'text-muted-foreground',
            )}
          >
            Announcements
          </p>
          <p className="text-muted-foreground mt-0.5 text-xs">
            Occasional news and reminders from WikiSubmission
          </p>
        </div>
        <Switch
          checked={prefs.announcements}
          disabled={!prefs.master}
          onCheckedChange={(on) => void setAnnouncements(on)}
          aria-label="Announcement notifications"
        />
      </div>
    </div>
  )
}
