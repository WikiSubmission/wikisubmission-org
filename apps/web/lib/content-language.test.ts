import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// server-client resolves its base URL once at module load, and undici refuses a
// relative request URL — so this has to be set before the import graph below is
// evaluated, which vi.hoisted guarantees.
vi.hoisted(() => {
  process.env.INTERNAL_API_URL = 'http://backend.test/api/v1'
})

import {
  contentLangForUiLocale,
  DEFAULT_CONTENT_LANG,
  LEGACY_UI_LOCALE_ALIASES,
  UI_LOCALES,
} from '@/constants/ui-locales'
import { fetchAppendices, fetchChapters } from '@/lib/quran-metadata'

/**
 * The Quran reader used to hand the UI locale straight to the backend as a
 * content language. They are separate registries: `/chapters`, `/appendices` and
 * `/quran` validate `lang`/`langs` against the backend's languages table and
 * answer 400 for anything absent, and the shipped `ckb`/`kmr` interface locales
 * are absent. Every Kurdish request 400'd, and the layout replaced the entire
 * page with "Something went wrong".
 *
 * These tests pin both halves of the repair: the locale is mapped before it goes
 * out, and a metadata request that fails degrades to English and then to an empty
 * list instead of taking the reader down with it.
 */

/**
 * Content language codes ws-backend actually serves — its baseline seed plus the
 * `ku` row from migration 026. Mirrored here so a mapping that points at a code
 * the backend would reject fails this suite rather than production.
 */
const BACKEND_LANGUAGES = [
  'ar', 'ac', 'en', 'fr', 'tr', 'de', 'id',
  'fa', 'ta', 'sv', 'ru', 'bn', 'ur', 'es', 'tl', 'ku',
]

describe('contentLangForUiLocale', () => {
  it('maps every shipped UI locale to a language the backend serves', () => {
    for (const { code } of UI_LOCALES) {
      expect(BACKEND_LANGUAGES).toContain(contentLangForUiLocale(code))
    }
  })

  it('passes through locales that are content languages too', () => {
    expect(contentLangForUiLocale('en')).toBe('en')
    expect(contentLangForUiLocale('ar')).toBe('ar')
    expect(contentLangForUiLocale('de')).toBe('de')
    expect(contentLangForUiLocale('fr')).toBe('fr')
    expect(contentLangForUiLocale('tr')).toBe('tr')
  })

  it('reads English for both Kurdish locales', () => {
    // Not `ku`: that row exists in the registry but no Kurdish chapters,
    // appendices, or verses were seeded behind it, so it answers 200 with [].
    expect(contentLangForUiLocale('ckb')).toBe('en')
    expect(contentLangForUiLocale('kmr')).toBe('en')
  })

  it('never returns a UI-only locale code', () => {
    const uiOnly = UI_LOCALES.map((l) => l.code).filter(
      (code) => !BACKEND_LANGUAGES.includes(code),
    )
    expect(uiOnly).toEqual(['ckb', 'kmr'])
    for (const code of uiOnly) {
      expect(contentLangForUiLocale(code)).not.toBe(code)
    }
  })

  it('follows retired locale aliases', () => {
    for (const legacy of Object.keys(LEGACY_UI_LOCALE_ALIASES)) {
      expect(BACKEND_LANGUAGES).toContain(contentLangForUiLocale(legacy))
    }
  })

  it.each([undefined, null, '', 'zz', 'not-a-locale'])(
    'falls back to English for %o',
    (value) => {
      expect(contentLangForUiLocale(value)).toBe(DEFAULT_CONTENT_LANG)
    },
  )
})

type Reply = { status?: number; body?: unknown }

let calls: string[] = []

/** openapi-fetch hands the custom fetch a Request, not a URL string. */
function urlOf(input: Request | URL | string): string {
  if (typeof input === 'string') return input
  return input instanceof URL ? input.href : input.url
}

/** Serve each request from `byLang`, keyed by the `lang` query param. */
function stubBackend(byLang: Record<string, Reply>) {
  vi.stubGlobal(
    'fetch',
    vi.fn(async (input: Request | URL | string) => {
      const url = urlOf(input)
      calls.push(url)
      const lang = new URL(url).searchParams.get('lang') ?? ''
      const reply =
        byLang[lang] ?? { status: 400, body: { message: `unsupported language: ${lang}` } }
      const status = reply.status ?? 200
      const body = reply.body ?? []
      return {
        ok: status >= 200 && status < 300,
        status,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => body,
        text: async () => JSON.stringify(body),
        clone() {
          return this
        },
      } as unknown as Response
    }),
  )
}

const langsRequested = () => calls.map((url) => new URL(url).searchParams.get('lang'))

const CHAPTER = { chapter_number: 1, title: 'The Key', verse_count: 7, revelation_order: 5 }

describe('fetchChapters / fetchAppendices', () => {
  beforeEach(() => {
    calls = []
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('requests the mapped language, never the raw UI locale', async () => {
    stubBackend({ en: { body: [CHAPTER] } })

    await expect(fetchChapters('ckb')).resolves.toEqual([CHAPTER])
    // The unmapped `ckb` would have 400'd; English answers on the first try, so
    // there is no retry either.
    expect(langsRequested()).toEqual(['en'])
  })

  it('degrades to English when the reader language fails', async () => {
    stubBackend({
      de: { status: 500, body: { message: 'boom' } },
      en: { body: [CHAPTER] },
    })

    await expect(fetchChapters('de')).resolves.toEqual([CHAPTER])
    expect(langsRequested()).toEqual(['de', 'en'])
  })

  it('resolves to an empty list when English fails too', async () => {
    stubBackend({})

    await expect(fetchChapters('de')).resolves.toEqual([])
    expect(langsRequested()).toEqual(['de', 'en'])
  })

  it('resolves to an empty list when the request throws', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => {
        throw new Error('network down')
      }),
    )

    await expect(fetchChapters('en')).resolves.toEqual([])
  })

  it('keeps a successful empty result instead of substituting English', async () => {
    // de/fr/tr have no appendices seeded and legitimately answer 200 []. Quietly
    // swapping in English titles there would change what those readers see.
    stubBackend({ de: { body: [] }, en: { body: [{ code: 1, title: 'One of the Great Miracles' }] } })

    await expect(fetchAppendices('de')).resolves.toEqual([])
    expect(langsRequested()).toEqual(['de'])
  })

  it('does not retry when the reader already reads English', async () => {
    stubBackend({})

    await expect(fetchChapters('en')).resolves.toEqual([])
    expect(langsRequested()).toEqual(['en'])
  })
})
