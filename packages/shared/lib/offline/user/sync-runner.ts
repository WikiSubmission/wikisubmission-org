import { buildSyncRequest, reconcileSyncResponse } from './sync-engine'
import type { SyncTransport } from './transport'
import type { OfflineUserStore } from './user-store'

export interface FlushResult {
  flushed: number
  failed: number
}

/**
 * Replay the outbox once: read pending mutations, send them as one ordered
 * batch, then drop the ones the server reached a terminal state for and bump the
 * retry count on the rest. A no-op when the outbox is empty.
 *
 * Stateless and transport-injected, so it is unit-testable and identical across
 * platforms. The scheduler (web/native) decides when to call it and guards
 * against concurrent runs.
 */
export async function flushOutbox(store: OfflineUserStore, transport: SyncTransport): Promise<FlushResult> {
  const pending = await store.pendingMutations()
  if (pending.length === 0) return { flushed: 0, failed: 0 }

  const response = await transport(buildSyncRequest(pending))
  const { flushedIds, failedIds } = reconcileSyncResponse(pending, response)

  if (flushedIds.length > 0) await store.markFlushed(flushedIds)
  if (failedIds.length > 0) await store.bumpAttempts(failedIds)

  return { flushed: flushedIds.length, failed: failedIds.length }
}
