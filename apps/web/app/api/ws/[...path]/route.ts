import { NextRequest, NextResponse } from 'next/server'
import { resolveServerApiBaseUrl } from '@/src/api/base-url'

const FETCH_TIMEOUT_MS = 30_000
const HOP_BY_HOP_HEADERS = new Set([
  'connection',
  'keep-alive',
  'proxy-authenticate',
  'proxy-authorization',
  'te',
  'trailer',
  'transfer-encoding',
  'upgrade',
])

async function proxyRequest(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const baseUrl = resolveServerApiBaseUrl()
  if (!baseUrl) {
    return NextResponse.json({ error: 'Backend API is not configured.' }, { status: 500 })
  }

  const { path } = await params
  const upstreamUrl = new URL(path.map(encodeURIComponent).join('/'), `${baseUrl}/`)
  upstreamUrl.search = request.nextUrl.search

  // Temporary auth diagnostic: for /me/* the request must carry a user bearer
  // token. Log only whether the header is present (never its value) so we can
  // tell a missing browser token apart from a header stripped in transit.
  // Remove once the /me 400s are resolved.
  if (path[0] === 'me') {
    const authHeader = request.headers.get('authorization')
    console.warn('[ws-proxy] /me request', {
      path: path.join('/'),
      hasAuthorization: !!authHeader,
      authScheme: authHeader ? authHeader.split(' ')[0] : null,
      hasCookie: !!request.headers.get('cookie'),
    })
  }

  const headers = new Headers()
  for (const [key, value] of request.headers) {
    const lower = key.toLowerCase()
    if (HOP_BY_HOP_HEADERS.has(lower) || lower === 'host') continue
    headers.set(key, value)
  }

  const method = request.method.toUpperCase()
  const hasBody = method !== 'GET' && method !== 'HEAD'
  const body = hasBody ? await request.arrayBuffer() : undefined

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS)

  try {
    const upstream = await fetch(upstreamUrl, {
      method,
      headers,
      body,
      cache: 'no-store',
      signal: controller.signal,
    })

    const responseHeaders = new Headers()
    const contentType = upstream.headers.get('content-type')
    if (contentType) responseHeaders.set('content-type', contentType)
    responseHeaders.set('cache-control', 'no-store')

    return new NextResponse(await upstream.arrayBuffer(), {
      status: upstream.status,
      statusText: upstream.statusText,
      headers: responseHeaders,
    })
  } catch (error) {
    const message =
      error instanceof Error && error.name === 'AbortError'
        ? 'Backend API timed out.'
        : 'Backend API is unavailable.'

    return NextResponse.json({ error: message }, { status: 502 })
  } finally {
    clearTimeout(timeout)
  }
}

export const GET = proxyRequest
export const POST = proxyRequest
export const PUT = proxyRequest
export const PATCH = proxyRequest
export const DELETE = proxyRequest
