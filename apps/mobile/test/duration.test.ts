import { describe, expect, it } from 'vitest'
import { formatRemaining, parseDurationToSeconds } from '@/lib/duration'

describe('parseDurationToSeconds', () => {
  it('parses hours, minutes and seconds together', () => {
    expect(parseDurationToSeconds('1h 23m 45s')).toBe(3600 + 23 * 60 + 45)
  })

  it('parses partial combinations', () => {
    expect(parseDurationToSeconds('45m 10s')).toBe(45 * 60 + 10)
    expect(parseDurationToSeconds('2h')).toBe(7200)
    expect(parseDurationToSeconds('30s')).toBe(30)
  })

  it('tolerates missing whitespace and returns 0 for unparseable input', () => {
    expect(parseDurationToSeconds('1h5m')).toBe(3600 + 5 * 60)
    expect(parseDurationToSeconds('soon')).toBe(0)
    expect(parseDurationToSeconds('')).toBe(0)
  })
})

describe('formatRemaining', () => {
  it('pads minutes and seconds under an hour header', () => {
    expect(formatRemaining(3661)).toBe('1h 01m 01s')
  })

  it('drops the hour segment when zero', () => {
    expect(formatRemaining(65)).toBe('1m 05s')
  })

  it('shows bare seconds below a minute', () => {
    expect(formatRemaining(9)).toBe('9s')
    expect(formatRemaining(0)).toBe('0s')
  })

  it('round-trips through the parser', () => {
    const seconds = 2 * 3600 + 7 * 60 + 3
    expect(parseDurationToSeconds(formatRemaining(seconds))).toBe(seconds)
  })
})
