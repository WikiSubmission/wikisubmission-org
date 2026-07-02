import type { OfflineContentStore } from './content-store'
import { WebOfflineContentStore } from './web-content-store'

/** URL of the offline manifest. Overridable per environment; defaults to the
 * production CDN. For local fixtures, set NEXT_PUBLIC_OFFLINE_MANIFEST_URL. */
export const OFFLINE_MANIFEST_URL =
  process.env.NEXT_PUBLIC_OFFLINE_MANIFEST_URL ??
  'https://cdn.wikisubmission.org/offline/manifest.json'

let store: OfflineContentStore | null = null

/** Lazily construct the single web content store (and, on first use, its worker). */
export function getOfflineContentStore(): OfflineContentStore {
  if (!store) store = new WebOfflineContentStore()
  return store
}

/** Per-check breakdown of {@link isOfflineSupported}, for diagnostics. Each
 * flag is the individual requirement so a caller can see exactly which one
 * fails in a given browser/context. */
export interface OfflineSupportDiagnostics {
  worker: boolean
  webassembly: boolean
  navigator: boolean
  opfs: boolean
  supported: boolean
}

export function offlineSupportDiagnostics(): OfflineSupportDiagnostics {
  const worker = typeof Worker !== 'undefined'
  const webassembly = typeof WebAssembly !== 'undefined'
  const hasNavigator = typeof navigator !== 'undefined'
  const opfs = hasNavigator && typeof navigator.storage?.getDirectory === 'function'
  return {
    worker,
    webassembly,
    navigator: hasNavigator,
    opfs,
    supported: worker && webassembly && hasNavigator && opfs,
  }
}

/** Whether this browser can run the offline content store: needs Web Workers,
 * WebAssembly, and OPFS (navigator.storage.getDirectory). */
export function isOfflineSupported(): boolean {
  return offlineSupportDiagnostics().supported
}
