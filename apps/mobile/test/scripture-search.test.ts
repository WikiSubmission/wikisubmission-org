import { describe, expect, it } from 'vitest'

import { resolveScriptureRef } from '@/lib/scripture-search'

function href(refs: string): string {
  return `/quran/verses?q=${encodeURIComponent(refs)}`
}

describe('resolveScriptureRef — Quran', () => {
  it('accepts the space form and normalises it to colon form', () => {
    expect(resolveScriptureRef('1 1')).toEqual({
      kind: 'quran',
      label: '1:1',
      href: href('1:1'),
    })
  })

  it('accepts the colon form', () => {
    expect(resolveScriptureRef('5:5')).toEqual({
      kind: 'quran',
      label: '5:5',
      href: href('5:5'),
    })
  })

  it('accepts ranges in both separators', () => {
    expect(resolveScriptureRef('1:1-7')?.label).toBe('1:1-7')
    expect(resolveScriptureRef('1 1-7')?.label).toBe('1:1-7')
  })

  it('accepts the Basmallah verse 0', () => {
    expect(resolveScriptureRef('2:0')?.label).toBe('2:0')
  })

  it('accepts comma-separated lists, normalising each part', () => {
    expect(resolveScriptureRef('1:4, 2 45 ,3:1-3')).toEqual({
      kind: 'quran',
      label: '1:4,2:45,3:1-3',
      href: href('1:4,2:45,3:1-3'),
    })
  })

  it('rejects a list where one part is not a reference', () => {
    expect(resolveScriptureRef('1:4,mercy')).toBeNull()
  })

  it('expands the all-chapters form to every chapter that has the verse', () => {
    const ref = resolveScriptureRef(':286')
    expect(ref).not.toBeNull()
    // Only chapter 2 reaches verse 286.
    expect(ref).toEqual({ kind: 'quran', label: ':286', href: href('2:286') })
  })

  it('expands an all-chapters range', () => {
    const ref = resolveScriptureRef(':1-3')
    expect(ref?.kind).toBe('quran')
    expect(decodeURIComponent(ref?.kind === 'quran' ? ref.href : '')).toContain('1:1-3,2:1-3')
  })

  it('returns null when no chapter is long enough', () => {
    expect(resolveScriptureRef(':999')).toBeNull()
  })

  it('rejects chapters outside 1–114', () => {
    expect(resolveScriptureRef('115:1')).toBeNull()
    expect(resolveScriptureRef('0:1')).toBeNull()
  })
})

describe('resolveScriptureRef — Bible', () => {
  it('accepts a named reference with a space separator', () => {
    expect(resolveScriptureRef('mark 12 3')).toEqual({
      kind: 'bible',
      label: 'Mark 12:3',
      reference: 'Mark 12:3',
    })
  })

  it('accepts a named reference with a colon separator', () => {
    expect(resolveScriptureRef('genesis 1:3')).toEqual({
      kind: 'bible',
      label: 'Gen 1:3',
      reference: 'Gen 1:3',
    })
  })

  it('accepts numbered books and ranges', () => {
    expect(resolveScriptureRef('1 sam 3:1-5')?.label).toBe('1 Sam 3:1-5')
  })

  it('accepts the numeric book form', () => {
    expect(resolveScriptureRef('41:12:3')?.label).toBe('Mark 12:3')
  })

  it('emits a canonical label that parses back to the same reference', () => {
    const ref = resolveScriptureRef('song of solomon 1 1')
    expect(ref).toEqual({ kind: 'bible', label: 'Song 1:1', reference: 'Song 1:1' })
    expect(resolveScriptureRef(ref?.label ?? '')).toEqual(ref)
  })

  it('rejects an unknown book', () => {
    expect(resolveScriptureRef('gospel of thomas 1:1')).toBeNull()
  })
})

describe('resolveScriptureRef — plain text', () => {
  it('falls through for free text so it reaches the verse search', () => {
    expect(resolveScriptureRef('mercy')).toBeNull()
    expect(resolveScriptureRef('')).toBeNull()
    expect(resolveScriptureRef('  ')).toBeNull()
  })

  it('leaves a bare chapter number to the chapter list', () => {
    expect(resolveScriptureRef('5')).toBeNull()
  })
})
