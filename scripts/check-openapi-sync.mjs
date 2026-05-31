#!/usr/bin/env node
// Regression guard: ensures the frontend-local openapi.yaml is byte-for-byte
// in sync with the canonical spec from ws-backend. Run after any backend
// schema change before regenerating types.
//
// Usage: pnpm test:contract
//        (or: node scripts/check-openapi-sync.mjs)

import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import { createHash } from 'crypto'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, '..')

function sha256(filePath) {
  const content = readFileSync(filePath)
  return createHash('sha256').update(content).digest('hex')
}

const frontend = resolve(root, 'src/api/openapi.yaml')
const backend = resolve(root, '../ws-backend/openapi.yaml')

let backendExists = true
try {
  readFileSync(backend)
} catch {
  backendExists = false
}

if (!backendExists) {
  console.log('SKIP: ../ws-backend/openapi.yaml not found (running outside monorepo)')
  process.exit(0)
}

const frontendHash = sha256(frontend)
const backendHash = sha256(backend)

if (frontendHash === backendHash) {
  console.log('OK: src/api/openapi.yaml is in sync with ws-backend/openapi.yaml')
  process.exit(0)
} else {
  console.error('FAIL: openapi.yaml is out of sync.')
  console.error('  frontend: src/api/openapi.yaml')
  console.error('  backend:  ../ws-backend/openapi.yaml')
  console.error('')
  console.error('Run: pnpm sync-api && pnpm generate')
  process.exit(1)
}
