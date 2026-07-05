import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { SettingsClient } from '@/components/me/settings-screen'
import { OfflineSettingsSection } from '@/components/me/offline-settings-section'

export const dynamic = 'force-dynamic'

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>
}) {
  const session = await auth()
  if (!session?.accessToken) redirect('/auth/sign-in')
  const { tab } = await searchParams
  // Offline reading is web-only (sqlite-wasm + OPFS); injected here so the
  // mobile build never pulls in the worker or WASM.
  return <SettingsClient offlineSection={<OfflineSettingsSection />} initialTab={tab} />
}
