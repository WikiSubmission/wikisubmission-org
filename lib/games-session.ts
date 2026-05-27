// Client-side hand-off between the Fill-the-Blank picker → play → result routes.
//
// A round is started in the picker, played on /play/[variantId], and scored on
// /result/[attemptId]. The variant and the submit result are passed across these
// client navigations via sessionStorage so a refresh inside the same tab keeps
// working. When the variant is missing (e.g. a shared link opened cold), the
// play route reconstructs the start request from the variant-id slug and resumes
// the round — the generator is deterministic, so the regenerated blanks are
// identical.
import type {
  GameVariant,
  GameSubmitResult,
  GameLanguage,
  GameDifficulty,
  GameRoundSize,
} from '@/src/api/me-client'

const VARIANT_PREFIX = 'ws.game.variant.'
const RESULT_PREFIX = 'ws.game.result.'

function canUseStorage(): boolean {
  return typeof window !== 'undefined' && 'sessionStorage' in window
}

function read<T>(key: string): T | null {
  if (!canUseStorage()) return null
  try {
    const raw = window.sessionStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : null
  } catch {
    return null
  }
}

function write(key: string, value: unknown): void {
  if (!canUseStorage()) return
  try {
    window.sessionStorage.setItem(key, JSON.stringify(value))
  } catch {
    // Quota or private-mode failures are non-fatal: the play route can re-fetch.
  }
}

export function stashVariant(variant: GameVariant): void {
  write(VARIANT_PREFIX + variant.variant_id, variant)
}

export function readVariant(variantId: string): GameVariant | null {
  return read<GameVariant>(VARIANT_PREFIX + variantId)
}

export function stashResult(result: GameSubmitResult): void {
  write(RESULT_PREFIX + result.attempt_id, result)
}

export function readResult(attemptId: string): GameSubmitResult | null {
  return read<GameSubmitResult>(RESULT_PREFIX + attemptId)
}

export interface ParsedVariantId {
  passage_id: number
  language: GameLanguage
  difficulty: GameDifficulty
  size: GameRoundSize
}

const DIFFICULTIES: GameDifficulty[] = ['easy', 'medium', 'hard', 'professional']
const SIZES: GameRoundSize[] = ['short', 'medium', 'long']

// Variant ids look like `p42-en-hard-medium-7`:
//   p<passageId> - <language> - <difficulty> - <size> - <counter>
export function parseVariantId(variantId: string): ParsedVariantId | null {
  const parts = variantId.split('-')
  if (parts.length !== 5) return null
  const [rawPassage, language, difficulty, size] = parts

  if (!rawPassage.startsWith('p')) return null
  const passageId = Number(rawPassage.slice(1))
  if (!Number.isInteger(passageId) || passageId <= 0) return null

  if (language !== 'en') return null
  if (!DIFFICULTIES.includes(difficulty as GameDifficulty)) return null
  if (!SIZES.includes(size as GameRoundSize)) return null

  return {
    passage_id: passageId,
    language,
    difficulty: difficulty as GameDifficulty,
    size: size as GameRoundSize,
  }
}
