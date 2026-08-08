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
 *   pnpm appendices:pt -- --out <dir> [numbers...]
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

const YOUTUBE_ID = /^[A-Za-z0-9_-]{11}$/

interface Cli {
  outDir: string
  numbers: number[]
}

function parseArgs(argv: readonly string[]): Cli {
  let outDir: string | null = null
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
    } else if (/^\d+$/.test(arg)) {
      numbers.push(Number(arg))
    } else {
      throw new Error(`unrecognised argument: ${arg}`)
    }
  }

  if (!outDir) throw new Error('nothing to do: pass --out <dir>')
  return { outDir, numbers }
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
  const known = new Set(APPENDICES.map((a) => a.number))
  const targets = cli.numbers.length > 0 ? cli.numbers : APPENDICES.map((a) => a.number)

  const unknown = targets.filter((n) => !known.has(n))
  if (unknown.length > 0) throw new Error(`unknown appendix number(s): ${unknown.join(', ')}`)

  mkdirSync(cli.outDir, { recursive: true })

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
    const file = path.join(cli.outDir, `appendix-${number}.json`)
    writeFileSync(file, `${JSON.stringify(payload, null, 2)}\n`)
    console.log(`appendix ${number}: ${result.blocks.length} top-level blocks → ${file}`)
    for (const warning of result.warnings) console.log(`  ! ${warning}`)
  }
}

void main().catch((error) => {
  console.error(error)
  process.exit(1)
})
