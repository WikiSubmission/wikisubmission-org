/// <reference lib="webworker" />
//
// Request/response plumbing shared by both offline sqlite workers. Supports two
// runtime shapes from a single worker source:
//
//   • dedicated Worker  — `self` is the message port (one worker per tab)
//   • SharedWorker      — one MessagePort per connected tab, delivered via
//                         `onconnect`; every port routes through the same
//                         module-global sqlite state, so the whole origin shares
//                         one OPFS SAH-pool instead of colliding on its handles.
//
// The mode is detected at runtime (SharedWorkerGlobalScope only exists in a
// shared-worker scope), so the same bundle works whichever way the client
// instantiates it — see worker-rpc.ts for the client's SharedWorker→Worker
// fallback.

interface PortLike {
  postMessage(msg: unknown): void
  onmessage: ((e: MessageEvent) => void) | null
  start?: () => void
}

/**
 * Wire `handle` to serve RPC requests over whichever port shape this worker was
 * started as. Each request carries a correlation `id` echoed back on the reply;
 * a thrown error is reported as `{ ok: false, error }` rather than crashing the
 * port, so one bad request can't take down every other tab's connection.
 */
export function serveWorker<Req extends { id: number }>(
  handle: (req: Req) => Promise<unknown> | unknown,
): void {
  const attach = (port: PortLike): void => {
    port.onmessage = async (e: MessageEvent) => {
      const req = e.data as Req
      try {
        const result = await handle(req)
        port.postMessage({ id: req.id, ok: true, result })
      } catch (err) {
        port.postMessage({
          id: req.id,
          ok: false,
          error: err instanceof Error ? err.message : String(err),
        })
      }
    }
    port.start?.()
  }

  const isShared =
    typeof (globalThis as { SharedWorkerGlobalScope?: unknown }).SharedWorkerGlobalScope !==
    'undefined'

  if (isShared) {
    const scope = self as unknown as { onconnect: ((e: MessageEvent) => void) | null }
    scope.onconnect = (e: MessageEvent) => attach(e.ports[0] as unknown as PortLike)
  } else {
    attach(self as unknown as PortLike)
  }
}
