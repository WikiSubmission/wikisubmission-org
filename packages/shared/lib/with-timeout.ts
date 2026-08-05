/**
 * Runs a request with a hard deadline.
 *
 * fetch() has no timeout of its own: on a stalled mobile connection (a captive
 * portal, a dropped radio hand-off) the promise can stay pending for as long as
 * the socket is held open, which is what leaves a button stuck on its loading
 * label forever. Everything user-facing that awaits the network should go
 * through here so failure is bounded and retryable.
 */
export const DEFAULT_REQUEST_TIMEOUT_MS = 15_000

export class RequestTimeoutError extends Error {
  constructor(ms: number) {
    super(`request timed out after ${ms}ms`)
    this.name = 'RequestTimeoutError'
  }
}

export async function withTimeout<T>(
  ms: number,
  fn: (signal: AbortSignal) => Promise<T>,
): Promise<T> {
  const controller = new AbortController()
  let timedOut = false
  const timer = setTimeout(() => {
    timedOut = true
    controller.abort()
  }, ms)
  try {
    return await fn(controller.signal)
  } catch (error) {
    if (timedOut) throw new RequestTimeoutError(ms)
    throw error
  } finally {
    clearTimeout(timer)
  }
}
