import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { ActivityClient } from './activity-client'

export const dynamic = 'force-dynamic'

export default async function ActivityPage() {
  const session = await auth()
  if (!session?.accessToken) redirect('/auth/sign-in')
  return <ActivityClient />
}
