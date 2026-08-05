import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import {
  flushPendingGameSubmits,
  onGamesOutboxChange,
  setGamesSubmitTransport,
  submitRound,
  type GamesSubmitTransport,
} from '@/lib/games-submit'
import {
  listPendingSubmits,
  readPendingSubmit,
  readRoundProgress,
  readRoundResult,
  savePendingSubmit,
  saveRoundProgress,
} from '@/lib/games-outbox'
import type {
  GameHistoryEntry,
  GameSubmitAttemptOutcome,
  GameSubmitRequest,
  GameSubmitResult,
} from '@/src/api/me-client'

const VARIANT = 'p1-en-medium-short-1'
// No real backoff in tests; the delays are the only slow part of the runner.
const NO_DELAY = { retryDelaysMs: [0, 0] }

function payload(variantId = VARIANT): GameSubmitRequest {
  return {
    variant_id: variantId,
    session_id: 'session-1',
    guesses: [{ index: 0, value: 'god' }],
    hints_used: 0,
    elapsed_ms: 1_000,
  }
}

function result(score = 1200): GameSubmitResult {
  return {
    attempt_id: 'attempt-1',
    score,
    correct_count: 3,
    total_count: 4,
    per_blank: [{ index: 0, correct: true, accepted_answer: 'god' }],
    difficulty_multiplier: 1.5,
    hint_penalty: 0,
    wrong_penalty: 0,
  }
}

function historyEntry(overrides: Partial<GameHistoryEntry> = {}): GameHistoryEntry {
  return {
    attempt_id: 'attempt-1',
    variant_id: VARIANT,
    score: 1200,
    size: 'short',
    difficulty: 'medium',
    completed_at: new Date().toISOString(),
    ...overrides,
  }
}

/** Transport whose submit outcomes are scripted per call. */
function fakeTransport(
  outcomes: GameSubmitAttemptOutcome[],
  history: GameHistoryEntry[] = [],
): GamesSubmitTransport & { submitCalls: number; historyCalls: number } {
  const t = {
    submitCalls: 0,
    historyCalls: 0,
    submit: async () => {
      const outcome = outcomes[Math.min(t.submitCalls, outcomes.length - 1)]
      t.submitCalls += 1
      return outcome
    },
    history: async () => {
      t.historyCalls += 1
      return history
    },
  }
  return t
}

beforeEach(() => {
  window.localStorage.clear()
})

afterEach(() => {
  setGamesSubmitTransport(null)
  vi.useRealTimers()
})

describe('submitRound', () => {
  it('records a successful submit, dropping the queue but keeping the review data', async () => {
    setGamesSubmitTransport(fakeTransport([{ kind: 'ok', data: result() }]))
    saveRoundProgress(VARIANT, {
      guesses: {},
      feedback: {},
      hintsRevealed: {},
      attemptsRemaining: {},
      wrongAttempts: {},
      elapsedMs: 0,
      updatedAt: Date.now(),
    })

    const outcome = await submitRound(payload(), NO_DELAY)

    expect(outcome).toEqual({ status: 'recorded', result: result() })
    expect(readPendingSubmit(VARIANT)).toBeNull()
    expect(readRoundResult(VARIANT)?.score).toBe(1200)
    // The snapshot stays: the result review renders the player's own guesses
    // and wrong attempts, which the server response never carries.
    expect(readRoundProgress(VARIANT)).not.toBeNull()
  })

  it('queues the round before the request leaves the device', async () => {
    let queuedDuringRequest: boolean | undefined
    setGamesSubmitTransport({
      submit: async () => {
        queuedDuringRequest = readPendingSubmit(VARIANT) !== null
        return { kind: 'ok', data: result() }
      },
      history: async () => [],
    })

    await submitRound(payload(), NO_DELAY)

    expect(queuedDuringRequest).toBe(true)
  })

  it('retries a transient failure and records the retry', async () => {
    const transport = fakeTransport([{ kind: 'transient' }, { kind: 'ok', data: result() }])
    setGamesSubmitTransport(transport)

    const outcome = await submitRound(payload(), NO_DELAY)

    expect(outcome.status).toBe('recorded')
    expect(transport.submitCalls).toBe(2)
  })

  it('keeps the round queued when every attempt fails', async () => {
    const transport = fakeTransport([{ kind: 'transient' }])
    setGamesSubmitTransport(transport)

    const outcome = await submitRound(payload(), NO_DELAY)

    expect(outcome).toEqual({ status: 'queued', reason: 'transient' })
    expect(transport.submitCalls).toBe(3)
    expect(readPendingSubmit(VARIANT)?.attempts).toBe(3)
  })

  it('stops replaying once history shows the round already landed', async () => {
    // The first POST timed out on the way back, so the server has the attempt.
    const transport = fakeTransport([{ kind: 'transient' }], [historyEntry({ score: 900 })])
    setGamesSubmitTransport(transport)

    const outcome = await submitRound(payload(), NO_DELAY)

    expect(outcome).toEqual({ status: 'already_recorded', score: 900 })
    // Exactly one POST: the reconcile check prevented a duplicate attempt row.
    expect(transport.submitCalls).toBe(1)
    expect(readPendingSubmit(VARIANT)).toBeNull()
  })

  it('ignores an older attempt on the same variant when reconciling', async () => {
    // Variants are replayable: a previous play must not be mistaken for this one.
    const stale = historyEntry({ completed_at: new Date(Date.now() - 60 * 60 * 1000).toISOString() })
    const transport = fakeTransport([{ kind: 'transient' }, { kind: 'ok', data: result() }], [stale])
    setGamesSubmitTransport(transport)

    const outcome = await submitRound(payload(), NO_DELAY)

    expect(outcome.status).toBe('recorded')
    expect(transport.submitCalls).toBe(2)
  })

  it('ignores a different variant when reconciling', async () => {
    const other = historyEntry({ variant_id: 'p9-en-hard-long-2' })
    const transport = fakeTransport([{ kind: 'transient' }, { kind: 'ok', data: result() }], [other])
    setGamesSubmitTransport(transport)

    expect((await submitRound(payload(), NO_DELAY)).status).toBe('recorded')
    expect(transport.submitCalls).toBe(2)
  })

  it('does not retry a round the backend refused', async () => {
    const transport = fakeTransport([{ kind: 'rejected', status: 404 }])
    setGamesSubmitTransport(transport)

    const outcome = await submitRound(payload(), NO_DELAY)

    expect(outcome).toEqual({ status: 'rejected', httpStatus: 404 })
    expect(transport.submitCalls).toBe(1)
    expect(readPendingSubmit(VARIANT)).toBeNull()
  })

  it('backs off instead of hammering a rate limit', async () => {
    const transport = fakeTransport([{ kind: 'rate_limited' }])
    setGamesSubmitTransport(transport)

    const outcome = await submitRound(payload(), NO_DELAY)

    expect(outcome).toEqual({ status: 'queued', reason: 'rate_limited' })
    expect(transport.submitCalls).toBe(1)
    expect(readPendingSubmit(VARIANT)).not.toBeNull()
  })

  it('resolves a rate limit that was caused by an earlier submit landing', async () => {
    const transport = fakeTransport([{ kind: 'rate_limited' }], [historyEntry()])
    setGamesSubmitTransport(transport)

    expect((await submitRound(payload(), NO_DELAY)).status).toBe('already_recorded')
    expect(readPendingSubmit(VARIANT)).toBeNull()
  })

  it('treats a request that never settles as transient', async () => {
    vi.useFakeTimers()
    // A stalled socket: only the deadline ends this request.
    setGamesSubmitTransport({
      submit: (_payload, signal) =>
        new Promise((_resolve, reject) => {
          signal.addEventListener('abort', () => reject(new Error('aborted')))
        }),
      history: async () => [],
    })

    const pending = submitRound(payload(), NO_DELAY)
    await vi.advanceTimersByTimeAsync(60_000)

    expect(await pending).toEqual({ status: 'queued', reason: 'transient' })
  })

  it('notifies subscribers when a result lands', async () => {
    setGamesSubmitTransport(fakeTransport([{ kind: 'ok', data: result() }]))
    const seen: number[] = []
    const unsubscribe = onGamesOutboxChange(() => {
      seen.push(readRoundResult(VARIANT)?.score ?? -1)
    })

    await submitRound(payload(), NO_DELAY)
    unsubscribe()

    expect(seen).toEqual([1200])
  })
})

