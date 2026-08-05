import { afterEach, describe, expect, it, vi } from 'vitest'
import { currentDaySeed, dailyZikrIndex, pickRandomZikrIndex } from '@/lib/zikr'

describe('dailyZikrIndex', () => {
  it('is deterministic for a given seed', () => {
    expect(dailyZikrIndex(20_600, 12)).toBe(dailyZikrIndex(20_600, 12))
  })

  it('stays within bounds for any seed', () => {
    for (let seed = 0; seed < 1000; seed++) {
      const index = dailyZikrIndex(seed, 7)
      expect(index).toBeGreaterThanOrEqual(0)
      expect(index).toBeLessThan(7)
    }
  })

  it('returns 0 for empty or invalid lengths', () => {
    expect(dailyZikrIndex(20_600, 0)).toBe(0)
    expect(dailyZikrIndex(20_600, -3)).toBe(0)
  })

  it('scrambles consecutive days instead of incrementing', () => {
    // The integer hash exists so day N and N+1 don't map to adjacent entries.
    // A window of consecutive seeds should produce more than a rotation.
    const length = 50
    const indices = Array.from({ length: 10 }, (_, i) => dailyZikrIndex(20_600 + i, length))
    const increments = indices.slice(1).map((v, i) => (v - indices[i] + length) % length)
    expect(new Set(increments).size).toBeGreaterThan(1)
  })
})

describe('currentDaySeed', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('counts whole UTC days since the epoch', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-07-12T10:00:00Z'))
    expect(currentDaySeed()).toBe(Math.floor(Date.parse('2026-07-12T10:00:00Z') / 86_400_000))
    // Same seed all UTC day, next seed after the UTC midnight boundary.
    const seed = currentDaySeed()
    vi.setSystemTime(new Date('2026-07-12T23:59:59Z'))
    expect(currentDaySeed()).toBe(seed)
    vi.setSystemTime(new Date('2026-07-13T00:00:01Z'))
    expect(currentDaySeed()).toBe(seed + 1)
  })
})

describe('pickRandomZikrIndex', () => {
  it('returns 0 for an empty list and a valid index otherwise', () => {
    expect(pickRandomZikrIndex([])).toBe(0)
    const items = [
      { id: 1, text: 'a' },
      { id: 2, text: 'b' },
      { id: 3, text: 'c' },
    ]
    for (let i = 0; i < 50; i++) {
      const index = pickRandomZikrIndex(items)
      expect(index).toBeGreaterThanOrEqual(0)
      expect(index).toBeLessThan(items.length)
    }
  })
})
