// Durable, device-local storage for Fill-the-Blank rounds.
//
// Three things are kept in localStorage (not sessionStorage — this has to
// survive the Android app being backgrounded and killed):
//
//   progress  in-flight answers for a round, so a reload or a cold restart
//             resumes where the player left off instead of an empty grid
//   pending   a submitted round that has not been acknowledged by the backend
//             yet — written BEFORE the request goes out, so a crash or a dead
//             connection mid-submit never loses the round
//   result    the scored result, so reopening the round shows the score rather
//             than restarting it
//
// Submits are not idempotent server-side (every POST inserts an attempt row),
// so the flush path in games-submit.ts reconciles against /me/games/history
// before replaying anything from `pending`.
import type { GameSubmitRequest, GameSubmitResult } from '@/src/api/me-client'

const PROGRESS_PREFIX = 'ws.game.progress.'
const RESULT_PREFIX = 'ws.game.result.'
const PENDING_KEY = 'ws.game.pending'

/** Entries older than this are dropped on the next read — bounds growth and
 * stops a long-dead round from being replayed weeks later. */
const MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000

export type BlankFeedback = 'correct' | 'wrong'

export interface GameRoundProgress {
  guesses: Record<number, string>
  feedback: Record<number, BlankFeedback>
  hintsRevealed: Record<number, number>
  attemptsRemaining: Record<number, number>
  wrongAttempts: Record<number, string[]>
  /** Play time accumulated so far, so the clock survives a restart. */
  elapsedMs: number
  updatedAt: number
}

export interface PendingGameSubmit {
  variantId: string
  payload: GameSubmitRequest
  createdAt: number
  attempts: number
}

// ── storage seam ────────────────────────────────────────────────────────────
// Injectable so the logic is testable in a node environment and inert during
// SSR / the static export's prerender pass.

type KeyValueStore = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>

let override: KeyValueStore | null = null

/** Test seam: swap in a fake store (pass null to fall back to localStorage). */
export function setGamesStore(store: KeyValueStore | null): void {
  override = store
}

function store(): KeyValueStore | null {
  if (override) return override
  if (typeof window === 'undefined') return null
  try {
    return window.localStorage
  } catch {
    return null
  }
}

function read<T>(key: string): T | null {
  const s = store()
  if (!s) return null
  try {
    const raw = s.getItem(key)
    return raw ? (JSON.parse(raw) as T) : null
  } catch {
    return null
  }
}

function write(key: string, value: unknown): void {
  const s = store()
  if (!s) return
  try {
    s.setItem(key, JSON.stringify(value))
  } catch {
    // Quota or private-mode failure. Non-fatal: the round still plays, it just
    // loses its local safety net.
  }
}

function remove(key: string): void {
  const s = store()
  if (!s) return
  try {
    s.removeItem(key)
  } catch {
    // Ignore — nothing actionable.
  }
}

// JSON turns numeric record keys into strings. Numeric lookups still work by
// coercion, but iteration does not, so restored records are re-keyed.
function toNumericRecord<T>(input: Record<string, T> | undefined | null): Record<number, T> {
  const out: Record<number, T> = {}
  for (const [key, value] of Object.entries(input ?? {})) {
    const n = Number(key)
    if (Number.isInteger(n)) out[n] = value
  }
  return out
}

// ── round progress ──────────────────────────────────────────────────────────

export function saveRoundProgress(variantId: string, progress: GameRoundProgress): void {
  write(PROGRESS_PREFIX + variantId, progress)
}

export function readRoundProgress(variantId: string, now = Date.now()): GameRoundProgress | null {
  const raw = read<GameRoundProgress>(PROGRESS_PREFIX + variantId)
  if (!raw) return null
  if (typeof raw.updatedAt !== 'number' || now - raw.updatedAt > MAX_AGE_MS) {
    remove(PROGRESS_PREFIX + variantId)
    return null
  }
  return {
    guesses: toNumericRecord(raw.guesses as unknown as Record<string, string>),
    feedback: toNumericRecord(raw.feedback as unknown as Record<string, BlankFeedback>),
    hintsRevealed: toNumericRecord(raw.hintsRevealed as unknown as Record<string, number>),
    attemptsRemaining: toNumericRecord(raw.attemptsRemaining as unknown as Record<string, number>),
    wrongAttempts: toNumericRecord(raw.wrongAttempts as unknown as Record<string, string[]>),
    elapsedMs: typeof raw.elapsedMs === 'number' && raw.elapsedMs >= 0 ? raw.elapsedMs : 0,
    updatedAt: raw.updatedAt,
  }
}

export function clearRoundProgress(variantId: string): void {
  remove(PROGRESS_PREFIX + variantId)
}

// ── scored result ───────────────────────────────────────────────────────────

interface StoredResult {
  result: GameSubmitResult
  savedAt: number
}

export function saveRoundResult(variantId: string, result: GameSubmitResult): void {
  write(RESULT_PREFIX + variantId, { result, savedAt: Date.now() } satisfies StoredResult)
}

export function readRoundResult(variantId: string, now = Date.now()): GameSubmitResult | null {
  const raw = read<StoredResult>(RESULT_PREFIX + variantId)
  if (!raw?.result) return null
  if (typeof raw.savedAt !== 'number' || now - raw.savedAt > MAX_AGE_MS) {
    remove(RESULT_PREFIX + variantId)
    return null
  }
  return raw.result
}

export function clearRoundResult(variantId: string): void {
  remove(RESULT_PREFIX + variantId)
}

// ── pending submits ─────────────────────────────────────────────────────────

/** All queued submits, newest last, with expired entries pruned. */
export function listPendingSubmits(now = Date.now()): PendingGameSubmit[] {
  const raw = read<PendingGameSubmit[]>(PENDING_KEY)
  if (!Array.isArray(raw)) return []
  const live = raw.filter(
    (e) =>
      e &&
      typeof e.variantId === 'string' &&
      e.payload != null &&
      typeof e.createdAt === 'number' &&
      now - e.createdAt <= MAX_AGE_MS,
  )
  if (live.length !== raw.length) write(PENDING_KEY, live)
  return live
}

export function readPendingSubmit(variantId: string): PendingGameSubmit | null {
  return listPendingSubmits().find((e) => e.variantId === variantId) ?? null
}

/** Queue a submit (or refresh the payload of one already queued for the
 * variant). One entry per variant: re-submitting the same round replaces it. */
export function savePendingSubmit(payload: GameSubmitRequest): PendingGameSubmit {
  const existing = listPendingSubmits()
  const previous = existing.find((e) => e.variantId === payload.variant_id)
  const entry: PendingGameSubmit = {
    variantId: payload.variant_id,
    payload,
    createdAt: previous?.createdAt ?? Date.now(),
    attempts: previous?.attempts ?? 0,
  }
  write(PENDING_KEY, [...existing.filter((e) => e.variantId !== payload.variant_id), entry])
  return entry
}

export function bumpPendingAttempts(variantId: string): void {
  const existing = listPendingSubmits()
  write(
    PENDING_KEY,
    existing.map((e) => (e.variantId === variantId ? { ...e, attempts: e.attempts + 1 } : e)),
  )
}

export function clearPendingSubmit(variantId: string): void {
  const existing = listPendingSubmits()
  const next = existing.filter((e) => e.variantId !== variantId)
  if (next.length === existing.length) return
  write(PENDING_KEY, next)
}
