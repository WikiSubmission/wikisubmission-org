import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import {
  notificationsAdminClient,
  type ScheduledNotification,
  type ZikrEntry,
} from '@/lib/notifications-admin-client'
import { NotificationsClient } from './notifications-client'

export const dynamic = 'force-dynamic'

export default async function AdminNotificationsPage() {
  const session = await auth()
  if (!session?.accessToken) redirect('/auth/sign-in?next=/admin/notifications')
  if (!session.isAdmin) redirect('/')

  const client = notificationsAdminClient(session.accessToken)
  let schedules: ScheduledNotification[] = []
  let zikr: ZikrEntry[] = []
  let loadError: string | null = null
  try {
    ;[schedules, zikr] = await Promise.all([client.listSchedules(), client.listZikr()])
  } catch {
    loadError = 'Could not load notifications data.'
  }

  return (
    <NotificationsClient initialSchedules={schedules} initialZikr={zikr} initialError={loadError} />
  )
}
