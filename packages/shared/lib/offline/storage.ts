/** Persistent-storage helpers. OPFS can be evicted under storage pressure
 * (notably Safari) unless persistence is granted, so we request it on first
 * install and surface usage in the settings UI. */

export async function requestPersistentStorage(): Promise<boolean> {
  if (typeof navigator === 'undefined' || !navigator.storage?.persist) return false
  try {
    return await navigator.storage.persist()
  } catch {
    return false
  }
}

export interface StorageUsage {
  usage: number
  quota: number
}

export async function storageEstimate(): Promise<StorageUsage | null> {
  if (typeof navigator === 'undefined' || !navigator.storage?.estimate) return null
  try {
    const est = await navigator.storage.estimate()
    return { usage: est.usage ?? 0, quota: est.quota ?? 0 }
  } catch {
    return null
  }
}
