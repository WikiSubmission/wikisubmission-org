'use client'

import { signOut } from 'next-auth/react'
import { SettingsClient } from '@/components/me/settings-screen'
import { OfflineSettingsSection } from '@/components/me/offline-settings-section'

// Thin web wrapper around the shared SettingsClient. The shared screen is
// auth-library agnostic; web supplies the account email + sign-out via next-auth
// here (functions can't cross the server→client boundary, so the wrapper owns
// the onAccountDeleted callback). The offline section resolves the platform
// store from the registry (sqlite-wasm here); it stays a client-only slot so the
// worker/WASM never enters other bundles.
export default function SettingsPageClient({
  email,
  initialTab,
}: {
  email?: string | null
  initialTab?: string
}) {
  return (
    <SettingsClient
      offlineSection={<OfflineSettingsSection />}
      initialTab={initialTab}
      accountEmail={email ?? undefined}
      onAccountDeleted={() => signOut({ callbackUrl: '/' })}
    />
  )
}
