import { Preferences } from '@capacitor/preferences'

/**
 * Zakat reminder model — device-local only (no backend). Preferences hold the
 * user's cadence and anchor; the countdown widget and the reminder page both
 * derive the next due date from here so they always agree.
 */

export type ZakatFrequency = 'weekly' | 'biweekly' | 'monthly'

export interface ZakatReminderPrefs {
  version: 1
  enabled: boolean
  frequency: ZakatFrequency
  /** Local date of the first (or next) due day, as picked by the user. */
  anchor: string // 'YYYY-MM-DD'
  timeOfDay: string // 'HH:mm'
}

const PREFS_KEY = 'zakat-reminder-v1'

export const DEFAULT_ZAKAT_TIME = '09:00'

export async function readZakatReminderPrefs(): Promise<ZakatReminderPrefs | null> {
  try {
    const { value } = await Preferences.get({ key: PREFS_KEY })
    if (!value) return null
    const parsed = JSON.parse(value) as ZakatReminderPrefs
    if (
      parsed?.version !== 1 ||
      typeof parsed.enabled !== 'boolean' ||
      !['weekly', 'biweekly', 'monthly'].includes(parsed.frequency) ||
      !/^\d{4}-\d{2}-\d{2}$/.test(parsed.anchor ?? '') ||
      !/^\d{2}:\d{2}$/.test(parsed.timeOfDay ?? '')
    ) {
      return null
    }
    return parsed
  } catch {
    return null
  }
}

export async function writeZakatReminderPrefs(prefs: ZakatReminderPrefs | null): Promise<void> {
  try {
    if (prefs) await Preferences.set({ key: PREFS_KEY, value: JSON.stringify(prefs) })
    else await Preferences.remove({ key: PREFS_KEY })
  } catch {
    // Storage failure: the UI state stands for this session.
  }
  // The countdown widget re-reads on this event (and on focus).
  window.dispatchEvent(new Event('zakat-prefs-changed'))
}

function anchorDate(prefs: ZakatReminderPrefs): Date {
  const [y, m, d] = prefs.anchor.split('-').map((v) => Number.parseInt(v, 10))
  const [hh, mm] = prefs.timeOfDay.split(':').map((v) => Number.parseInt(v, 10))
  return new Date(y, m - 1, d, hh, mm, 0, 0)
}

function daysInMonth(year: number, monthIndex: number): number {
  return new Date(year, monthIndex + 1, 0).getDate()
}

/**
 * Next due instant, all in local time. Weekly/biweekly step by calendar days
 * (DST-safe: wall-clock time is preserved). Monthly keeps the ORIGINAL anchor
 * day-of-month and clamps per month, so an anchor on the 31st gives
 * Jan 31 -> Feb 28 -> Mar 31 without drifting to the 28th.
 */
export function nextDueDate(prefs: ZakatReminderPrefs, now: Date = new Date()): Date {
  const anchor = anchorDate(prefs)
  const [hh, mm] = prefs.timeOfDay.split(':').map((v) => Number.parseInt(v, 10))

  if (prefs.frequency === 'monthly') {
    const targetDay = anchor.getDate()
    let year = anchor.getFullYear()
    let month = anchor.getMonth()
    if (anchor > now) return anchor
    // Start from the current month and walk forward until a clamped candidate
    // lands in the future.
    year = now.getFullYear()
    month = now.getMonth()
    for (;;) {
      const candidate = new Date(year, month, Math.min(targetDay, daysInMonth(year, month)), hh, mm)
      if (candidate > now && candidate >= anchor) return candidate
      month += 1
      if (month > 11) {
        month = 0
        year += 1
      }
    }
  }

  const periodDays = prefs.frequency === 'weekly' ? 7 : 14
  if (anchor > now) return anchor
  const elapsedMs = now.getTime() - anchor.getTime()
  let steps = Math.ceil(elapsedMs / (periodDays * 24 * 60 * 60 * 1000))
  for (;;) {
    // Calendar-day addition, not millisecond addition, so DST keeps wall time.
    const candidate = new Date(
      anchor.getFullYear(),
      anchor.getMonth(),
      anchor.getDate() + steps * periodDays,
      hh,
      mm,
    )
    if (candidate > now) return candidate
    steps += 1
  }
}

/** Series of upcoming due instants (for scheduling concrete notifications). */
export function upcomingDueDates(
  prefs: ZakatReminderPrefs,
  count: number,
  now: Date = new Date(),
): Date[] {
  const dates: Date[] = []
  let cursor = now
  for (let i = 0; i < count; i++) {
    const next = nextDueDate(prefs, cursor)
    dates.push(next)
    cursor = next
  }
  return dates
}

function startOfLocalDay(date: Date): number {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime()
}

/** Whole days until `next`, comparing local midnights (0 = due today). */
export function daysUntil(next: Date, now: Date = new Date()): number {
  return Math.round((startOfLocalDay(next) - startOfLocalDay(now)) / (24 * 60 * 60 * 1000))
}
