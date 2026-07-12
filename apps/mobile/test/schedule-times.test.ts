import { describe, expect, it } from 'vitest'
import { computeUpcomingEventInstants } from '@/lib/notifications/schedule-times'
import type { PrayerTimeSet, PrayerTimesResponse } from '@/lib/prayer-times'

const deviceTz = Intl.DateTimeFormat().resolvedOptions().timeZone
// Any zone that is guaranteed not to be the test machine's.
const otherTz = deviceTz === 'Pacific/Kiritimati' ? 'Pacific/Chatham' : 'Pacific/Kiritimati'

function timeSet(overrides: Partial<PrayerTimeSet> = {}): PrayerTimeSet {
  return {
    fajr: '4:30 AM',
    sunrise: '6:00 AM',
    dhuhr: '1:00 PM',
    asr: '4:30 PM',
    maghrib: '8:30 PM',
    isha: '10:00 PM',
    sunset: '8:30 PM',
    ...overrides,
  }
}

function response(overrides: Partial<PrayerTimesResponse>): PrayerTimesResponse {
  return {
    status_string: '',
    location_string: '',
    country: '',
    country_code: '',
    city: '',
    region: '',
    local_time: '',
    local_timezone: '',
    local_timezone_id: deviceTz,
    ...overrides,
  }
}

describe('computeUpcomingEventInstants — schedule path', () => {
  it('returns future events within the horizon, chronologically', () => {
    const data = response({
      schedule: [
        { date: '2026-07-12', day: 'Sunday', times: timeSet() },
        { date: '2026-07-13', day: 'Monday', times: timeSet() },
      ],
    })
    const now = new Date(2026, 6, 12, 6, 0)
    const instants = computeUpcomingEventInstants(data, { days: 1, now })

    // Today: sunrise (6:00) equals `now`, so it's excluded; dhuhr..isha remain.
    // Tomorrow: fajr and sunrise land inside the 24h horizon (inclusive).
    expect(instants.map((i) => i.event)).toEqual([
      'dhuhr',
      'asr',
      'maghrib',
      'isha',
      'fajr',
      'sunrise',
    ])
    expect(instants[0].at).toEqual(new Date(2026, 6, 12, 13, 0))
    expect(instants[4].at).toEqual(new Date(2026, 6, 13, 4, 30))
    const times = instants.map((i) => i.at.getTime())
    expect([...times].sort((a, b) => a - b)).toEqual(times)
  })

  it('parses 12-hour edge cases (12 AM / 12 PM)', () => {
    const data = response({
      schedule: [
        {
          date: '2026-07-12',
          day: 'Sunday',
          times: timeSet({ fajr: '12:05 AM', dhuhr: '12:30 PM' }),
        },
      ],
    })
    const now = new Date(2026, 6, 12, 0, 0)
    const instants = computeUpcomingEventInstants(data, { days: 1, now })
    expect(instants.find((i) => i.event === 'fajr')?.at).toEqual(new Date(2026, 6, 12, 0, 5))
    expect(instants.find((i) => i.event === 'dhuhr')?.at).toEqual(new Date(2026, 6, 12, 12, 30))
  })

  it('skips unparseable clock strings instead of failing', () => {
    const data = response({
      schedule: [
        {
          date: '2026-07-12',
          day: 'Sunday',
          times: timeSet({ dhuhr: 'soon', asr: '25:00 PM' }),
        },
      ],
    })
    const now = new Date(2026, 6, 12, 6, 30)
    const events = computeUpcomingEventInstants(data, { days: 1, now }).map((i) => i.event)
    expect(events).not.toContain('dhuhr')
    expect(events).not.toContain('asr')
    expect(events).toContain('maghrib')
  })
})

describe('computeUpcomingEventInstants — UTC fallback', () => {
  const utcTimes: PrayerTimeSet = {
    fajr: '2026-07-12T03:30:00Z',
    sunrise: '2026-07-12T05:00:00Z',
    dhuhr: '2026-07-12T12:00:00Z',
    asr: '2026-07-12T15:30:00Z',
    maghrib: '2026-07-12T19:30:00Z',
    isha: '2026-07-12T21:00:00Z',
    sunset: '2026-07-12T19:30:00Z',
  }

  it('degrades to times_in_utc when the response timezone differs from the device', () => {
    const data = response({
      local_timezone_id: otherTz,
      times_in_utc: utcTimes,
      // A schedule is present but must be ignored: its wall clocks are in the
      // city's timezone, which is not the device's.
      schedule: [{ date: '2026-07-12', day: 'Sunday', times: timeSet() }],
    })
    const now = new Date('2026-07-12T13:00:00Z')
    const instants = computeUpcomingEventInstants(data, { days: 30, now })
    expect(instants.map((i) => i.event)).toEqual(['asr', 'maghrib', 'isha'])
    expect(instants[0].at.toISOString()).toBe('2026-07-12T15:30:00.000Z')
  })

  it('uses times_in_utc when no schedule was returned', () => {
    const data = response({ times_in_utc: utcTimes })
    const now = new Date('2026-07-12T20:00:00Z')
    const instants = computeUpcomingEventInstants(data, { days: 30, now })
    expect(instants.map((i) => i.event)).toEqual(['isha'])
  })

  it('returns an empty list when there is nothing usable', () => {
    const data = response({})
    expect(computeUpcomingEventInstants(data, { days: 30, now: new Date() })).toEqual([])
  })
})
