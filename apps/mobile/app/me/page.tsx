'use client'

import MeDashboard from '@/components/me/me-dashboard'
import { useMobileAuth } from '@/components/mobile-auth-context'

// Profile dashboard. The auth-gate lives in the layout, so by the time this
// renders a user is present. Sign-out is the native one; the provider label is
// derived from the auth id (Apple vs Google).
export default function ProfilePage() {
  const { user, signOut } = useMobileAuth()
  const providerLabel = user?.auth_id.startsWith('apple:') ? 'Apple' : 'Google'

  return (
    <MeDashboard
      name={user?.display_name}
      email={user?.email}
      onSignOut={() => {
        void signOut()
      }}
      providerLabel={providerLabel}
    />
  )
}
