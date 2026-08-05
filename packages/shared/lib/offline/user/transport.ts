import type { SyncRequest, SyncResponse } from './types'

/** Sends a batch-sync request to the server and returns the response. The
 * implementation is platform-specific (web attaches the next-auth token; the
 * Capacitor app uses its stored token), so it is injected rather than imported —
 * the replay runner stays platform-agnostic. */
export type SyncTransport = (req: SyncRequest) => Promise<SyncResponse>

let transport: SyncTransport | null = null

export function registerSyncTransport(fn: SyncTransport | null): void {
  transport = fn
}

export function getSyncTransport(): SyncTransport | null {
  return transport
}
