import { Capacitor } from '@capacitor/core'
import { Preferences } from '@capacitor/preferences'
import { parseManifest } from '@/lib/offline/manifest'
import { nativeCatalog } from './native-catalog'
import { sqlite } from './native-db'

/**
 * First-run seeding of the offline bundles pre-packaged in the app binary.
 *
 * The prebuild script (scripts/fetch-offline-bundles.mjs) places verified .db
 * files plus a manifest snapshot under public/assets/databases/. On device,
 * copyFromAssets moves every asset .db into the plugin's database directory
 * under the exact name a runtime download would use (<url filename stem>), so
 * once the catalog is seeded the bundles are indistinguishable from downloaded
 * ones — the existing reader, search, and downloads UI all just work.
 *
 * Guards:
 * - a Preferences flag keyed by the snapshot's max data_version, so a user who
 *   deliberately removes a bundle is not re-seeded on next launch;
 * - per-bundle, the catalog only gains entries that are absent or older than
 *   the bundled data_version (never downgrades a newer runtime download).
 */
const FLAG_PREFIX = 'ws-offline-preinstalled-v'

function dbNameFromUrl(url: string): string {
  const file = url.split('?')[0].split('/').pop() ?? ''
  return file.replace(/\.db$/i, '')
}

export async function preinstallBundledContent(): Promise<void> {
  if (!Capacitor.isNativePlatform()) return

  let manifest
  try {
    const res = await fetch('/assets/databases/bundled-manifest.json')
    if (!res.ok) return // prebuild script not run — nothing pre-packaged
    manifest = parseManifest(await res.json())
  } catch {
    return
  }
  if (manifest.bundles.length === 0) return

  const maxDataVersion = Math.max(...manifest.bundles.map((b) => b.dataVersion))
  const flagKey = `${FLAG_PREFIX}${maxDataVersion}`
  try {
    if ((await Preferences.get({ key: flagKey })).value) return
  } catch {
    // Unreadable flag: fall through — seeding is idempotent per the guards below.
  }

  try {
    await sqlite().copyFromAssets(false)
  } catch (error) {
    // Missing/empty assets dir throws; without the files there is nothing to seed.
    console.warn('[offline] copyFromAssets failed', error)
    return
  }

  const installed = await nativeCatalog.list()
  for (const bundle of manifest.bundles) {
    const existing = installed.find((b) => b.id === bundle.id)
    if (existing && existing.dataVersion >= bundle.dataVersion) continue
    await nativeCatalog.upsert({
      id: bundle.id,
      scripture: bundle.scripture,
      lang: bundle.lang,
      kind: bundle.kind ?? 'text',
      bytes: bundle.bytes,
      sha256: bundle.sha256,
      dataVersion: bundle.dataVersion,
      schemaVersion: bundle.schemaVersion,
      normalizationVersion: bundle.normalizationVersion,
      ftsTokenizer: bundle.ftsTokenizer,
      installedAt: Date.now(),
      dbName: dbNameFromUrl(bundle.url),
    })
  }

  await Preferences.set({ key: flagKey, value: String(Date.now()) })
}
