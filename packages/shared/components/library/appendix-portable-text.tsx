/**
 * Renders an appendix body authored as Portable Text.
 *
 * Nothing here draws markup of its own. Every block is handed to the matching
 * component in appendix-blocks.tsx, which draws it from the style registry the
 * converter recognised it by, so a converted appendix renders as the hardcoded
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
 * evidence items group the same way. Groups that carry a different rhythm are
 * stored explicitly as `appendixSection` blocks.
 */
import { Fragment, type ReactNode } from 'react'

import Link from 'next/link'

import { QuranRef } from '@/components/quran-ref'
import { sanitizeUrl } from '@/lib/safe-url'
import { BLOCKQUOTE_CARD_STYLES, INLINE_MARK_STYLES } from '@/lib/appendix-styles'
import type {
  AppendixBlock,
  AppendixInlineChild,
  AppendixLinkMarkDef,
  AppendixListItem,
  AppendixRichText,
} from '@/lib/appendix-portable-text'

import {
  AppendixCallout,
  AppendixCode,
  AppendixFigure,
  AppendixGroup,
  AppendixLink,
  AppendixParagraph,
  BadgeList,
  DataTable,
  DefinitionRow,
  EvidenceInterlude,
  EvidenceItem,
  GridTable,
  ListCard,
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

  // A newline in a span is a hard break, which is how the converter carries the
  // `<br/>`s the corpus uses inside its cards. CSS would collapse the character
  // itself to a space, so it becomes an element again here.
  let node: ReactNode = child.text.includes('\n')
    ? child.text.split('\n').map((part, i) => (
        <Fragment key={i}>
          {i > 0 && <br />}
          {part}
        </Fragment>
      ))
    : child.text
  const marks = child.marks ?? []

  for (const mark of marks) {
    const tag = DECORATOR_TAG[mark]
    if (!tag) continue
    if (tag === 'strong') node = <strong>{node}</strong>
    else if (tag === 'em') node = <em>{node}</em>
    else node = <code>{node}</code>
  }

  for (const mark of marks) {
    if (!(mark in INLINE_MARK_STYLES)) continue
    node = (
      <span className={INLINE_MARK_STYLES[mark as keyof typeof INLINE_MARK_STYLES]}>{node}</span>
    )
  }

  for (const mark of marks) {
    if (DECORATOR_TAG[mark] || mark in INLINE_MARK_STYLES) continue
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

/**
 * A list item's body is inline content, except when its wrapper is a `<div>` —
 * appendix 27 puts several paragraphs in one item, and those are blocks.
 */
function renderListItems(
  items: AppendixListItem[],
  contentTag: 'none' | 'span' | 'p' | 'div',
  keyPrefix: string,
) {
  return items.map((item, i) => {
    const key = item._key || `${keyPrefix}-i${i}`
    return {
      key,
      content:
        contentTag === 'div'
          ? renderNested(item.content ?? [], key)
          : renderInline(item.text, key),
    }
  })
}

function renderBlock(block: AppendixBlock, key: string): ReactNode {
  switch (block._type) {
    case 'block':
      return block.bare ? (
        <Fragment key={key}>{renderInline(block, key)}</Fragment>
      ) : (
        <AppendixParagraph key={key} style={block.style}>
          {renderInline(block, key)}
        </AppendixParagraph>
      )

    case 'appendixSection':
      return (
        <AppendixGroup key={key} style={block.style} as={block.tag}>
          {renderNested(block.content, key)}
        </AppendixGroup>
      )

    case 'appendixDivider':
      return (
        <SectionDivider key={key} centered={block.centered}>
          {renderInline(block.title, key)}
        </SectionDivider>
      )

    case 'appendixEvidence':
      return (
        <EvidenceItem key={key} n={block.n} marker={block.marker} body={block.body}>
          {renderNested(block.content, key)}
        </EvidenceItem>
      )

    case 'appendixDefinitionRow':
      return (
        <DefinitionRow
          key={key}
          term={renderInline(block.term, `${key}-t`)}
          termStyle={block.termStyle}
          bodyStyle={block.bodyStyle}
        >
          {renderInline(block.body, `${key}-b`)}
        </DefinitionRow>
      )

    case 'appendixInterlude':
      return <EvidenceInterlude key={key}>{renderInline(block.text, key)}</EvidenceInterlude>

    case 'appendixStatement':
      return <StatementBox key={key}>{renderInline(block.text, key)}</StatementBox>

    case 'appendixCallout':
      return (
        <AppendixCallout
          key={key}
          style={block.style}
          reveal={block.reveal}
          as={BLOCKQUOTE_CARD_STYLES.has(block.style) ? 'blockquote' : 'div'}
        >
          {renderNested(block.content, key)}
        </AppendixCallout>
      )

    case 'appendixVerseCards':
      return (
        <VerseCards
          key={key}
          style={block.style}
          body={block.body}
          refStyle={block.refStyle}
          reveal={block.reveal}
          heading={block.heading ? renderInline(block.heading, `${key}-h`) : undefined}
          headingStyle={block.headingStyle}
          entries={block.entries.map((entry, i) => ({
            key: entry._key || `${key}-e${i}`,
            body: renderInline(entry.body, `${key}-e${i}`),
            reference:
              entry.reference === undefined
                ? undefined
                : renderInline(entry.reference, `${key}-e${i}r`),
            wrapper: entry.wrapper,
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
          reveal={block.reveal}
          caption={block.caption ? renderInline(block.caption, `${key}-cap`) : undefined}
          source={
            block.source ? renderBlock(block.source, `${key}-src`) : undefined
          }
        />
      )
    }

    case 'appendixBadgeList':
      return (
        <BadgeList
          key={key}
          ordered={block.ordered}
          style={block.style}
          item={block.item}
          marker={block.marker}
          content={block.content}
          contentTag={block.contentTag}
          bullet={block.bullet}
          items={renderListItems(block.items, block.contentTag, key)}
        />
      )

    case 'appendixDataTable':
      return (
        <DataTable
          key={key}
          caption={block.caption ? renderInline(block.caption, `${key}-cap`) : undefined}
          table={block.table}
          reveal={block.reveal}
          columns={block.columns.map((column, i) => ({
            key: `${key}-c${i}`,
            header:
              column.header === undefined
                ? undefined
                : renderInline(column.header, `${key}-c${i}`),
            headerStyle: column.headerStyle,
            cellStyle: column.cellStyle,
          }))}
          rows={block.rows.map((row, r) => ({
            key: row._key || `${key}-r${r}`,
            style: row.style,
            cellStyles: row.cellStyles,
            cells: row.cells.map((cell, c) => ({
              key: `${key}-r${r}c${c}`,
              content: renderInline(cell, `${key}-r${r}c${c}`),
            })),
          }))}
          noteStyle={block.note?.style}
          noteInside={block.note?.inside}
          note={block.note ? renderNested(block.note.content, `${key}-note`) : undefined}
        />
      )

    case 'appendixListCard':
      return (
        <ListCard
          key={key}
          caption={block.caption ? renderInline(block.caption, `${key}-cap`) : undefined}
          item={block.item}
          marker={block.marker}
          content={block.content}
          contentTag={block.contentTag}
          reveal={block.reveal}
          items={renderListItems(block.items, block.contentTag, key)}
        />
      )

    case 'appendixCode':
      return (
        <AppendixCode key={key} style={block.style} text={block.text} value={block.value} />
      )

    case 'appendixGridTable':
      return (
        <GridTable
          key={key}
          reveal={block.reveal}
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
  if (block._type === 'block' && block.style === 'normal') return 'prose'
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
      <AppendixGroup key={key} style={runKind === 'prose' ? 'prose' : 'stackXl'}>
        {children}
      </AppendixGroup>,
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
 * Nested content (a group's children, an evidence item's column) renders
 * without the grouping wrapper: the parent already supplies the rhythm.
 */
function renderNested(blocks: AppendixBlock[], keyPrefix: string): ReactNode[] {
  return blocks.map((block, i) => renderBlock(block, block._key || `${keyPrefix}-${i}`))
}

export function AppendixPortableText({ blocks }: { blocks: AppendixBlock[] }) {
  return <>{renderBlocks(blocks, 'a')}</>
}
