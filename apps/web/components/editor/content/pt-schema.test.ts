import { describe, it, expect } from 'vitest'

import {
  SCHEMA_DEFINITION,
  DECORATORS,
  KNOWN_BLOCK_TYPES,
  hasUnsupportedBlocks,
  toInitialValue,
} from './pt-schema'

// These assertions are the byte-compatibility contract with existing stored
// Portable Text and the public @portabletext/react renderer. If a name here
// changes, previously-stored content silently stops rendering — so the test
// pins the exact type/mark/style/field names, not just their presence.

describe('SCHEMA_DEFINITION', () => {
  it('declares exactly the stored inline mark names', () => {
    expect(SCHEMA_DEFINITION.decorators.map((d) => d.name)).toEqual([
      'strong',
      'em',
      'underline',
      'strike-through',
      'code',
    ])
    expect(DECORATORS).toContain('strike-through')
  })

  it('declares the stored block styles', () => {
    expect(SCHEMA_DEFINITION.styles.map((s) => s.name)).toEqual([
      'normal',
      'h2',
      'h3',
      'h4',
      'blockquote',
    ])
  })

  it('declares bullet and number lists', () => {
    expect(SCHEMA_DEFINITION.lists.map((l) => l.name)).toEqual(['bullet', 'number'])
  })

  it('declares the link annotation with href and blank fields', () => {
    const link = SCHEMA_DEFINITION.annotations.find((a) => a.name === 'link')
    expect(link).toBeDefined()
    expect(link?.fields.map((f) => f.name)).toEqual(['href', 'blank'])
  })

  it('declares callout and image block objects with their exact fields', () => {
    const callout = SCHEMA_DEFINITION.blockObjects.find((b) => b.name === 'callout')
    expect(callout?.fields.map((f) => f.name)).toEqual(['tone', 'text'])

    const image = SCHEMA_DEFINITION.blockObjects.find((b) => b.name === 'image')
    expect(image?.fields.map((f) => f.name)).toEqual(['url', 'alt', 'caption'])
  })
})

describe('hasUnsupportedBlocks', () => {
  it('accepts documents of block, callout and image only', () => {
    const value = [
      { _type: 'block', children: [] },
      { _type: 'callout', tone: 'info', text: 'x' },
      { _type: 'image', url: 'https://cdn/x.png' },
    ]
    expect(hasUnsupportedBlocks(value)).toBe(false)
    expect(KNOWN_BLOCK_TYPES).toEqual(['block', 'callout', 'image'])
  })

  it('flags documents with any other block type', () => {
    expect(hasUnsupportedBlocks([{ _type: 'block' }, { _type: 'table' }])).toBe(true)
    expect(hasUnsupportedBlocks([{ _type: 'youtube' }])).toBe(true)
  })

  it('treats a non-array (or empty) value as supported', () => {
    expect(hasUnsupportedBlocks(undefined)).toBe(false)
    expect(hasUnsupportedBlocks(null)).toBe(false)
    expect(hasUnsupportedBlocks([])).toBe(false)
  })
})

describe('toInitialValue', () => {
  it('passes a non-empty array through unchanged', () => {
    const value = [{ _type: 'block' }]
    expect(toInitialValue(value)).toBe(value)
  })

  it('maps empty or non-array values to undefined', () => {
    expect(toInitialValue([])).toBeUndefined()
    expect(toInitialValue(null)).toBeUndefined()
    expect(toInitialValue('nope')).toBeUndefined()
  })
})
