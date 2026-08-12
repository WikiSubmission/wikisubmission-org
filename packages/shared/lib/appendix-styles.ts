/**
 * The one registry of appendix presentation classes.
 *
 * Both directions of the conversion read this file: the converter
 * (`scripts/appendix-portable-text/walk.ts`) builds reverse lookups from it to
 * recognise a card in the hardcoded TSX, and the renderer
 * (`components/library/appendix-blocks.tsx`) reads it forward to draw that card
 * again. Because the class string a style resolves to is literally the same
 * string the converter matched on, a style can never silently render as
 * something other than what it was converted from. Adding a variant is one line
 * here rather than two tables that have to be kept in agreement.
 *
 * Every value is copied verbatim out of
 * `content/library/appendices/appendix-*.tsx`. The corpus is 38 hand-written
 * documents that were never factored into shared components, so the same card
 * is spelled `space-y-2` in one appendix and `space-y-4` in the next. Those
 * spellings are enumerated rather than smoothed over, because rendering
 * identically to the hardcoded page is the acceptance bar for this migration.
 *
 * Lookup is by `classKey`, which sorts the tokens. Tailwind class order in an
 * attribute has no effect on the generated CSS, so two orderings of the same
 * token set are the same style, and appendix 1 (which assembles a couple of its
 * class strings from a template literal) lands on the same entry as the
 * appendices that write theirs out.
 *
 * Class strings are written out in full rather than assembled from fragments,
 * because Tailwind only generates the classes it can see literally in source.
 */

/** Order-insensitive lookup key for a class attribute. */
export function classKey(className: string): string {
  return className.trim().split(/\s+/).filter(Boolean).sort().join(' ')
}

/** Inverts a style registry into a `classKey` → style-name lookup. */
export function reverseStyles<T extends string>(
  styles: Readonly<Record<T, string>>,
): Map<string, T> {
  const out = new Map<string, T>()
  for (const [name, className] of Object.entries(styles) as Array<[T, string]>) {
    out.set(classKey(className), name)
  }
  return out
}

// ── cards ────────────────────────────────────────────────────────────────────

/**
 * Bordered prose cards, keyed by style name.
 *
 * The destructive-surfaced `statement` is the load-bearing one: it is what
 * keeps appendix 24's two injected verses reading as forgeries. Converted to
 * markdown they became an ordinary blockquote, visually identical to the
 * genuine scripture quoted around them, in the one appendix whose entire
 * purpose is to tell those apart.
 */
