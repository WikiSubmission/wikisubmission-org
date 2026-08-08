/**
 * Renders an appendix body authored as Portable Text.
 *
 * Nothing here draws markup of its own. Every block is handed to the matching
 * component in appendix-blocks.tsx, which holds the markup the hardcoded
 * appendix TSX already draws, so a converted appendix is pixel-identical to the
 * one it replaced.
 *
 * Safety: this is the same posture as the markdown renderer and the blog
 * Portable Text renderer. Link and image URLs go through the shared
 * `sanitizeUrl` allow-list, so a `javascript:` URL cannot reach an href or a
 * src; a rejected link degrades to plain text rather than to a link pointing at
 * the current page. Text is never interpreted as markup — there is no raw-HTML
 * escape hatch in Portable Text to begin with, which is part of why it is a
 * safer carrier than markdown-plus-extensions. Do not weaken either rule; they
 * are what keep the stored-XSS hole closed in a8ec310 closed.
 *
 * Structure: prose is stored as plain Portable Text blocks and consecutive runs
 * of them are grouped into one `<section>` here, which is how the hardcoded TSX
 * lays prose out and keeps ordinary paragraphs flat and editable. Runs of
 * evidence items group the same way. Sections that carry a different rhythm are
 * stored explicitly as `appendixSection` blocks.
 */
import { Fragment, type ReactNode } from 'react'

import Link from 'next/link'

import { QuranRef } from '@/components/quran-ref'
import { sanitizeUrl } from '@/lib/safe-url'
import type {
  AppendixBlock,
  AppendixCalloutParagraph,
  AppendixInlineChild,
  AppendixLinkMarkDef,
  AppendixRichText,
} from '@/lib/appendix-portable-text'

import {
  AppendixCallout,
  AppendixFigure,
  AppendixLink,
  AppendixSection,
  BadgeList,
  EvidenceInterlude,
  EvidenceItem,
  GridTable,
  MathTable,
  SectionDivider,
  StatementBox,
  VerseCards,
} from './appendix-blocks'

// ── inline ───────────────────────────────────────────────────────────────────

const DECORATOR_TAG: Record<string, 'strong' | 'em' | 'code'> = {
  strong: 'strong',
  em: 'em',
  code: 'code',
}

/**
 * Wraps a span's text in its decorators, innermost first, then in its link
 * annotation if it carries one.
 *
 * Appendix links are rendered without a class because that is what the
 * hardcoded appendices 26 and 33 do — an unclassed `<Link>` inherits its
 * colour under Tailwind's preflight. Appendix 24's styled cross-references come
 * through the `appendixLink` inline object instead, which carries the primary
 * underline. Two source constructs, two typed representations.
 */
function renderSpan(
  child: AppendixInlineChild,
  markDefs: AppendixLinkMarkDef[],
  key: string,
): ReactNode {
  if (child._type === 'quranRef') return <QuranRef key={key} reference={child.reference} />
  if (child._type === 'appendixLink') return <AppendixLink key={key} n={child.n} />

  let node: ReactNode = child.text
  const marks = child.marks ?? []

  for (const mark of marks) {
    const tag = DECORATOR_TAG[mark]
    if (!tag) continue
    if (tag === 'strong') node = <strong>{node}</strong>
    else if (tag === 'em') node = <em>{node}</em>
    else node = <code>{node}</code>
  }

  for (const mark of marks) {
    if (DECORATOR_TAG[mark]) continue
    const def = markDefs.find((candidate) => candidate._key === mark)
    if (!def) continue
    const href = sanitizeUrl(def.href)
    // A rejected URL drops the annotation and keeps the label, rather than
    // rendering a link that silently points back at the current page.
    if (!href) continue
    node = /^https?:/i.test(href) ? (
      <a href={href} target="_blank" rel="noopener noreferrer">
        {node}
      </a>
    ) : (
      <Link href={href}>{node}</Link>
    )
  }

  return <Fragment key={key}>{node}</Fragment>
}

function renderInline(rich: AppendixRichText | undefined, keyPrefix: string): ReactNode {
  if (!rich) return null
  const markDefs = rich.markDefs ?? []
  return rich.children.map((child, i) => renderSpan(child, markDefs, `${keyPrefix}-${i}`))
}

// ── blocks ───────────────────────────────────────────────────────────────────

function renderCalloutParagraphs(paragraphs: AppendixCalloutParagraph[], keyPrefix: string) {
  return paragraphs.map((paragraph, i) => ({
    key: `${keyPrefix}-p${i}`,
    content: renderInline(paragraph, `${keyPrefix}-p${i}`),
    emphasis: paragraph.emphasis,
    spaced: paragraph.spaced,
  }))
}

