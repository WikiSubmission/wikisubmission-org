// Client-side hand-off between the Fill-the-Blank picker and the play route.
//
// A round is started in the picker and played on /play/[variantId]. The variant
// is stashed in sessionStorage so a refresh inside the same tab keeps working.
// When the stash is missing (e.g. a shared link opened cold), the play route
// reconstructs the start request from the variant-id slug and resumes the
// round — the generator is deterministic, so the regenerated blanks are
// identical. The submit result lives in component state only; there is no
// separate result page.
import type {
  GameVariant,
  GameLanguage,
  GameDifficulty,
  GameRoundSize,
} from '@/src/api/me-client'

const VARIANT_PREFIX = 'ws.game.variant.'

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

export interface ParsedVariantId {
  passage_id: number
  language: GameLanguage
  difficulty: GameDifficulty
  size: GameRoundSize
}

const DIFFICULTIES: GameDifficulty[] = ['easy', 'medium', 'hard', 'professional']
const SIZES: GameRoundSize[] = ['short', 'medium', 'long']
const LANGUAGES: GameLanguage[] = [
  'en', 'ar', 'ac', 'fa', 'ur', 'fr', 'de', 'es', 'sv', 'tr', 'id', 'tl', 'ru', 'bn', 'ta',
]

// Variant ids look like `p42-en-hard-medium-7`:
//   p<passageId> - <language> - <difficulty> - <size> - <counter>
export function parseVariantId(variantId: string): ParsedVariantId | null {
  const parts = variantId.split('-')
  if (parts.length !== 5) return null
  const [rawPassage, language, difficulty, size] = parts

  if (!rawPassage.startsWith('p')) return null
  const passageId = Number(rawPassage.slice(1))
  if (!Number.isInteger(passageId) || passageId <= 0) return null

  if (!LANGUAGES.includes(language as GameLanguage)) return null
  if (!DIFFICULTIES.includes(difficulty as GameDifficulty)) return null
  if (!SIZES.includes(size as GameRoundSize)) return null

  return {
    passage_id: passageId,
    language: language as GameLanguage,
    difficulty: difficulty as GameDifficulty,
    size: size as GameRoundSize,
  }
}