export const CARD_STYLES = {
  /** Labelled quotation card — appendix 24's two false verses. */
  statement:
    'rounded-xl border border-destructive/20 bg-destructive/5 p-5 space-y-2 text-sm',
  /** Enumerated conclusions. */
  summary:
    'rounded-xl border border-primary/20 bg-primary/5 p-5 space-y-2 text-sm text-foreground/85',
  /** Closing acknowledgement. */
  aside:
    'rounded-xl border border-border/60 p-5 text-sm italic text-foreground/75 leading-relaxed',
  /** A run of quoted passages from an outside source. */
  quotation:
    'rounded-xl border border-primary/20 bg-primary/5 p-5 space-y-4 text-sm italic text-foreground/80',
  /** A single translated source passage under a figure. */
  source:
    'rounded-xl border border-border/60 p-5 text-sm italic text-foreground/80 leading-relaxed',
  /** Centred arithmetic. */
  arithmetic:
    'rounded-xl border border-primary/20 bg-primary/5 p-5 space-y-2 text-sm text-center font-mono',
  /** An inline remark attached to a table or an evidence item. */
  remark:
    'rounded-xl border border-border/60 bg-muted/20 px-5 py-4 text-sm leading-relaxed text-foreground/80',
  /** A computed result plus its explanation. */
  result: 'rounded-xl border border-border/60 bg-muted/20 px-5 py-4 space-y-2',
  /** The publisher line that closes most appendices. */
  attribution:
    'rounded-lg border border-border/40 bg-muted/20 p-4 text-sm text-muted-foreground leading-relaxed',
  /** The same, where the publisher line runs to several paragraphs. */
  attributionStacked:
    'rounded-lg border border-border/40 bg-muted/20 p-4 text-sm text-muted-foreground leading-relaxed space-y-2',
  /** A worked example: bold lead-in, then its explanation. */
  example: 'rounded-xl border border-primary/20 bg-primary/5 p-5 space-y-3 text-sm',
  /** The same with a wider rhythm, used where the example holds groups. */
  exampleWide: 'rounded-xl border border-primary/20 bg-primary/5 p-5 space-y-4 text-sm',
  /** An eyebrow-labelled note. */
  note: 'rounded-xl border border-primary/20 bg-primary/5 p-5 space-y-2',
  noteMuted: 'rounded-xl border border-border/50 bg-muted/20 p-5 space-y-2',
  noteDestructive: 'rounded-xl border border-destructive/20 bg-destructive/5 p-5 space-y-2',
  /** Centred cards. */
  centered: 'rounded-xl border border-primary/20 bg-primary/5 p-5 space-y-3 text-center',
  centeredTight: 'rounded-xl border border-primary/20 bg-primary/5 p-5 text-center space-y-2',
  centeredStatement:
    'rounded-xl border border-primary/20 bg-primary/5 p-5 text-center text-sm font-medium text-foreground/90',
  mutedCentered: 'rounded-xl border border-border/50 bg-muted/20 p-4 text-center',
  /** A stack of monospace arithmetic lines. */
  monoStack: 'rounded-xl border border-primary/20 bg-primary/5 p-5 space-y-3 text-sm font-mono',
  /** A single quoted passage. */
  quotationTight:
    'rounded-xl border border-primary/20 bg-primary/5 p-5 text-sm italic text-foreground/80',
  plain: 'rounded-xl border border-primary/20 bg-primary/5 p-5 text-sm text-foreground/90',
  plainStack:
    'rounded-xl border border-primary/20 bg-primary/5 p-5 space-y-4 text-sm text-foreground/90',
  /** Unfilled cards. */
  outline: 'rounded-xl border border-border/60 p-5 space-y-4 text-sm',
  outlineQuote:
    'rounded-xl border border-border/60 p-5 text-sm leading-relaxed text-foreground/85 space-y-3 italic',
  /** Cards marked by a left rule rather than a full border. */
  rule: 'rounded-xl border-l-2 border-primary/40 bg-muted/20 px-5 py-4',
  ruleTight: 'pl-4 border-l-2 border-primary/30 space-y-1',
  ruleStack: 'space-y-3 text-sm italic pl-4 border-l-2 border-primary/30',
  /** A left-ruled quotation. Rendered as a `<blockquote>`, as in the source. */
  blockquote: 'border-l-2 border-primary/40 pl-4 italic text-foreground/80 space-y-1',
  /**
   * Cards that share their class string with the scripture-card styles below.
   * Appendix 1 highlights an arithmetic result in exactly the card the other
   * appendices quote scripture in, so the two are told apart by content: a card
   * holding a verse body is a scripture card, and anything else is one of
   * these. Same surface, different block, and the editor sees which is which.
   */
  highlight: 'rounded-xl border border-primary/20 bg-primary/5 p-6 space-y-2',
  highlightCentered: 'rounded-xl border border-primary/20 bg-primary/5 p-6 text-center space-y-2',
  highlightStack: 'rounded-xl border border-primary/20 bg-primary/5 p-6 space-y-4',
  highlightStackWide: 'rounded-xl border border-primary/20 bg-primary/5 p-6 space-y-5',
} as const satisfies Record<string, string>

export type AppendixCardStyle = keyof typeof CARD_STYLES

/** Cards the source writes as `<blockquote>` rather than `<div>`. */
export const BLOCKQUOTE_CARD_STYLES = new Set<AppendixCardStyle>(['blockquote'])

/**
 * The semantic tone each card style carries.
 *
 * Kept alongside the class strings so the `tone` on a block and the surface it
 * is drawn with cannot drift apart: the converter asserts they agree.
 */
