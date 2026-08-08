'use client'

import { useEffect } from 'react'
import { installPointerEventsRecovery } from '@/lib/pointer-events-recovery'

/**
 * Mounts the global watchdog that un-sticks `document.body`'s pointer events when
 * a Radix layer fails to finish closing. See lib/pointer-events-recovery.ts for
 * the failure mode. Renders nothing; mount once per app, high in the provider tree.
 */
export function PointerEventsRecovery() {
  useEffect(() => installPointerEventsRecovery(), [])
  return null
}
