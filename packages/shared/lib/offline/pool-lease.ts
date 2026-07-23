/**
 * Origin-scoped ownership lease for an OPFS SAH-pool.
 *
 * The SAH-pool VFS grabs exclusive OPFS access handles for the page's lifetime,
 * and `createSyncAccessHandle` is exposed *only* in dedicated Workers — never in
 * a SharedWorker (verified: a SharedWorker can neither open sync access handles
 * nor spawn a nested dedicated worker to do it). So the pool genuinely cannot be
 * shared across tabs: a second tab that opens the same-named pool collides with
 * "Access Handles cannot be created if there is another open Access Handle".
 *
 * This elects a single owner tab via one exclusive Web Lock held for the page's
 * lifetime. The owner runs the worker and serves offline data; every other tab
 * skips the worker entirely and degrades to the network path, so the sqlite-wasm
 * install is never even attempted there (no error spam, no broken pool).
 *
 * Resolves `true` if this tab owns the pool, `false` if another tab already does.
 * Where Web Locks is unavailable, resolves `true` — best-effort single-tab
 * behavior, matching how the app ran before any locking existed.
 */
/** Thrown by a store's RPC layer when this tab does not own the pool lease, so
 * public methods can map it to a graceful fallback (empty read / no-op) instead
 * of surfacing it. Distinct from real worker errors, which still propagate. */
export class OfflinePoolUnavailableError extends Error {
  constructor() {
    super('offline pool is owned by another tab')
    this.name = 'OfflinePoolUnavailableError'
  }
}

/** Await `p`, but swallow an {@link OfflinePoolUnavailableError} into `fallback`
 * (a non-owning tab degrades to this default). Any other error propagates. */
export async function orDefault<T>(p: Promise<T>, fallback: T): Promise<T> {
  try {
    return await p
  } catch (err) {
    if (err instanceof OfflinePoolUnavailableError) return fallback
    throw err
  }
}

export function acquirePoolLease(name: string): Promise<boolean> {
  if (typeof navigator === 'undefined' || !navigator.locks) return Promise.resolve(true)
  return new Promise<boolean>((resolve) => {
    navigator.locks
      // ifAvailable: resolve immediately with null rather than queueing behind
      // the current owner (whose callback never resolves — it holds for life).
      .request(name, { ifAvailable: true }, (lock) => {
        resolve(lock !== null)
        if (!lock) return // not the owner — release straight away
        return new Promise<void>(() => {}) // owner: hold the lock until this tab unloads
      })
      .catch(() => resolve(true)) // lock subsystem error — don't disable offline
  })
}
