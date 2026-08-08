/**
 * Emits the appendix backfill SQL: a re-runnable psql script that writes the
 * converted markdown body and the video metadata into `editorial_appendices`.
 *
 * The script it produces never writes unless explicitly told to; see the
 * header comment it embeds. This module only builds text; it has no database
 * access of any kind.
 */

export interface BackfillRow {
  /** editorial_appendices.code. */
  code: string
  /** Human-readable, for the generated file's comments only. */
  title: string
  /** Markdown body, with the video already lifted out. */
  body: string
  videoId: string | null
  videoTitle: string | null
}

/**
 * Dollar-quoting keeps 350KB of markdown readable and diffable, but the tag
 * must not occur inside any body or it would close the literal early. The tag
 * grows until it is unique across the whole corpus.
 */
function dollarTag(bodies: readonly string[]): string {
  for (let i = 0; i < 100; i += 1) {
    const tag = i === 0 ? '$md$' : `$md${i}$`
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

const HEADER = `-- Appendix backfill: markdown bodies + video metadata → editorial_appendices
--
-- GENERATED FILE. Regenerate from apps/web with:
--   pnpm appendices:backfill
--
-- The 38 English appendices' prose lives in hardcoded TSX
-- (packages/shared/content/library/appendices/appendix-*.tsx) while their
-- editorial rows carry only a title and a snippet. This script moves the prose
-- into the rows so the public reader can stop falling back to the TSX. Each
-- appendix's single trailing YouTube embed is written as video_id /
-- video_title payload metadata rather than as body markdown.
--
-- The payload is jsonb, so nothing here changes the schema.
--
-- DRY RUN IS THE DEFAULT. Nothing is written unless -v apply=true is passed;
-- the transaction is rolled back and only the report is printed.
--
--   Dry run (default, writes nothing):
--     psql "$DATABASE_URL" -f apps/web/scripts/appendix-backfill.sql
--
--   Actually write the drafts:
--     psql "$DATABASE_URL" -v apply=true -f apps/web/scripts/appendix-backfill.sql
--
--   Also copy each touched draft into its published snapshot (see below):
--     psql "$DATABASE_URL" -v apply=true -v publish=true -f apps/web/scripts/appendix-backfill.sql
--
--   Pin one Quran version when a language carries more than one:
--     psql "$DATABASE_URL" -v version=authorized-translation -f ...
--
-- PUBLISHING IS DELIBERATELY SEPARATE. By default this writes the \`draft\`
-- payload only. The public endpoint serves the \`published\` snapshot, so until
-- something publishes, the live site is unchanged and the reader keeps
-- rendering the TSX. Review the drafts at /editor first, then either publish
-- them there or re-run this with -v publish=true.
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

CREATE TEMPORARY TABLE appendix_backfill (
  code        text PRIMARY KEY,
  body        text NOT NULL,
  video_id    text,
  video_title text
) ON COMMIT DROP;
`

const TAIL = String.raw`
-- ── resolve the rows this run would touch ────────────────────────────────────
-- English-language Quran versions only. jsonb concatenation is a shallow merge,
-- so title, snippet, version_id and code in the existing draft are preserved.
-- An appendix with no video has any stale video keys stripped, which is what
-- makes a re-run converge rather than accumulate.

CREATE TEMPORARY TABLE appendix_targets ON COMMIT DROP AS
SELECT
  a.id,
  a.code,
  v.slug        AS version_slug,
  a.published IS NOT NULL AS is_published,
  a.draft       AS old_draft,
  CASE
    WHEN b.video_id IS NULL THEN
      (a.draft - 'video_id'::text - 'video_title'::text) || jsonb_build_object('body', b.body)
    ELSE
      a.draft || jsonb_build_object(
        'body',        b.body,
        'video_id',    b.video_id,
        'video_title', b.video_title
      )
  END AS new_draft
FROM public.editorial_appendices a
JOIN public.quran_versions v ON v.id = a.version_id
JOIN public.languages     l ON l.id = v.lang_id
JOIN appendix_backfill    b ON b.code = a.code
WHERE l.code = 'en'
  AND (:'version' = '' OR v.slug = :'version');

-- ── report ──────────────────────────────────────────────────────────────────

\echo ''
\echo '── appendix codes with no matching English row ─────────────────────────'
SELECT b.code, left(regexp_replace(b.body, '\s+', ' ', 'g'), 60) AS body_preview
FROM appendix_backfill b
WHERE NOT EXISTS (SELECT 1 FROM appendix_targets t WHERE t.code = b.code)
ORDER BY b.code::int;

\echo ''
\echo '── per-row changes ────────────────────────────────────────────────────'
SELECT
  t.code,
  t.version_slug,
  CASE WHEN t.is_published THEN 'published' ELSE 'draft' END AS row_state,
  length(coalesce(t.old_draft->>'body', ''))  AS body_before,
  length(t.new_draft->>'body')                AS body_after,
  coalesce(t.old_draft->>'video_id', '-')     AS video_before,
  coalesce(t.new_draft->>'video_id', '-')     AS video_after,
  CASE WHEN t.old_draft IS DISTINCT FROM t.new_draft THEN 'CHANGES' ELSE 'unchanged' END AS verdict
FROM appendix_targets t
ORDER BY t.code::int;

\echo ''
\echo '── summary ────────────────────────────────────────────────────────────'
SELECT
  (SELECT count(*) FROM appendix_backfill)                            AS codes_in_script,
  count(*)                                                            AS rows_matched,
  count(*) FILTER (WHERE old_draft IS DISTINCT FROM new_draft)        AS rows_to_update,
  count(*) FILTER (WHERE jsonb_exists(new_draft, 'video_id'))          AS rows_with_video,
  count(*) FILTER (WHERE coalesce(old_draft->>'body', '') = '')       AS rows_with_empty_body_before
FROM appendix_targets;

-- ── write ───────────────────────────────────────────────────────────────────

UPDATE public.editorial_appendices a
SET draft = t.new_draft,
    updated_at = now()
FROM appendix_targets t
WHERE a.id = t.id
  AND a.draft IS DISTINCT FROM t.new_draft;

\if :publish
  \echo ''
  \echo '── publishing (copying draft into the published snapshot) ──────────────'
  UPDATE public.editorial_appendices a
  SET published = a.draft,
      published_at = now(),
      updated_at = now()
  FROM appendix_targets t
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
 * psql expands `:name` outside of quotes; inside dollar quotes it does not,
 * but a body carrying such a token is close enough to a foot-gun that it is
 * worth refusing rather than shipping a script that might corrupt prose.
 */
const PSQL_VARIABLE = /:[A-Za-z_][A-Za-z0-9_]*/

/** Builds the whole backfill script. */
export function buildBackfillSql(rows: readonly BackfillRow[]): string {
  if (rows.length === 0) throw new Error('refusing to emit a backfill with no appendices')

  for (const row of rows) {
    const hit = PSQL_VARIABLE.exec(row.body)
    if (hit) {
      throw new Error(
        `appendix ${row.code}: body contains "${hit[0]}", which psql could read as a variable`,
      )
    }
  }

  const tag = dollarTag(rows.map((row) => row.body))
  const values = rows
    .map((row) => {
      const head = `-- Appendix ${row.code}: ${row.title.replace(/\n/g, ' ')}`
      return (
        `${head}\n(${quote(row.code)}, ${tag}${row.body}${tag}, ` +
        `${nullableQuote(row.videoId)}, ${nullableQuote(row.videoTitle)})`
      )
    })
    .join(',\n\n')

  return `${HEADER}
INSERT INTO appendix_backfill (code, body, video_id, video_title) VALUES

${values};
${TAIL}`
}
