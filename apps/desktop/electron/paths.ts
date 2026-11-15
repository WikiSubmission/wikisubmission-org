import fs from 'node:fs'
import path from 'node:path'
import { app } from 'electron'

/** Where everything the shell needs lives, packaged or in development. */
export interface AppPaths {
  /** The static export (`next build` output). */
  outDir: string
  /** The ws-backend desktop sidecar binary. */
  sidecarBinary: string
  /** Folder holding embedded-postgres-binaries-<os>-<arch>-<version>.txz. */
  pgArchiveDir: string
  /** Quran content snapshot (manifest.json plus table files). */
  snapshotDir: string
  /** The user's database. Kept in userData so updates never touch it. */
  dataDir: string
  /** Shell and backend logs. */
  logDir: string
}

const exe = process.platform === 'win32' ? '.exe' : ''

/**
 * Packaged: everything ships under process.resourcesPath (see Phase 5 of
 * docs/desktop-offline-plan.md). Development: the same settings as the dev
 * host, from environment variables or host.config.local.json, and the export
 * in apps/desktop/out.
 */
export function resolveAppPaths(): AppPaths {
  const common = {
    dataDir: path.join(app.getPath('userData'), 'db'),
    logDir: app.getPath('logs'),
  }

  if (app.isPackaged) {
    const res = process.resourcesPath
    return {
      ...common,
      outDir: path.join(res, 'web'),
      sidecarBinary: path.join(res, 'backend', `ws-backend-desktop${exe}`),
      pgArchiveDir: path.join(res, 'postgres'),
      snapshotDir: path.join(res, 'snapshot'),
    }
  }

  // The bundle runs from apps/desktop/dist-electron.
  const appDir = path.resolve(__dirname, '..')
  const configPath = path.join(appDir, 'host.config.local.json')
  const config: Record<string, string> = fs.existsSync(configPath)
    ? JSON.parse(fs.readFileSync(configPath, 'utf8'))
    : {}
  const setting = (name: string) => process.env[name] || config[name]
  const required = (name: string) => {
    const v = setting(name)
    if (!v) throw new Error(`Set ${name} (environment or host.config.local.json) to run the desktop app in development.`)
    return v
  }

  return {
    ...common,
    outDir: path.join(appDir, 'out'),
    sidecarBinary: required('WS_DESKTOP_SIDECAR'),
    pgArchiveDir: required('WS_DESKTOP_PG_ARCHIVE'),
    snapshotDir: required('WS_DESKTOP_SNAPSHOT'),
    dataDir: setting('WS_DESKTOP_DATA') || common.dataDir,
  }
}
