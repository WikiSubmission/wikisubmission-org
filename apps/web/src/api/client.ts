import createClient, { type Middleware } from 'openapi-fetch'
import { getSession } from 'next-auth/react'
import type { paths } from './types.gen'
import { resolveBrowserApiBaseUrl } from './base-url'

export const wsApi = createClient<paths>({
  baseUrl: resolveBrowserApiBaseUrl(),
})

const authMiddleware: Middleware = {
  async onRequest({ request }) {
    const session = await getSession()
    if (session?.accessToken) {
      request.headers.set('Authorization', `Bearer ${session.accessToken}`)
    }
    return request
  },
}

wsApi.use(authMiddleware)
