import { Capacitor } from '@capacitor/core'
import { resolveBrowserApiBaseUrl } from '@/src/api/base-url'

/**
 * Minimal crash/error reporter: batches window-level errors, unhandled
 * rejections, and error-boundary catches to the backend's anonymous
 * POST /client-errors endpoint (structured-logged server-side).
 *
 * Deliberately conservative: capped per session, deduped by message, batched
 * on a short debounce, silent on failure — the reporter must never become a
 * source of errors or traffic itself.
 */

export type CrashSource =
  | 'error-boundary'
  | 'global-error'
  | 'window-error'
  | 'unhandledrejection'

interface CrashReport {
  message: string
  stack?: string
  source: CrashSource
  route?: string
  platform?: string
  occurred_at: number
}

const MAX_REPORTS_PER_SESSION = 20
const MAX_BATCH = 10
const FLUSH_DEBOUNCE_MS = 2_000

let queue: CrashReport[] = []
let sentCount = 0
const seenMessages = new Set<string>()
let flushTimer: ReturnType<typeof setTimeout> | null = null
let installed = false

async function flush(): Promise<void> {
  flushTimer = null
  if (queue.length === 0) return
  const batch = queue.slice(0, MAX_BATCH)
  queue = queue.slice(MAX_BATCH)
  try {
    await fetch(`${resolveBrowserApiBaseUrl()}/client-errors`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ errors: batch }),
      // Reports are fire-and-forget; keepalive lets a crash-on-exit batch out.
      keepalive: true,
    })
  } catch {
    // Offline or endpoint missing: drop silently.
  }
  if (queue.length > 0) scheduleFlush()
}

function scheduleFlush(): void {
  flushTimer ??= setTimeout(() => void flush(), FLUSH_DEBOUNCE_MS)
}

export function reportClientError(error: unknown, source: CrashSource): void {
  if (typeof window === 'undefined') return
  if (sentCount >= MAX_REPORTS_PER_SESSION) return

  const message =
    error instanceof Error
      ? `${error.name}: ${error.message}`
      : String(error ?? 'unknown error')
  // One report per distinct message per session — a render-loop crash must
  // not turn into a request stream.
  if (seenMessages.has(message)) return
  seenMessages.add(message)
  sentCount += 1

  queue.push({
    message: message.slice(0, 2000),
    stack: error instanceof Error ? error.stack?.slice(0, 8000) : undefined,
    source,
    route: window.location?.pathname,
    platform: Capacitor.getPlatform(),
    occurred_at: Date.now(),
  })
  scheduleFlush()
}

/** Wires window.onerror + unhandledrejection. Idempotent; call once at boot. */
export function installCrashReporter(): void {
  if (installed || typeof window === 'undefined') return
  installed = true
  window.addEventListener('error', (event) => {
    reportClientError(event.error ?? event.message, 'window-error')
  })
  window.addEventListener('unhandledrejection', (event) => {
    reportClientError(event.reason, 'unhandledrejection')
  })
}
