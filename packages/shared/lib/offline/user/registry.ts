import type { OfflineUserStore } from './user-store'

// Worker-free injection seam for the user store (mirrors the content store's
// registry). apps/web registers a WebOfflineUserStore; mobile registers nothing
// for now. The user-data hooks read from here so the shared hooks never import
// the web worker.
let registered: OfflineUserStore | null = null

export function registerOfflineUserStore(store: OfflineUserStore | null): void {
  registered = store
}

export function getRegisteredOfflineUserStore(): OfflineUserStore | null {
  return registered
}
