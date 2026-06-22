import type { OutboxEntry, UserMutation } from './types'

export interface BookmarkEntryMirror {
  categoryId: number
  scripture: string
  vk: string
}

export interface NoteMirror {
  scripture: string
  vk: string
  content: string
  tags?: string[]
  updatedAt: number
}

/**
 * The offline user-data seam (signed-in only). Implemented by a web adapter
 * (sqlite-wasm `user.db`) and, later, a Capacitor adapter. The store is scoped
 * to one user id and cleared on sign-out or a user-id mismatch.
 *
 * Writes are local-first: `apply` updates the mirror and enqueues the outbox
 * atomically, so reads reflect the change immediately and the flush can wait for
 * connectivity. Online reads call `mirror*` write-through helpers to keep the
 * mirror fresh.
 */
export interface OfflineUserStore {
  /** Switch to a user (clearing the mirror if it belonged to someone else). */
  open(userId: string): Promise<void>

  // ── mirror reads ──
  getBookmarkEntries(scripture: string): Promise<BookmarkEntryMirror[]>
  getNote(scripture: string, vk: string): Promise<NoteMirror | null>
  getReadingProgress(scripture: string): Promise<string | null>

  // ── write-through from successful online reads ──
  mirrorBookmarkEntries(scripture: string, entries: BookmarkEntryMirror[]): Promise<void>
  mirrorNote(note: NoteMirror): Promise<void>
  mirrorReadingProgress(scripture: string, vk: string): Promise<void>

  // ── local-first writes ──
  /** Apply a mutation to the mirror and enqueue it in the outbox atomically. */
  apply(mutation: UserMutation): Promise<void>

  // ── outbox / sync ──
  pendingMutations(): Promise<OutboxEntry[]>
  pendingCount(): Promise<number>
  markFlushed(ids: string[]): Promise<void>
  bumpAttempts(ids: string[]): Promise<void>

  /** Drop all local data (sign-out, or detected user-id mismatch). */
  clear(): Promise<void>
}
