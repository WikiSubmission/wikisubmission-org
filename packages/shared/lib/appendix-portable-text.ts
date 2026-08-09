/**
 * Portable Text block schema for appendix bodies.
 *
 * Why Portable Text and not markdown: markdown has exactly one container (the
 * blockquote), so the five distinct card meanings the appendix TSX draws all
 * collapse into it. The two false verses of appendix 24 stopped being
 * distinguishable from genuine scripture, four separate closing scripture cards
 * merged into one undivided quote, and 42 table totals rows became ordinary
 * data rows. A typed block carries `tone`, the entry wrapper and the totals row
 * style as fields, so none of that has to be re-derived from prose.
 *
 * Every visual variant here is a name in `lib/appendix-styles.ts`, which holds
 * the one copy of each class string. The converter recognises a card by looking
 * a class string up in that registry and the renderer draws it by looking the
 * same name back out, so a block cannot render as something other than what it
 * was converted from. Anything not in the registry is a converter warning, not
 * an approximation.
 *
 * Cards hold blocks rather than paragraphs. The corpus nests freely — appendix
 * 5 puts a comparison grid inside a card, appendix 7 two labelled groups,
 * appendix 19 a pair of term/definition groups — so a card whose content were
 * a flat paragraph list could not carry them.
 */

import type {
  AppendixCardStyle,
  AppendixCodeStyle,
  AppendixCodeTextStyle,
  AppendixGroupStyle,
  AppendixListContentStyle,
  AppendixListItemStyle,
  AppendixListStyle,
  AppendixMarkerStyle,
  AppendixParagraphStyle,
  AppendixTableCellStyle,
  AppendixTableHeaderStyle,
  AppendixTableNoteStyle,
  AppendixTableRowStyle,
  AppendixTableStyle,
  AppendixVerseBodyStyle,
  AppendixVerseCardStyle,
  AppendixVerseEntryStyle,
  AppendixVerseRefStyle,
} from './appendix-styles'

// ── inline content ───────────────────────────────────────────────────────────

/** A Portable Text span. `marks` holds decorators and markDef keys. */
export interface AppendixSpan {
  _type: 'span'
  _key: string
  text: string
  marks?: string[]
}

/** Inline scripture badge — the `<QuranRef reference="9:128" />` of the TSX. */
export interface AppendixQuranRefSpan {
  _type: 'quranRef'
  _key: string
  reference: string
}

/** Inline cross-reference to a sibling appendix. */
export interface AppendixLinkSpan {
  _type: 'appendixLink'
  _key: string
  n: number
}

export type AppendixInlineChild = AppendixSpan | AppendixQuranRefSpan | AppendixLinkSpan

/** Link annotation, referenced by key from a span's `marks`. */
export interface AppendixLinkMarkDef {
  _key: string
  _type: 'link'
  href: string
  blank?: boolean
}

/**
 * A run of inline content: the `children` + `markDefs` pair of a Portable Text
 * block, reused wherever a field holds rich text that is not a paragraph of its
 * own (a table cell, a divider title, a verse reference).
 */
export interface AppendixRichText {
  children: AppendixInlineChild[]
  markDefs?: AppendixLinkMarkDef[]
}

// ── shared ───────────────────────────────────────────────────────────────────

/**
 * Card colour. The load-bearing one is `destructive`: it is what keeps the two
 * forged verses of appendix 24 visually marked as forgeries rather than
 * rendering identically to the genuine quotations around them.
 */
export type AppendixTone = 'primary' | 'destructive' | 'neutral' | 'muted'

/**
 * Whether the card is revealed by the article's scroll animation. Mirrors the
 * `data-card` attribute, which the corpus sets on most but not all of its
 * cards; carried rather than normalised so the converted page animates exactly
 * as the hardcoded one did.
 */
export interface AppendixRevealable {
  reveal?: boolean
}

// ── blocks ───────────────────────────────────────────────────────────────────

/**
 * Standard Portable Text paragraph. `style` names a paragraph recipe from the
 * registry; `normal` is unstyled body prose, which is what keeps ordinary
 * paragraphs editable as ordinary Portable Text.
 */
export interface AppendixParagraphBlock extends AppendixRichText {
  _type: 'block'
  _key: string
  style: AppendixParagraphStyle
  /**
   * Rendered without a `<p>` of its own. A handful of cards write their prose
   * straight into the card element, and wrapping that in a paragraph would add
   * an element the source never had.
   */
  bare?: boolean
  children: AppendixInlineChild[]
}

