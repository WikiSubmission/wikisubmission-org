'use client'

import { AmbientBackdrop } from '@/components/today/ambient-backdrop'
import { PrayerSchedule } from '@/components/today/prayer-schedule'

/**
 * Today is the mobile home: a themed, time-of-day ambient backdrop behind the
 * day's prayer schedule. The backdrop bleeds full-screen (under the translucent
 * top/tab bars); the content sits above it.
 */
export function TodayScreen() {
  return (
    <div className="relative flex flex-1 flex-col">
      <AmbientBackdrop />
      <div className="relative z-10 flex flex-1 flex-col py-6">
        <PrayerSchedule />
      </div>
    </div>
  )
}
