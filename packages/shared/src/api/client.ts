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

/**
 * Called when a request comes back 401 despite carrying a bearer token.
 * Returns a fresh access token (after rotating the session) or undefined if
 * the session cannot be recovered. Platforms with refresh tokens (the native
 * app) register one; the web app's next-auth session has its own lifecycle
 * and leaves this unset. Implementations must single-flight themselves —
 * concurrent 401s all await the same rotation.
 */
export type AuthRefreshHandler = () => Promise<string | undefined>

let authRefreshHandler: AuthRefreshHandler | undefined

export function setAuthRefreshHandler(handler: AuthRefreshHandler): void {
  authRefreshHandler = handler
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
  async onResponse({ request, response }) {
    // Expired-token recovery: rotate the session once and replay the request.
    if (response.status !== 401 || !authRefreshHandler) return response
    if (!request.headers.get('Authorization')) return response

    const fresh = await authRefreshHandler()
    if (!fresh) return response

    // The original Request's body stream is already consumed by the failed
    // attempt, so only bodyless methods can be replayed. Bodied calls still
    // benefit: the session is rotated, so the caller's retry succeeds.
    if (request.method !== 'GET' && request.method !== 'HEAD') return response

    const headers = new Headers(request.headers)
    headers.set('Authorization', `Bearer ${fresh}`)
    return fetch(new Request(request.url, { method: request.method, headers }))
  },
}

wsApi.use(authMiddleware)
