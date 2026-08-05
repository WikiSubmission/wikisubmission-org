'use client'

import { OfflineSettingsSection } from '@/components/me/offline-settings-section'
import { NotificationPreferencesList } from '@/components/notification-preferences-list'
import { SettingsClient } from '@/components/me/settings-screen'
import { MobileGeneralSettings } from '@/components/settings/mobile-general-settings'
import { useMobileAuth } from '@/components/mobile-auth-context'

// The downloads tab drives the native Capacitor content store registered by
// registerMobileOfflineStore(); off-device (web preview) no store is registered
// and the section reports downloads as unavailable. The notifications section
// replaces the web-push controls with the native (local + FCM) preferences —
// the same list the Today-screen bell opens. Account deletion signs out through
// the native MobileAuthProvider (Capacitor), mirroring how web uses next-auth.
export default function SettingsPage() {
  const { user, signOut } = useMobileAuth()
  return (
    <SettingsClient
      offlineSection={<OfflineSettingsSection />}
      notificationsSection={<NotificationPreferencesList />}
      generalExtrasSection={<MobileGeneralSettings />}
      accountEmail={user?.email ?? undefined}
      onAccountDeleted={() => void signOut()}
    />
  )
}
