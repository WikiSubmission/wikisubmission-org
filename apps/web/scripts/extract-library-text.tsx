/**
 * Extract plain text from the shared library content (introduction,
 * proclamation, 38 appendices) for Postgres seeding and offline bundles.
 *
 * Renders each content component with renderToStaticMarkup (heavy leaf
 * components are stubbed via tsconfig.extract.json path overrides), splits the
 * HTML into sections on <h2> boundaries, converts each to plain text, and
 * writes ../../../ws-backend/db/seeds/library_docs_en.json.
 *
 * Run from apps/web:
 *   pnpm exec tsx --tsconfig scripts/tsconfig.extract.json scripts/extract-library-text.tsx
 */
import { mkdirSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import React, { createElement, type ComponentType } from 'react'

// tsx transpiles the shared content files with the classic JSX transform
// (their nearest tsconfig has jsx: preserve), which emits bare
// `React.createElement` references — satisfy them globally.
;(globalThis as { React?: typeof React }).React = React
import { renderToStaticMarkup } from 'react-dom/server'
import { convert } from 'html-to-text'
import { APPENDICES } from '@/constants/appendices'
import { IntroductionContent } from '@/content/library/introduction'
import { ProclamationContent } from '@/content/library/proclamation'

interface SeedSection {
  idx: number
  heading: string | null
  body: string
}

interface SeedDoc {
  doc_type: 'appendix' | 'introduction' | 'proclamation'
  doc_number: number | null
  lang: string
  title: string
  sections: SeedSection[]
}

const OUT_PATH = path.resolve(__dirname, '../../../../ws-backend/db/seeds/library_docs_en.json')

function toText(html: string): string {
  return convert(html, {
    wordwrap: false,
    selectors: [
      { selector: 'a', options: { ignoreHref: true } },
      { selector: 'img', format: 'skip' },
      { selector: 'svg', format: 'skip' },
      { selector: 'h1', options: { uppercase: false } },
      { selector: 'h2', options: { uppercase: false } },
      { selector: 'h3', options: { uppercase: false } },
      { selector: 'table', format: 'dataTable' },
    ],
  })
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

/** Split rendered HTML into sections on <h2> boundaries. */
function splitSections(html: string): SeedSection[] {
  const h2 = /<h2[^>]*>([\s\S]*?)<\/h2>/g
  const sections: SeedSection[] = []
  let lastIndex = 0
  let lastHeading: string | null = null
  let match: RegExpExecArray | null

  const push = (heading: string | null, chunk: string) => {
    const body = toText(chunk)
    if (body) sections.push({ idx: sections.length, heading, body })
  }

  while ((match = h2.exec(html)) !== null) {
    push(lastHeading, html.slice(lastIndex, match.index))
    lastHeading = toText(match[1]) || null
    lastIndex = h2.lastIndex
  }
  push(lastHeading, html.slice(lastIndex))
  return sections
}

function extract(
  docType: SeedDoc['doc_type'],
  docNumber: number | null,
  title: string,
  Component: ComponentType,
): SeedDoc {
  let html: string
  try {
    html = renderToStaticMarkup(createElement(Component))
  } catch (error) {
    throw new Error(
      `${docType} ${docNumber ?? ''}: render failed: ${error instanceof Error ? error.message : error}`,
    )
  }
  const sections = splitSections(html)
  if (sections.length === 0) {
    throw new Error(`${docType} ${docNumber ?? ''}: extraction produced no text`)
  }
  return { doc_type: docType, doc_number: docNumber, lang: 'en', title, sections }
}

async function main() {
  const docs: SeedDoc[] = []

  docs.push(
    extract('introduction', null, 'Introduction to Quran: The Final Testament', IntroductionContent),
  )
  docs.push(
    extract(
      'proclamation',
      null,
      'Proclaiming One Unified Religion for All the People',
      ProclamationContent,
    ),
  )

  for (const appendix of APPENDICES) {
    const mod = (await import(`@/content/library/appendices/appendix-${appendix.number}`)) as {
      AppendixContent: ComponentType
    }
    docs.push(extract('appendix', appendix.number, appendix.title, mod.AppendixContent))
  }

  mkdirSync(path.dirname(OUT_PATH), { recursive: true })
  writeFileSync(OUT_PATH, JSON.stringify(docs, null, 2))

  const sectionCount = docs.reduce((n, d) => n + d.sections.length, 0)
  const charCount = docs.reduce(
    (n, d) => n + d.sections.reduce((m, s) => m + s.body.length, 0),
    0,
  )
  console.log(
    `wrote ${OUT_PATH}: ${docs.length} docs, ${sectionCount} sections, ${(charCount / 1000).toFixed(0)}k chars`,
  )
}

void main().catch((error) => {
  console.error(error)
  process.exit(1)
})
