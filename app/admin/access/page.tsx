import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { adminUsersClient, type AdminUser } from '@/lib/admin-users-client'
import { AccessClient } from './access-client'

export const dynamic = 'force-dynamic'

export default async function AdminAccessPage() {
  const session = await auth()
  if (!session?.accessToken) redirect('/auth/sign-in?next=/admin/access')
  if (!session.isAdmin) redirect('/')

  let users: AdminUser[] = []
  let loadError: string | null = null
  try {
    users = await adminUsersClient(session.accessToken).list({ limit: 200 })
  } catch {
    loadError = 'Could not load users.'
  }

  return <AccessClient initialUsers={users} initialError={loadError} />
}
