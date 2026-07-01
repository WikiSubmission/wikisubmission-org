'use client'

import { signOut } from 'next-auth/react'
import MeDashboard from '@/components/me/me-dashboard'

// Thin web wrapper around the shared MeDashboard. The dashboard is auth-library
// agnostic; web supplies sign-out via next-auth here, mobile supplies it via the
// native MobileAuthProvider.
export default function MePageClient({
  name,
  email,
}: {
  name?: string | null
  email?: string | null
}) {
  return (
    <MeDashboard
      name={name}
      email={email}
      onSignOut={() => signOut({ callbackUrl: '/' })}
    />
  )
}
