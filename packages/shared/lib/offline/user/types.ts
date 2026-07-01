/**
 * Offline user-data sync types: the mutations a signed-in user can make offline,
 * the durable outbox that holds them until they reach the server, and the
 * batch-sync wire contract. See org/docs/offline-architecture.md.
 *
 * Every mutation is addressed by NATURAL KEY (bookmarks by category+scripture+vk,
 * notes and reading-progress by scripture+vk) rather than a server numeric id, so
 * a mutation created offline needs no local-id↔server-id mapping and replays are
 * idempotent.
 */

/** A user-data change captured locally. v1 covers bookmarks, notes, and reading
 * progress; collections stay read-only offline. */
export type UserMutation =
  | { entity: 'bookmark_entry'; op: 'create' | 'delete'; categoryId: number; scripture: string; vk: string }
  | { entity: 'note'; op: 'upsert'; scripture: string; vk: string; content: string; tags?: string[] }
  | { entity: 'note'; op: 'delete'; scripture: string; vk: string }
  | { entity: 'reading_progress'; op: 'upsert'; scripture: string; vk: string }

export type UserEntity = UserMutation['entity']

/** One durable outbox row. `id` is a client-generated UUID that doubles as the
 * Idempotency-Key the server dedupes on. */
export interface OutboxEntry {
  id: string
  mutation: UserMutation
  createdAt: number // epoch ms, client clock — orders replay
  attempts: number
}

// ── Wire format (snake_case, matches the rest of the ws-backend API) ─────────

export interface WireMutation {
  id: string
  entity: UserEntity
  op: 'create' | 'delete' | 'upsert'
  created_at: number
  payload: Record<string, unknown>
}

export interface SyncRequest {
  mutations: WireMutation[]
}

/**
 * Per-mutation outcome.
 * - applied: the mutation was performed.
 * - duplicate: already processed (Idempotency-Key replay) — terminal, drop it.
 * - superseded: a newer server state won (notes/reading-progress last-write-wins)
 *   — terminal, drop it; the next online read refreshes the mirror.
 * - error: transient failure — keep it in the outbox and retry.
 */
export type SyncResultStatus = 'applied' | 'duplicate' | 'superseded' | 'error'

export interface SyncResult {
  id: string
  status: SyncResultStatus
  error?: string
}

export interface SyncResponse {
  results: SyncResult[]
  server_time: number
}
