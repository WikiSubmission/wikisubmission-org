// Copies the backend pieces the installer ships into build-resources/, laid
// out as electron-builder.yml expects:
//
//   build-resources/backend/ws-backend-desktop[.exe]
//   build-resources/postgres/embedded-postgres-binaries-<os>-<arch>-<ver>.txz
//   build-resources/snapshot/{manifest.json, *.copy.gz}
//
// Sources come from flags, environment variables, or host.config.local.json
// (the same names the dev host uses):
//   --sidecar / WS_DESKTOP_SIDECAR      the ws-backend desktop binary for the target
//   --pg      / WS_DESKTOP_PG_ARCHIVE   a .txz file, or a folder holding exactly one
//   --snapshot / WS_DESKTOP_SNAPSHOT    snapshot folder from cmd/build-desktop-snapshot
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { parseArgs } from 'node:util'

const appDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const outDir = path.join(appDir, 'build-resources')

const { values } = parseArgs({
  options: {
    sidecar: { type: 'string' },
    pg: { type: 'string' },
    snapshot: { type: 'string' },
    platform: { type: 'string' },
  },
})

const configPath = path.join(appDir, 'host.config.local.json')
const config = fs.existsSync(configPath) ? JSON.parse(fs.readFileSync(configPath, 'utf8')) : {}
const pick = (flag, env) => values[flag] || process.env[env] || config[env]

function fail(message) {
  console.error(`stage-resources: ${message}`)
  process.exit(1)
}

const sidecar = pick('sidecar', 'WS_DESKTOP_SIDECAR')
const pg = pick('pg', 'WS_DESKTOP_PG_ARCHIVE')
const snapshot = pick('snapshot', 'WS_DESKTOP_SNAPSHOT')
if (!sidecar || !pg || !snapshot) fail('need --sidecar, --pg and --snapshot (or the WS_DESKTOP_* settings)')

const platform = values.platform || process.platform
const exe = platform === 'win32' ? '.exe' : ''

// Postgres: a file, or a folder with exactly one archive.
let pgArchive = pg
if (fs.statSync(pg).isDirectory()) {
  const found = fs.readdirSync(pg).filter((f) => /^embedded-postgres-binaries-.+\.txz$/.test(f))
  if (found.length !== 1) fail(`expected one embedded-postgres-binaries-*.txz in ${pg}, found ${found.length}`)
  pgArchive = path.join(pg, found[0])
}
const pgOs = { win32: 'windows', darwin: 'darwin', linux: 'linux' }[platform]
if (!path.basename(pgArchive).startsWith(`embedded-postgres-binaries-${pgOs}-`)) {
  fail(`${path.basename(pgArchive)} is not a ${pgOs} build`)
}

const manifestPath = path.join(snapshot, 'manifest.json')
if (!fs.existsSync(manifestPath)) fail(`${snapshot} has no manifest.json`)
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'))

fs.rmSync(outDir, { recursive: true, force: true })
fs.mkdirSync(path.join(outDir, 'backend'), { recursive: true })
fs.mkdirSync(path.join(outDir, 'postgres'), { recursive: true })
fs.mkdirSync(path.join(outDir, 'snapshot'), { recursive: true })

const sidecarDest = path.join(outDir, 'backend', `ws-backend-desktop${exe}`)
fs.copyFileSync(sidecar, sidecarDest)
if (!exe) fs.chmodSync(sidecarDest, 0o755)
fs.copyFileSync(pgArchive, path.join(outDir, 'postgres', path.basename(pgArchive)))

// Only what the manifest lists, so stray files never ship.
fs.copyFileSync(manifestPath, path.join(outDir, 'snapshot', 'manifest.json'))
for (const t of manifest.tables) {
  fs.copyFileSync(path.join(snapshot, t.file), path.join(outDir, 'snapshot', t.file))
}

const size = (p) => fs.statSync(p).size / (1 << 20)
console.log(`staged for ${platform}:`)
console.log(`  backend   ${size(sidecarDest).toFixed(1)} MB`)
console.log(`  postgres  ${path.basename(pgArchive)} (${size(pgArchive).toFixed(1)} MB)`)
console.log(`  snapshot  ${manifest.tables.length} tables, content version ${manifest.content_version}`)
