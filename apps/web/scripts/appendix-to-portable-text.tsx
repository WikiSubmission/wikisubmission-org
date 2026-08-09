/**
 * Convert the hardcoded appendix TSX into Portable Text.
 *
 * The sibling of appendix-to-markdown.tsx, and a replacement for it once the
 * fidelity of this path is accepted. Markdown could only express one container,
 * the blockquote, so appendix 24's two forged verses became indistinguishable
 * from genuine scripture, four separate closing scripture cards merged into one,
 * and 42 tables lost the emphasis on their totals rows. Portable Text carries
 * `tone`, `divided` and `totals` as typed fields.
 *
 * Like the markdown script: it writes files, it never touches the database, and
 * it never modifies the source TSX. The trailing YouTube embed is lifted out of
 * the body into `video_id` / `video_title` metadata, exactly as before, so the
 * reader draws it through the same AppendixVideo component.
 *
 * Run from apps/web:
 *   pnpm appendices:pt -- --out <dir> [numbers...]   # write the fixtures
 *   pnpm appendices:backfill-pt                      # regenerate the SQL artifact
 *
 * The SQL always describes the whole corpus, so it ignores any numbers passed.
 */
import { mkdirSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import React, { type ReactNode } from 'react'

// tsx transpiles the shared content files with the classic JSX transform (their
// nearest tsconfig has jsx: preserve), which emits bare `React.createElement`
// references — satisfy them globally.
;(globalThis as { React?: typeof React }).React = React
import { APPENDICES } from '@/constants/appendices'
import { convertTree, type ConvertResult } from './appendix-portable-text/walk'
import {
  buildPortableTextBackfillSql,
  type PortableTextBackfillRow,
} from './appendix-portable-text/sql'

const YOUTUBE_ID = /^[A-Za-z0-9_-]{11}$/

interface Cli {
  outDir: string | null
  sqlFile: string | null
  numbers: number[]
}

function parseArgs(argv: readonly string[]): Cli {
  let outDir: string | null = null
  let sqlFile: string | null = null
  const numbers: number[] = []

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i]
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
    } else if (/^\d+$/.test(arg)) {
      numbers.push(Number(arg))
    } else {
      throw new Error(`unrecognised argument: ${arg}`)
    }
  }

  if (!outDir && !sqlFile) {
    throw new Error('nothing to do: pass --out <dir> and/or --sql <file>')
  }
  return { outDir, sqlFile, numbers }
}

async function convertAppendix(number: number): Promise<ConvertResult> {
  const mod = (await import(`@/content/library/appendices/appendix-${number}`)) as {
    AppendixContent: () => ReactNode
  }
  // These content components are pure and hook-free, so calling one outside a
  // React renderer just yields its element tree.
  return convertTree(mod.AppendixContent())
}

/** The one video of an appendix, if it has one. */
function soleEmbed(number: number, result: ConvertResult) {
  if (result.embeds.length === 0) return null
  if (result.embeds.length > 1) {
    throw new Error(
      `appendix ${number}: ${result.embeds.length} videos found, but the payload holds one`,
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
  const known = new Map(APPENDICES.map((a) => [a.number, a.title]))
  // The SQL artifact always describes the whole corpus, so a subset selected on
  // the command line only narrows the fixtures.
  const selected = cli.numbers.length > 0 ? cli.numbers : APPENDICES.map((a) => a.number)
  const targets = cli.sqlFile ? APPENDICES.map((a) => a.number) : selected

  const unknown = selected.filter((n) => !known.has(n))
  if (unknown.length > 0) throw new Error(`unknown appendix number(s): ${unknown.join(', ')}`)

  if (cli.outDir) mkdirSync(cli.outDir, { recursive: true })
  if (cli.sqlFile) mkdirSync(path.dirname(cli.sqlFile), { recursive: true })

  const backfill: PortableTextBackfillRow[] = []

  for (const number of targets) {
    const result = await convertAppendix(number)
    if (result.blocks.length === 0) {
      throw new Error(`appendix ${number}: conversion produced no blocks`)
    }
    const embed = soleEmbed(number, result)
    const payload = {
      code: String(number),
      body_pt: result.blocks,
      video_id: embed?.videoId ?? null,
      video_title: embed?.videoTitle || null,
    }

    if (cli.outDir && selected.includes(number)) {
      const file = path.join(cli.outDir, `appendix-${number}.json`)
      writeFileSync(file, `${JSON.stringify(payload, null, 2)}\n`)
      console.log(`appendix ${number}: ${result.blocks.length} top-level blocks → ${file}`)
    } else {
      console.log(`appendix ${number}: ${result.blocks.length} top-level blocks`)
    }
    for (const warning of result.warnings) console.log(`  ! ${warning}`)

    backfill.push({
      code: String(number),
      title: known.get(number) ?? '',
      bodyPtJson: JSON.stringify(result.blocks),
      videoId: embed?.videoId ?? null,
      videoTitle: embed?.videoTitle || null,
    })
  }

  if (cli.sqlFile) {
    const sql = buildPortableTextBackfillSql(backfill)
    writeFileSync(cli.sqlFile, sql)
    const withVideo = backfill.filter((row) => row.videoId !== null).length
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