describe('flushPendingGameSubmits', () => {
  it('is a no-op with an empty queue', async () => {
    const transport = fakeTransport([{ kind: 'ok', data: result() }])
    setGamesSubmitTransport(transport)

    expect(await flushPendingGameSubmits()).toBe(0)
    expect(transport.submitCalls).toBe(0)
  })

  it('sends a queued round and stores the result', async () => {
    savePendingSubmit(payload())
    setGamesSubmitTransport(fakeTransport([{ kind: 'ok', data: result() }]))

    expect(await flushPendingGameSubmits()).toBe(1)
    expect(listPendingSubmits()).toEqual([])
    expect(readRoundResult(VARIANT)?.score).toBe(1200)
  })

  it('reconciles before replaying so a landed round is not submitted twice', async () => {
    savePendingSubmit(payload())
    const transport = fakeTransport([{ kind: 'ok', data: result() }], [historyEntry()])
    setGamesSubmitTransport(transport)

    expect(await flushPendingGameSubmits()).toBe(1)
    expect(transport.submitCalls).toBe(0)
    expect(listPendingSubmits()).toEqual([])
  })

  it('keeps a round queued and stops early while still offline', async () => {
    savePendingSubmit(payload('p1-en-medium-short-1'))
    savePendingSubmit(payload('p2-en-hard-long-3'))
    const transport = fakeTransport([{ kind: 'transient' }])
    setGamesSubmitTransport(transport)

    expect(await flushPendingGameSubmits()).toBe(0)
    expect(listPendingSubmits()).toHaveLength(2)
    // Bailed after the first failure instead of walking the whole queue.
    expect(transport.submitCalls).toBe(1)
  })

  it('drops a round the backend refuses so it cannot wedge the queue', async () => {
    savePendingSubmit(payload())
    setGamesSubmitTransport(fakeTransport([{ kind: 'rejected', status: 400 }]))

    expect(await flushPendingGameSubmits()).toBe(1)
    expect(listPendingSubmits()).toEqual([])
    expect(readRoundResult(VARIANT)).toBeNull()
  })

  it('collapses concurrent drains into one', async () => {
    savePendingSubmit(payload())
    let release: (() => void) | undefined
    const gate = new Promise<void>((resolve) => {
      release = resolve
    })
    let submitCalls = 0
    setGamesSubmitTransport({
      submit: async () => {
        submitCalls += 1
        await gate
        return { kind: 'ok', data: result() }
      },
      history: async () => [],
    })

    const first = flushPendingGameSubmits()
    const second = flushPendingGameSubmits()
    release?.()

    expect(await first).toBe(1)
    expect(await second).toBe(0)
    expect(submitCalls).toBe(1)
  })
})
