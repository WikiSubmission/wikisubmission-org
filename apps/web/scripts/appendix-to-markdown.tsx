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
 * It writes files. It never touches the database, and it never modifies the
 * source TSX.
 *
 * Run from apps/web:
 *   pnpm exec tsx --tsconfig scripts/tsconfig.appendix-md.json \
 *     scripts/appendix-to-markdown.tsx --out <dir> [--embeds=link|shortcode|drop] [numbers...]
 *
 * With no numbers it converts all 38.
 */
import { mkdirSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import React, { type ReactNode } from 'react'

// tsx transpiles the shared content files with the classic JSX transform
// (their nearest tsconfig has jsx: preserve), which emits bare
// `React.createElement` references — satisfy them globally.
;(globalThis as { React?: typeof React }).React = React
import { APPENDICES } from '@/constants/appendices'
import { convertTree, type EmbedMode } from './appendix-markdown/walk'

interface Cli {
  outDir: string
  embeds: EmbedMode
  numbers: number[]
}

const EMBED_MODES: readonly EmbedMode[] = ['link', 'shortcode', 'drop']

function parseArgs(argv: readonly string[]): Cli {
  let outDir = path.resolve(process.cwd(), 'appendix-markdown')
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

  return { outDir, embeds, numbers }
}

async function convertAppendix(
  number: number,
  embeds: EmbedMode,
): Promise<{ markdown: string; warnings: string[] }> {
  const mod = (await import(`@/content/library/appendices/appendix-${number}`)) as {
    AppendixContent: () => ReactNode
  }
  // These content components are pure and hook-free, so calling one outside a
  // React renderer just yields its element tree.
  const tree = mod.AppendixContent()
  return convertTree(tree, { embeds })
}

async function main() {
  const cli = parseArgs(process.argv.slice(2))
  const known = new Set(APPENDICES.map((a) => a.number))
  const targets = cli.numbers.length > 0 ? cli.numbers : APPENDICES.map((a) => a.number)

  const unknown = targets.filter((n) => !known.has(n))
  if (unknown.length > 0) throw new Error(`unknown appendix number(s): ${unknown.join(', ')}`)

  mkdirSync(cli.outDir, { recursive: true })

  for (const number of targets) {
    const { markdown, warnings } = await convertAppendix(number, cli.embeds)
    if (!markdown.trim()) throw new Error(`appendix ${number}: conversion produced no markdown`)

    const file = path.join(cli.outDir, `appendix-${number}.md`)
    writeFileSync(file, markdown)
    console.log(`appendix ${number}: ${markdown.length} chars → ${file}`)
    for (const warning of warnings) console.log(`  ! ${warning}`)
  }
}

void main().catch((error) => {
  console.error(error)
  process.exit(1)
})
