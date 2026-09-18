import { redirect } from 'next/navigation'
import { auth } from '@/auth'

export const dynamic = 'force-dynamic'

// Settings now lives as a section of the /me dashboard instead of its own
// page — this route only exists so old links and bookmarks keep working.
export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>
}) {
  const session = await auth()
  if (!session?.accessToken) redirect('/auth/sign-in')
  const { tab } = await searchParams
  redirect(`/me${tab ? `?tab=${tab}` : ''}#settings`)
}
