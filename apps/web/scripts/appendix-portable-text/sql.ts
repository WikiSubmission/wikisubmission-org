/**
 * Emits the Portable Text appendix backfill: a re-runnable psql script that
 * writes `body_pt` into `editorial_appendices`.
 *
 * The sibling of ../appendix-markdown/sql.ts and the same shape: dry run by
 * default, drafts only, nothing published unless asked. It differs in what it
 * writes. The markdown script fills `body`; this one fills `body_pt` and leaves
 * `body` exactly as it is, so the 38 markdown drafts already in the database
 * stay valid and an appendix that has not been converted keeps rendering from
 * the carrier it has.
 *
 * This module only builds text. It has no database access of any kind.
 */

export interface PortableTextBackfillRow {
  /** editorial_appendices.code. */
  code: string
  /** Human-readable, for the generated file's comments only. */
  title: string
  /** The Portable Text block array, already serialised to JSON. */
  bodyPtJson: string
  videoId: string | null
  videoTitle: string | null
}

/**
 * Dollar-quoting keeps the JSON readable and diffable, but the tag must not
 * occur inside any body or it would close the literal early. The tag grows
 * until it is unique across the whole corpus.
 */
function dollarTag(bodies: readonly string[]): string {
  for (let i = 0; i < 100; i += 1) {
    const tag = i === 0 ? '$pt$' : `$pt${i}$`
    if (!bodies.some((body) => body.includes(tag))) return tag
  }
  throw new Error('could not find a dollar-quote tag that no appendix body contains')
}

/** Single-quoted SQL literal. standard_conforming_strings is on by default. */
function quote(value: string): string {
  return `'${value.replace(/'/g, "''")}'`
}

function nullableQuote(value: string | null): string {
  return value === null || value === '' ? 'NULL' : quote(value)
}

const HEADER = `-- Appendix backfill: Portable Text bodies → editorial_appendices.draft.body_pt
--
-- GENERATED FILE. Regenerate from apps/web with:
--   pnpm appendices:backfill-pt
--
-- Why a second carrier. The 38 appendices were first converted to markdown,
-- and rendering that revealed markdown has exactly one container: the
-- blockquote. Five distinct card meanings collapsed into it. Two of those
-- collapses changed what the text argues rather than how it looks — appendix
-- 24's two false verses lost the marking that says they are forgeries and
-- became indistinguishable from the genuine scripture quoted beside them, and
-- four separate closing scripture cards merged into one undivided block — and
-- 42 totals rows were demoted to ordinary data rows in a document whose whole
-- case is arithmetic. Portable Text carries those distinctions as typed fields.
--
-- \`body\` is left untouched. The markdown drafts already in these rows stay
-- valid, and the reader prefers \`body_pt\` when it is present and falls back to
-- \`body\` when it is not, so a half-converted corpus still reads correctly.
--
-- The payload is jsonb, so nothing here changes the schema.
--
-- DRY RUN IS THE DEFAULT. Nothing is written unless -v apply=true is passed;
-- the transaction is rolled back and only the report is printed.
--
--   Dry run (default, writes nothing):
--     psql "$DATABASE_URL" -f apps/web/scripts/appendix-backfill-pt.sql
--
--   Actually write the drafts:
--     psql "$DATABASE_URL" -v apply=true -f apps/web/scripts/appendix-backfill-pt.sql
--
--   Also copy each touched draft into its published snapshot (see below):
--     psql "$DATABASE_URL" -v apply=true -v publish=true -f apps/web/scripts/appendix-backfill-pt.sql
--
--   Pin one Quran version when a language carries more than one:
--     psql "$DATABASE_URL" -v version=authorized-translation -f ...
--
-- PUBLISHING IS DELIBERATELY SEPARATE. By default this writes the \`draft\`
-- payload only. The public endpoint serves the \`published\` snapshot, so until
-- something publishes, the live site is unchanged. Review the drafts at /editor
-- first, then either publish them there or re-run this with -v publish=true.
--
-- It is safe to re-run. Rows are matched by code, updates are guarded with IS
-- DISTINCT FROM, so a second run touches nothing and does not bump updated_at.
-- Only rows whose owning Quran version is English are considered, and only the
-- codes listed below.

\\set ON_ERROR_STOP on

-- Defaults for anything not passed with -v.
\\if :{?apply}
\\else
  \\set apply false
\\endif
\\if :{?publish}
\\else
  \\set publish false
\\endif
\\if :{?version}
\\else
  \\set version ''
\\endif

BEGIN;

CREATE TEMPORARY TABLE appendix_pt_backfill (
  code        text PRIMARY KEY,
  body_pt     jsonb NOT NULL,
  video_id    text,
  video_title text
) ON COMMIT DROP;
`

