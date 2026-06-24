import type { OutboxEntry, UserMutation } from '../types'
import type { BookmarkEntryMirror, NoteMirror } from '../user-store'

/** RPC messages for the writable user.db worker. Each request carries a
 * correlation `id` the response echoes. Outbox UUIDs and timestamps are
 * generated on the main thread and passed in, keeping the worker deterministic. */
export type UserWorkerRequest =
  | { id: number; type: 'open'; userId: string }
  | { id: number; type: 'apply'; mutation: UserMutation; outboxId: string; createdAt: number }
  | { id: number; type: 'getBookmarkEntries'; scripture: string }
  | { id: number; type: 'getNote'; scripture: string; vk: string }
  | { id: number; type: 'getReadingProgress'; scripture: string }
  | { id: number; type: 'getChapterUserData'; scripture: string; chapter: number }
  | { id: number; type: 'mirrorBookmarkEntries'; scripture: string; entries: BookmarkEntryMirror[] }
  | { id: number; type: 'mirrorNote'; note: NoteMirror }
  | { id: number; type: 'mirrorReadingProgress'; scripture: string; vk: string }
  | {
      id: number
      type: 'mirrorChapterUserData'
      scripture: string
      chapter: number
      entries: BookmarkEntryMirror[]
      notes: NoteMirror[]
    }
  | { id: number; type: 'pendingMutations' }
  | { id: number; type: 'pendingCount' }
  | { id: number; type: 'markFlushed'; ids: string[] }
  | { id: number; type: 'bumpAttempts'; ids: string[] }
  | { id: number; type: 'clear' }

export interface UserWorkerResultMap {
  open: boolean
  apply: boolean
  getBookmarkEntries: BookmarkEntryMirror[]
  getNote: NoteMirror | null
  getReadingProgress: string | null
  getChapterUserData: { entries: BookmarkEntryMirror[]; notes: NoteMirror[] }
  mirrorBookmarkEntries: boolean
  mirrorNote: boolean
  mirrorReadingProgress: boolean
  mirrorChapterUserData: boolean
  pendingMutations: OutboxEntry[]
  pendingCount: number
  markFlushed: boolean
  bumpAttempts: boolean
  clear: boolean
}

type DistributiveOmit<T, K extends PropertyKey> = T extends unknown ? Omit<T, K> : never
export type UserWorkerRequestBody = DistributiveOmit<UserWorkerRequest, 'id'>

export type UserWorkerResponse =
  | { id: number; ok: true; result: unknown }
  | { id: number; ok: false; error: string }
