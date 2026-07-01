import type { OutboxEntry, UserMutation } from './types'
import type { BookmarkEntryMirror, NoteMirror, OfflineUserStore } from './user-store'
import type { UserWorkerRequestBody, UserWorkerResponse } from './worker/protocol'

type Pending = { resolve: (v: unknown) => void; reject: (e: Error) => void }

/**
 * Web implementation of OfflineUserStore: a writable per-user SQLite database
 * (mirror + outbox) driven over RPC to a dedicated worker. Outbox UUIDs and
 * timestamps are minted here so the worker stays deterministic.
 *
 * Browser-only; not re-exported from the offline barrel and not imported by
 * apps/mobile, so the worker/WASM never enter the mobile bundle.
 */
export class WebOfflineUserStore implements OfflineUserStore {
  private worker: Worker | null = null
  private seq = 0
  private readonly pending = new Map<number, Pending>()

  private ensureWorker(): Worker {
    if (this.worker) return this.worker
    const worker = new Worker(new URL('./worker/user-sqlite.worker.ts', import.meta.url), {
      type: 'module',
    })
    worker.onmessage = (e: MessageEvent<UserWorkerResponse>) => {
      const res = e.data
      const p = this.pending.get(res.id)
      if (!p) return
      this.pending.delete(res.id)
      if (res.ok) p.resolve(res.result)
      else p.reject(new Error(res.error))
    }
    worker.onerror = (e) => {
      const err = new Error(e.message || 'offline user worker crashed')
      for (const p of this.pending.values()) p.reject(err)
      this.pending.clear()
    }
    this.worker = worker
    return worker
  }

  private rpc<T>(req: UserWorkerRequestBody): Promise<T> {
    const worker = this.ensureWorker()
    const id = ++this.seq
    return new Promise<T>((resolve, reject) => {
      this.pending.set(id, { resolve: resolve as Pending['resolve'], reject })
      worker.postMessage({ ...req, id })
    })
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
