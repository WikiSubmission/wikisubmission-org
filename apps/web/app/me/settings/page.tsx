import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { SettingsClient } from '@/components/me/settings-screen'

export const dynamic = 'force-dynamic'

export default async function SettingsPage() {
  const session = await auth()
  if (!session?.accessToken) redirect('/auth/sign-in')
  return <SettingsClient />
}
