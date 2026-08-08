/**
 * Convert the hardcoded appendix TSX into markdown for the editorial store.
 *
 * The public prose for the 38 English appendices only exists in
 * `packages/shared/content/library/appendices/appendix-*.tsx`; the
 * `editorial_appendices` rows carry title and snippet only. This script is the
 * re-runnable bridge: it walks each appendix's React element tree and emits
 * markdown in the dialect `components/library/appendix-markdown.tsx` renders
 * (CommonMark + remark-gfm tables, no raw HTML, sanitize-safe URLs).
 *
 * Alongside the bodies it writes `videos.json`, a manifest covering all 38
 * appendices. Each appendix carries at most one video (a single trailing
 * YouTube embed), and that is treated as payload metadata rather than body
 * content, so with `--embeds=drop` the body stays plain markdown and the
 * manifest is what carries the video into `editorial_appendices`.
 *
 * It writes files. It never touches the database, and it never modifies the
 * source TSX.
 *
 * With `--sql <file>` it also emits the backfill script that writes those
 * bodies and video fields into `editorial_appendices`. That script is a dry run
 * by default and never runs from here; see its own header for usage.
 *
 * Run from apps/web:
 *   pnpm appendices:markdown -- --out <dir> [--embeds=link|shortcode|drop] [numbers...]
 *   pnpm appendices:backfill                        # regenerates the SQL artifact
 *
 * With no numbers it writes a body for all 38. The manifest and the SQL always
 * cover all 38 regardless, so neither is ever partially valid.
 */
import { mkdirSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import React, { type ReactNode } from 'react'

// tsx transpiles the shared content files with the classic JSX transform
// (their nearest tsconfig has jsx: preserve), which emits bare
// `React.createElement` references — satisfy them globally.
;(globalThis as { React?: typeof React }).React = React
import { APPENDICES } from '@/constants/appendices'
import { convertTree, type ConvertResult, type EmbedMode } from './appendix-markdown/walk'
import { buildBackfillSql, type BackfillRow } from './appendix-markdown/sql'

/** One appendix's row in videos.json. */
interface ManifestEntry {
  /** editorial_appendices.code, i.e. the appendix number as a string. */
  code: string
  title: string
  markdown_file: string
  /** Bare 11-char YouTube id, or null when the appendix has no video. */
  video_id: string | null
  video_title: string | null
}

const MANIFEST_FILE = 'videos.json'
const YOUTUBE_ID = /^[A-Za-z0-9_-]{11}$/

interface Cli {
  /** Directory for the .md bodies and videos.json, or null to skip them. */
  outDir: string | null
  /** File for the backfill SQL, or null to skip it. */
  sqlFile: string | null
  embeds: EmbedMode
  numbers: number[]
}

const EMBED_MODES: readonly EmbedMode[] = ['link', 'shortcode', 'drop']

function parseArgs(argv: readonly string[]): Cli {
  let outDir: string | null = null
  let sqlFile: string | null = null
  let embeds: EmbedMode = 'link'
  const numbers: number[] = []

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i]
    // `pnpm appendices:markdown -- --out …` forwards the separator verbatim.
    if (arg === '--') continue
    if (arg === '--out') {
      const value = argv[i + 1]
      if (!value) throw new Error('--out requires a directory')
      outDir = path.resolve(process.cwd(), value)
      i += 1
    } else if (arg.startsWith('--out=')) {
      outDir = path.resolve(process.cwd(), arg.slice('--out='.length))
    } else if (arg === '--sql') {
      const value = argv[i + 1]
      if (!value) throw new Error('--sql requires a file path')
      sqlFile = path.resolve(process.cwd(), value)
      i += 1
    } else if (arg.startsWith('--sql=')) {
      sqlFile = path.resolve(process.cwd(), arg.slice('--sql='.length))
    } else if (arg.startsWith('--embeds=')) {
      const value = arg.slice('--embeds='.length) as EmbedMode
      if (!EMBED_MODES.includes(value)) {
        throw new Error(`--embeds must be one of ${EMBED_MODES.join(', ')}`)
      }
      embeds = value
    } else if (/^\d+$/.test(arg)) {
      numbers.push(Number(arg))
    } else {
      throw new Error(`unrecognised argument: ${arg}`)
    }
  }

  if (!outDir && !sqlFile) {
    throw new Error('nothing to do: pass --out <dir> and/or --sql <file>')
  }
  if (sqlFile && embeds !== 'drop') {
    // The backfill carries the video in its own payload keys, so a body that
    // still contains the embed would render it twice.
    throw new Error('--sql requires --embeds=drop')
  }

  return { outDir, sqlFile, embeds, numbers }
}

