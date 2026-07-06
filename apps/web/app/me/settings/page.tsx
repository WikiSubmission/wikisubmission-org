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
  // The offline section resolves the platform store from the registry
  // (sqlite-wasm here, the Capacitor store on mobile); the worker/WASM only
  // load through this app's registerWebOfflineStore().
  return <SettingsClient offlineSection={<OfflineSettingsSection />} initialTab={tab} />
}
