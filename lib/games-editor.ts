/**
 * Server-only editorial allowlist + shared editor-facing passage type.
 *
 * The real security boundary is the backend's RequireEditor middleware. This
 * soft check only controls whether the studio page renders the UI (and whether
 * the nav shows the link) — never rely on it for security.
 *
 * The allowlist env var is GAMES_EDITOR_EMAILS (plaintext, shared with the
 * backend gate). Comparison is done on SHA-256 hashes computed in-app, so the
 * raw email is never logged or compared directly.
 *
 * Never import this in a Client Component: the env var is not exposed to the
 * browser.
 */
import { createHash } from 'node:crypto'

// Editor-facing passage shape — mirrors the backend `reviewPassage` JSON in
// api/handlers/games_admin.go. These endpoints live outside the OpenAPI
// contract, so the type is declared by hand here.
export interface ReviewPassage {
  id: number
  chapter_start: number
  verse_start: number
  chapter_end: number
  verse_end: number
  label: string
  themes: string[]
  rationale: string
  llm_difficulty?: string | null
  llm_blank_hint?: number | null
  status: string
  source: string
  approved_at?: string | null
  approved_by?: number | null
  created_at: string
  updated_at: string
}

export type ReviewStatus = 'approved' | 'rejected' | 'needs_refinement'

/** SHA-256 hex of a normalized (trimmed, lowercased) email. */
function hashEmail(email: string): string {
  return createHash('sha256').update(email.trim().toLowerCase()).digest('hex')
}

/**
 * Parse GAMES_EDITOR_EMAILS (comma-separated plaintext emails) into a set of
 * SHA-256 hashes. Hashing in-app keeps the raw emails out of comparisons and
 * logs while letting the env var stay the same plaintext value the backend
 * uses.
 */
export function parseEditorHashes(raw: string | undefined): Set<string> {
  if (!raw) return new Set()
  return new Set(
    raw
      .split(',')
      .map((e) => e.trim())
      .filter((e) => e.length > 0)
      .map(hashEmail),
  )
}

/**
 * True when the email is on the GAMES_EDITOR_EMAILS allowlist (compared by
 * hash). An empty or unset allowlist denies everyone, matching the backend.
 */
export function isEditor(email: string | null | undefined): boolean {
  if (!email) return false
  return parseEditorHashes(process.env.GAMES_EDITOR_EMAILS).has(hashEmail(email))
}
