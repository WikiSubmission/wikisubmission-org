type Pending = { resolve: (v: unknown) => void; reject: (e: Error) => void }

interface RpcResponse {
  id: number
  ok: boolean
  result?: unknown
  error?: string
}

/**
 * Client-side RPC transport for the offline sqlite workers.
 *
 * Prefers a **SharedWorker** so every tab of the origin drives one worker
 * instance — and therefore one OPFS SAH-pool. The SAH-pool VFS grabs exclusive
 * OPFS access handles for the page's lifetime, so two dedicated workers (one per
 * tab) opening the same-named pool collide with "Access Handles cannot be created
 * if there is another open Access Handle". A single shared worker avoids that.
 *
 * Falls back to a dedicated **Worker** when SharedWorker is unavailable (e.g.
 * Chrome on Android) or the engine rejects a module SharedWorker. In that case
 * the collision only matters across multiple tabs, which those engines can't
 * hit via SharedWorker anyway.
 *
 * The two constructors are passed as thunks so the `new URL(..., import.meta.url)`
 * literal stays at the call site: bundlers only emit a worker chunk when they see
 * `new Worker(new URL('...', import.meta.url))` (or the SharedWorker form)
 * syntactically, which a shared helper can't express on the caller's behalf.
 */
export class WorkerRpc<Body extends object> {
  private post: ((msg: unknown, transfer: Transferable[]) => void) | null = null
  private seq = 0
  private readonly pending = new Map<number, Pending>()

  constructor(
    private readonly label: string,
    private readonly makeShared: () => SharedWorker,
    private readonly makeDedicated: () => Worker,
  ) {}

  private onResponse = (res: RpcResponse): void => {
    const p = this.pending.get(res.id)
    if (!p) return
    this.pending.delete(res.id)
    if (res.ok) p.resolve(res.result)
    else p.reject(new Error(res.error ?? `${this.label} worker error`))
  }

  private crash = (err: Error): void => {
    for (const p of this.pending.values()) p.reject(err)
    this.pending.clear()
  }

  private ensure(): void {
    if (this.post) return
    if (typeof SharedWorker !== 'undefined') {
      try {
        const sw = this.makeShared()
        sw.port.onmessage = (e: MessageEvent<RpcResponse>) => this.onResponse(e.data)
        sw.onerror = () => this.crash(new Error(`${this.label} shared worker crashed`))
        sw.port.start()
        this.post = (msg, transfer) => sw.port.postMessage(msg, transfer)
        return
      } catch {
        // Engine advertises SharedWorker but rejected this one (e.g. no module
        // support). Fall through to a dedicated worker.
      }
    }
    const w = this.makeDedicated()
    w.onmessage = (e: MessageEvent<RpcResponse>) => this.onResponse(e.data)
    w.onerror = (e) => this.crash(new Error(e.message || `${this.label} worker crashed`))
    this.post = (msg, transfer) => w.postMessage(msg, transfer)
  }

  rpc<T>(body: Body, transfer: Transferable[] = []): Promise<T> {
    this.ensure()
    const id = ++this.seq
    return new Promise<T>((resolve, reject) => {
      this.pending.set(id, { resolve: resolve as Pending['resolve'], reject })
      this.post!({ ...body, id }, transfer)
    })
  }
}
