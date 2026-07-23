import { acquirePoolLease, OfflinePoolUnavailableError, orDefault } from '../pool-lease'
import type { OutboxEntry, UserMutation } from './types'
import type { BookmarkEntryMirror, NoteMirror, OfflineUserStore } from './user-store'
import type { UserWorkerRequestBody, UserWorkerResponse } from './worker/protocol'

type Pending = { resolve: (v: unknown) => void; reject: (e: Error) => void }

/**
 * Web implementation of OfflineUserStore: a writable per-user SQLite database
 * (mirror + outbox) driven over RPC to a dedicated worker. Outbox UUIDs and
 * timestamps are minted here so the worker stays deterministic.
 *
 * The worker's OPFS SAH-pool can only be opened by one tab at a time, so a
 * per-origin Web Lock elects a single owner tab (see pool-lease.ts). This tab
 * runs the worker; a non-owning tab never creates it and every method degrades
 * gracefully — reads return empty, best-effort writes no-op, and `apply` (which
 * must not silently drop a mutation) surfaces the failure so the caller falls
 * back to its network path. The whole user-data layer is network-first, so a
 * degraded tab loses no data.
 *
 * Browser-only; not re-exported from the offline barrel and not imported by
 * apps/mobile, so the worker/WASM never enter the mobile bundle.
 */
export class WebOfflineUserStore implements OfflineUserStore {
  private worker: Worker | null = null
  private seq = 0
  private readonly pending = new Map<number, Pending>()
  private lease: Promise<boolean> | null = null

  /** Whether this tab owns the pool. Acquired once, held for the page lifetime. */
  private owns(): Promise<boolean> {
    if (!this.lease) this.lease = acquirePoolLease('ws-offline-user-pool')
    return this.lease
  }

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

  private async rpc<T>(req: UserWorkerRequestBody): Promise<T> {
    if (!(await this.owns())) throw new OfflinePoolUnavailableError()
    const worker = this.ensureWorker()
    const id = ++this.seq
    return new Promise<T>((resolve, reject) => {
      this.pending.set(id, { resolve: resolve as Pending['resolve'], reject })
      worker.postMessage({ ...req, id })
    })
  }

  open(userId: string): Promise<void> {
    return orDefault(this.rpc<boolean>({ type: 'open', userId }).then(() => undefined), undefined)
  }

  getBookmarkEntries(scripture: string): Promise<BookmarkEntryMirror[]> {
    return orDefault(this.rpc<BookmarkEntryMirror[]>({ type: 'getBookmarkEntries', scripture }), [])
  }

  getNote(scripture: string, vk: string): Promise<NoteMirror | null> {
    return orDefault(this.rpc<NoteMirror | null>({ type: 'getNote', scripture, vk }), null)
  }

  getReadingProgress(scripture: string): Promise<string | null> {
    return orDefault(this.rpc<string | null>({ type: 'getReadingProgress', scripture }), null)
  }

  getChapterUserData(
    scripture: string,
    chapter: number,
  ): Promise<{ entries: BookmarkEntryMirror[]; notes: NoteMirror[] }> {
    return orDefault(
      this.rpc<{ entries: BookmarkEntryMirror[]; notes: NoteMirror[] }>({
        type: 'getChapterUserData',
        scripture,
        chapter,
      }),
      { entries: [], notes: [] },
    )
  }

  mirrorChapterUserData(
    scripture: string,
    chapter: number,
    entries: BookmarkEntryMirror[],
    notes: NoteMirror[],
  ): Promise<void> {
    return orDefault(
      this.rpc<boolean>({ type: 'mirrorChapterUserData', scripture, chapter, entries, notes }).then(
        () => undefined,
      ),
      undefined,
    )
  }

  mirrorBookmarkEntries(scripture: string, entries: BookmarkEntryMirror[]): Promise<void> {
    return orDefault(
      this.rpc<boolean>({ type: 'mirrorBookmarkEntries', scripture, entries }).then(() => undefined),
      undefined,
    )
  }

  mirrorNote(note: NoteMirror): Promise<void> {
    return orDefault(this.rpc<boolean>({ type: 'mirrorNote', note }).then(() => undefined), undefined)
  }

  mirrorReadingProgress(scripture: string, vk: string): Promise<void> {
    return orDefault(
      this.rpc<boolean>({ type: 'mirrorReadingProgress', scripture, vk }).then(() => undefined),
      undefined,
    )
  }

  // `apply` intentionally does NOT swallow the unavailable error: it's only
  // called after a network write failed, and the caller relies on the rejection
  // to surface that failure rather than silently drop the mutation.
  apply(mutation: UserMutation): Promise<void> {
    return this.rpc<boolean>({
      type: 'apply',
      mutation,
      outboxId: crypto.randomUUID(),
      createdAt: Date.now(),
    }).then(() => undefined)
  }

  pendingMutations(): Promise<OutboxEntry[]> {
    return orDefault(this.rpc<OutboxEntry[]>({ type: 'pendingMutations' }), [])
  }

  pendingCount(): Promise<number> {
    return orDefault(this.rpc<number>({ type: 'pendingCount' }), 0)
  }

  markFlushed(ids: string[]): Promise<void> {
    return orDefault(this.rpc<boolean>({ type: 'markFlushed', ids }).then(() => undefined), undefined)
  }

  bumpAttempts(ids: string[]): Promise<void> {
    return orDefault(this.rpc<boolean>({ type: 'bumpAttempts', ids }).then(() => undefined), undefined)
  }

  clear(): Promise<void> {
    return orDefault(this.rpc<boolean>({ type: 'clear' }).then(() => undefined), undefined)
  }
}
