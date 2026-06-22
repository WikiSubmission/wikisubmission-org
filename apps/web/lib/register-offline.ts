import { registerOfflineContentStore } from '@/lib/offline/registry'
import { getOfflineContentStore, isOfflineSupported } from '@/lib/offline/web-store-singleton'

/**
 * Register the web sqlite-wasm content store so the shared reader and search
 * hooks can serve installed bundles. No-op during SSR and in browsers without
 * Workers/WASM/OPFS, leaving those sessions on the network path. The worker
 * itself is created lazily on first query, so registering here is cheap.
 */
export function registerWebOfflineStore(): void {
  if (!isOfflineSupported()) return
  registerOfflineContentStore(getOfflineContentStore())
}
