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

/** Whether this browser can run the offline content store: needs Web Workers,
 * WebAssembly, and OPFS (navigator.storage.getDirectory). */
export function isOfflineSupported(): boolean {
  return (
    typeof Worker !== 'undefined' &&
    typeof WebAssembly !== 'undefined' &&
    typeof navigator !== 'undefined' &&
    typeof navigator.storage?.getDirectory === 'function'
  )
}
