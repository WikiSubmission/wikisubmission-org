import { describe, expect, it } from 'vitest'
import { compute } from '@/hooks/use-time-of-day'

describe('compute (time-of-day sky model)', () => {
  it('places the sun at the zenith at solar noon', () => {
    const noon = compute(12 * 60)
    expect(noon.isDay).toBe(true)
    expect(noon.phase).toBe('midday')
    expect(noon.luminaryX).toBeCloseTo(50)
    expect(noon.luminaryAltitude).toBeCloseTo(1)
    expect(noon.progress).toBeCloseTo(0.5)
  })

  it('starts the day arc at the 06:00 sunrise reference', () => {
    const sunrise = compute(6 * 60)
    expect(sunrise.isDay).toBe(true)
    expect(sunrise.luminaryX).toBeCloseTo(0)
    expect(sunrise.luminaryAltitude).toBeCloseTo(0)
  })

  it('switches to the night arc at the 18:00 sunset reference', () => {
    const sunset = compute(18 * 60)
    expect(sunset.isDay).toBe(false)
    expect(sunset.luminaryX).toBeCloseTo(0) // moon rises where the sun set
  })

  it('puts the moon at its peak at local midnight', () => {
    const midnight = compute(0)
    expect(midnight.isDay).toBe(false)
    expect(midnight.phase).toBe('night')
    // Midnight is 6h into the 12h night span (18:00 -> 06:00).
    expect(midnight.luminaryX).toBeCloseTo(50)
    expect(midnight.luminaryAltitude).toBeCloseTo(1)
  })

  it('maps phase boundaries', () => {
    expect(compute(4 * 60 + 59).phase).toBe('night')
    expect(compute(5 * 60).phase).toBe('dawn')
    expect(compute(7 * 60).phase).toBe('morning')
    expect(compute(11 * 60).phase).toBe('midday')
    expect(compute(15 * 60).phase).toBe('afternoon')
    expect(compute(18 * 60).phase).toBe('dusk')
    expect(compute(20 * 60).phase).toBe('night')
  })
})