export const CARD_TONES = {
  statement: 'destructive',
  summary: 'primary',
  aside: 'neutral',
  quotation: 'primary',
  source: 'neutral',
  arithmetic: 'primary',
  remark: 'muted',
  result: 'muted',
  attribution: 'muted',
  attributionStacked: 'muted',
  example: 'primary',
  exampleWide: 'primary',
  note: 'primary',
  noteMuted: 'muted',
  noteDestructive: 'destructive',
  centered: 'primary',
  centeredTight: 'primary',
  centeredStatement: 'primary',
  mutedCentered: 'muted',
  monoStack: 'primary',
  quotationTight: 'primary',
  plain: 'primary',
  plainStack: 'primary',
  outline: 'neutral',
  outlineQuote: 'neutral',
  rule: 'primary',
  ruleTight: 'primary',
  ruleStack: 'primary',
  blockquote: 'primary',
  highlight: 'primary',
  highlightCentered: 'primary',
  highlightStack: 'primary',
  highlightStackWide: 'primary',
} as const satisfies Record<AppendixCardStyle, 'primary' | 'destructive' | 'neutral' | 'muted'>

// ── scripture cards ──────────────────────────────────────────────────────────

/** The tinted card a run of scripture quotations sits in. */
export const VERSE_CARD_STYLES = {
  centerTight: 'rounded-xl border border-primary/20 bg-primary/5 p-6 text-center space-y-2',
  tight: 'rounded-xl border border-primary/20 bg-primary/5 p-6 space-y-2',
  stacked: 'rounded-xl border border-primary/20 bg-primary/5 p-6 space-y-4',
  stackedWide: 'rounded-xl border border-primary/20 bg-primary/5 p-6 space-y-5',
} as const satisfies Record<string, string>

export type AppendixVerseCardStyle = keyof typeof VERSE_CARD_STYLES

/**
 * The wrapper around one quotation inside a stack.
 *
 * `none` and `plain` are not the same thing: `none` means the quote's two
 * paragraphs are direct children of the card, so the card's own `space-y`
 * separates them, while `plain` is an unclassed wrapper that takes them out of
 * that rhythm. Appendix 24's closing stack opens with a `plain` entry and
 * divides the rest, so both occur in one card.
 */
export const VERSE_ENTRY_STYLES = {
  /** No wrapper element at all. */
  none: '',
  /** An unclassed wrapper — the first quotation of a divided stack. */
  plain: '',
  /** A grouping wrapper that tightens the quote against its reference. */
  grouped: 'space-y-1',
  /** A rule between quotations — appendix 24's four closing verses. */
  divided: 'border-t border-border/40 pt-4',
} as const satisfies Record<string, string>

export type AppendixVerseEntryStyle = keyof typeof VERSE_ENTRY_STYLES

/** A quotation's body paragraph. */
export const VERSE_BODY_STYLES = {
  sm: 'text-sm leading-relaxed italic text-foreground/90',
  base: 'text-base leading-relaxed italic text-foreground/90',
} as const satisfies Record<string, string>

export type AppendixVerseBodyStyle = keyof typeof VERSE_BODY_STYLES

/** A quotation's reference line. */
export const VERSE_REF_STYLES = {
  plain: 'text-xs text-muted-foreground font-mono',
  spaced: 'text-xs text-muted-foreground font-mono mt-1',
  /** Appendix 15 attributes one quotation in prose rather than as a verse key. */
  sans: 'text-xs text-muted-foreground',
} as const satisfies Record<string, string>

export type AppendixVerseRefStyle = keyof typeof VERSE_REF_STYLES

// ── groups ───────────────────────────────────────────────────────────────────

/**
 * Plain wrappers: `<section>`s and the bare `<div>`s the corpus uses to group
 * a run of blocks under one rhythm.
 */
export const GROUP_STYLES = {
  prose: 'space-y-5 text-base leading-relaxed text-foreground/90',
  proseTight: 'space-y-4 text-base leading-relaxed text-foreground/90',
  proseSm: 'space-y-4 text-sm leading-relaxed text-foreground/90',
  proseFlush: 'space-y-1 text-base leading-relaxed text-foreground/90',
  stackXl: 'space-y-6',
  stackLg: 'space-y-5',
  stackMd: 'space-y-4',
  stackSm: 'space-y-3',
  stackXs: 'space-y-2',
  stackFlush: 'space-y-1',
  /** An evidence item's content column. */
  evidenceBody: 'text-sm leading-relaxed text-foreground/85 space-y-3 flex-1 min-w-0',
  /** A definition row's content column. */
  rowBody: 'text-sm leading-relaxed space-y-1',
  /** The single-column grid appendix 5 lays its comparisons out in. */
  grid: 'grid grid-cols-1 gap-3',
} as const satisfies Record<string, string>

