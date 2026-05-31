#!/usr/bin/env node
// Regression guard: two checks in one pass.
//
// 1. YAML sync: src/api/openapi.yaml must be byte-for-byte identical to
//    ../ws-backend/openapi.yaml (catches "backend changed but frontend
//    forgot to run pnpm sync-api").
//
// 2. Types sync: src/api/types.gen.ts must be up to date with the local
//    openapi.yaml (catches "yaml was synced but pnpm generate was not run").
//    Runs openapi-typescript in a temp dir and diffs the output.
//
// Usage: pnpm test:contract
//        (or: node scripts/check-openapi-sync.mjs)

import { readFileSync, writeFileSync, mkdirSync, rmSync, existsSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import { createHash } from 'crypto'
import { execSync } from 'child_process'
import { tmpdir } from 'os'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, '..')

function sha256(filePath) {
  const content = readFileSync(filePath)
  return createHash('sha256').update(content).digest('hex')
}

let ok = true

// ── Check 1: yaml sync ────────────────────────────────────────────────────────

const frontendYaml = resolve(root, 'src/api/openapi.yaml')
const backendYaml = resolve(root, '../ws-backend/openapi.yaml')

if (!existsSync(backendYaml)) {
  console.log('SKIP yaml-sync: ../ws-backend/openapi.yaml not found (outside monorepo)')
} else {
  const frontendHash = sha256(frontendYaml)
  const backendHash = sha256(backendYaml)

  if (frontendHash === backendHash) {
    console.log('OK   yaml-sync: src/api/openapi.yaml matches ws-backend/openapi.yaml')
  } else {
    console.error('FAIL yaml-sync: openapi.yaml is out of sync with ws-backend')
    console.error('     Run: pnpm sync-api && pnpm generate')
    ok = false
  }
}

// ── Check 2: types.gen.ts sync ────────────────────────────────────────────────

const existingTypes = resolve(root, 'src/api/types.gen.ts')
const tmp = resolve(tmpdir(), `ws-openapi-check-${process.pid}`)

try {
  mkdirSync(tmp, { recursive: true })
  const tmpOut = resolve(tmp, 'types.gen.ts')

  execSync(
    `node_modules/.bin/openapi-typescript ${frontendYaml} -o ${tmpOut}`,
    { cwd: root, stdio: 'pipe' },
  )

  const existingHash = sha256(existingTypes)
  const freshHash = sha256(tmpOut)

  if (existingHash === freshHash) {
    console.log('OK   types-sync: src/api/types.gen.ts is up to date')
  } else {
    console.error('FAIL types-sync: src/api/types.gen.ts is stale')
    console.error('     Run: pnpm generate')
    ok = false
  }
} catch (err) {
  console.error('FAIL types-sync: could not regenerate types for comparison')
  console.error('    ', err.message)
  ok = false
} finally {
  try { rmSync(tmp, { recursive: true, force: true }) } catch {}
}

process.exit(ok ? 0 : 1)
