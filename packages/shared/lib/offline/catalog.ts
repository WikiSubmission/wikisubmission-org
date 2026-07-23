import type { BundleInfo } from './types'

// Local record of which bundles are installed. Kept in localStorage (small,
// synchronous, survives reloads). The actual .db files live in OPFS, managed by
// the worker; this catalog is the queryable index of them.
const KEY = 'ws-offline-catalog-v1'

function read(): BundleInfo[] {
  if (typeof localStorage === 'undefined') return []
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? (JSON.parse(raw) as BundleInfo[]) : []
  } catch {
    return []
  }
}

function write(list: BundleInfo[]): void {
  if (typeof localStorage === 'undefined') return
  localStorage.setItem(KEY, JSON.stringify(list))
}

export const catalog = {
  list(): BundleInfo[] {
    return read()
  },
  upsert(info: BundleInfo): void {
    write([...read().filter((b) => b.id !== info.id), info])
  },
  remove(id: string): void {
    write(read().filter((b) => b.id !== id))
  },
}
