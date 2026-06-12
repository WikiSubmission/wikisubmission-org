import { NextRequest } from 'next/server'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const authHandlerCalls = vi.hoisted(() => ({ count: 0 }))

vi.mock('@/auth', () => ({
  auth: (handler: (request: NextRequest & { auth?: unknown }) => Response) =>
    (request: NextRequest & { auth?: unknown }) => {
      authHandlerCalls.count += 1
      return handler(request)
    },
}))

import proxy, { getPublicProxyResponse, isAuthProtectedPath } from './proxy'

function request(path: string) {
  return new NextRequest(`https://wikisubmission.org${path}`)
}

const event = {} as Parameters<typeof proxy>[1]

describe('proxy route handling', () => {
  beforeEach(() => {
    authHandlerCalls.count = 0
  })

  it('redirects legacy privacy URL without invoking auth', async () => {
    const response = (await proxy(request('/privacy-policy'), event)) as Response

    expect(response.status).toBe(307)
    expect(response.headers.get('location')).toBe('https://wikisubmission.org/legal/privacy-policy')
    expect(authHandlerCalls.count).toBe(0)
  })

  it('redirects legacy terms URL without invoking auth', async () => {
    const response = (await proxy(request('/terms-of-service'), event)) as Response

    expect(response.status).toBe(307)
    expect(response.headers.get('location')).toBe('https://wikisubmission.org/legal/terms-of-use')
    expect(authHandlerCalls.count).toBe(0)
  })

  it('keeps Quran query redirects public', async () => {
    const response = (await proxy(request('/quran?q=2:255&tab=reader'), event)) as Response

    expect(response.status).toBe(307)
    expect(response.headers.get('location')).toBe('https://wikisubmission.org/quran/2:255?tab=reader')
    expect(authHandlerCalls.count).toBe(0)
  })

  it('does not invoke auth for a normal public page', async () => {
    const response = (await proxy(request('/legal/privacy-policy'), event)) as Response

    expect(response.status).toBe(200)
    expect(authHandlerCalls.count).toBe(0)
  })

  it('only protects account and admin areas', () => {
    expect(isAuthProtectedPath('/me')).toBe(true)
    expect(isAuthProtectedPath('/me/settings')).toBe(true)
    expect(isAuthProtectedPath('/admin')).toBe(true)
    expect(isAuthProtectedPath('/admin/games')).toBe(true)
    expect(isAuthProtectedPath('/quran')).toBe(false)
    expect(isAuthProtectedPath('/legal/privacy-policy')).toBe(false)
  })

  it('returns no public response for normal public pages', () => {
    expect(getPublicProxyResponse(request('/'))).toBeNull()
    expect(getPublicProxyResponse(request('/legal/privacy-policy'))).toBeNull()
  })
})