/**
 * A plain grouping wrapper: a `<section>` of prose, or one of the bare `<div>`s
 * the corpus groups a run of blocks with. Emitted only where the group carries
 * a rhythm of its own; a plain run of paragraphs is regrouped by the renderer
 * instead, so ordinary prose stays flat.
 */
export interface AppendixSectionBlock {
  _type: 'appendixSection'
  _key: string
  style: AppendixGroupStyle
  /** Which element the source wrote the group as. Inert visually, kept exact. */
  tag: 'section' | 'div'
  content: AppendixBlock[]
}

/** `<hr/> Title <hr/>` band. Title is rich: appendix 33 puts a QuranRef in one. */
export interface AppendixDividerBlock {
  _type: 'appendixDivider'
  _key: string
  title: AppendixRichText
  /** The corpus writes the heading both centred and not; it shows when it wraps. */
  centered?: boolean
}

/** A numbered piece of evidence: badge on the left, nested content on the right. */
export interface AppendixEvidenceBlock {
  _type: 'appendixEvidence'
  _key: string
  n: number
  marker: AppendixMarkerStyle
  body: AppendixGroupStyle
  content: AppendixBlock[]
}

/**
 * A term/definition row: a fixed-width term on the left, its explanation on the
 * right. Appendix 5 compares the two Heavens with a column of these.
 */
export interface AppendixDefinitionRowBlock {
  _type: 'appendixDefinitionRow'
  _key: string
  term: AppendixRichText
  termStyle: AppendixMarkerStyle
  body: AppendixRichText
  bodyStyle: AppendixListContentStyle
}

/** An unattached editorial aside sitting between evidence items. */
export interface AppendixInterludeBlock {
  _type: 'appendixInterlude'
  _key: string
  text: AppendixRichText
}

/** A single centred monospace assertion, e.g. "15 + 99 = 114 = 19x6." */
export interface AppendixStatementBlock {
  _type: 'appendixStatement'
  _key: string
  text: AppendixRichText
}

/**
 * A bordered prose card. `tone` is a typed field precisely so the destructive
 * variant survives: appendix 24's whole argument depends on the two false
 * verses reading as forgeries and not as scripture. `style` names the exact
 * surface; the converter checks the two agree.
 */
export interface AppendixCalloutBlock extends AppendixRevealable {
  _type: 'appendixCallout'
  _key: string
  tone: AppendixTone
  style: AppendixCardStyle
  content: AppendixBlock[]
}

/** One quotation inside a scripture card stack. */
export interface AppendixVerseEntry {
  _key: string
  body: AppendixRichText
  /** The reference line under the quote. Rich: it is often several refs. */
  reference?: AppendixRichText
  /**
   * The wrapper this quotation sits in. `divided` is what keeps appendix 24's
   * four closing verses as four cards separated by a rule instead of one
   * continuous quotation.
   */
  wrapper: AppendixVerseEntryStyle
}

/** One or more scripture quotations in a tinted card. */
export interface AppendixVerseCardsBlock extends AppendixRevealable {
  _type: 'appendixVerseCards'
  _key: string
  style: AppendixVerseCardStyle
  body: AppendixVerseBodyStyle
  /** Named `refStyle`, not `ref`: `ref` is reserved once it reaches a component. */
  refStyle: AppendixVerseRefStyle
  /** An eyebrow above the quotations, used by appendix 1. */
  heading?: AppendixRichText
  headingStyle?: AppendixParagraphStyle
  entries: AppendixVerseEntry[]
}

/** A figure: framed image, with either a caption or a translated-source card. */
export interface AppendixFigureBlock extends AppendixRevealable {
  _type: 'appendixFigure'
  _key: string
  src: string
  alt: string
  width: number
  height: number
  /** `sm` renders the bare framed image at max-w-sm, centred, with no caption. */
  frame: 'full' | 'sm'
  caption?: AppendixRichText
  /** A bordered translation card beneath the image. */
  source?: AppendixCalloutBlock
}

/**
 * One item of a list. `text` carries an inline body; `content` carries the
 * blocks of an item whose body is a group. Which one is set follows the list's
 * `contentTag`.
 */
export interface AppendixListItem {
  _key: string
  text?: AppendixRichText
  content?: AppendixBlock[]
}

