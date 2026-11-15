import fs from 'node:fs/promises'
import { protocol } from 'electron'
import { resolveStatic } from '../host/static-routes.mts'
import { backendPathFor, isForwardedRequestHeader } from '../host/api-proxy.mts'

export const APP_SCHEME = 'app'
export const APP_HOST = 'wikisubmission'
export const APP_ORIGIN = `${APP_SCHEME}://${APP_HOST}`

/**
 * Must run before the app is ready. `standard` and `secure` give the scheme a
 * real origin (so storage, workers and crypto.subtle work); `supportFetchAPI`
 * and `stream` let the page fetch the proxied API.
 */
export function registerAppScheme(): void {
  protocol.registerSchemesAsPrivileged([
    {
      scheme: APP_SCHEME,
      privileges: {
        standard: true,
        secure: true,
        supportFetchAPI: true,
        stream: true,
        corsEnabled: true,
        codeCache: true,
      },
    },
  ])
}

/**
 * Content Security Policy for every page. Next's static export relies on
 * inline scripts and styles. The only remote resources are the recitation
 * audio CDN and appendix videos.
 */
export const CONTENT_SECURITY_POLICY = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://i.ytimg.com",
  "font-src 'self' data:",
  "connect-src 'self' https://cdn.wikisubmission.org",
  "media-src 'self' blob: https://cdn.wikisubmission.org",
  'frame-src https://www.youtube-nocookie.com https://www.youtube.com',
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join('; ')

/**
 * Serves app://wikisubmission/: the static export from `outDir`, and the API
 * under /api/ws/ from the sidecar with the local user's token added. The
 * token stays in the main process.
 */
export function handleAppProtocol(outDir: string, sidecar: { port: number; token: string }): void {
  protocol.handle(APP_SCHEME, async (request) => {
    const url = new URL(request.url)
    if (url.host !== APP_HOST) return new Response('Not found', { status: 404 })

    const backendPath = backendPathFor(url.pathname)
    if (backendPath) return proxyApi(request, backendPath + url.search, sidecar)

    if (request.method !== 'GET' && request.method !== 'HEAD') {
      return new Response('Method not allowed', { status: 405 })
    }

    const r = resolveStatic(outDir, url.pathname, url.search)
    if (r.kind === 'redirect') {
      return new Response(null, { status: 302, headers: { location: r.location } })
    }
    if (r.kind === 'not-found') {
      const body = r.file ? await fs.readFile(r.file) : 'Not found'
      return new Response(body, {
        status: 404,
        headers: { 'content-type': 'text/html; charset=utf-8', 'content-security-policy': CONTENT_SECURITY_POLICY },
      })
    }
    const headers: Record<string, string> = { 'content-type': r.contentType }
    if (r.contentType.startsWith('text/html')) headers['content-security-policy'] = CONTENT_SECURITY_POLICY
    // Hashed build assets never change within a version.
    if (url.pathname.startsWith('/_next/static/')) headers['cache-control'] = 'public, max-age=31536000, immutable'
    return new Response(request.method === 'HEAD' ? null : await fs.readFile(r.file), { headers })
  })
}

async function proxyApi(
  request: Request,
  backendPath: string,
  sidecar: { port: number; token: string },
): Promise<Response> {
  const headers = new Headers()
  request.headers.forEach((value, key) => {
    if (isForwardedRequestHeader(key)) headers.set(key, value)
  })
  headers.set('authorization', `Bearer ${sidecar.token}`)
  // Node's fetch would decompress a gzipped answer but keep its
  // content-encoding header, so the page would try to decode it twice.
  headers.set('accept-encoding', 'identity')

  const hasBody = request.method !== 'GET' && request.method !== 'HEAD'
  try {
    const upstream = await fetch(`http://127.0.0.1:${sidecar.port}${backendPath}`, {
      method: request.method,
      headers,
      body: hasBody ? await request.arrayBuffer() : undefined,
      redirect: 'manual',
    })
    const out = new Headers(upstream.headers)
    out.delete('content-encoding')
    out.delete('content-length')
    return new Response(upstream.body, { status: upstream.status, headers: out })
  } catch {
    return new Response(JSON.stringify({ error: 'the local backend is not reachable' }), {
      status: 502,
      headers: { 'content-type': 'application/json' },
    })
  }
}
