import { describe, expect, it } from 'vitest'

// constants/appendices lives in packages/shared; colocated here because that is
// where the vitest project scans.
import { resolveAppendixMeta, splitAppendixTitle } from '@/constants/appendices'

describe('splitAppendixTitle', () => {
  it('lifts a trailing scripture reference out of the title', () => {
    expect(splitAppendixTitle('One of the Great Miracles [74:35]')).toEqual({
      title: 'One of the Great Miracles',
      quranRef: '74:35',
    })
  })

  it('accepts a verse range', () => {
    expect(
      splitAppendixTitle("God's Messenger of the Covenant [3:81-85]")
    ).toEqual({
      title: "God's Messenger of the Covenant",
      quranRef: '3:81-85',
    })
  })

  it('leaves a title with no reference untouched', () => {
    expect(splitAppendixTitle('Heaven and Hell')).toEqual({
      title: 'Heaven and Hell',
    })
  })

  it('ignores a bracket that is not at the end', () => {
    expect(splitAppendixTitle('Verse [2:255] explained')).toEqual({
      title: 'Verse [2:255] explained',
    })
  })
})

describe('resolveAppendixMeta', () => {
  it('falls back to the static list when there is no editorial title', () => {
    expect(resolveAppendixMeta(1)).toEqual({
      number: 1,
      title: 'One of the Great Miracles',
      quranRef: '74:35',
    })
  })

  it('prefers an edited title and keeps its reference', () => {
    expect(
      resolveAppendixMeta(1, 'One of the Greatest Miracles [74:30]')
    ).toEqual({
      number: 1,
      title: 'One of the Greatest Miracles',
      quranRef: '74:30',
    })
  })

  it('keeps the static reference when the edited title omits one', () => {
    expect(resolveAppendixMeta(1, 'One of the Great Miracles')).toEqual({
      number: 1,
      title: 'One of the Great Miracles',
      quranRef: '74:35',
    })
  })

  it('treats a blank editorial title as absent', () => {
    expect(resolveAppendixMeta(5, '   ')?.title).toBe('Heaven and Hell')
  })

  it('returns undefined for a number outside the corpus', () => {
    expect(resolveAppendixMeta(0)).toBeUndefined()
    expect(resolveAppendixMeta(39)).toBeUndefined()
  })
})
