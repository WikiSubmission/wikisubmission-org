import { describe, expect, it } from 'vitest'

import {
  appendItem,
  appendixBlocks,
  moveItem,
  parseRich,
  readAtPath,
  removeItem,
  richPreview,
  serializeRich,
  updateAtPath,
} from './appendix-pt'
import type { AppendixRichText } from '@/lib/appendix-portable-text'

/**
 * The rule these tests exist to hold: an edit never drops anything. The appendix
 * blocks carry typed presentation fields the editing surface deliberately does
 * not expose, so a helper that rebuilt a node instead of copying it would
 * silently undo the conversion this migration exists for.
 */

const rich = (text: string): AppendixRichText => parseRich(text)

describe('serializeRich / parseRich', () => {
  it('round-trips plain text', () => {
    expect(serializeRich(rich('Hello world'))).toBe('Hello world')
  })

  it('round-trips decorators', () => {
    for (const source of ['**bold**', '*italic*', '`code`', '__mono__', '++term++']) {
      expect(serializeRich(rich(source))).toBe(source)
    }
  })

  it('round-trips a scripture badge as an inline object, not as text', () => {
    const parsed = rich('Verse {{9:128}} is false')
    expect(parsed.children.map((c) => c._type)).toEqual(['span', 'quranRef', 'span'])
    expect(serializeRich(parsed)).toBe('Verse {{9:128}} is false')
  })

  it('round-trips an appendix cross-reference', () => {
    const parsed = rich('see {{A24}}')
    expect(parsed.children[1]).toMatchObject({ _type: 'appendixLink', n: 24 })
    expect(serializeRich(parsed)).toBe('see {{A24}}')
  })

  it('round-trips a link annotation', () => {
    const parsed = rich('[label](https://example.com)')
    expect(parsed.markDefs?.[0]).toMatchObject({ _type: 'link', href: 'https://example.com' })
    expect(serializeRich(parsed)).toBe('[label](https://example.com)')
  })

  it('keeps a hard break, which the corpus uses inside cards', () => {
    const parsed = rich('one\ntwo')
    expect(serializeRich(parsed)).toBe('one\ntwo')
  })

  it('treats an unmatched marker as literal text', () => {
    const parsed = rich('2 * 3 = 6')
    expect(richPreview(parsed)).toBe('2 * 3 = 6')
  })

  it('escapes a marker character so it survives the round trip', () => {
    expect(richPreview(rich(serializeRich(rich('a [b] c'))))).toBe('a [b] c')
  })
})

describe('updateAtPath', () => {
  it('replaces only the touched node and keeps siblings identical', () => {
    const blocks = [
      { _type: 'block', _key: 'a', style: 'normal', children: [] },
      { _type: 'block', _key: 'b', style: 'normal', children: [] },
    ]
    const next = updateAtPath(blocks, [1, 'style'], 'term') as typeof blocks
    expect(next[1].style).toBe('term')
    expect(next[0]).toBe(blocks[0])
    expect(blocks[1].style).toBe('normal')
  })

  it('preserves unknown fields on the node it edits', () => {
    const blocks = [{ _type: 'appendixCallout', _key: 'a', tone: 'primary', reveal: false, style: 'note' }]
    const next = updateAtPath(blocks, [0, 'style'], 'example') as typeof blocks
    expect(next[0]).toEqual({
      _type: 'appendixCallout',
      _key: 'a',
      tone: 'primary',
      reveal: false,
      style: 'example',
    })
  })

  it('descends into nested content without disturbing the parent', () => {
    const blocks = [
      {
        _type: 'appendixCallout',
        _key: 'a',
        style: 'note',
        content: [{ _type: 'block', _key: 'inner', style: 'normal', children: [] }],
      },
    ]
    const next = updateAtPath(blocks, [0, 'content', 0, 'style'], 'term') as typeof blocks
    expect(next[0].content[0].style).toBe('term')
    expect(next[0]._key).toBe('a')
    expect(next[0].style).toBe('note')
  })

  it('leaves the value alone when the index does not resolve', () => {
    const blocks = [{ _type: 'block', _key: 'a' }]
    expect(updateAtPath(blocks, [5, 'style'], 'term')).toBe(blocks)
  })
})

describe('list edits', () => {
  const list = () => [
    { _type: 'block', _key: 'a' },
    { _type: 'block', _key: 'b' },
    { _type: 'block', _key: 'c' },
  ]

  it('removes by index', () => {
    const next = removeItem(list(), [], 1) as Array<{ _key: string }>
    expect(next.map((b) => b._key)).toEqual(['a', 'c'])
  })

  it('moves an item and keeps every key', () => {
    const next = moveItem(list(), [], 0, 2) as Array<{ _key: string }>
    expect(next.map((b) => b._key)).toEqual(['b', 'c', 'a'])
  })

  it('treats an out-of-range move as a no-op rather than an error', () => {
    const blocks = list()
    expect(moveItem(blocks, [], 2, 1)).toBe(blocks)
    expect(moveItem(blocks, [], 0, -1)).toBe(blocks)
  })

  it('appends into a nested array, creating it when absent', () => {
    const blocks = [{ _type: 'appendixCallout', _key: 'a' }]
    const next = appendItem(blocks, [0, 'content'], { _type: 'block', _key: 'new' }) as Array<{
      content: unknown[]
    }>
    expect(next[0].content).toHaveLength(1)
  })
})

describe('tolerant accessors', () => {
  it('reads a malformed body as empty rather than throwing', () => {
    expect(appendixBlocks(null)).toEqual([])
    expect(appendixBlocks('not blocks')).toEqual([])
  })

  it('returns undefined for a path that does not resolve', () => {
    expect(readAtPath([{ _type: 'block' }], [0, 'missing', 3])).toBeUndefined()
  })
})