export type AppendixGroupStyle = keyof typeof GROUP_STYLES

// ── paragraphs ───────────────────────────────────────────────────────────────

/**
 * Paragraph styles, carried on a Portable Text block's `style` field.
 *
 * `normal` is unstyled body prose and is the only one that renders without a
 * class, which is what keeps ordinary paragraphs editable as ordinary Portable
 * Text.
 */
export const PARAGRAPH_STYLES = {
  normal: '',
  /** The bold lead-in that titles a worked example. */
  term: 'font-semibold text-foreground',
  termUpper: 'font-semibold text-foreground text-xs uppercase tracking-widest',
  /** The explanation under a term. */
  body: 'text-foreground/80',
  bodyRelaxed: 'text-foreground/80 leading-relaxed',
  bodySm: 'text-sm leading-relaxed text-foreground/80',
  bodySmItalic: 'text-sm leading-relaxed text-foreground/80 italic',
  sm: 'text-sm leading-relaxed',
  base: 'text-base leading-relaxed text-foreground/90',
  verse: 'text-base leading-relaxed italic text-foreground/90',
  /** An arithmetic result, set apart from its operands. */
  result: 'font-bold text-base',
  mono: 'font-mono text-sm text-primary break-words',
  caption: 'text-xs text-muted-foreground leading-relaxed',
  passage: 'italic text-foreground/80 leading-relaxed',
  italic: 'italic text-foreground/80',
  medium: 'text-foreground/90 leading-relaxed font-medium',
  semibold: 'text-sm font-semibold text-foreground leading-relaxed',
  primary: 'text-sm font-semibold text-primary',
  /** Eyebrows written as a paragraph rather than as a card label. */
  eyebrowPrimary: 'text-xs font-semibold uppercase tracking-widest text-primary',
  eyebrowPrimarySm: 'text-sm font-semibold uppercase tracking-widest text-primary',
  eyebrowMuted: 'text-xs font-semibold uppercase tracking-widest text-muted-foreground',
  eyebrowDestructive: 'text-xs font-semibold uppercase tracking-widest text-destructive/70',
  /** Notes and attributions. */
  note: 'text-xs text-muted-foreground',
  noteMono: 'text-xs text-muted-foreground font-mono',
  noteMonoSpaced: 'text-xs text-muted-foreground font-mono mt-1',
  noteItalic: 'text-xs italic text-muted-foreground',
  notePlain: 'text-xs not-italic text-muted-foreground',
  noteSource: 'text-xs not-italic text-muted-foreground font-mono',
  noteSourceSpaced: 'text-xs not-italic text-muted-foreground font-mono mt-2',
  muted: 'text-sm text-muted-foreground',
  mutedXs: 'text-foreground/60 text-xs',
  xs: 'text-xs',
  /** Centred lines. */
  center: 'text-center',
  centerXs: 'text-center text-xs',
  centerRelaxed: 'text-center leading-relaxed',
  centerNote: 'text-xs text-muted-foreground text-center',
  /** An arithmetic result pushed away from the operands above it. */
  resultSpaced: 'font-bold text-base pt-2',
  /** The eyebrow that titles a card. */
  labelDestructive: 'font-semibold text-destructive/80 uppercase tracking-widest text-xs',
  labelPrimary: 'font-semibold text-primary/80 uppercase tracking-widest text-xs',
} as const satisfies Record<string, string>

export type AppendixParagraphStyle = keyof typeof PARAGRAPH_STYLES

// ── lists ────────────────────────────────────────────────────────────────────

/** The `<ul>`/`<ol>` element of a badge or bullet list. */
export const LIST_STYLES = {
  badge: 'space-y-2 list-none',
  badgeSm: 'space-y-3 list-none',
  badgeMd: 'space-y-4 list-none',
  bullet: 'space-y-2 text-foreground/80 text-sm',
  bulletBody: 'space-y-2 text-foreground/80',
  decimal: 'space-y-3 list-decimal list-outside pl-6 text-base leading-relaxed',
  plain: 'space-y-2',
} as const satisfies Record<string, string>

export type AppendixListStyle = keyof typeof LIST_STYLES

