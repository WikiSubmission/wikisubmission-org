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
import { splitSections } from './lib/html-sections'
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
  // The shared splitter also reports a heading anchor, which the library seed
  // format has no column for; map it away rather than changing that format.
  const sections: SeedSection[] = splitSections(html).map(({ idx, heading, body }) => ({
    idx,
    heading,
    body,
  }))
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
