import { beforeEach, describe, expect, it } from 'vitest'
import { sanitiseRemotePreferences } from '@/hooks/use-quran-preferences'

/**
 * `GET /me/preferences` returns an opaque `Record<string, unknown>` the backend
 * never validates, so a record written by an older client outlives every store
 * migration. It used to be spread straight into the store, which meant a stale
 * server row could revert live settings and reintroduce a primaryLanguage the
 * backend 400s on. These tests pin the whitelist.
 */

beforeEach(() => {
  localStorage.clear()
})

describe('sanitiseRemotePreferences', () => {
  it('returns nothing for a non-object payload', () => {
    expect(sanitiseRemotePreferences(null)).toEqual({})
    expect(sanitiseRemotePreferences(undefined)).toEqual({})
    expect(sanitiseRemotePreferences('wordByWord')).toEqual({})
  })

  it('passes valid values through', () => {
    expect(
      sanitiseRemotePreferences({
        arabic: false,
        wordByWord: true,
        showVerseNumbers: false,
        primaryLanguage: 'fr',
        secondaryLanguage: 'ar',
        readingModeLang: 'arabic',
        wordTapAction: 'details',
        fontSize: 'lg',
        contentWidth: 'wide',
      })
    ).toEqual({
      arabic: false,
      wordByWord: true,
      showVerseNumbers: false,
      primaryLanguage: 'fr',
      secondaryLanguage: 'ar',
      readingModeLang: 'arabic',
      wordTapAction: 'details',
      fontSize: 'lg',
      contentWidth: 'wide',
    })
  })

  it('maps a legacy zoomLevel onto the split text-size and width settings', () => {
    // Records written before the split carry only `zoomLevel`; without this a
    // reader signing in on a new device would land on the defaults instead.
    expect(sanitiseRemotePreferences({ zoomLevel: 'wide' })).toEqual({
      fontSize: 'lg',
      contentWidth: 'wide',
    })
    expect(sanitiseRemotePreferences({ zoomLevel: 'enormous' })).toEqual({})
  })

  it('prefers explicit sizes over the legacy zoomLevel beside them', () => {
    expect(sanitiseRemotePreferences({ zoomLevel: 'compact', fontSize: 'xl' })).toEqual({
      fontSize: 'xl',
      contentWidth: 'narrow',
    })
  })

  it('never accepts displayMode or text from the server', () => {
    // displayMode is local-only view state; text's `true` invariant belongs to
    // patchPreferences.
    const out = sanitiseRemotePreferences({ displayMode: 'reading', text: false })
    expect(out).not.toHaveProperty('displayMode')
    expect(out).not.toHaveProperty('text')
  })

  it('repairs a UI locale stored as the translation language', () => {
    // The exact shape of a pre-v9 server record: `ckb` has no backend content.
    expect(sanitiseRemotePreferences({ primaryLanguage: 'ckb' }).primaryLanguage).toBe('en')
    expect(sanitiseRemotePreferences({ primaryLanguage: 42 }).primaryLanguage).toBe('en')
  })

  it('drops an unusable secondary language rather than repairing it', () => {
    const out = sanitiseRemotePreferences({ secondaryLanguage: 'ckb' })
    expect('secondaryLanguage' in out).toBe(true)
    expect(out.secondaryLanguage).toBeUndefined()
  })

  it('drops values of the wrong type or outside the allowed set', () => {
    expect(
      sanitiseRemotePreferences({
        arabic: 'yes',
        fontSize: 'enormous',
        contentWidth: 'infinite',
        readingModeLang: 'klingon',
        wordTapAction: 'explode',
        unknownKey: true,
      })
    ).toEqual({})
  })

  it('fills missing wordLabSections fields with their defaults', () => {
    expect(sanitiseRemotePreferences({ wordLabSections: { derivs: false } }).wordLabSections).toEqual(
      { derivs: false, occurrences: true, morphology: false }
    )
  })
})
