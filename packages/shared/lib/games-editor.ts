/**
 * Editor-facing types for the games review surface.
 *
 * Access control has moved twice: first off a GAMES_EDITOR_EMAILS env allowlist
 * onto a single users.permissions.games_editor flag, and now onto per-game grant
 * tables (backend migration 027). Resolve access with the predicates in
 * apps/web/lib/editorial-access.ts — `canReadGame` / `canWriteGame` — or the
 * helpers in apps/web/lib/games-access.ts. `session.isEditor` survives only as a
 * coarse nav hint and goes stale for up to 55 minutes.
 *
 * This file now only re-exports the type shapes the editorial UI consumes.
 *
 * The real security boundary remains the backend's per-game middleware
 * (auth.RequireGameEditor for reads, auth.RequireGameWriter for mutations).
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
