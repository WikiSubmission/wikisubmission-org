import { describe, it, expect, beforeEach } from 'vitest'
import {
  bumpPendingAttempts,
  clearPendingSubmit,
  clearRoundProgress,
  listPendingSubmits,
  readPendingSubmit,
  readRoundProgress,
  readRoundResult,
  savePendingSubmit,
  saveRoundProgress,
  saveRoundResult,
  type GameRoundProgress,
} from '@/lib/games-outbox'
import type { GameSubmitRequest, GameSubmitResult } from '@/src/api/me-client'

const DAY_MS = 24 * 60 * 60 * 1000

function progress(overrides: Partial<GameRoundProgress> = {}): GameRoundProgress {
  return {
    guesses: { 0: 'god', 2: 'mercy' },
    feedback: { 0: 'correct', 2: 'wrong' },
    hintsRevealed: { 2: 1 },
    attemptsRemaining: { 0: 3, 2: 2 },
    wrongAttempts: { 2: ['grace'] },
    elapsedMs: 42_000,
    updatedAt: Date.now(),
    ...overrides,
  }
}

function payload(variantId = 'p1-en-medium-short-1'): GameSubmitRequest {
  return {
    variant_id: variantId,
    session_id: 'session-1',
    guesses: [{ index: 0, value: 'god' }],
    hints_used: 1,
    elapsed_ms: 42_000,
  }
}

function result(): GameSubmitResult {
  return {
    attempt_id: 'attempt-1',
    score: 1200,
    correct_count: 3,
    total_count: 4,
    per_blank: [{ index: 0, correct: true, accepted_answer: 'god' }],
    difficulty_multiplier: 1.5,
    hint_penalty: 25,
    wrong_penalty: 10,
  }
}

beforeEach(() => {
  window.localStorage.clear()
})

describe('round progress', () => {
  it('round-trips a snapshot with numeric blank keys restored', () => {
    saveRoundProgress('v1', progress())
    const restored = readRoundProgress('v1')

    expect(restored).not.toBeNull()
    // JSON stringifies record keys — iteration must still see numbers.
    expect(Object.keys(restored!.guesses)).toEqual(['0', '2'])
    expect(restored!.guesses[2]).toBe('mercy')
    expect(restored!.feedback[0]).toBe('correct')
    expect(restored!.wrongAttempts[2]).toEqual(['grace'])
    expect(restored!.elapsedMs).toBe(42_000)
  })

  it('returns null for an unknown variant', () => {
    expect(readRoundProgress('nope')).toBeNull()
  })

  it('drops a snapshot older than the retention window', () => {
    saveRoundProgress('v1', progress({ updatedAt: Date.now() - 8 * DAY_MS }))
    expect(readRoundProgress('v1')).toBeNull()
    expect(window.localStorage.getItem('ws.game.progress.v1')).toBeNull()
  })

  it('keeps a snapshot inside the retention window', () => {
    saveRoundProgress('v1', progress({ updatedAt: Date.now() - 2 * DAY_MS }))
    expect(readRoundProgress('v1')).not.toBeNull()
  })

  it('clears a snapshot on request', () => {
    saveRoundProgress('v1', progress())
    clearRoundProgress('v1')
    expect(readRoundProgress('v1')).toBeNull()
  })

  it('survives a corrupt payload', () => {
    window.localStorage.setItem('ws.game.progress.v1', '{not json')
    expect(readRoundProgress('v1')).toBeNull()
  })

  it('defaults a missing elapsed time to zero', () => {
    window.localStorage.setItem(
      'ws.game.progress.v1',
      JSON.stringify({ guesses: {}, updatedAt: Date.now() }),
    )
    expect(readRoundProgress('v1')?.elapsedMs).toBe(0)
  })
})

describe('stored result', () => {
  it('round-trips a scored result', () => {
    saveRoundResult('v1', result())
    expect(readRoundResult('v1')?.score).toBe(1200)
  })

  it('expires an old result', () => {
    saveRoundResult('v1', result())
    expect(readRoundResult('v1', Date.now() + 8 * DAY_MS)).toBeNull()
  })
})

describe('pending submits', () => {
  it('queues a submit and reads it back by variant', () => {
    savePendingSubmit(payload())
    const pending = readPendingSubmit('p1-en-medium-short-1')

    expect(pending?.payload.session_id).toBe('session-1')
    expect(pending?.attempts).toBe(0)
  })

  it('keeps one entry per variant and preserves the original queue time', () => {
    const first = savePendingSubmit(payload())
    bumpPendingAttempts('p1-en-medium-short-1')
    const second = savePendingSubmit({ ...payload(), hints_used: 3 })

    expect(listPendingSubmits()).toHaveLength(1)
    expect(second.createdAt).toBe(first.createdAt)
    // Attempts carry over: the round has already cost the player retries.
    expect(second.attempts).toBe(1)
    expect(readPendingSubmit('p1-en-medium-short-1')?.payload.hints_used).toBe(3)
  })

  it('queues distinct variants side by side', () => {
    savePendingSubmit(payload('p1-en-medium-short-1'))
    savePendingSubmit(payload('p2-en-hard-long-3'))
    expect(listPendingSubmits().map((e) => e.variantId)).toEqual([
      'p1-en-medium-short-1',
      'p2-en-hard-long-3',
    ])
  })

  it('bumps the attempt counter', () => {
    savePendingSubmit(payload())
    bumpPendingAttempts('p1-en-medium-short-1')
    bumpPendingAttempts('p1-en-medium-short-1')
    expect(readPendingSubmit('p1-en-medium-short-1')?.attempts).toBe(2)
  })

  it('clears one variant without touching the others', () => {
    savePendingSubmit(payload('p1-en-medium-short-1'))
    savePendingSubmit(payload('p2-en-hard-long-3'))
    clearPendingSubmit('p1-en-medium-short-1')

    expect(listPendingSubmits().map((e) => e.variantId)).toEqual(['p2-en-hard-long-3'])
  })

  it('prunes entries past the retention window', () => {
    savePendingSubmit(payload('p1-en-medium-short-1'))
    savePendingSubmit(payload('p2-en-hard-long-3'))
    const raw = JSON.parse(window.localStorage.getItem('ws.game.pending')!)
    raw[0].createdAt = Date.now() - 8 * DAY_MS
    window.localStorage.setItem('ws.game.pending', JSON.stringify(raw))

    expect(listPendingSubmits().map((e) => e.variantId)).toEqual(['p2-en-hard-long-3'])
  })

  it('ignores a malformed queue', () => {
    window.localStorage.setItem('ws.game.pending', '{"not":"an array"}')
    expect(listPendingSubmits()).toEqual([])
  })
})
