/**
 * Runs work once the browser is idle, returning a canceller.
 *
 * Prefers `scheduler.postTask` at background priority, falls back to
 * `requestIdleCallback` with a timeout so it still runs on a busy page, and
 * finally to a plain timer. Nothing in the codebase used either API before, so
 * this is the single place that feature-detects them.
 */
export function scheduleIdle(fn: () => void, timeoutMs = 1500): () => void {
  if (typeof window === 'undefined') return () => {}

  const scheduler = (
    globalThis as unknown as {
      scheduler?: {
        postTask?: (
          callback: () => void,
          options?: { priority?: string; signal?: AbortSignal },
        ) => Promise<unknown>
      }
    }
  ).scheduler

  if (typeof scheduler?.postTask === 'function') {
    const controller = new AbortController()
    scheduler
      .postTask(fn, { priority: 'background', signal: controller.signal })
      // An aborted task rejects; that is the cancellation path, not an error.
      ?.catch(() => {})
    return () => controller.abort()
  }

  const requestIdle = (
    globalThis as unknown as {
      requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number
      cancelIdleCallback?: (handle: number) => void
    }
  ).requestIdleCallback

  if (typeof requestIdle === 'function') {
    const handle = requestIdle(fn, { timeout: timeoutMs })
    return () => {
      const cancel = (globalThis as unknown as { cancelIdleCallback?: (h: number) => void })
        .cancelIdleCallback
      cancel?.(handle)
    }
  }

  const timer = setTimeout(fn, Math.min(timeoutMs, 1200))
  return () => clearTimeout(timer)
}