/** A list whose markers are badges or bullets rather than list markers. */
export interface AppendixBadgeListBlock {
  _type: 'appendixBadgeList'
  _key: string
  ordered: boolean
  style: AppendixListStyle
  item: AppendixListItemStyle
  /** Absent for a plain list that draws no marker of its own. */
  marker?: AppendixMarkerStyle
  content: AppendixListContentStyle
  /** The element carrying the content class. `none` writes into the `<li>`. */
  contentTag: 'none' | 'span' | 'p' | 'div'
  /** The literal bullet character, when `marker` is the bullet style. */
  bullet?: string
  items: AppendixListItem[]
}

/** A column of a data table: its header and its cell recipe. */
export interface AppendixTableColumn {
  header?: AppendixRichText
  headerStyle: AppendixTableHeaderStyle
  cellStyle: AppendixTableCellStyle
}

/**
 * A row of a data table. `style` is what marks a totals row: the `totals*`
 * recipes are the ones that band and embolden it, and keeping them named is
 * what stops a total from reading as one more data row — the distinction
 * markdown lost across 42 tables in appendix 24 alone.
 */
export interface AppendixTableRow {
  _key: string
  style: AppendixTableRowStyle
  cells: AppendixRichText[]
  /** Set where a row's cells depart from their column's recipe. */
  cellStyles?: AppendixTableCellStyle[]
}

/**
 * A captioned table.
 *
 * Cell recipes hang off the column, because that is how the source reads: a
 * column is monospace, or right-aligned, or the primary-coloured one carrying
 * the count. A row that departs from its columns overrides them per cell.
 */
export interface AppendixDataTableBlock extends AppendixRevealable {
  _type: 'appendixDataTable'
  _key: string
  caption?: AppendixRichText
  table: AppendixTableStyle
  columns: AppendixTableColumn[]
  rows: AppendixTableRow[]
  /**
   * The footer strip. `inside` places it within the horizontal scroller beside
   * the table rather than under it, which is where some appendices write it and
   * which decides whether the note scrolls with a table too wide to fit.
   */
  note?: { style: AppendixTableNoteStyle; inside?: boolean; content: AppendixBlock[] }
}

/** A captioned card whose rows are list items rather than table cells. */
export interface AppendixListCardBlock extends AppendixRevealable {
  _type: 'appendixListCard'
  _key: string
  caption?: AppendixRichText
  item: AppendixListItemStyle
  marker?: AppendixMarkerStyle
  content: AppendixListContentStyle
  contentTag: 'none' | 'span' | 'p' | 'div'
  items: AppendixListItem[]
}

/** A scrolling strip of monospace text, e.g. a digit sequence. */
export interface AppendixCodeBlock {
  _type: 'appendixCode'
  _key: string
  style: AppendixCodeStyle
  text: AppendixCodeTextStyle
  value: string
}

export interface AppendixGridCell {
  content: AppendixRichText
  colSpan?: number
}

export interface AppendixGridRow {
  /** `total` bolds the whole row; `group` bolds a spanning sub-heading cell. */
  variant: 'data' | 'total' | 'group'
  alignTop?: boolean
  cells: AppendixGridCell[]
}

/**
 * The bordered-grid table of appendices 26, 29 and 33: rich cells (they are
 * full of QuranRefs), colSpan sub-headings, a bold totals row, and trailing
 * notes.
 */
export interface AppendixGridTableBlock extends AppendixRevealable {
  _type: 'appendixGridTable'
  _key: string
  headers: AppendixRichText[]
  rows: AppendixGridRow[]
  notes?: AppendixRichText[]
}

export type AppendixBlock =
  | AppendixParagraphBlock
  | AppendixSectionBlock
  | AppendixDividerBlock
  | AppendixEvidenceBlock
  | AppendixDefinitionRowBlock
  | AppendixInterludeBlock
  | AppendixStatementBlock
  | AppendixCalloutBlock
  | AppendixVerseCardsBlock
  | AppendixFigureBlock
  | AppendixBadgeListBlock
  | AppendixDataTableBlock
  | AppendixListCardBlock
  | AppendixCodeBlock
  | AppendixGridTableBlock

/** Every custom `_type` in the appendix body schema. */
export const APPENDIX_BLOCK_TYPES = [
  'appendixSection',
  'appendixDivider',
  'appendixEvidence',
  'appendixDefinitionRow',
  'appendixInterlude',
  'appendixStatement',
  'appendixCallout',
  'appendixVerseCards',
  'appendixFigure',
  'appendixBadgeList',
  'appendixDataTable',
  'appendixListCard',
  'appendixCode',
  'appendixGridTable',
] as const

/** Inline object `_type`s that may appear in a block's `children`. */
export const APPENDIX_INLINE_TYPES = ['quranRef', 'appendixLink'] as const