/** The `<li>` of a badge or bullet list. */
export const LIST_ITEM_STYLES = {
  none: '',
  badge: 'flex items-start gap-3',
  badgeBaseline: 'flex items-baseline gap-3',
  bullet: 'flex items-start gap-2',
  row: 'flex items-start gap-3 px-4 py-2.5',
  rowWide: 'flex items-start gap-3 px-4 py-3',
} as const satisfies Record<string, string>

export type AppendixListItemStyle = keyof typeof LIST_ITEM_STYLES

/** The numbered marker of a list item. */
export const MARKER_STYLES = {
  primary:
    'shrink-0 flex items-center justify-center size-7 rounded-md bg-primary/10 text-primary font-mono text-xs font-semibold mt-0.5',
  destructive:
    'shrink-0 flex items-center justify-center size-7 rounded-md bg-destructive/10 text-destructive font-mono text-xs font-semibold mt-0.5',
  primaryCompact:
    'shrink-0 flex items-center justify-center size-6 rounded-md bg-primary/10 text-primary font-mono text-xs font-semibold',
  primaryCompactSpaced:
    'shrink-0 flex items-center justify-center size-6 rounded-md bg-primary/10 text-primary font-mono text-xs font-semibold mt-0.5',
  primarySmall:
    'shrink-0 size-5 flex items-center justify-center rounded bg-primary/10 text-primary font-mono text-xs font-bold mt-0.5',
  /** A bullet character rather than a number. */
  bullet: 'text-primary mt-1',
  /** A term in the left column of a definition row. */
  term: 'shrink-0 font-semibold text-primary w-24',
} as const satisfies Record<string, string>

export type AppendixMarkerStyle = keyof typeof MARKER_STYLES

/**
 * The content column of a list item. Which element carries this class is a
 * separate field on the block: the corpus wraps an item's body in a `<span>`,
 * in a `<p>`, or in a `<div>` holding several paragraphs, and those are not
 * interchangeable — a `<p>` cannot hold the blocks a `<div>` does.
 */
export const LIST_CONTENT_STYLES = {
  none: '',
  sm: 'text-sm leading-relaxed',
  body: 'text-foreground/80',
  bodySm: 'text-foreground/80 text-sm leading-relaxed',
  base: 'text-base leading-relaxed text-foreground/90',
  proseFlush: 'space-y-1 text-base leading-relaxed text-foreground/90',
} as const satisfies Record<string, string>

export type AppendixListContentStyle = keyof typeof LIST_CONTENT_STYLES

// ── data tables ──────────────────────────────────────────────────────────────

/** The shell a captioned table or list card is drawn in. */
export const TABLE_SHELL = 'rounded-xl border border-border/60 overflow-hidden'
/** Its caption bar. */
export const TABLE_CAPTION_BAR = 'px-4 py-3 bg-primary/5 border-b border-border/40'
/** The caption text inside that bar. */
export const TABLE_CAPTION_TEXT =
  'text-xs font-semibold uppercase tracking-widest text-muted-foreground'
/** The horizontal scroller around a wide table. */
export const TABLE_SCROLLER = 'overflow-x-auto'
/** The header row. */
export const TABLE_HEAD_ROW = 'border-b border-border/40 bg-muted/30'

export const TABLE_STYLES = {
  plain: 'w-full text-sm',
  collapse: 'w-full text-sm border-collapse',
} as const satisfies Record<string, string>

export type AppendixTableStyle = keyof typeof TABLE_STYLES

/** A `<th>`. */
export const TABLE_HEADER_STYLES = {
  left: 'text-left px-4 py-2 font-medium text-muted-foreground',
  leftMono: 'text-left px-4 py-2 font-medium text-muted-foreground font-mono',
  leftNowrap: 'text-left px-4 py-2 font-medium text-muted-foreground whitespace-nowrap',
  leftSemibold: 'text-left px-4 py-2 font-semibold text-muted-foreground',
  leftXs: 'text-left px-3 py-2 font-medium text-muted-foreground text-xs',
  leftMonoXs: 'text-left px-3 py-2 font-medium text-muted-foreground font-mono text-xs',
  right: 'text-right px-4 py-2 font-medium text-muted-foreground',
  rightMono: 'text-right px-4 py-2 font-medium text-muted-foreground font-mono',
} as const satisfies Record<string, string>

