'use client'

import { OfflineSettingsSection } from '@/components/me/offline-settings-section'
import { SettingsClient } from '@/components/me/settings-screen'

// The downloads tab drives the native Capacitor content store registered by
// registerMobileOfflineStore(); off-device (web preview) no store is registered
// and the section reports downloads as unavailable.
export default function SettingsPage() {
  return <SettingsClient offlineSection={<OfflineSettingsSection />} />
}
