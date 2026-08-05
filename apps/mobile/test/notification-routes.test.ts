import { describe, expect, it } from 'vitest'
import { safeRoute } from '@/lib/notification-routes'

describe('safeRoute', () => {
  it('accepts whitelisted prefixes and their subpaths', () => {
    expect(safeRoute('/')).toBe('/')
    expect(safeRoute('/quran')).toBe('/quran')
    expect(safeRoute('/quran/2')).toBe('/quran/2')
    expect(safeRoute('/me/settings')).toBe('/me/settings')
    expect(safeRoute('/zakat')).toBe('/zakat')
  })

  it('normalizes trailing slashes (static-export URLs carry them)', () => {
    expect(safeRoute('/quran/2/')).toBe('/quran/2')
    expect(safeRoute('/quran///')).toBe('/quran')
  })

  it('rejects non-whitelisted paths', () => {
    expect(safeRoute('/settings')).toBeNull()
    expect(safeRoute('/mequran')).toBeNull() // prefix match must respect segment boundary
    expect(safeRoute('/admin')).toBeNull()
  })

  it('rejects non-path payloads', () => {
    expect(safeRoute('https://evil.example')).toBeNull()
    expect(safeRoute('//evil.example')).toBeNull()
    expect(safeRoute('quran')).toBeNull()
    expect(safeRoute(42)).toBeNull()
    expect(safeRoute(null)).toBeNull()
    expect(safeRoute(undefined)).toBeNull()
  })
})
