import { describe, expect, it } from 'vitest'
import { parseCoverToCover } from '@/lib/cover-to-cover'

describe('parseCoverToCover', () => {
  it('parses a verse key into chapter, verse and percent', () => {
    expect(parseCoverToCover('5:23')).toEqual({ chapter: 5, verse: 23, percent: 4 })
  })

  it('reaches 100% at the last chapter', () => {
    expect(parseCoverToCover('114:6')).toEqual({ chapter: 114, verse: 6, percent: 100 })
  })

  it('accepts verse 0 (the pre-verse Basmala)', () => {
    expect(parseCoverToCover('2:0')?.verse).toBe(0)
  })

  it('rejects missing, malformed and out-of-range keys', () => {
    expect(parseCoverToCover(null)).toBeNull()
    expect(parseCoverToCover(undefined)).toBeNull()
    expect(parseCoverToCover('')).toBeNull()
    expect(parseCoverToCover('abc')).toBeNull()
    expect(parseCoverToCover('x:y')).toBeNull()
    expect(parseCoverToCover('5')).toBeNull()
    expect(parseCoverToCover('0:1')).toBeNull()
    expect(parseCoverToCover('115:1')).toBeNull()
    expect(parseCoverToCover('-1:5')).toBeNull()
  })
})
