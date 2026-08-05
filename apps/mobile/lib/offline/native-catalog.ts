import { Preferences } from '@capacitor/preferences'
import type { BundleInfo } from '@/lib/offline/types'

/**
 * Durable record of installed content bundles for the native store. The web
 * adapter keeps this in localStorage; on native we use @capacitor/preferences so
 * it survives OS storage pressure, mirroring the durability of the native DB
 * files themselves.
 *
 * A `dbName` is tracked alongside the shared BundleInfo fields: it is the
 * @capacitor-community/sqlite database name the bundle was stored under (derived
 * from the download URL's filename), which the read paths need to open it.
 */
export interface NativeBundleRecord extends BundleInfo {
  dbName: string
}

const KEY = 'ws-offline-catalog-v1'

let cache: NativeBundleRecord[] | null = null

async function load(): Promise<NativeBundleRecord[]> {
  if (cache) return cache
  try {
    const { value } = await Preferences.get({ key: KEY })
    cache = value ? (JSON.parse(value) as NativeBundleRecord[]) : []
  } catch {
    cache = []
  }
  return cache
}

async function persist(list: NativeBundleRecord[]): Promise<void> {
  cache = list
  await Preferences.set({ key: KEY, value: JSON.stringify(list) })
}

export const nativeCatalog = {
  async list(): Promise<NativeBundleRecord[]> {
    return [...(await load())]
  },
  async upsert(rec: NativeBundleRecord): Promise<void> {
    const list = await load()
    await persist([...list.filter((b) => b.id !== rec.id), rec])
  },
  async remove(id: string): Promise<void> {
    const list = await load()
    await persist(list.filter((b) => b.id !== id))
  },
}
