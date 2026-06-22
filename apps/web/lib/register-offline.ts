import { registerOfflineContentStore } from '@/lib/offline/registry'
import { getOfflineContentStore, isOfflineSupported } from '@/lib/offline/web-store-singleton'
import { registerOfflineUserStore } from '@/lib/offline/user/registry'
import { WebOfflineUserStore } from '@/lib/offline/user/web-user-store'

let userStore: WebOfflineUserStore | null = null

/**
 * Register the web sqlite-wasm content + user stores so the shared reader,
 * search, and user-data hooks can use installed bundles and the local mirror.
 * No-op during SSR and in browsers without Workers/WASM/OPFS, leaving those
 * sessions on the network path. Workers are created lazily on first use, so
 * registering here is cheap; the user store is opened per-user once signed in.
 */
export function registerWebOfflineStore(): void {
  if (!isOfflineSupported()) return
  registerOfflineContentStore(getOfflineContentStore())
  if (!userStore) userStore = new WebOfflineUserStore()
  registerOfflineUserStore(userStore)
}
