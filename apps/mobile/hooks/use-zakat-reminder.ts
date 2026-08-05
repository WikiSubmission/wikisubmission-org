'use client'

import { useCallback, useEffect, useState } from 'react'
import {
  daysUntil,
  nextDueDate,
  readZakatReminderPrefs,
  type ZakatReminderPrefs,
} from '@/lib/zakat-reminder'

export interface UseZakatReminderResult {
  prefs: ZakatReminderPrefs | null
  loading: boolean
  nextDue: Date | null
  /** Whole days until the next due date; 0 = due today. */
  daysLeft: number | null
  /** Force a re-read (the zakat page also dispatches `zakat-prefs-changed`). */
  refresh: () => void
}

/**
 * Read-side of the zakat reminder for the Today-screen countdown chip.
 * Re-reads on focus and on the `zakat-prefs-changed` event; whole-day
 * granularity makes a ticking clock unnecessary.
 */
export function useZakatReminder(): UseZakatReminderResult {
  const [prefs, setPrefs] = useState<ZakatReminderPrefs | null>(null)
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(() => {
    readZakatReminderPrefs().then((stored) => {
      setPrefs(stored)
      setLoading(false)
    })
  }, [])

  useEffect(() => {
    refresh()
    window.addEventListener('zakat-prefs-changed', refresh)
    window.addEventListener('focus', refresh)
    return () => {
      window.removeEventListener('zakat-prefs-changed', refresh)
      window.removeEventListener('focus', refresh)
    }
  }, [refresh])

  const nextDue = prefs?.enabled ? nextDueDate(prefs) : null
  return {
    prefs,
    loading,
    nextDue,
    daysLeft: nextDue ? daysUntil(nextDue) : null,
    refresh,
  }
}
