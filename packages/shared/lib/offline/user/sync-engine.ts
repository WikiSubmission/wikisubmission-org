import type { OutboxEntry, SyncRequest, SyncResponse, UserMutation, WireMutation } from './types'

/** Map a mutation to its snake_case wire payload (verse_key, category_id). */
function toPayload(m: UserMutation): Record<string, unknown> {
  switch (m.entity) {
    case 'bookmark_entry':
      return { category_id: m.categoryId, scripture: m.scripture, verse_key: m.vk }
    case 'note':
      return m.op === 'upsert'
        ? { scripture: m.scripture, verse_key: m.vk, content: m.content, ...(m.tags ? { tags: m.tags } : {}) }
        : { scripture: m.scripture, verse_key: m.vk }
    case 'reading_progress':
      return { scripture: m.scripture, verse_key: m.vk }
  }
}

function toWire(entry: OutboxEntry): WireMutation {
  return {
    id: entry.id,
    entity: entry.mutation.entity,
    op: entry.mutation.op,
    created_at: entry.createdAt,
    payload: toPayload(entry.mutation),
  }
}

/** Build the batch-sync request from the outbox, ordered oldest-first so the
 * server applies mutations in the order the user made them. */
export function buildSyncRequest(outbox: OutboxEntry[]): SyncRequest {
  const ordered = [...outbox].sort((a, b) => a.createdAt - b.createdAt || a.id.localeCompare(b.id))
  return { mutations: ordered.map(toWire) }
}

export interface Reconciliation {
  /** Outbox entries to remove — the server reached a terminal state for them. */
  flushedIds: string[]
  /** Entries to keep and retry (server returned an error or no result). */
  failedIds: string[]
}

/**
 * Decide which outbox entries to drop and which to retry from a sync response.
 * applied/duplicate/superseded are all terminal (drop); error or a missing
 * result is transient (keep and retry on the next flush).
 */
export function reconcileSyncResponse(outbox: OutboxEntry[], response: SyncResponse): Reconciliation {
  const byId = new Map(response.results.map((r) => [r.id, r]))
  const flushedIds: string[] = []
  const failedIds: string[] = []

  for (const entry of outbox) {
    const result = byId.get(entry.id)
    if (!result || result.status === 'error') {
      failedIds.push(entry.id)
    } else {
      flushedIds.push(entry.id)
    }
  }

  return { flushedIds, failedIds }
}
