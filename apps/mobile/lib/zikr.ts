import { resolveBrowserApiBaseUrl } from '@/src/api/base-url'

/**
 * Zikr data layer: short remembrances of God shown in the Today-screen strip
 * and the startup splash. Fetched from ws-backend (GET /zikr, admin-managed),
 * cached in localStorage — synchronous reads matter because the splash overlay
 * needs a zikr on its very first client render — with a bundled fallback for
 * first-launch offline.
 */

export interface ZikrItem {
  id: number
  text: string
  source?: string
}

const CACHE_KEY = 'ws.zikr.cache.v1'
const FETCH_TIMEOUT_MS = 10_000

interface ZikrCache {
  fetchedAt: number
  items: ZikrItem[]
}

function isZikrItem(value: unknown): value is ZikrItem {
  if (typeof value !== 'object' || value === null) return false
  const item = value as Record<string, unknown>
  return typeof item.id === 'number' && typeof item.text === 'string' && item.text.length > 0
}

export async function fetchZikrList(signal?: AbortSignal): Promise<ZikrItem[]> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS)
  signal?.addEventListener('abort', () => controller.abort(), { once: true })
  try {
    const response = await fetch(`${resolveBrowserApiBaseUrl()}/zikr`, {
      signal: controller.signal,
    })
    if (!response.ok) throw new Error(`Zikr endpoint returned ${response.status}`)
    const json = (await response.json()) as { data?: unknown }
    const items = Array.isArray(json.data) ? json.data.filter(isZikrItem) : []
    if (items.length === 0) throw new Error('Zikr endpoint returned no entries')
    return items.map(({ id, text, source }) => ({ id, text, source }))
  } finally {
    clearTimeout(timeout)
  }
}

export function writeCachedZikrList(items: ZikrItem[]): void {
  if (typeof window === 'undefined' || items.length === 0) return
  try {
    window.localStorage.setItem(
      CACHE_KEY,
      JSON.stringify({ fetchedAt: Date.now(), items } satisfies ZikrCache),
    )
  } catch {
    // The bundled fallback still covers the splash.
  }
}

/** Synchronous: cached list or null. Callers layer the bundled fallback. */
export function readCachedZikrList(): ZikrItem[] | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(CACHE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as ZikrCache
    const items = Array.isArray(parsed?.items) ? parsed.items.filter(isZikrItem) : []
    return items.length > 0 ? items : null
  } catch {
    return null
  }
}

export function pickRandomZikrIndex(items: ZikrItem[]): number {
  return items.length > 0 ? Math.floor(Math.random() * items.length) : 0
}

/** Whole days since the Unix epoch (UTC). Computed server-side so the value is
 *  serialized into the payload and the client reuses it verbatim — a per-render
 *  `Date` on the client would hydration-mismatch a static export. */
export function currentDaySeed(): number {
  return Math.floor(Date.now() / 86_400_000)
}

/**
 * Deterministic "zikr of the day" index for a given day seed. Scrambles the day
 * number (integer hash) so consecutive days jump around the list instead of
 * incrementing by one, while staying stable for the whole day and identical on
 * server and client — the hydration-safe seed for the startup overlay.
 */
export function dailyZikrIndex(daySeed: number, length: number): number {
  if (length <= 0) return 0
  let x = (daySeed + 0x9e3779b9) | 0
  x = Math.imul(x ^ (x >>> 16), 0x45d9f3b)
  x = Math.imul(x ^ (x >>> 16), 0x45d9f3b)
  x = x ^ (x >>> 16)
  return Math.abs(x) % length
}