function renderBlock(block: AppendixBlock, key: string): ReactNode {
  switch (block._type) {
    case 'block':
      return <p key={key}>{renderInline(block, key)}</p>

    case 'appendixSection':
      return (
        <AppendixSection key={key} gap={block.gap} prose={block.prose}>
          {renderNested(block.content, key)}
        </AppendixSection>
      )

    case 'appendixDivider':
      return <SectionDivider key={key}>{renderInline(block.title, key)}</SectionDivider>

    case 'appendixEvidence':
      return (
        <EvidenceItem key={key} n={block.n}>
          {renderNested(block.content, key)}
        </EvidenceItem>
      )

    case 'appendixInterlude':
      return <EvidenceInterlude key={key}>{renderInline(block.text, key)}</EvidenceInterlude>

    case 'appendixStatement':
      return <StatementBox key={key}>{renderInline(block.text, key)}</StatementBox>

    case 'appendixCallout':
      return (
        <AppendixCallout
          key={key}
          tone={block.tone}
          style={block.style}
          label={block.label ? renderInline(block.label, `${key}-label`) : undefined}
          paragraphs={renderCalloutParagraphs(block.paragraphs, key)}
          footnote={block.footnote ? renderInline(block.footnote, `${key}-fn`) : undefined}
          footnoteSpaced={block.footnoteSpaced}
        />
      )

    case 'appendixVerseCards':
      return (
        <VerseCards
          key={key}
          align={block.align}
          size={block.size}
          gap={block.gap}
          divided={block.divided}
          entries={block.entries.map((entry, i) => ({
            key: `${key}-e${i}`,
            body: renderInline(entry.body, `${key}-e${i}`),
            reference:
              entry.reference === undefined ? undefined : (
                <QuranRef reference={entry.reference} />
              ),
          }))}
        />
      )

    case 'appendixFigure': {
      const src = sanitizeUrl(block.src)
      if (!src) return null
      return (
        <AppendixFigure
          key={key}
          src={src}
          alt={block.alt}
          width={block.width}
          height={block.height}
          frame={block.frame}
          caption={block.caption ? renderInline(block.caption, `${key}-cap`) : undefined}
          source={
            block.source ? (
              <AppendixCallout
                tone="neutral"
                style="source"
                paragraphs={[
                  {
                    key: `${key}-src`,
                    content: renderInline(block.source.body, `${key}-src`),
                  },
                ]}
                footnote={
                  block.source.footnote
                    ? renderInline(block.source.footnote, `${key}-srcfn`)
                    : undefined
                }
                footnoteSpaced
              />
            ) : undefined
          }
        />
      )
    }

    case 'appendixBadgeList':
      return (
        <BadgeList
          key={key}
          tone={block.tone}
          ordered={block.ordered}
          density={block.density}
          items={block.items.map((item, i) => ({
            key: `${key}-i${i}`,
            content: renderInline(item, `${key}-i${i}`),
          }))}
        />
      )

    case 'appendixMathTable':
      return (
        <MathTable
          key={key}
          caption={block.caption}
          headers={block.headers}
          rows={block.rows}
          totals={block.totals}
          note={block.note ? renderInline(block.note, `${key}-note`) : undefined}
        />
      )

    case 'appendixGridTable':
      return (
        <GridTable
          key={key}
          headers={block.headers.map((header, i) => ({
            key: `${key}-h${i}`,
            content: renderInline(header, `${key}-h${i}`),
          }))}
          rows={block.rows.map((row, r) => ({
            key: `${key}-r${r}`,
            variant: row.variant,
            alignTop: row.alignTop,
            cells: row.cells.map((cell, c) => ({
              key: `${key}-r${r}c${c}`,
              content: renderInline(cell.content, `${key}-r${r}c${c}`),
              colSpan: cell.colSpan,
            })),
          }))}
          notes={block.notes?.map((note, i) => ({
            key: `${key}-n${i}`,
            content: renderInline(note, `${key}-n${i}`),
          }))}
        />
      )

    default:
      // An unknown block is dropped rather than guessed at. The converter is
      // the place that fails loudly; a reader should never see an approximation.
      return null
  }
}

/** Blocks that group into a shared wrapper when they appear consecutively. */
type Grouped = 'prose' | 'evidence' | null

function groupOf(block: AppendixBlock): Grouped {
  if (block._type === 'block') return 'prose'
  if (block._type === 'appendixEvidence' || block._type === 'appendixInterlude') {
    return 'evidence'
  }
  return null
}

function renderBlocks(blocks: AppendixBlock[], keyPrefix: string): ReactNode[] {
  const out: ReactNode[] = []
  let run: AppendixBlock[] = []
  let runKind: Grouped = null
  let runStart = 0

  const flush = () => {
    if (run.length === 0) return
    const key = `${keyPrefix}-g${runStart}`
    const children = run.map((block, i) => renderBlock(block, `${key}-${i}`))
    out.push(
      runKind === 'prose' ? (
        <AppendixSection key={key} gap="lg" prose>
          {children}
        </AppendixSection>
      ) : (
        <AppendixSection key={key} gap="xl" prose={false}>
          {children}
        </AppendixSection>
      ),
    )
    run = []
    runKind = null
  }

  blocks.forEach((block, i) => {
    const kind = groupOf(block)
    if (kind === null) {
      flush()
      out.push(renderBlock(block, `${keyPrefix}-${i}`))
      return
    }
    if (kind !== runKind) {
      flush()
      runKind = kind
      runStart = i
    }
    run.push(block)
  })
  flush()

  return out
}

/**
 * Nested content (a section's children, an evidence item's column) renders
 * without the grouping wrapper: the parent already supplies the rhythm.
 */
function renderNested(blocks: AppendixBlock[], keyPrefix: string): ReactNode[] {
  return blocks.map((block, i) => renderBlock(block, `${keyPrefix}-${i}`))
}

export function AppendixPortableText({ blocks }: { blocks: AppendixBlock[] }) {
  return <>{renderBlocks(blocks, 'a')}</>
}
