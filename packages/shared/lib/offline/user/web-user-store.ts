import { WorkerRpc } from '../worker-rpc'
import type { OutboxEntry, UserMutation } from './types'
import type { BookmarkEntryMirror, NoteMirror, OfflineUserStore } from './user-store'
import type { UserWorkerRequestBody } from './worker/protocol'

/**
 * Web implementation of OfflineUserStore: a writable per-user SQLite database
 * (mirror + outbox) driven over RPC to a worker. Outbox UUIDs and timestamps are
 * minted here so the worker stays deterministic.
 *
 * Browser-only; not re-exported from the offline barrel and not imported by
 * apps/mobile, so the worker/WASM never enter the mobile bundle.
 */
export class WebOfflineUserStore implements OfflineUserStore {
  // SharedWorker (with a dedicated-Worker fallback) so all tabs share one OPFS
  // SAH-pool instead of colliding on its exclusive access handles.
  private readonly transport = new WorkerRpc<UserWorkerRequestBody>(
    'ws-offline-user',
    () =>
      new SharedWorker(new URL('./worker/user-sqlite.worker.ts', import.meta.url), {
        type: 'module',
        name: 'ws-offline-user',
      }),
    () =>
      new Worker(new URL('./worker/user-sqlite.worker.ts', import.meta.url), { type: 'module' }),
  )

  private rpc<T>(req: UserWorkerRequestBody): Promise<T> {
    return this.transport.rpc<T>(req)
  }

  open(userId: string): Promise<void> {
    return this.rpc<boolean>({ type: 'open', userId }).then(() => undefined)
  }

  getBookmarkEntries(scripture: string): Promise<BookmarkEntryMirror[]> {
    return this.rpc<BookmarkEntryMirror[]>({ type: 'getBookmarkEntries', scripture })
  }

  getNote(scripture: string, vk: string): Promise<NoteMirror | null> {
    return this.rpc<NoteMirror | null>({ type: 'getNote', scripture, vk })
  }

  getReadingProgress(scripture: string): Promise<string | null> {
    return this.rpc<string | null>({ type: 'getReadingProgress', scripture })
  }

  getChapterUserData(
    scripture: string,
    chapter: number,
  ): Promise<{ entries: BookmarkEntryMirror[]; notes: NoteMirror[] }> {
    return this.rpc<{ entries: BookmarkEntryMirror[]; notes: NoteMirror[] }>({
      type: 'getChapterUserData',
      scripture,
      chapter,
    })
  }

  mirrorChapterUserData(
    scripture: string,
    chapter: number,
    entries: BookmarkEntryMirror[],
    notes: NoteMirror[],
  ): Promise<void> {
    return this.rpc<boolean>({ type: 'mirrorChapterUserData', scripture, chapter, entries, notes }).then(
      () => undefined,
    )
  }

  mirrorBookmarkEntries(scripture: string, entries: BookmarkEntryMirror[]): Promise<void> {
    return this.rpc<boolean>({ type: 'mirrorBookmarkEntries', scripture, entries }).then(() => undefined)
  }

  mirrorNote(note: NoteMirror): Promise<void> {
    return this.rpc<boolean>({ type: 'mirrorNote', note }).then(() => undefined)
  }

  mirrorReadingProgress(scripture: string, vk: string): Promise<void> {
    return this.rpc<boolean>({ type: 'mirrorReadingProgress', scripture, vk }).then(() => undefined)
  }

  apply(mutation: UserMutation): Promise<void> {
    return this.rpc<boolean>({
      type: 'apply',
      mutation,
      outboxId: crypto.randomUUID(),
      createdAt: Date.now(),
    }).then(() => undefined)
  }

  pendingMutations(): Promise<OutboxEntry[]> {
    return this.rpc<OutboxEntry[]>({ type: 'pendingMutations' })
  }

  pendingCount(): Promise<number> {
    return this.rpc<number>({ type: 'pendingCount' })
  }

  markFlushed(ids: string[]): Promise<void> {
    return this.rpc<boolean>({ type: 'markFlushed', ids }).then(() => undefined)
  }

  bumpAttempts(ids: string[]): Promise<void> {
    return this.rpc<boolean>({ type: 'bumpAttempts', ids }).then(() => undefined)
  }

  clear(): Promise<void> {
    return this.rpc<boolean>({ type: 'clear' }).then(() => undefined)
  }
}
