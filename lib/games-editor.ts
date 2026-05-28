/**
 * Editor-facing types for the games review surface.
 *
 * Access control was previously gated on a GAMES_EDITOR_EMAILS env allowlist
 * hashed in-app. That gate has moved to the database (users.role +
 * users.permissions.games_editor) and is surfaced as `session.isEditor` /
 * `session.isAdmin`. This file now only re-exports the type shapes the
 * editorial UI consumes.
 *
 * The real security boundary remains the backend's RequireEditor middleware.
 */

// Mirrors the backend `reviewPassage` JSON in api/handlers/games_admin.go.
// These endpoints live outside the OpenAPI contract, so the type is declared
// here by hand.
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
