'use client'

import { OfflineSettingsSection } from '@/components/me/offline-settings-section'
import { NotificationPreferencesList } from '@/components/notification-preferences-list'
import { SettingsClient } from '@/components/me/settings-screen'

// The downloads tab drives the native Capacitor content store registered by
// registerMobileOfflineStore(); off-device (web preview) no store is registered
// and the section reports downloads as unavailable. The notifications section
// replaces the web-push controls with the native (local + FCM) preferences —
// the same list the Today-screen bell opens.
export default function SettingsPage() {
  return (
    <SettingsClient
      offlineSection={<OfflineSettingsSection />}
      notificationsSection={<NotificationPreferencesList />}
    />
  )
}