export type AppendixTableHeaderStyle = keyof typeof TABLE_HEADER_STYLES

/** A `<td>`. */
export const TABLE_CELL_STYLES = {
  plain: 'px-4 py-2 text-xs',
  medium: 'px-4 py-2 text-xs font-medium',
  semibold: 'px-4 py-2 text-xs font-semibold',
  mediumSm: 'px-4 py-2 font-medium text-xs',
  muted: 'px-4 py-2 text-xs text-muted-foreground',
  faded: 'px-4 py-2 text-xs text-foreground/70',
  primary: 'px-4 py-2 text-xs text-primary font-semibold',
  mono: 'px-4 py-2 font-mono text-xs',
  monoAlt: 'px-4 py-2 text-xs font-mono',
  monoMuted: 'px-4 py-2 font-mono text-xs text-muted-foreground',
  monoMutedAlt: 'px-4 py-2 text-xs font-mono text-muted-foreground',
  monoPrimary: 'px-4 py-2 font-mono text-xs text-primary',
  monoPrimaryMedium: 'px-4 py-2 font-mono text-xs text-primary font-medium',
  monoPrimarySemibold: 'px-4 py-2 font-mono text-xs text-primary font-semibold',
  monoPrimaryBold: 'px-4 py-2 font-mono text-xs text-primary font-bold',
  monoRight: 'px-4 py-2 font-mono text-xs text-right text-muted-foreground',
  monoRightAlt: 'px-4 py-2 text-xs font-mono text-right text-muted-foreground',
  monoPrimaryRight: 'px-4 py-2 font-mono text-xs text-primary text-right',
  monoPrimaryBoldRight: 'px-4 py-2 text-xs font-mono font-bold text-primary text-right',
  mutedRight: 'px-4 py-2 text-xs text-right text-muted-foreground',
  tightMonoMuted: 'px-4 py-1.5 font-mono text-xs text-muted-foreground',
  tightMonoPrimaryMedium: 'px-4 py-1.5 font-mono text-xs text-primary font-medium',
  tightMonoRight: 'px-4 py-1.5 font-mono text-xs text-right',
  plainTop: 'px-4 py-2 text-xs align-top',
  monoPrimaryMediumTop: 'px-4 py-2 font-mono text-xs text-primary font-medium align-top',
  monoPrimaryNowrap: 'px-4 py-2 font-mono text-xs text-primary whitespace-nowrap',
  tightMonoNowrapPrimary: 'px-4 py-1.5 font-mono text-xs whitespace-nowrap text-primary',
  tightMonoNowrapFaded: 'px-4 py-1.5 font-mono text-xs whitespace-nowrap text-foreground/80',
  /** An empty cell padding out a short column. */
  compact: 'px-3 py-1.5',
  compactMonoMuted: 'px-3 py-1.5 font-mono text-xs text-muted-foreground',
  compactMonoPrimary: 'px-3 py-1.5 font-mono text-xs text-primary font-semibold',
} as const satisfies Record<string, string>

export type AppendixTableCellStyle = keyof typeof TABLE_CELL_STYLES

/**
 * A `<tr>` in the body. The `totals*` recipes are the ones that band and
 * embolden a row, and keeping them named is what stops a total from reading as
 * one more data row — the distinction markdown lost across 42 tables in a
 * document that argues entirely by arithmetic.
 */
export const TABLE_ROW_STYLES = {
  data: 'border-b border-border/20 hover:bg-muted/20 transition-colors',
  /** A data row the source emphasises in place, e.g. a repeated-value summary. */
  dataEmphasised:
    'border-b border-border/20 hover:bg-muted/20 transition-colors bg-muted/20 font-medium',
  totalsPrimary: 'bg-primary/5 font-semibold border-t border-border/40',
  /** Second and later totals rows of a stack, which drop the leading rule. */
  totalsPlain: 'bg-primary/5 font-semibold',
  totalsMuted: 'border-t-2 border-border/40 bg-muted/30 font-semibold',
  totalsBand: 'bg-primary/5 border-t border-primary/20',
} as const satisfies Record<string, string>

export type AppendixTableRowStyle = keyof typeof TABLE_ROW_STYLES

