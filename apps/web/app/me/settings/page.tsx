import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import SettingsPageClient from './settings-client'

export const dynamic = 'force-dynamic'

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>
}) {
  const session = await auth()
  if (!session?.accessToken) redirect('/auth/sign-in')
  const { tab } = await searchParams
  return <SettingsPageClient email={session.user?.email} initialTab={tab} />
}
