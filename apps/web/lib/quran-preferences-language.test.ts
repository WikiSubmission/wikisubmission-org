import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

/**
 * primaryLanguage is the translation language sent to the backend in `langs`, and
 * it used to be seeded straight from the UI locale cookie. `ckb` and `kmr` are
 * shipped interface locales the backend has no content for, and it rejects the
 * whole verse request with a 400 when one appears — so a Kurdish reader got a
 * reader that could not load a single verse, and kept getting one after the SSR
 * fix because the bad code was already persisted.
 *
 * These tests pin the seed and the v9 repair. The store is imported fresh per
 * case because zustand's persist middleware rehydrates once, at creation.
 */

const STORAGE_KEY = 'quran-preferences-v4'

/** Create the store against the currently seeded localStorage/cookie. */
async function loadStore() {
  vi.resetModules()
  const { useQuranPreferences } = await import('@/hooks/use-quran-preferences')
  return useQuranPreferences.getState()
}

/** Seed persisted preferences as an older build would have written them. */
function seedPersisted(state: Record<string, unknown>, version: number) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ state, version }))
}

function setLocaleCookie(locale: string) {
  document.cookie = `locale=${locale}`
}

beforeEach(() => {
  localStorage.clear()
  // Expire whatever a previous case left behind.
  document.cookie = 'locale=; expires=Thu, 01 Jan 1970 00:00:00 GMT'
})

afterEach(() => {
  vi.resetModules()
})

describe('primaryLanguage seeding from the locale cookie', () => {
  it('reads English for a Kurdish interface', async () => {
    setLocaleCookie('ckb')
    await expect(loadStore().then((s) => s.primaryLanguage)).resolves.toBe('en')
  })

  it('reads English for Kurmanji too', async () => {
    setLocaleCookie('kmr')
    await expect(loadStore().then((s) => s.primaryLanguage)).resolves.toBe('en')
  })

  it('keeps a locale that is also a translation language', async () => {
    setLocaleCookie('de')
    await expect(loadStore().then((s) => s.primaryLanguage)).resolves.toBe('de')
  })

  it('falls back to English for an unknown cookie', async () => {
    setLocaleCookie('zz')
    await expect(loadStore().then((s) => s.primaryLanguage)).resolves.toBe('en')
  })
})

describe('v9 migration of persisted preferences', () => {
  const v8 = (overrides: Record<string, unknown>) => ({
    arabic: true,
    subtitles: true,
    footnotes: true,
    transliteration: false,
    text: true,
    wordByWord: false,
    displayMode: 'verse',
    showVerseNumbers: true,
    readingModeLang: 'translation',
    primaryLanguage: 'en',
    zoomLevel: 'comfortable',
    wordLabSections: { derivs: true, occurrences: true, morphology: false },
    wordTapAction: 'play',
    ...overrides,
  })

  it.each(['ckb', 'kmr'])('repairs a stored %s primary language', async (stored) => {
    seedPersisted(v8({ primaryLanguage: stored }), 8)

    const state = await loadStore()

    expect(state.primaryLanguage).toBe('en')
  })

  it('leaves a valid stored language alone', async () => {
    seedPersisted(v8({ primaryLanguage: 'ar' }), 8)

    const state = await loadStore()

    expect(state.primaryLanguage).toBe('ar')
  })

  it('preserves unrelated stored preferences while repairing', async () => {
    seedPersisted(v8({ primaryLanguage: 'ckb', arabic: false, zoomLevel: 'compact' }), 8)

    const state = await loadStore()

    expect(state).toMatchObject({
      primaryLanguage: 'en',
      arabic: false,
      zoomLevel: 'compact',
    })
  })

  it('drops an unusable secondary language instead of duplicating the primary', async () => {
    seedPersisted(v8({ primaryLanguage: 'en', secondaryLanguage: 'ckb' }), 8)

    const state = await loadStore()

    expect(state.secondaryLanguage).toBeUndefined()
  })

  it('keeps a valid secondary language', async () => {
    seedPersisted(v8({ primaryLanguage: 'en', secondaryLanguage: 'ar' }), 8)

    const state = await loadStore()

    expect(state.secondaryLanguage).toBe('ar')
  })
})
