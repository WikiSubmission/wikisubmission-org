/**
 * Server-only editorial allowlist + shared editor-facing passage type.
 *
 * The real security boundary is the backend's RequireEditor middleware. This
 * soft check only controls whether the studio page renders the UI or a
 * "not authorized" message — never rely on it for security.
 *
 * Never import this in a Client Component: GAMES_EDITOR_EMAILS is not exposed
 * to the browser.
 */

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

/** Parse GAMES_EDITOR_EMAILS (comma-separated, trimmed, lowercased). */
export function parseEditorEmails(raw: string | undefined): Set<string> {
  if (!raw) return new Set()
  return new Set(
    raw
      .split(',')
      .map((e) => e.trim().toLowerCase())
      .filter((e) => e.length > 0),
  )
}

/**
 * True when the email is on the GAMES_EDITOR_EMAILS allowlist. An empty or
 * unset allowlist denies everyone, matching the backend.
 */
export function isEditor(email: string | null | undefined): boolean {
  if (!email) return false
  return parseEditorEmails(process.env.GAMES_EDITOR_EMAILS).has(email.trim().toLowerCase())
}
