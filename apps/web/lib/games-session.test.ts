import { describe, it, expect, beforeEach } from 'vitest'
import { stashVariant, readVariant, parseVariantId } from '@/lib/games-session'
import type { GameVariant } from '@/src/api/me-client'

// ── parseVariantId ────────────────────────────────────────────────────────────

describe('parseVariantId', () => {
  it('parses a valid English variant', () => {
    expect(parseVariantId('p42-en-hard-medium-7')).toEqual({
      passage_id: 42,
      language: 'en',
      difficulty: 'hard',
      size: 'medium',
    })
  })

  it('parses passage id 1', () => {
    expect(parseVariantId('p1-en-easy-short-1')).toEqual({
      passage_id: 1,
      language: 'en',
      difficulty: 'easy',
      size: 'short',
    })
  })

  it('parses all difficulty levels', () => {
    const difficulties = ['easy', 'medium', 'hard', 'professional'] as const
    for (const d of difficulties) {
      const result = parseVariantId(`p1-en-${d}-short-1`)
      expect(result?.difficulty).toBe(d)
    }
  })

  it('parses all size levels', () => {
    const sizes = ['short', 'medium', 'long'] as const
    for (const s of sizes) {
      const result = parseVariantId(`p1-en-easy-${s}-1`)
      expect(result?.size).toBe(s)
    }
  })

  // Multi-language support was added in commit 64286b8; parseVariantId must
  // accept every language the picker offers, not just 'en'.
  it('parses Arabic variant', () => {
    expect(parseVariantId('p10-ar-easy-short-1')).toEqual({
      passage_id: 10,
      language: 'ar',
      difficulty: 'easy',
      size: 'short',
    })
  })

  it.each([
    ['ar'], ['ac'], ['fa'], ['ur'], ['fr'], ['de'], ['es'], ['sv'],
    ['tr'], ['id'], ['tl'], ['ru'], ['bn'], ['ta'],
  ])('parses language %s', (lang) => {
    const result = parseVariantId(`p1-${lang}-easy-short-1`)
    expect(result).not.toBeNull()
    expect(result?.language).toBe(lang)
  })

  it('returns null when passage prefix is missing', () => {
    expect(parseVariantId('42-en-hard-medium-7')).toBeNull()
  })

  it('returns null for non-numeric passage id', () => {
    expect(parseVariantId('pabc-en-hard-medium-7')).toBeNull()
  })

  it('returns null for passage id 0', () => {
    expect(parseVariantId('p0-en-hard-medium-7')).toBeNull()
  })

  it('returns null for unknown difficulty', () => {
    expect(parseVariantId('p1-en-impossible-short-1')).toBeNull()
  })

  it('returns null for unknown size', () => {
    expect(parseVariantId('p1-en-easy-huge-1')).toBeNull()
  })

  it('returns null when too few parts', () => {
    expect(parseVariantId('p42-en-hard-medium')).toBeNull()
  })

  it('returns null when too many parts', () => {
    expect(parseVariantId('p42-en-hard-medium-7-extra')).toBeNull()
  })

  it('returns null for empty string', () => {
    expect(parseVariantId('')).toBeNull()
  })
})

// ── stashVariant / readVariant ────────────────────────────────────────────────

function makeVariant(id: string): GameVariant {
  return {
    variant_id: id,
    passage_id: 1,
    language: 'en',
    difficulty: 'easy',
    size: 'short',
    blanks: [],
    verse_keys: [],
    text: '',
    session_id: 'sess-1',
  } as unknown as GameVariant
}

describe('stashVariant / readVariant', () => {
  beforeEach(() => {
    sessionStorage.clear()
  })

  it('round-trips a variant through sessionStorage', () => {
    const v = makeVariant('p1-en-easy-short-1')
    stashVariant(v)
    expect(readVariant('p1-en-easy-short-1')).toEqual(v)
  })

  it('returns null for a variant id that was never stashed', () => {
    expect(readVariant('p99-en-hard-long-1')).toBeNull()
  })

  it('storing a second variant does not evict the first', () => {
    const a = makeVariant('p1-en-easy-short-1')
    const b = makeVariant('p2-en-hard-long-2')
    stashVariant(a)
    stashVariant(b)
    expect(readVariant('p1-en-easy-short-1')).toEqual(a)
    expect(readVariant('p2-en-hard-long-2')).toEqual(b)
  })

  it('overwriting a stashed variant replaces it', () => {
    const original = makeVariant('p1-en-easy-short-1')
    const updated = { ...original, difficulty: 'hard' } as GameVariant
    stashVariant(original)
    stashVariant(updated)
    expect(readVariant('p1-en-easy-short-1')).toEqual(updated)
  })
})
