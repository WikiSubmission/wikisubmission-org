import type { OfflineContentStore } from './content-store'

// Injection seam for the offline content store, mirroring setAccessTokenProvider
// in src/api/client.ts. The reader and search hooks (shared by web and mobile)
// read the store from here instead of importing a concrete implementation, so
// the web sqlite-wasm worker never enters the mobile bundle. apps/web registers
// the WebOfflineContentStore at startup; apps/mobile registers nothing for now
// (network path) and will register a native adapter in a later phase.

let registered: OfflineContentStore | null = null

export function registerOfflineContentStore(store: OfflineContentStore | null): void {
  registered = store
}

/** The registered store, or null when offline content is unavailable on this
 * platform/session — in which case callers use the network path. */
export function getRegisteredOfflineContentStore(): OfflineContentStore | null {
  return registered
}
