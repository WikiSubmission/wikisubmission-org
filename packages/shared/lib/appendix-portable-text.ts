/**
 * Portable Text block schema for appendix bodies.
 *
 * Why Portable Text and not markdown: markdown has exactly one container (the
 * blockquote), so the five distinct card meanings the appendix TSX draws all
 * collapse into it. The two false verses of appendix 24 stopped being
 * distinguishable from genuine scripture, four separate closing scripture cards
 * merged into one undivided quote, and 42 table totals rows became ordinary
 * data rows. A typed block carries `tone`, `caption` and `totals` as fields, so
 * none of that has to be re-derived from prose.
 *
 * Every block type here maps 1:1 onto one component in
 * `components/library/appendix-blocks.tsx`, and each of those components is a
 * verbatim copy of the markup the hardcoded TSX already draws. The renderer
 * never invents styling: a block that cannot be expressed is a converter
 * warning, not an approximation.
 *
 * Layout variants (`gap`, `size`, `density`, `style`) are closed enums, not
 * free-form class names. The hardcoded corpus is not internally consistent —
 * the same kind of card is written with `space-y-2` in one appendix and
 * `space-y-4` in another — and pixel fidelity with it is the acceptance bar, so
 * the variants that actually occur are named and typed rather than smoothed
 * over. Anything outside the enum is rejected by the converter.
 */

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
 * own (a table cell, a divider title, a card label).
 */
export interface AppendixRichText {
  children: AppendixInlineChild[]
  markDefs?: AppendixLinkMarkDef[]
}

// ── shared enums ─────────────────────────────────────────────────────────────

/**
 * Card colour. The load-bearing one is `destructive`: it is what keeps the two
 * forged verses of appendix 24 visually marked as forgeries rather than
 * rendering identically to the genuine quotations around them.
 */
export type AppendixTone = 'primary' | 'destructive' | 'neutral' | 'muted'

/** Vertical rhythm inside a card or section. */
export type AppendixGap = 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl'

// ── blocks ───────────────────────────────────────────────────────────────────

/** Standard Portable Text paragraph. Runs of these become one prose section. */
export interface AppendixParagraphBlock extends AppendixRichText {
  _type: 'block'
  _key: string
  style: 'normal'
  children: AppendixInlineChild[]
}

/**
 * An explicit `<section>`. Emitted only when a section does not match the
 * default prose rhythm — a run of plain paragraphs is grouped implicitly by the
 * renderer instead, so ordinary prose stays flat and editable.
 */
export interface AppendixSectionBlock {
  _type: 'appendixSection'
  _key: string
  gap: AppendixGap
  /** Whether the section carries the base prose type scale. */
  prose: boolean
  content: AppendixBlock[]
}

/** `<hr/> Title <hr/>` band. Title is rich: appendix 33 puts a QuranRef in one. */
export interface AppendixDividerBlock {
  _type: 'appendixDivider'
  _key: string
  title: AppendixRichText
}

/** A numbered piece of evidence: badge on the left, nested content on the right. */
export interface AppendixEvidenceBlock {
  _type: 'appendixEvidence'
  _key: string
  n: number
  content: AppendixBlock[]
}

/** An unattached editorial aside sitting between evidence items. */
export interface AppendixInterludeBlock {
  _type: 'appendixInterlude'
  _key: string
  text: AppendixRichText
}

/** A single centred monospace assertion, e.g. "15 + 99 = 114 = 19×6." */
export interface AppendixStatementBlock {
  _type: 'appendixStatement'
  _key: string
  text: AppendixRichText
}

/**
 * Named card recipes. Each maps to exactly one entry in `CALLOUT_STYLE` in
 * appendix-blocks.tsx, and each of those is a card that exists verbatim in the
 * hardcoded corpus.
 */
export type AppendixCalloutStyle =
  | 'statement'
  | 'summary'
  | 'aside'
  | 'quotation'
  | 'source'
  | 'arithmetic'
  | 'remark'
  | 'result'

