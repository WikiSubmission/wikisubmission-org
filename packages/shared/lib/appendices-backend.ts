import { resolveBrowserApiBaseUrl, resolveServerApiBaseUrl } from '@/src/api/base-url'

/**
 * Public appendices reads from ws-backend's editorial store — the rows edited
 * at /editor. Mirrors lib/blog-backend.ts: the backend serves only published
 * snapshots, and the snake_case DTO is mapped onto a camelCase view shape here
 * so the rendering components never see wire naming.
 *
 * `body` is markdown text, not Portable Text (ws-backend commit c54d4db).
 *
 * An appendix's single trailing YouTube embed rides alongside the body as
 * metadata (`video_id` / `video_title`) rather than as body syntax, so the
 * reader renders it below the markdown with the same YouTubeEmbed the
 * hardcoded TSX uses.
 *
 * This is deliberately separate from the legacy `GET /appendices` metadata
 * endpoint (title + snippet only), which still backs the Quran nav listing.
 */

interface PublicAppendixDTO {
  id: number
  code: string
  title: string
  snippet: string
  /** Markdown. Absent on listings and on rows that have no body yet. */
  body?: string
  /** Bare 11-char YouTube id. Absent when the appendix has no video. */
  video_id?: string
  video_title?: string
  language: string
  version_slug: string
  version_name: string
  direction: string
  published_at: string | null
  updated_at: string
}

export interface EditorialAppendix {
  id: number
  /** Stable identifier within a Quran version; numeric for the 38 appendices. */
  code: string
  /** Appendix number, or null when the code is not numeric. */
  number: number | null
  title: string
  snippet?: string
  /** Markdown body. Empty string when the row carries no body. */
  body: string
  /** Bare YouTube id of the appendix's trailing video, or undefined. */
  videoId?: string
  videoTitle?: string
  language: string
  versionSlug: string
  versionName: string
  direction: 'ltr' | 'rtl'
  updatedAt: string
}

function apiBase(): string {
  return typeof window === 'undefined' ? resolveServerApiBaseUrl() : resolveBrowserApiBaseUrl()
}

// Matches the endpoint's own `Cache-Control: public, max-age=300`, so the web
// pages stay statically rendered and refresh within five minutes of an edit
// instead of opting the route into per-request rendering.
const REVALIDATE_SECONDS = 300

async function getData<T>(path: string): Promise<T | null> {
  const base = apiBase()
  if (!base) return null
  try {
    const res = await fetch(`${base}${path}`, { next: { revalidate: REVALIDATE_SECONDS } })
    if (!res.ok) return null
    const json = (await res.json()) as { data?: T }
    return json.data ?? null
  } catch {
    return null
  }
}

function toAppendix(dto: PublicAppendixDTO): EditorialAppendix {
  const parsed = Number.parseInt(dto.code, 10)
  return {
    id: dto.id,
    code: dto.code,
    number: /^\d+$/.test(dto.code) && Number.isFinite(parsed) ? parsed : null,
    title: dto.title,
    snippet: dto.snippet || undefined,
    body: dto.body ?? '',
    videoId: dto.video_id?.trim() || undefined,
    videoTitle: dto.video_title?.trim() || undefined,
    language: dto.language,
    versionSlug: dto.version_slug,
    versionName: dto.version_name,
    direction: dto.direction === 'rtl' ? 'rtl' : 'ltr',
    updatedAt: dto.updated_at,
  }
}

/** Published appendices for a language, in reading order. Bodies are omitted. */
export async function fetchAppendices(language = 'en'): Promise<EditorialAppendix[]> {
  const data = await getData<PublicAppendixDTO[]>(
    `/editorial/public/appendices?language=${encodeURIComponent(language)}`
  )
  return (data ?? []).map(toAppendix)
}

/**
 * One published appendix with its markdown body. Falls back to English when a
 * non-English language has no row for that code, matching the article reads.
 */
export async function fetchAppendix(
  code: string | number,
  language = 'en'
): Promise<EditorialAppendix | null> {
  const path = (lang: string) =>
    `/editorial/public/appendices/${encodeURIComponent(lang)}/${encodeURIComponent(String(code))}`
  let dto = await getData<PublicAppendixDTO>(path(language))
  if (!dto && language !== 'en') dto = await getData<PublicAppendixDTO>(path('en'))
  return dto ? toAppendix(dto) : null
}

/**
 * Whether an appendix carries renderable editorial prose. Rows migrated from
 * the legacy seed have a title and a snippet but no body, so callers keep their
 * existing content source until a body is written in /editor.
 */
export function hasEditorialBody(appendix: EditorialAppendix | null): boolean {
  return Boolean(appendix && appendix.body.trim().length > 0)
}
