import { describe, expect, it, vi } from 'vitest'

// The module imports @capacitor/preferences at top level for the prefs I/O
// helpers; the date math under test never touches it.
vi.mock('@capacitor/preferences', () => ({
  Preferences: { get: vi.fn(), set: vi.fn(), remove: vi.fn() },
}))

import {
  daysUntil,
  nextDueDate,
  upcomingDueDates,
  type ZakatReminderPrefs,
} from '@/lib/zakat-reminder'

function prefs(overrides: Partial<ZakatReminderPrefs>): ZakatReminderPrefs {
  return {
    version: 1,
    enabled: true,
    frequency: 'weekly',
    anchor: '2026-07-01',
    timeOfDay: '09:00',
    ...overrides,
  }
}

describe('nextDueDate', () => {
  it('returns a future anchor as-is', () => {
    const now = new Date(2026, 5, 15, 12, 0)
    expect(nextDueDate(prefs({}), now)).toEqual(new Date(2026, 6, 1, 9, 0))
  })

  it('steps weekly from the anchor, preserving wall-clock time', () => {
    const now = new Date(2026, 6, 12, 10, 0) // 11 days past the anchor
    expect(nextDueDate(prefs({}), now)).toEqual(new Date(2026, 6, 15, 9, 0))
  })

  it('steps biweekly in 14-day periods', () => {
    const now = new Date(2026, 6, 12, 10, 0)
    expect(nextDueDate(prefs({ frequency: 'biweekly' }), now)).toEqual(new Date(2026, 6, 15, 9, 0))
  })

  it('is strict about the due instant itself (due time is not "upcoming")', () => {
    const due = new Date(2026, 6, 15, 9, 0)
    expect(nextDueDate(prefs({}), due)).toEqual(new Date(2026, 6, 22, 9, 0))
  })

  it('monthly keeps the original day-of-month and clamps short months', () => {
    const monthly = prefs({ frequency: 'monthly', anchor: '2026-01-31' })
    // February 2026 has 28 days -> clamp to the 28th…
    expect(nextDueDate(monthly, new Date(2026, 1, 10))).toEqual(new Date(2026, 1, 28, 9, 0))
    // …but March recovers the 31st (no drift to the 28th).
    expect(nextDueDate(monthly, new Date(2026, 2, 1))).toEqual(new Date(2026, 2, 31, 9, 0))
  })
})

describe('upcomingDueDates', () => {
  it('produces a strictly increasing series of the requested length', () => {
    const now = new Date(2026, 6, 12, 10, 0)
    const dates = upcomingDueDates(prefs({}), 4, now)
    expect(dates).toHaveLength(4)
    expect(dates[0]).toEqual(new Date(2026, 6, 15, 9, 0))
    for (let i = 1; i < dates.length; i++) {
      expect(dates[i].getTime()).toBeGreaterThan(dates[i - 1].getTime())
      expect(dates[i].getTime() - dates[i - 1].getTime()).toBe(7 * 24 * 60 * 60 * 1000)
    }
  })
})

describe('daysUntil', () => {
  it('compares local midnights, not elapsed hours', () => {
    expect(daysUntil(new Date(2026, 6, 13, 0, 5), new Date(2026, 6, 12, 23, 55))).toBe(1)
    expect(daysUntil(new Date(2026, 6, 12, 23, 55), new Date(2026, 6, 12, 0, 5))).toBe(0)
    expect(daysUntil(new Date(2026, 6, 15, 9, 0), new Date(2026, 6, 12, 10, 0))).toBe(3)
  })
})
