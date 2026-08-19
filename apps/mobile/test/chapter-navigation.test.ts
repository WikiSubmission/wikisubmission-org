import { describe, expect, it, vi } from 'vitest'
import { replaceChapterHistoryEntry } from '@/lib/chapter-navigation'

describe('replaceChapterHistoryEntry', () => {
  it('replaces the current reader entry so Back returns to the previous page', () => {
    const replaceState = vi.fn()

    expect(replaceChapterHistoryEntry({ replaceState }, 12)).toBe(true)
    expect(replaceState).toHaveBeenCalledWith(null, '', '/quran/12/')
  })

  it.each([0, 115, 1.5, Number.NaN])('rejects invalid chapter %s', (target) => {
    const replaceState = vi.fn()

    expect(replaceChapterHistoryEntry({ replaceState }, target)).toBe(false)
    expect(replaceState).not.toHaveBeenCalled()
  })
})