/** One line of a callout. `emphasis` is what marks an arithmetic result line. */
export interface AppendixCalloutParagraph extends AppendixRichText {
  emphasis?: 'result' | 'mono' | 'caption' | 'passage'
  /** Extra space above, used to separate a result from its operands. */
  spaced?: boolean
}

/**
 * A bordered prose card. `tone` is a typed field precisely so the destructive
 * variant survives: appendix 24's whole argument depends on the two false
 * verses reading as forgeries and not as scripture.
 */
export interface AppendixCalloutBlock {
  _type: 'appendixCallout'
  _key: string
  tone: AppendixTone
  style: AppendixCalloutStyle
  /** Small uppercase eyebrow, coloured from `tone`. */
  label?: AppendixRichText
  paragraphs: AppendixCalloutParagraph[]
  /** Trailing monospace attribution, e.g. "[Insert 3]". */
  footnote?: AppendixRichText
  /** Whether the attribution is pushed away from the passage above it. */
  footnoteSpaced?: boolean
}

/** One quotation inside a scripture card stack. */
export interface AppendixVerseEntry {
  body: AppendixRichText
  /** Verse key rendered as a QuranRef badge under the quote. */
  reference?: string
}

/**
 * One or more scripture quotations in a tinted card. `divided` is what keeps
 * appendix 24's four closing verses as four cards separated by a rule instead
 * of one continuous quotation.
 */
export interface AppendixVerseCardsBlock {
  _type: 'appendixVerseCards'
  _key: string
  align: 'start' | 'center'
  size: 'sm' | 'base'
  gap: AppendixGap
  divided: boolean
  entries: AppendixVerseEntry[]
}

/** A figure: framed image, with either a caption or a translated-source card. */
export interface AppendixFigureBlock {
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
  source?: { body: AppendixRichText; footnote?: AppendixRichText }
}

/** A numbered list whose markers are badges rather than list markers. */
export interface AppendixBadgeListBlock {
  _type: 'appendixBadgeList'
  _key: string
  tone: AppendixTone
  ordered: boolean
  density: 'compact' | 'comfortable'
  items: AppendixRichText[]
}

/** A cell of a math table. Numbers are kept as-is; everything else is text. */
export type AppendixMathCell = string | number

/**
 * The math table of appendix 24: caption bar, monospace grid, optional totals.
 * `totals` is a separate field rather than trailing rows, which is the whole
 * point — in markdown those 42 totals rows became byte-identical to data rows
 * in a document whose entire argument is arithmetic.
 */
export interface AppendixMathTableBlock {
  _type: 'appendixMathTable'
  _key: string
  caption: string
  headers: string[]
  rows: AppendixMathCell[][]
  totals?: AppendixMathCell[][]
  note?: AppendixRichText
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
 * The bordered-grid table of appendices 26 and 33: rich cells (they are full of
 * QuranRefs), colSpan sub-headings, a bold totals row, and trailing notes.
 */
export interface AppendixGridTableBlock {
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
  | AppendixInterludeBlock
  | AppendixStatementBlock
  | AppendixCalloutBlock
  | AppendixVerseCardsBlock
  | AppendixFigureBlock
  | AppendixBadgeListBlock
  | AppendixMathTableBlock
  | AppendixGridTableBlock

/** Every custom `_type` in the appendix body schema. */
export const APPENDIX_BLOCK_TYPES = [
  'appendixSection',
  'appendixDivider',
  'appendixEvidence',
  'appendixInterlude',
  'appendixStatement',
  'appendixCallout',
  'appendixVerseCards',
  'appendixFigure',
  'appendixBadgeList',
  'appendixMathTable',
  'appendixGridTable',
] as const

/** Inline object `_type`s that may appear in a block's `children`. */
export const APPENDIX_INLINE_TYPES = ['quranRef', 'appendixLink'] as const
