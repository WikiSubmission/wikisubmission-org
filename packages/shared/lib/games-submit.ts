// Durable submit path for Fill-the-Blank rounds.
//
// The round is written to the local outbox before the request leaves the
// device, so a submit can never be lost to a dropped connection, a killed app,
// or a stalled socket. From there it is retried with backoff, and drained again
// whenever the app comes back to the foreground or regains connectivity.
//
// Submits are NOT idempotent on the backend — every accepted POST inserts an
// attempt row and feeds the leaderboard. A timed-out request has an unknown
// outcome, so before any replay the runner reconciles against
// /me/games/history: if an attempt for this variant was recorded after the
// round was queued, the submit is treated as done instead of being sent again.
import {
  meApi,
  type GameHistoryEntry,
  type GameSubmitAttemptOutcome,
  type GameSubmitRequest,
  type GameSubmitResult,
} from '@/src/api/me-client'
import {
  bumpPendingAttempts,
  clearPendingSubmit,
  clearRoundProgress,
  listPendingSubmits,
  savePendingSubmit,
  saveRoundResult,
} from './games-outbox'
import { withTimeout } from './with-timeout'

const SUBMIT_TIMEOUT_MS = 15_000
const RECONCILE_TIMEOUT_MS = 10_000
/** Delays before the 2nd and 3rd attempt of a single submit action. */
const RETRY_DELAYS_MS = [700, 2_000]
/** Clock slack when matching a history entry to a queued round. */
const RECONCILE_SLACK_MS = 60_000

/** Network seam, injected so the runner's state machine is testable without a
 * server (mirrors offline/user/transport.ts). */
export interface GamesSubmitTransport {
  submit: (payload: GameSubmitRequest, signal: AbortSignal) => Promise<GameSubmitAttemptOutcome>
  history: (signal: AbortSignal) => Promise<GameHistoryEntry[]>
}

const defaultTransport: GamesSubmitTransport = {
  submit: (payload, signal) => meApi.games.submitVariantChecked(payload, { signal }),
  history: async (signal) => (await meApi.games.getHistory({ limit: 20 }, { signal })).data,
}

let transport: GamesSubmitTransport = defaultTransport

export function setGamesSubmitTransport(next: GamesSubmitTransport | null): void {
  transport = next ?? defaultTransport
}

export type SubmitRoundOutcome =
  /** Scored by the backend; the result is authoritative. */
  | { status: 'recorded'; result: GameSubmitResult }
  /** The backend already had this round (a replay of a timed-out submit). */
  | { status: 'already_recorded'; score: number | null }
  /** Kept in the outbox; will be retried automatically. */
  | { status: 'queued'; reason: 'transient' | 'rate_limited' }
  /** The backend refused the round for good (bad/expired variant, no session). */
  | { status: 'rejected'; httpStatus: number }

// ── change notifications ────────────────────────────────────────────────────
// A background flush can land a result while the round screen is mounted, so
// the UI subscribes instead of polling.

type OutboxListener = () => void
const listeners = new Set<OutboxListener>()

