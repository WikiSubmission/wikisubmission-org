/**
 * Development host for the desktop app, standing in for the Electron shell:
 * starts the ws-backend sidecar, proxies /api/ws/* to it with the local
 * user's token, and serves the app.
 *
 *   pnpm host:dev      app from `next dev` on :3100 (run `pnpm dev` too)
 *   pnpm host:static   app from the static export in out/ (run `pnpm build`)
 *
 * Settings come from environment variables, or from host.config.local.json
 * (gitignored) with the same names as keys:
 *   WS_DESKTOP_SIDECAR     path to the ws-backend desktop binary (required)
 *   WS_DESKTOP_PG_ARCHIVE  folder with embedded-postgres-binaries-*.txz (required)
 *   WS_DESKTOP_SNAPSHOT    content snapshot folder (required)
 *   WS_DESKTOP_DATA        database folder (default: ./.desktop-data)
 *   WS_DESKTOP_HOST_PORT   port to serve on (default: 3200)
 */
import fs from 'node:fs'
import http from 'node:http'
import net from 'node:net'
import path from 'node:path'
import { startSidecar } from './sidecar.mts'
import { backendPathFor, proxyToSidecar } from './api-proxy.mts'
import { resolveStatic } from './static-routes.mts'

const appDir = path.resolve(import.meta.dirname, '..')
const staticMode = process.argv.includes('--static')
const outDir = path.join(appDir, 'out')
const NEXT_DEV = { host: '127.0.0.1', port: 3100 }

const localConfigPath = path.join(appDir, 'host.config.local.json')
const localConfig: Record<string, string> = fs.existsSync(localConfigPath)
  ? JSON.parse(fs.readFileSync(localConfigPath, 'utf8'))
  : {}

function setting(name: string): string | undefined {
  return process.env[name] || localConfig[name]
}

function required(name: string): string {
  const v = setting(name)
  if (!v) {
    console.error(`Set ${name}. See the header of host/dev-host.mts.`)
    process.exit(2)
  }
  return v
}

const sidecar = await startSidecar({
  binary: required('WS_DESKTOP_SIDECAR'),
  pgArchiveDir: required('WS_DESKTOP_PG_ARCHIVE'),
  snapshotDir: required('WS_DESKTOP_SNAPSHOT'),
  dataDir: setting('WS_DESKTOP_DATA') ?? path.join(appDir, '.desktop-data'),
  onLog: (line) => {
    // The sidecar logs JSON; show only warnings and errors here.
    if (/"level":"(WARN|ERROR)"/.test(line) || !line.startsWith('{')) console.error('[backend]', line)
  },
})
console.log(`[host] backend ready on 127.0.0.1:${sidecar.port}`)

if (staticMode && !fs.existsSync(outDir)) {
  console.error('[host] out/ is missing; run `pnpm build` first')
  await sidecar.stop()
  process.exit(2)
}

function serveStatic(req: http.IncomingMessage, res: http.ServerResponse, url: URL) {
  const r = resolveStatic(outDir, url.pathname, url.search)
  if (r.kind === 'redirect') {
    res.writeHead(302, { location: r.location })
    res.end()
    return
  }
  if (r.kind === 'not-found') {
    res.writeHead(404, { 'content-type': 'text/html; charset=utf-8' })
    if (r.file) fs.createReadStream(r.file).pipe(res)
    else res.end('Not found')
    return
  }
  res.writeHead(200, { 'content-type': r.contentType })
  if (req.method === 'HEAD') res.end()
  else fs.createReadStream(r.file).pipe(res)
}

function proxyToNextDev(req: http.IncomingMessage, res: http.ServerResponse) {
  const upstream = http.request(
    { ...NEXT_DEV, method: req.method, path: req.url, headers: req.headers },
    (up) => {
      res.writeHead(up.statusCode ?? 502, up.headers)
      up.pipe(res)
    },
  )
  upstream.on('error', () => {
    if (!res.headersSent) res.writeHead(502, { 'content-type': 'text/plain' })
    res.end('next dev is not running on :3100 (pnpm dev)')
  })
  req.pipe(upstream)
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url ?? '/', 'http://localhost')
  const backendPath = backendPathFor(url.pathname)
  if (backendPath) {
    proxyToSidecar(req, res, backendPath + url.search, sidecar)
    return
  }
  if (staticMode) serveStatic(req, res, url)
  else proxyToNextDev(req, res)
})

// Hot reload websocket for next dev.
server.on('upgrade', (req, socket, head) => {
  if (staticMode) {
    socket.destroy()
    return
  }
  const upstream = net.connect(NEXT_DEV.port, NEXT_DEV.host, () => {
    const lines = [`${req.method} ${req.url} HTTP/${req.httpVersion}`]
    for (let i = 0; i < req.rawHeaders.length; i += 2) lines.push(`${req.rawHeaders[i]}: ${req.rawHeaders[i + 1]}`)
    upstream.write(lines.join('\r\n') + '\r\n\r\n')
    upstream.write(head)
    upstream.pipe(socket)
    socket.pipe(upstream)
  })
  upstream.on('error', () => socket.destroy())
  socket.on('error', () => upstream.destroy())
})

const port = Number(setting('WS_DESKTOP_HOST_PORT') ?? process.env.PORT ?? 3200)
server.listen(port, '127.0.0.1', () => {
  console.log(`[host] ${staticMode ? 'serving out/' : 'proxying next dev'} at http://127.0.0.1:${port}/`)
})

let shuttingDown = false
async function shutdown() {
  if (shuttingDown) return
  shuttingDown = true
  console.log('[host] stopping')
  server.close()
  await sidecar.stop()
  process.exit(0)
}
process.on('SIGINT', shutdown)
process.on('SIGTERM', shutdown)
void sidecar.exited.then((code) => {
  if (!shuttingDown) {
    console.error(`[host] backend exited unexpectedly (code ${code})`)
    process.exit(1)
  }
})
