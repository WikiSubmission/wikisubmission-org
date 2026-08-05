import { describe, expect, it } from 'vitest'

import { hasTranslatedTitles, mergeWithBundled } from '@/lib/chapter-titles'
import { CHAPTER_TITLES_EN } from '@/lib/quran-titles-en'
import { SUPPORTED_LOCALES } from '@/constants/locales'

describe('hasTranslatedTitles', () => {
  it('claims only the locales the backend actually serves titles for', () => {
    const served = SUPPORTED_LOCALES.filter(hasTranslatedTitles)
    // `de` returns the English titles and `ku` is not a backend language at all
    // (GET /chapters?lang=ku responds 400), so neither is fetched.
    expect(served).toEqual(['ar', 'fr', 'tr'])
  })

  it('never fetches for the default locale', () => {
    expect(hasTranslatedTitles('en')).toBe(false)
  })
})

describe('mergeWithBundled', () => {
  it('falls back to the bundled English table when there is nothing to merge', () => {
    expect(mergeWithBundled(null)).toBe(CHAPTER_TITLES_EN)
    expect(mergeWithBundled(undefined)).toBe(CHAPTER_TITLES_EN)
  })

  it('lets translated titles win but keeps every chapter present', () => {
    const merged = mergeWithBundled({ 1: 'La Clef' })
    expect(merged[1]).toBe('La Clef')
    // A gap in the response must not blank out a row.
    expect(merged[2]).toBe(CHAPTER_TITLES_EN[2])
    expect(Object.keys(merged)).toHaveLength(Object.keys(CHAPTER_TITLES_EN).length)
  })

  it('does not mutate the bundled table', () => {
    const before = CHAPTER_TITLES_EN[1]
    mergeWithBundled({ 1: 'overwritten' })
    expect(CHAPTER_TITLES_EN[1]).toBe(before)
  })
})