export function onGamesOutboxChange(listener: OutboxListener): () => void {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

function notify(): void {
  for (const listener of [...listeners]) {
    try {
      listener()
    } catch {
      // A broken subscriber must not stop the flush.
    }
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}

/**
 * Looks for an already-recorded attempt for this variant. `since` guards
 * against matching an *earlier* play of the same variant (rounds are
 * replayable), so only attempts completed around or after the queue time
 * count.
 */
async function reconcile(
  variantId: string,
  since: number,
): Promise<{ found: boolean; score: number | null }> {
  try {
    const entries = await withTimeout(RECONCILE_TIMEOUT_MS, (signal) => transport.history(signal))
    const match = entries.find((entry) => {
      if (entry.variant_id !== variantId) return false
      const completed = Date.parse(entry.completed_at)
      return !Number.isFinite(completed) || completed >= since - RECONCILE_SLACK_MS
    })
    return { found: match !== undefined, score: match?.score ?? null }
  } catch {
    // Can't tell — treat as not recorded and let the caller retry later.
    return { found: false, score: null }
  }
}

function settle(variantId: string, result: GameSubmitResult): void {
  saveRoundResult(variantId, result)
  clearPendingSubmit(variantId)
  // The progress snapshot is deliberately kept: the result review reads the
  // player's own guesses and wrong attempts from it, which the server response
  // does not carry. It expires on its own.
  notify()
}

/**
 * Submits a round, queueing it locally first. Resolves with what is known for
 * certain; a `queued` outcome means the score will be recorded later without
 * the player having to do anything.
 */
export async function submitRound(
  payload: GameSubmitRequest,
  opts?: { retryDelaysMs?: number[] },
): Promise<SubmitRoundOutcome> {
  const delays = opts?.retryDelaysMs ?? RETRY_DELAYS_MS
  const entry = savePendingSubmit(payload)

  for (let attempt = 0; attempt < delays.length + 1; attempt += 1) {
    if (attempt > 0) {
      await sleep(delays[attempt - 1])
      // The previous attempt's fate is unknown, so check before replaying.
      const known = await reconcile(payload.variant_id, entry.createdAt)
      if (known.found) {
        clearPendingSubmit(payload.variant_id)
        clearRoundProgress(payload.variant_id)
        notify()
        return { status: 'already_recorded', score: known.score }
      }
    }

    const outcome = await withTimeout(SUBMIT_TIMEOUT_MS, (signal) =>
      transport.submit(payload, signal),
    ).catch(() => ({ kind: 'transient' as const }))

    if (outcome.kind === 'ok') {
      settle(payload.variant_id, outcome.data)
      return { status: 'recorded', result: outcome.data }
    }
    if (outcome.kind === 'rejected') {
      clearPendingSubmit(payload.variant_id)
      notify()
      return { status: 'rejected', httpStatus: outcome.status }
    }
    if (outcome.kind === 'rate_limited') {
      // Retrying now would just 429 again. It may also mean an earlier submit
      // of this round did land, so reconcile once before backing off.
      const known = await reconcile(payload.variant_id, entry.createdAt)
      if (known.found) {
        clearPendingSubmit(payload.variant_id)
        clearRoundProgress(payload.variant_id)
        notify()
        return { status: 'already_recorded', score: known.score }
      }
      bumpPendingAttempts(payload.variant_id)
      return { status: 'queued', reason: 'rate_limited' }
    }
    bumpPendingAttempts(payload.variant_id)
  }

  return { status: 'queued', reason: 'transient' }
}

let flushing = false

/**
 * Drains the outbox once. Safe to call on app resume, on reconnect, and on
 * mount — concurrent calls collapse into the first one. Returns how many
 * queued rounds reached a terminal state.
 */
export async function flushPendingGameSubmits(): Promise<number> {
  if (flushing) return 0
  const pending = listPendingSubmits()
  if (pending.length === 0) return 0

  flushing = true
  let settled = 0
  try {
    for (const entry of pending) {
      // Reconcile first: this entry is only here because its outcome was never
      // confirmed, and a blind replay would risk a duplicate attempt.
      const known = await reconcile(entry.variantId, entry.createdAt)
      if (known.found) {
        clearPendingSubmit(entry.variantId)
        clearRoundProgress(entry.variantId)
        notify()
        settled += 1
        continue
      }

      const outcome = await withTimeout(SUBMIT_TIMEOUT_MS, (signal) =>
        transport.submit(entry.payload, signal),
      ).catch(() => ({ kind: 'transient' as const }))

      if (outcome.kind === 'ok') {
        settle(entry.variantId, outcome.data)
        settled += 1
      } else if (outcome.kind === 'rejected') {
        clearPendingSubmit(entry.variantId)
        notify()
        settled += 1
      } else {
        bumpPendingAttempts(entry.variantId)
        // Rate limited or offline: stop here and let the next trigger retry,
        // rather than walking the whole queue into the same wall.
        break
      }
    }
  } finally {
    flushing = false
  }
  return settled
}
