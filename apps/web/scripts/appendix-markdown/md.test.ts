import { describe, expect, it } from 'vitest'
import { escapeText, gfmTable } from './md'

describe('escapeText', () => {
  it('leaves numbered prose markers like "[1]" readable', () => {
    // The appendix prose numbers its points this way; CommonMark keeps them
    // literal, so escaping every bracket would only hurt the stored source.
    expect(escapeText('[1] As pointed out')).toBe('[1] As pointed out')
  })

  it('escapes a bracket that could open a link or an image', () => {
    expect(escapeText('see [label](x)')).toBe('see \\[label\\](x)')
  })

  it('breaks an ordered-list marker at its punctuation, not its digits', () => {
    // "\1919." would render as a literal backslash: a backslash only escapes
    // ASCII punctuation.
    expect(escapeText('1919.')).toBe('1919\\.')
  })

  it('escapes a line-leading bullet', () => {
    expect(escapeText('- not a list')).toBe('\\- not a list')
  })

  it('does not escape pipes, which gfmTable owns', () => {
    expect(escapeText('a | b')).toBe('a | b')
  })
})

describe('gfmTable', () => {
  it('pads short rows out to the widest row', () => {
    expect(gfmTable(['a', 'b'], [['1']])).toBe('| a | b |\n| --- | --- |\n| 1 |   |')
  })

  it('escapes a pipe inside a cell exactly once', () => {
    expect(gfmTable(['a'], [['x | y']])).toContain('| x \\| y |')
  })
})
