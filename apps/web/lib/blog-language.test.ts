import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { fetchArticleBySlug, fetchArticles, searchArticles } from '@/lib/blog-backend'
import { DEFAULT_BLOG_LANGUAGE, toSanityLanguage } from '@/lib/blog-queries'

/**
 * The public blog used to clamp the reader's locale to a hardcoded en/fr/ar/tr
 * list, so an article published in any other language was unreachable. These
 * tests pin the replacement: the locale reaches the backend untouched, and
 * English is used only when the reader's language comes back with nothing.
 *
 * fetch is stubbed rather than pointed at ws-backend because the assertion is
 * about the request this client builds (which language code goes out, and how
 * many calls follow an empty result), which a live backend cannot show.
 */

type Reply = { data: unknown }

let calls: string[] = []

/** Serve each request from `byLanguage`, keyed by the `language` in the URL. */
function stubBackend(byLanguage: Record<string, unknown[]>) {
  vi.stubGlobal(
    'fetch',
    vi.fn(async (url: string) => {
      calls.push(url)
      const lang = url.match(/[?&]language=([^&]*)/)?.[1] ?? url.split('/')[4] ?? ''
      const data = byLanguage[decodeURIComponent(lang)] ?? []
      return {
        ok: true,
        json: async (): Promise<Reply> => ({ data }),
      } as unknown as Response
    }),
  )
}

const article = (slug: string) => ({
  id: 1,
  slug,
  language: 'de',
  title: slug,
  excerpt: '',
  thumbnail_url: '',
  category: '',
  category_slug: '',
  author_name: '',
  author_photo_url: '',
  published_at: null,
  updated_at: '',
})

function languagesRequested(): string[] {
  return calls.map((url) => decodeURIComponent(url.match(/[?&]language=([^&]*)/)?.[1] ?? ''))
}

beforeEach(() => {
  calls = []
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('toSanityLanguage', () => {
  it('passes through languages outside the retired en/fr/ar/tr list', () => {
    for (const code of ['de', 'ckb', 'kmr', 'fa', 'ur', 'pt-br']) {
      expect(toSanityLanguage(code)).toBe(code)
    }
  })

  it('normalizes case and surrounding whitespace', () => {
    expect(toSanityLanguage('  DE ')).toBe('de')
  })

  it('falls back to English for a missing or malformed locale', () => {
    for (const value of ['', '   ', '../en', 'not a locale', null, undefined]) {
      expect(toSanityLanguage(value)).toBe(DEFAULT_BLOG_LANGUAGE)
    }
  })

  it('never returns an empty code, which the backend reads as every language', () => {
    for (const value of ['', null, undefined, '!!']) {
      expect(toSanityLanguage(value)).not.toBe('')
    }
  })
})

describe('fetchArticles', () => {
  it('requests the reader language verbatim and returns its articles', async () => {
    stubBackend({ de: [article('gott-ist-einer')], en: [article('you-always-deal-with-god')] })

    const posts = await fetchArticles('de')

    expect(posts.map((p) => p.slug.current)).toEqual(['gott-ist-einer'])
    expect(languagesRequested()).toEqual(['de'])
  })

  it('falls back to English when the reader language has nothing published', async () => {
    stubBackend({ en: [article('you-always-deal-with-god')] })

    const posts = await fetchArticles('de')

    expect(posts.map((p) => p.slug.current)).toEqual(['you-always-deal-with-god'])
    expect(languagesRequested()).toEqual(['de', 'en'])
  })

  it('does not issue a second request when English itself is empty', async () => {
    stubBackend({})

    expect(await fetchArticles('en')).toEqual([])
    expect(languagesRequested()).toEqual(['en'])
  })
})

describe('searchArticles', () => {
  it('falls back to English so search finds the articles the reader can see', async () => {
    stubBackend({ en: [article('you-always-deal-with-god')] })

    const posts = await searchArticles('god', 'ckb')

    expect(posts).toHaveLength(1)
    expect(languagesRequested()).toEqual(['ckb', 'en'])
  })
})

describe('fetchArticleBySlug', () => {
  it('retries the English slug when the localized one is missing', async () => {
    // Path reads are /editorial/public/articles/<lang>/<slug>, so the stub keys
    // off the path segment rather than a query parameter.
    vi.stubGlobal(
      'fetch',
      vi.fn(async (url: string) => {
        calls.push(url)
        const found = url.includes('/en/')
        return {
          ok: found,
          json: async (): Promise<Reply> => ({ data: found ? article('a-slug') : null }),
        } as unknown as Response
      }),
    )

    const post = await fetchArticleBySlug('a-slug', 'de')

    expect(post?.slug?.current).toBe('a-slug')
    expect(calls).toHaveLength(2)
    expect(calls[0]).toContain('/de/a-slug')
    expect(calls[1]).toContain('/en/a-slug')
  })
})
