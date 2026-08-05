import { describe, it, expect } from 'vitest'
import {
  normalizeForSearch,
  NORMALIZATION_VERSION,
} from '@/lib/text-normalization/normalize'
import vectors from '@/lib/text-normalization/vectors.json'

// The implementation lives in packages/shared and is consumed here via the
// `@/*` -> packages/shared path fallback. vectors.json is the cross-repo source
// of truth; the ws-backend Go implementation must satisfy the same cases.
describe('normalizeForSearch', () => {
  it('declares the same version as the shared vectors', () => {
    expect(NORMALIZATION_VERSION).toBe(vectors.version)
  })

  for (const c of vectors.cases) {
    it(`vector: ${c.name}`, () => {
      expect(normalizeForSearch(c.in)).toBe(c.out)
    })
  }

  it('is idempotent', () => {
    for (const c of vectors.cases) {
      const once = normalizeForSearch(c.in)
      expect(normalizeForSearch(once)).toBe(once)
    }
  })

  // ── Edge cases ─────────────────────────────────────────────────────────────

  it('returns an empty string for empty input', () => {
    expect(normalizeForSearch('')).toBe('')
  })

  it('collapses a whitespace-only string to empty', () => {
    expect(normalizeForSearch('   \t\n  ')).toBe('')
  })

  it('reduces a combining-mark-only string to empty', () => {
    // Bare harakat (fatha, kasra, sukun) with no base letters -> nothing remains.
    expect(normalizeForSearch('َِْ')).toBe('')
  })

  it('strips a lone standalone hamza to empty', () => {
    expect(normalizeForSearch('ء')).toBe('')
  })

  it('collapses internal runs of whitespace between mixed scripts', () => {
    expect(normalizeForSearch('God   اللَّه\tmercy')).toBe('god الله mercy')
  })

  it('lowercases Latin while leaving Arabic letters intact', () => {
    expect(normalizeForSearch('MERCY')).toBe('mercy')
  })
})