const TAIL = String.raw`
-- ── resolve the rows this run would touch ────────────────────────────────────
-- English-language Quran versions only. jsonb concatenation is a shallow merge,
-- so title, snippet, version_id, code and the existing markdown body in the
-- draft are all preserved; only body_pt and the video keys are replaced. An
-- appendix with no video has any stale video keys stripped, which is what makes
-- a re-run converge rather than accumulate.

CREATE TEMPORARY TABLE appendix_pt_targets ON COMMIT DROP AS
SELECT
  a.id,
  a.code,
  v.slug        AS version_slug,
  a.published IS NOT NULL AS is_published,
  a.draft       AS old_draft,
  CASE
    WHEN b.video_id IS NULL THEN
      (a.draft - 'video_id'::text - 'video_title'::text) || jsonb_build_object('body_pt', b.body_pt)
    ELSE
      a.draft || jsonb_build_object(
        'body_pt',     b.body_pt,
        'video_id',    b.video_id,
        'video_title', b.video_title
      )
  END AS new_draft
FROM public.editorial_appendices a
JOIN public.quran_versions   v ON v.id = a.version_id
JOIN public.languages        l ON l.id = v.lang_id
JOIN appendix_pt_backfill    b ON b.code = a.code
WHERE l.code = 'en'
  AND (:'version' = '' OR v.slug = :'version');

-- ── report ──────────────────────────────────────────────────────────────────

\echo ''
\echo '── appendix codes with no matching English row ─────────────────────────'
SELECT b.code, jsonb_array_length(b.body_pt) AS blocks
FROM appendix_pt_backfill b
WHERE NOT EXISTS (SELECT 1 FROM appendix_pt_targets t WHERE t.code = b.code)
ORDER BY b.code::int;

\echo ''
\echo '── per-row changes ────────────────────────────────────────────────────'
SELECT
  t.code,
  t.version_slug,
  CASE WHEN t.is_published THEN 'published' ELSE 'draft' END AS row_state,
  length(coalesce(t.old_draft->>'body', ''))                AS markdown_body_kept,
  coalesce(jsonb_array_length(t.old_draft->'body_pt'), 0)   AS blocks_before,
  jsonb_array_length(t.new_draft->'body_pt')                AS blocks_after,
  coalesce(t.old_draft->>'video_id', '-')                   AS video_before,
  coalesce(t.new_draft->>'video_id', '-')                   AS video_after,
  CASE WHEN t.old_draft IS DISTINCT FROM t.new_draft THEN 'CHANGES' ELSE 'unchanged' END AS verdict
FROM appendix_pt_targets t
ORDER BY t.code::int;

\echo ''
\echo '── summary ────────────────────────────────────────────────────────────'
SELECT
  (SELECT count(*) FROM appendix_pt_backfill)                                AS codes_in_script,
  count(*)                                                                   AS rows_matched,
  count(*) FILTER (WHERE old_draft IS DISTINCT FROM new_draft)               AS rows_to_update,
  count(*) FILTER (WHERE jsonb_exists(new_draft, 'video_id'))                AS rows_with_video,
  count(*) FILTER (WHERE NOT jsonb_exists(old_draft, 'body_pt'))             AS rows_without_pt_before,
  count(*) FILTER (WHERE coalesce(old_draft->>'body', '') <> '')             AS rows_keeping_markdown
FROM appendix_pt_targets;

-- ── write ───────────────────────────────────────────────────────────────────

UPDATE public.editorial_appendices a
SET draft = t.new_draft,
    updated_at = now()
FROM appendix_pt_targets t
WHERE a.id = t.id
  AND a.draft IS DISTINCT FROM t.new_draft;

\if :publish
  \echo ''
  \echo '── publishing (copying draft into the published snapshot) ──────────────'
  UPDATE public.editorial_appendices a
  SET published = a.draft,
      published_at = now(),
      updated_at = now()
  FROM appendix_pt_targets t
  WHERE a.id = t.id
    AND a.published IS DISTINCT FROM a.draft;
\else
  \echo ''
  \echo 'publish: skipped (pass -v publish=true to copy drafts into published)'
\endif

\if :apply
  COMMIT;
  \echo ''
  \echo 'APPLIED: the changes above are committed.'
\else
  ROLLBACK;
  \echo ''
  \echo 'DRY RUN: nothing was written. Re-run with -v apply=true to commit.'
\endif
`

/**
 * Builds the whole backfill script.
 *
 * The markdown generator refuses a body containing a `:name` token, on the
 * argument that it looks like a psql variable. That guard is not carried over:
 * psql does not expand variables inside dollar quotes, and a Portable Text body
 * is full of structural `:false` and `:null`, so the check would reject every
 * appendix while protecting against nothing. What is checked instead is the one
 * thing that actually matters for this artifact — that each body is valid JSON
 * that survives a round trip, since it is inserted straight into a jsonb column
 * and a malformed literal would only surface as a syntax error at apply time.
 */
export function buildPortableTextBackfillSql(
  rows: readonly PortableTextBackfillRow[],
): string {
  if (rows.length === 0) throw new Error('refusing to emit a backfill with no appendices')

  for (const row of rows) {
    let parsed: unknown
    try {
      parsed = JSON.parse(row.bodyPtJson)
    } catch (error) {
      throw new Error(
        `appendix ${row.code}: body_pt is not valid JSON: ` +
          `${error instanceof Error ? error.message : String(error)}`,
      )
    }
    if (!Array.isArray(parsed) || parsed.length === 0) {
      throw new Error(`appendix ${row.code}: body_pt must be a non-empty block array`)
    }
  }

  const tag = dollarTag(rows.map((row) => row.bodyPtJson))
  const values = rows
    .map((row) => {
      const head = `-- Appendix ${row.code}: ${row.title.replace(/\n/g, ' ')}`
      return (
        `${head}\n(${quote(row.code)}, ${tag}${row.bodyPtJson}${tag}::jsonb, ` +
        `${nullableQuote(row.videoId)}, ${nullableQuote(row.videoTitle)})`
      )
    })
    .join(',\n\n')

  return `${HEADER}
INSERT INTO appendix_pt_backfill (code, body_pt, video_id, video_title) VALUES

${values};
${TAIL}`
}
