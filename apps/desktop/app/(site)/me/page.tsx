'use client'

import MeDashboard from '@/components/me/me-dashboard'

// Study dashboard for the local user. No sign-out (there is no account) and
// no Bible, which the desktop app does not ship.
export default function StudyPage() {
  return <MeDashboard hideBible />
}
