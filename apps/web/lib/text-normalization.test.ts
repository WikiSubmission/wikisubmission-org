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
})
