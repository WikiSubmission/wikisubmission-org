'use client'

import { signOut } from 'next-auth/react'
import MeDashboard from '@/components/me/me-dashboard'

// Thin web wrapper around the shared MeDashboard. The dashboard is auth-library
// agnostic; web supplies sign-out via next-auth here, mobile supplies it via the
// native MobileAuthProvider.
//
// hideStudy drops the bookmarks, notes and reading-stats sections: on web those
// open as dialogs from the "Your study" band on /quran. The /me/bookmarks,
// /me/notes and /me/stats routes stay reachable for deep links (verse cards and
// collections still point at them), and mobile keeps the full dashboard.
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
      hideStudy
    />
  )
}