/** The footer strip beneath a table. */
export const TABLE_NOTE_STYLES = {
  plain: 'px-4 py-2 text-xs text-muted-foreground border-t border-border/20 space-y-1',
  band:
    'px-4 py-2.5 border-t border-border/40 bg-muted/20 text-xs text-muted-foreground leading-relaxed',
} as const satisfies Record<string, string>

export type AppendixTableNoteStyle = keyof typeof TABLE_NOTE_STYLES

/** The `<ul>` of a list card, which some appendices use instead of a table. */
export const TABLE_LIST_STYLE = 'divide-y divide-border/20 text-sm'

// ── code ─────────────────────────────────────────────────────────────────────

/** A scrolling strip holding a monospace sequence. */
export const CODE_STYLES = {
  sequence: 'overflow-x-auto rounded-lg border border-border/40 bg-muted/20 px-4 py-2 my-1',
  block: 'overflow-x-auto rounded-lg border border-border/40 bg-muted/30 px-4 py-3',
} as const satisfies Record<string, string>

export type AppendixCodeStyle = keyof typeof CODE_STYLES

/** The `<code>` inside it. */
export const CODE_TEXT_STYLES = {
  sequence: 'text-xs font-mono text-primary whitespace-nowrap',
  block: 'font-mono text-xs text-foreground/80 whitespace-pre',
} as const satisfies Record<string, string>

export type AppendixCodeTextStyle = keyof typeof CODE_TEXT_STYLES

// ── figures ──────────────────────────────────────────────────────────────────

export const FIGURE_FRAME = 'rounded-lg border border-border/30 overflow-hidden bg-muted/20'
export const FIGURE_FRAME_SM =
  'rounded-lg border border-border/30 overflow-hidden bg-muted/20 max-w-sm mx-auto'
export const FIGURE_CARD = 'space-y-3'
export const FIGURE_IMAGE = 'w-full h-auto'
export const FIGURE_CAPTION = 'text-xs text-muted-foreground leading-relaxed'

// ── grid tables ──────────────────────────────────────────────────────────────

export const GRID_TABLE_CARD =
  'rounded-xl border border-primary/20 bg-primary/5 p-5 space-y-3 text-sm overflow-x-auto'
export const GRID_TABLE = 'w-full text-sm border-collapse'
export const GRID_CELL = 'border border-border/40 px-3 py-2 text-left'
export const GRID_NOTE = 'text-xs text-muted-foreground'

// ── chrome ───────────────────────────────────────────────────────────────────

export const DIVIDER_ROW = 'flex items-center gap-4'
export const DIVIDER_RULE = 'flex-1 border-border/50'
/**
 * The divider heading. The corpus writes this both with and without
 * `text-center`; on a `shrink-0` flex child sized to its own content the two
 * are indistinguishable, so both spellings resolve here.
 */
export const DIVIDER_TITLE =
  'text-sm font-semibold uppercase tracking-widest text-muted-foreground shrink-0'
export const DIVIDER_TITLE_CENTERED =
  'text-sm font-semibold uppercase tracking-widest text-muted-foreground shrink-0 text-center'

/**
 * Inline runs the corpus styles with a `<span>` rather than with `<em>` or
 * `<strong>`. These become Portable Text decorator marks, so they survive as
 * marks on a span instead of being flattened to plain text: appendix 4 sets its
 * four Arabic pronouns this way, and without them the words it is comparing
 * read as ordinary prose.
 */
export const INLINE_MARK_STYLES = {
  monoStrong: 'font-mono font-semibold',
  term: 'font-semibold text-foreground',
} as const satisfies Record<string, string>

export type AppendixInlineMark = keyof typeof INLINE_MARK_STYLES

export const EVIDENCE_ROW = 'flex items-start gap-3'
export const EVIDENCE_INTERLUDE = 'text-sm leading-relaxed text-foreground/85 italic pl-10'

export const STATEMENT_BOX =
  'rounded-xl border border-primary/20 bg-primary/5 px-5 py-4 text-center font-mono text-sm text-primary leading-relaxed'

export const INLINE_LINK = 'text-primary underline underline-offset-2'
export const INLINE_LINK_HOVER = 'text-primary underline underline-offset-2 hover:text-primary/80'
