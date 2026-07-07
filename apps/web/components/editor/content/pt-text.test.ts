import { describe, expect, it } from 'vitest'

import {
  makeTextBlock,
  parseBlockText,
  ptPreview,
  serializeBlockText,
  type PTBlock,
} from './pt-text'

function block(children: PTBlock['children'], markDefs: PTBlock['markDefs'] = []): PTBlock {
  return { _type: 'block', style: 'normal', children, markDefs }
}

function roundTrip(text: string): string {
  const { children, markDefs } = parseBlockText(text)
  return serializeBlockText(block(children, markDefs))
}

describe('serializeBlockText', () => {
  it('renders plain spans as-is', () => {
    expect(serializeBlockText(block([{ _type: 'span', text: 'In the name of God' }]))).toBe(
      'In the name of God',
    )
  })

  it('wraps decorator marks', () => {
    expect(
      serializeBlockText(
        block([
          { _type: 'span', text: 'most ' },
          { _type: 'span', text: 'gracious', marks: ['strong'] },
          { _type: 'span', text: ', most ' },
          { _type: 'span', text: 'merciful', marks: ['em'] },
        ]),
      ),
    ).toBe('most **gracious**, most *merciful*')
  })

  it('stacks marks in canonical order', () => {
    expect(
      serializeBlockText(block([{ _type: 'span', text: 'x', marks: ['em', 'strong'] }])),
    ).toBe('***x***')
    expect(
      serializeBlockText(block([{ _type: 'span', text: 'x', marks: ['strong', 'em'] }])),
    ).toBe('***x***')
  })

  it('renders links with href and blank flag', () => {
    expect(
      serializeBlockText(
        block(
          [{ _type: 'span', text: 'proof', marks: ['abc123'] }],
          [{ _key: 'abc123', _type: 'link', href: 'https://example.org', blank: true }],
        ),
      ),
    ).toBe('[proof](https://example.org +blank)')
  })

  it('escapes literal marker characters', () => {
    expect(serializeBlockText(block([{ _type: 'span', text: '2 * 3 = 6' }]))).toBe('2 \\* 3 = 6')
  })
})

describe('parseBlockText', () => {
  it('parses plain text into one span', () => {
    const { children } = parseBlockText('Read the Quran')
    expect(children).toHaveLength(1)
    expect(children[0].text).toBe('Read the Quran')
    expect(children[0].marks).toEqual([])
  })

  it('parses decorators into marks', () => {
    const { children } = parseBlockText('most **gracious**, most *merciful*')
    expect(children.map((c) => ({ text: c.text, marks: c.marks }))).toEqual([
      { text: 'most ', marks: [] },
      { text: 'gracious', marks: ['strong'] },
      { text: ', most ', marks: [] },
      { text: 'merciful', marks: ['em'] },
    ])
  })

  it('parses nested marks', () => {
    const { children } = parseBlockText('**bold *and italic* only bold**')
    expect(children.map((c) => ({ text: c.text, marks: c.marks }))).toEqual([
      { text: 'bold ', marks: ['strong'] },
      { text: 'and italic', marks: ['strong', 'em'] },
      { text: ' only bold', marks: ['strong'] },
    ])
  })

  it('parses links into markDefs', () => {
    const { children, markDefs } = parseBlockText('see [appendix 1](https://example.org/a1)')
    expect(markDefs).toHaveLength(1)
    expect(markDefs[0].href).toBe('https://example.org/a1')
    expect(children[1].marks).toEqual([markDefs[0]._key])
    expect(children[1].text).toBe('appendix 1')
  })

  it('treats unmatched markers as literal text', () => {
    const { children } = parseBlockText('5 * 3 and a lone ` tick')
    expect(children.map((c) => c.text).join('')).toBe('5 * 3 and a lone ` tick')
  })

  it('unescapes escaped characters', () => {
    const { children } = parseBlockText('2 \\* 3 = 6')
    expect(children[0].text).toBe('2 * 3 = 6')
  })
})

describe('round trip', () => {
  const cases = [
    'plain text',
    'with **strong** and *em* and __underline__ and ~~strike~~ and `code`',
    '***stacked marks***',
    '[a link](https://example.org)',
    '[blank link](https://example.org +blank)',
    'escaped \\* literal \\_ characters \\[ok\\]',
    'multi\nline\ntext',
    '',
  ]
  for (const text of cases) {
    it(`preserves ${JSON.stringify(text)}`, () => {
      expect(roundTrip(text)).toBe(text)
    })
  }

  it('preserves span structure through serialize -> parse', () => {
    const original = block(
      [
        { _type: 'span', text: 'God alone. ' },
        { _type: 'span', text: 'Worship Him', marks: ['strong'] },
        { _type: 'span', text: ' — see ' },
        { _type: 'span', text: 'the proof', marks: ['k1'] },
      ],
      [{ _key: 'k1', _type: 'link', href: 'https://example.org' }],
    )
    const text = serializeBlockText(original)
    const { children, markDefs } = parseBlockText(text)
    expect(serializeBlockText(block(children, markDefs))).toBe(text)
    expect(children.map((c) => c.text)).toEqual([
      'God alone. ',
      'Worship Him',
      ' — see ',
      'the proof',
    ])
  })
})

describe('makeTextBlock', () => {
  it('applies style and list attributes', () => {
    const b = makeTextBlock('First point', { style: 'normal', listItem: 'bullet', level: 1 })
    expect(b.listItem).toBe('bullet')
    expect(b.level).toBe(1)
    expect(b.children?.[0].text).toBe('First point')
  })

  it('keeps a stable key when provided', () => {
    const b = makeTextBlock('x', { key: 'stable123456' })
    expect(b._key).toBe('stable123456')
  })
})

describe('ptPreview', () => {
  it('joins block text and truncates', () => {
    const blocks = [
      block([{ _type: 'span', text: 'A'.repeat(200) }]),
      block([{ _type: 'span', text: 'tail' }]),
    ]
    const preview = ptPreview(blocks, 50)
    expect(preview.length).toBe(50)
    expect(preview.endsWith('…')).toBe(true)
  })

  it('handles non-array input', () => {
    expect(ptPreview(undefined)).toBe('')
    expect(ptPreview('nope')).toBe('')
  })
})
