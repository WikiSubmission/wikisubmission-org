import http from 'node:http'

/** Same-origin path the app calls; the web app proxies it the same way. */
export const API_PREFIX = '/api/ws/'

/** `/api/ws/quran?x` → `/api/v1/quran?x`, or null when not an API path. */
export function backendPathFor(urlPath: string): string | null {
  if (!urlPath.startsWith(API_PREFIX)) return null
  return '/api/v1/' + urlPath.slice(API_PREFIX.length)
}

/** Whether a renderer request header may be forwarded to the sidecar. */
export function isForwardedRequestHeader(name: string): boolean {
  return !DROP_REQUEST_HEADERS.has(name.toLowerCase())
}

// Hop-by-hop and credential headers never forwarded from the renderer.
const DROP_REQUEST_HEADERS = new Set([
  'host',
  'authorization',
  'cookie',
  'connection',
  'keep-alive',
  'proxy-authorization',
  'te',
  'trailer',
  'transfer-encoding',
  'upgrade',
  'origin',
  'referer',
])

/**
 * Forwards one renderer request to the sidecar on 127.0.0.1, replacing any
 * credentials with the local user's token. The token lives only here, in the
 * host process.
 */
export function proxyToSidecar(
  req: http.IncomingMessage,
  res: http.ServerResponse,
  backendPath: string,
  sidecar: { port: number; token: string },
): void {
  const headers: http.OutgoingHttpHeaders = {}
  for (const [k, v] of Object.entries(req.headers)) {
    if (isForwardedRequestHeader(k) && v !== undefined) headers[k] = v
  }
  headers.host = `127.0.0.1:${sidecar.port}`
  headers.authorization = `Bearer ${sidecar.token}`

  const upstream = http.request(
    { host: '127.0.0.1', port: sidecar.port, method: req.method, path: backendPath, headers },
    (up) => {
      res.writeHead(up.statusCode ?? 502, up.headers)
      up.pipe(res)
    },
  )
  upstream.on('error', () => {
    if (!res.headersSent) res.writeHead(502, { 'content-type': 'application/json' })
    res.end(JSON.stringify({ error: 'the local backend is not reachable' }))
  })
  req.pipe(upstream)
}
