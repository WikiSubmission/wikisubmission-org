import createClient, { type Middleware } from 'openapi-fetch'
import type { paths } from './types.gen'
import { resolveBrowserApiBaseUrl } from './base-url'

/**
 * Resolves the bearer token attached to every browser API request.
 *
 * The token source is injected per platform so this client stays free of any
 * auth dependency. On web it is backed by next-auth's getSession(); on the
 * native (Capacitor) app it reads the stored mobile session token. Until a
 * provider is registered it returns undefined and requests go out unauthed.
 */
export type AccessTokenProvider = () => Promise<string | undefined>

let accessTokenProvider: AccessTokenProvider = async () => undefined

export function setAccessTokenProvider(provider: AccessTokenProvider): void {
  accessTokenProvider = provider
}

export const wsApi = createClient<paths>({
  baseUrl: resolveBrowserApiBaseUrl(),
})

const authMiddleware: Middleware = {
  async onRequest({ request }) {
    const token = await accessTokenProvider()
    if (token) {
      request.headers.set('Authorization', `Bearer ${token}`)
    }
    return request
  },
}

wsApi.use(authMiddleware)
