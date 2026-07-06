#!/usr/bin/env node
/**
 * Prebuild step: download the offline content bundles that ship inside the app
 * into public/assets/databases/, where @capacitor-community/sqlite's
 * copyFromAssets picks them up on first launch (see lib/offline/preinstall.ts).
 *
 * Idempotent: existing files with a matching sha256 are kept; stale .db files
 * (old versions, deselected bundles) are removed so they never reach the APK.
 * Bundles missing from the manifest (e.g. not published yet) are skipped with a
 * warning rather than failing the build.
 *
 * Config:
 *   NEXT_PUBLIC_OFFLINE_MANIFEST_URL  manifest override (defaults to prod CDN)
 *   OFFLINE_PREPACKAGE_IDS            comma-separated bundle ids to pre-package
 */
import { createHash } from 'node:crypto'
import { mkdir, readdir, readFile, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const MANIFEST_URL =
  process.env.NEXT_PUBLIC_OFFLINE_MANIFEST_URL ??
  'https://cdn.wikisubmission.org/offline/manifest.json'
const BUNDLE_IDS = (process.env.OFFLINE_PREPACKAGE_IDS ?? 'quran-en,quran-ar,library-en')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean)

const outDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'public', 'assets', 'databases')

function sha256(buffer) {
  return createHash('sha256').update(buffer).digest('hex')
}

function fileNameFromUrl(url) {
  return new URL(url).pathname.split('/').pop()
}

async function existingHashMatches(filePath, expected) {
  try {
    return sha256(await readFile(filePath)) === expected
  } catch {
    return false
  }
}

async function main() {
  console.log(`[offline-bundles] manifest: ${MANIFEST_URL}`)
  const res = await fetch(MANIFEST_URL, { cache: 'no-store' })
  if (!res.ok) throw new Error(`manifest fetch failed: ${res.status} ${res.statusText}`)
  const manifest = await res.json()
  if (!Array.isArray(manifest?.bundles)) throw new Error('malformed manifest: missing bundles[]')

  await mkdir(outDir, { recursive: true })

  const selected = []
  for (const id of BUNDLE_IDS) {
    const bundle = manifest.bundles.find((b) => b.id === id)
    if (!bundle) {
      console.warn(`[offline-bundles] WARNING: bundle "${id}" not in manifest — skipping`)
      continue
    }
    selected.push(bundle)
  }
  if (selected.length === 0) throw new Error('no requested bundles found in manifest')

  const keepFiles = new Set(selected.map((b) => fileNameFromUrl(b.url)))
  for (const entry of await readdir(outDir)) {
    if (entry.endsWith('.db') && !keepFiles.has(entry)) {
      console.log(`[offline-bundles] removing stale ${entry}`)
      await rm(path.join(outDir, entry))
    }
  }

  for (const bundle of selected) {
    const fileName = fileNameFromUrl(bundle.url)
    const filePath = path.join(outDir, fileName)

    if (await existingHashMatches(filePath, bundle.sha256)) {
      console.log(`[offline-bundles] ${fileName} up to date`)
      continue
    }

    console.log(`[offline-bundles] downloading ${bundle.url} (${(bundle.bytes / 1e6).toFixed(1)} MB)`)
    const dl = await fetch(bundle.url)
    if (!dl.ok) throw new Error(`${bundle.id}: download failed: ${dl.status} ${dl.statusText}`)
    const bytes = Buffer.from(await dl.arrayBuffer())

    const digest = sha256(bytes)
    if (digest !== bundle.sha256) {
      throw new Error(`${bundle.id}: sha256 mismatch (expected ${bundle.sha256}, got ${digest})`)
    }
    await writeFile(filePath, bytes)
    console.log(`[offline-bundles] wrote ${fileName}`)
  }

  // Snapshot of the selected manifest entries (wire format) for first-run
  // catalog seeding on device.
  await writeFile(
    path.join(outDir, 'bundled-manifest.json'),
    JSON.stringify({ bundles: selected }, null, 2),
  )
  console.log(`[offline-bundles] wrote bundled-manifest.json (${selected.map((b) => b.id).join(', ')})`)
}

main().catch((error) => {
  console.error(`[offline-bundles] ${error?.message ?? error}`)
  process.exit(1)
})
