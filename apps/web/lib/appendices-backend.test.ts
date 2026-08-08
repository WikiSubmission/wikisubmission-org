import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// appendices-backend lives in packages/shared (@/lib/appendices-backend); the
// test is colocated in apps/web because that is where the vitest project scans.
import {
  fetchAppendices,
  fetchAppendix,
  hasEditorialBody,
  type EditorialAppendix,
} from '@/lib/appendices-backend'

const BASE = 'https://api.test/api/v1'

function dto(overrides: Record<string, unknown> = {}) {
  return {
    id: 7,
    code: '19',
    title: 'Hadith and Sunna: Satanic Innovations',
    snippet: 'The Quran is complete, perfect and fully detailed.',
    language: 'en',
    version_slug: 'authorized-translation',
    version_name: 'Authorized Translation',
    direction: 'ltr',
    published_at: '2026-04-27T18:46:24Z',
    updated_at: '2026-04-27T18:46:24Z',
    ...overrides,
  }
}

const ok = (data: unknown) =>
  ({ ok: true, json: async () => ({ data }) }) as unknown as Response
const notFound = () =>
  ({ ok: false, json: async () => ({}) }) as unknown as Response

let fetchMock: ReturnType<typeof vi.fn>

beforeEach(() => {
  // jsdom defines `window`, so the client resolves the browser base URL.
  vi.stubEnv('NEXT_PUBLIC_BROWSER_API_URL', BASE)
  fetchMock = vi.fn()
  vi.stubGlobal('fetch', fetchMock)
})

afterEach(() => {
  vi.unstubAllEnvs()
  vi.unstubAllGlobals()
})

describe('fetchAppendix', () => {
  it('maps the wire DTO onto the reader view shape', async () => {
    fetchMock.mockResolvedValueOnce(ok(dto({ body: '## Heading\n\ntext' })))

    const appendix = await fetchAppendix(19)

    expect(appendix).toMatchObject({
      id: 7,
      code: '19',
      number: 19,
      title: 'Hadith and Sunna: Satanic Innovations',
      body: '## Heading\n\ntext',
      versionSlug: 'authorized-translation',
      direction: 'ltr',
    })
  })

  it('requests the language-scoped path', async () => {
    fetchMock.mockResolvedValueOnce(ok(dto()))
    await fetchAppendix(19)
    expect(fetchMock).toHaveBeenCalledWith(
      `${BASE}/editorial/public/appendices/en/19`,
      expect.anything()
    )
  })

  it('falls back to English when the requested language has no row', async () => {
    fetchMock.mockResolvedValueOnce(notFound()).mockResolvedValueOnce(ok(dto()))

    const appendix = await fetchAppendix(19, 'ar')

    expect(appendix?.code).toBe('19')
    expect(fetchMock).toHaveBeenNthCalledWith(
      1,
      `${BASE}/editorial/public/appendices/ar/19`,
      expect.anything()
    )
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      `${BASE}/editorial/public/appendices/en/19`,
      expect.anything()
    )
  })

  it('does not retry English when English itself is missing', async () => {
    fetchMock.mockResolvedValue(notFound())
    expect(await fetchAppendix(19)).toBeNull()
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('returns null instead of throwing when the backend is unreachable', async () => {
    fetchMock.mockRejectedValue(new Error('ECONNREFUSED'))
    expect(await fetchAppendix(19)).toBeNull()
  })

  it('leaves number null for a non-numeric code', async () => {
    fetchMock.mockResolvedValueOnce(ok(dto({ code: 'intro' })))
    expect((await fetchAppendix('intro'))?.number).toBeNull()
  })

  it('normalizes an unexpected direction to ltr', async () => {
    fetchMock.mockResolvedValueOnce(ok(dto({ direction: 'sideways' })))
    expect((await fetchAppendix(19))?.direction).toBe('ltr')
  })

  it('keeps rtl when the owning version is right-to-left', async () => {
    fetchMock.mockResolvedValueOnce(ok(dto({ direction: 'rtl' })))
    expect((await fetchAppendix(19))?.direction).toBe('rtl')
  })
})

describe('fetchAppendices', () => {
  it('returns an empty list rather than null when the read fails', async () => {
    fetchMock.mockResolvedValue(notFound())
    expect(await fetchAppendices()).toEqual([])
  })

  it('maps a listing and defaults the missing body to an empty string', async () => {
    fetchMock.mockResolvedValueOnce(
      ok([dto({ code: '1' }), dto({ code: '2' })])
    )

    const list = await fetchAppendices()

    expect(list.map((a) => a.number)).toEqual([1, 2])
    expect(list.every((a) => a.body === '')).toBe(true)
  })
})

describe('hasEditorialBody', () => {
  const withBody = (body: string): EditorialAppendix =>
    ({ body }) as unknown as EditorialAppendix

  it('is false for null, empty and whitespace-only bodies', () => {
    expect(hasEditorialBody(null)).toBe(false)
    expect(hasEditorialBody(withBody(''))).toBe(false)
    expect(hasEditorialBody(withBody('   \n\t '))).toBe(false)
  })

  it('is true once real prose exists', () => {
    expect(hasEditorialBody(withBody('# Appendix'))).toBe(true)
  })
})