async function convertAppendix(number: number, embeds: EmbedMode): Promise<ConvertResult> {
  const mod = (await import(`@/content/library/appendices/appendix-${number}`)) as {
    AppendixContent: () => ReactNode
  }
  // These content components are pure and hook-free, so calling one outside a
  // React renderer just yields its element tree.
  const tree = mod.AppendixContent()
  return convertTree(tree, { embeds })
}

/**
 * The one video of an appendix, if it has one. More than one would mean the
 * "at most one trailing video" assumption the payload model rests on no longer
 * holds, so that fails loudly rather than silently keeping the first.
 */
function soleEmbed(
  number: number,
  result: ConvertResult,
): { videoId: string; videoTitle: string } | null {
  if (result.embeds.length === 0) return null
  if (result.embeds.length > 1) {
    throw new Error(
      `appendix ${number}: ${result.embeds.length} videos found, but the payload holds one ` +
        `(${result.embeds.map((e) => e.videoId).join(', ')})`,
    )
  }
  const embed = result.embeds[0]
  if (!YOUTUBE_ID.test(embed.videoId)) {
    throw new Error(`appendix ${number}: "${embed.videoId}" is not a bare YouTube id`)
  }
  return embed
}

async function main() {
  const cli = parseArgs(process.argv.slice(2))
  const known = new Set(APPENDICES.map((a) => a.number))
  const all = APPENDICES.map((a) => a.number)
  const targets = new Set(cli.numbers.length > 0 ? cli.numbers : all)

  const unknown = [...targets].filter((n) => !known.has(n))
  if (unknown.length > 0) throw new Error(`unknown appendix number(s): ${unknown.join(', ')}`)

  if (cli.outDir) mkdirSync(cli.outDir, { recursive: true })
  if (cli.sqlFile) mkdirSync(path.dirname(cli.sqlFile), { recursive: true })

  // Every appendix is converted, even when only some bodies are being written,
  // so the manifest and the SQL always describe the whole corpus.
  const manifest: ManifestEntry[] = []
  const backfill: BackfillRow[] = []
  for (const number of all) {
    const result = await convertAppendix(number, cli.embeds)
    const { markdown, warnings } = result
    if (!markdown.trim()) throw new Error(`appendix ${number}: conversion produced no markdown`)

    const embed = soleEmbed(number, result)
    // The title is informational only; the backfill writes body and video, and
    // never touches the row's own title.
    const meta = APPENDICES.find((a) => a.number === number)
    const markdownFile = `appendix-${number}.md`

    manifest.push({
      code: String(number),
      title: meta?.title ?? `Appendix ${number}`,
      markdown_file: markdownFile,
      video_id: embed?.videoId ?? null,
      video_title: embed?.videoTitle || null,
    })
    backfill.push({
      code: String(number),
      title: meta?.title ?? `Appendix ${number}`,
      body: markdown,
      videoId: embed?.videoId ?? null,
      videoTitle: embed?.videoTitle || null,
    })

    if (!cli.outDir || !targets.has(number)) continue

    const file = path.join(cli.outDir, markdownFile)
    writeFileSync(file, markdown)
    console.log(`appendix ${number}: ${markdown.length} chars → ${file}`)
    for (const warning of warnings) console.log(`  ! ${warning}`)
  }

  const withVideo = manifest.filter((entry) => entry.video_id !== null).length

  if (cli.outDir) {
    const manifestPath = path.join(cli.outDir, MANIFEST_FILE)
    writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`)
    console.log(
      `manifest: ${manifest.length} appendices, ${withVideo} with a video → ${manifestPath}`,
    )
  }

  if (cli.sqlFile) {
    const sql = buildBackfillSql(backfill)
    writeFileSync(cli.sqlFile, sql)
    console.log(
      `backfill sql: ${backfill.length} appendices, ${withVideo} with a video, ` +
        `${sql.length} chars → ${cli.sqlFile}`,
    )
  }
}

void main().catch((error) => {
  console.error(error)
  process.exit(1)
})
