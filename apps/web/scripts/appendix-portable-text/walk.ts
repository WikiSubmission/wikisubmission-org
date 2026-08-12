/**
 * Walks a rendered appendix's React element tree and emits Portable Text.
 *
 * Reading props off elements rather than round-tripping HTML is what keeps
 * structure the appendix TSX already has: `MathTable` takes `headers`/`rows`/
 * `totals`, `YouTubeEmbed` carries a `videoId`, and an HTML pass would have
 * flattened all of it into divs.
 *
 * Recognition is by exact class string, looked up in `lib/appendix-styles.ts` —
 * the same registry the renderer draws from. Anything not in the registry
 * produces a warning naming the class rather than a best-effort guess, because
 * a silent approximation is exactly the failure mode this conversion exists to
 * fix: converted to markdown, appendix 24's two forged verses became
 * indistinguishable from the genuine scripture around them, and a word-level
 * diff called that lossless.
 *
 * Lookup is order-insensitive (see `classKey`), so the couple of class strings
 * appendix 1 assembles from a template literal land on the same entry as the
 * ones written out by hand.
 */
import { isValidElement, type ReactElement, type ReactNode } from 'react'

import {
  CARD_STYLES,
  CARD_TONES,
  CODE_STYLES,
  CODE_TEXT_STYLES,
  DIVIDER_ROW,
  DIVIDER_TITLE,
  DIVIDER_TITLE_CENTERED,
  EVIDENCE_INTERLUDE,
  EVIDENCE_ROW,
  FIGURE_CAPTION,
  FIGURE_CARD,
  FIGURE_FRAME,
  FIGURE_FRAME_SM,
  GRID_CELL,
  GRID_NOTE,
  GRID_TABLE_CARD,
  GROUP_STYLES,
  INLINE_MARK_STYLES,
  LIST_CONTENT_STYLES,
  LIST_ITEM_STYLES,
  LIST_STYLES,
  MARKER_STYLES,
  PARAGRAPH_STYLES,
  STATEMENT_BOX,
  TABLE_CAPTION_BAR,
  TABLE_CAPTION_TEXT,
  TABLE_CELL_STYLES,
  TABLE_HEADER_STYLES,
  TABLE_LIST_STYLE,
  TABLE_NOTE_STYLES,
  TABLE_ROW_STYLES,
  TABLE_SCROLLER,
  TABLE_SHELL,
  TABLE_STYLES,
  VERSE_BODY_STYLES,
  VERSE_CARD_STYLES,
  VERSE_ENTRY_STYLES,
  VERSE_REF_STYLES,
  classKey,
  reverseStyles,
} from '@/lib/appendix-styles'
import type {
  AppendixBlock,
  AppendixGridRow,
  AppendixInlineChild,
  AppendixLinkMarkDef,
  AppendixListItem,
  AppendixRichText,
  AppendixTableColumn,
  AppendixTableRow,
  AppendixVerseEntry,
} from '@/lib/appendix-portable-text'

/** An appendix's single trailing YouTube embed, lifted out as metadata. */
export interface EmbedRef {
  videoId: string
  videoTitle: string
}

export interface ConvertResult {
  blocks: AppendixBlock[]
  embeds: EmbedRef[]
  warnings: string[]
}

type Props = Record<string, unknown>

const FRAGMENT: unknown = Symbol.for('react.fragment')

const isFragment = (element: ReactElement) => (element.type as unknown) === FRAGMENT
const propsOf = (element: ReactElement): Props => (element.props ?? {}) as Props
const classOf = (element: ReactElement): string => {
  const value = propsOf(element).className
  return typeof value === 'string' ? value.replace(/\s+/g, ' ').trim() : ''
}

function nameOf(type: unknown): string {
  if (typeof type === 'function') {
    const fn = type as { displayName?: string; name?: string }
    return fn.displayName ?? fn.name ?? ''
  }
  if (type && typeof type === 'object') {
    const obj = type as { displayName?: string; name?: string; render?: { name?: string } }
    return obj.displayName ?? obj.name ?? obj.render?.name ?? ''
  }
  return ''
}

function childArray(node: ReactNode): ReactNode[] {
  if (node === null || node === undefined || node === false || node === true) return []
  return Array.isArray(node) ? ((node.flat(Infinity) as ReactNode[]) ?? []) : [node]
}

/**
 * Element children only, with text dropped and fragments flattened into their
 * contents. Flattening matters: appendix 23 emits every pair of table cells
 * inside a `React.Fragment`, so a walk that treated a fragment as an opaque
 * child would read that table as having no cells at all.
 */
function elementChildren(node: ReactNode): ReactElement[] {
  const out: ReactElement[] = []
  for (const child of childArray(node)) {
    if (!isValidElement(child)) continue
    const element = child as ReactElement
    if (isFragment(element)) {
      out.push(...elementChildren(propsOf(element).children as ReactNode))
      continue
    }
    out.push(element)
  }
  return out
}

// ── reverse lookups ──────────────────────────────────────────────────────────

const CARDS = reverseStyles(CARD_STYLES)
const VERSE_CARDS = reverseStyles(VERSE_CARD_STYLES)
const VERSE_BODIES = reverseStyles(VERSE_BODY_STYLES)
const VERSE_REFS = reverseStyles(VERSE_REF_STYLES)
const GROUPS = reverseStyles(GROUP_STYLES)
const PARAGRAPHS = reverseStyles(PARAGRAPH_STYLES)
const LISTS = reverseStyles(LIST_STYLES)
const LIST_ITEMS = reverseStyles(LIST_ITEM_STYLES)
const MARKERS = reverseStyles(MARKER_STYLES)
const LIST_CONTENTS = reverseStyles(LIST_CONTENT_STYLES)
const TABLES = reverseStyles(TABLE_STYLES)
const TABLE_HEADERS = reverseStyles(TABLE_HEADER_STYLES)
const TABLE_CELLS = reverseStyles(TABLE_CELL_STYLES)
const TABLE_ROWS = reverseStyles(TABLE_ROW_STYLES)
const TABLE_NOTES = reverseStyles(TABLE_NOTE_STYLES)
const CODES = reverseStyles(CODE_STYLES)
const INLINE_MARKS = reverseStyles(INLINE_MARK_STYLES)
const CODE_TEXTS = reverseStyles(CODE_TEXT_STYLES)

/** A verse-entry wrapper is matched on its own, since two names share a class. */
const VERSE_WRAPPERS = new Map<string, keyof typeof VERSE_ENTRY_STYLES>([
  ['', 'plain'],
  [classKey(VERSE_ENTRY_STYLES.grouped), 'grouped'],
  [classKey(VERSE_ENTRY_STYLES.divided), 'divided'],
])

const is = (className: string, style: string) => classKey(className) === classKey(style)

// ── the walk ─────────────────────────────────────────────────────────────────

export function convertTree(root: ReactNode): ConvertResult {
  const embeds: EmbedRef[] = []
  const warnings: string[] = []
  const warn = (message: string) => {
    if (!warnings.includes(message)) warnings.push(message)
  }

  let keySeed = 0
  const key = () => `a${(keySeed += 1).toString(36)}`

  /** Invokes a presentational component so the walk can continue into it. */
  function render(element: ReactElement): ReactNode {
    const type = element.type as (props: Props) => ReactNode
    try {
      if (typeof type === 'function') return type(propsOf(element))
    } catch (error) {
      warn(
        `could not render <${nameOf(element.type) || 'anonymous'}>: ` +
          `${error instanceof Error ? error.message : String(error)}`,
      )
    }
    return propsOf(element).children as ReactNode
  }

  /** Whether the source marked this card for the article's reveal animation. */
  const revealOf = (element: ReactElement) =>
    propsOf(element)['data-card'] !== undefined ? {} : { reveal: false }

  // ── inline ─────────────────────────────────────────────────────────────────

  /** Collects a node's inline content into spans, refs and link annotations. */
  function inline(node: ReactNode): AppendixRichText {
    const children: AppendixInlineChild[] = []
    const markDefs: AppendixLinkMarkDef[] = []

    const push = (text: string, marks: string[]) => {
      if (text === '') return
      const last = children[children.length - 1]
      if (last && last._type === 'span' && (last.marks ?? []).join(' ') === marks.join(' ')) {
        last.text += text
        return
      }
      children.push(
        marks.length > 0
          ? { _type: 'span', _key: key(), text, marks: [...marks] }
          : { _type: 'span', _key: key(), text },
      )
    }

    const visit = (value: ReactNode, marks: string[]) => {
      if (value === null || value === undefined || typeof value === 'boolean') return
      if (typeof value === 'string') return push(value, marks)
      if (typeof value === 'number') return push(String(value), marks)
      if (Array.isArray(value)) {
        for (const item of value) visit(item, marks)
        return
      }
      if (!isValidElement(value)) return

      const element = value as ReactElement
      const props = propsOf(element)
      const kids = props.children as ReactNode

      if (isFragment(element)) return visit(kids, marks)

      if (typeof element.type === 'string') {
        switch (element.type) {
          case 'em':
          case 'i':
            return visit(kids, [...marks, 'em'])
          case 'strong':
          case 'b':
            return visit(kids, [...marks, 'strong'])
          case 'code':
            return visit(kids, [...marks, 'code'])
          case 'br':
            // A newline in the span text, rendered back as a <br/>. Collapsing
            // it to a space would silently reflow the card it sits in.
            return push('\n', marks)
          case 'span': {
            // An unclassed span is a grouping wrapper with no visual effect; a
            // classed one is an inline style and becomes a decorator mark.
            const cls = classOf(element)
            if (cls === '') return visit(kids, marks)
            const mark = INLINE_MARKS.get(classKey(cls))
            if (!mark) {
              warn(`unmapped inline span class "${cls}"`)
              return visit(kids, marks)
            }
            return visit(kids, [...marks, mark])
          }
          case 'a': {
            const href = typeof props.href === 'string' ? props.href : undefined
            if (!href) return visit(kids, marks)
            const def: AppendixLinkMarkDef = { _key: key(), _type: 'link', href }
            markDefs.push(def)
            return visit(kids, [...marks, def._key])
          }
          default:
            return visit(kids, marks)
        }
      }

      const name = nameOf(element.type)
      if (name === 'QuranRef' || name === 'ScriptureRef') {
        const reference = props.reference
        if (typeof reference === 'string') {
          children.push({ _type: 'quranRef', _key: key(), reference })
        }
        return
      }
      if (name === 'AppendixLink') {
        if (typeof props.n === 'number') {
          children.push({ _type: 'appendixLink', _key: key(), n: props.n })
        }
        return
      }
      if (typeof props.href === 'string') {
        const def: AppendixLinkMarkDef = { _key: key(), _type: 'link', href: props.href }
        markDefs.push(def)
        return visit(kids, [...marks, def._key])
      }
      return visit(render(element), marks)
    }

    visit(node, [])
    return markDefs.length > 0 ? { children, markDefs } : { children }
  }

  const isEmpty = (rich: AppendixRichText) =>
    rich.children.length === 0 ||
    rich.children.every((child) => child._type === 'span' && child.text.trim() === '')

  /** Plain text of a node, for the fields the schema stores as strings. */
  function text(node: ReactNode): string {
    return inline(node)
      .children.map((child) => (child._type === 'span' ? child.text : ''))
      .join('')
      .replace(/\s+/g, ' ')
      .trim()
  }

  // ── blocks ─────────────────────────────────────────────────────────────────

  function blocks(node: ReactNode): AppendixBlock[] {
    const out: AppendixBlock[] = []
    for (const child of childArray(node)) {
      if (child === null || child === undefined || typeof child === 'boolean') continue
      if (typeof child === 'string' && child.trim() === '') continue
      if (typeof child === 'string' || typeof child === 'number') {
        // Bare text at block level: a few cards write their prose straight into
        // the card. `bare` keeps it that way — wrapping it in a paragraph would
        // add an element the source never had.
        out.push({ _type: 'block', _key: key(), style: 'normal', bare: true, ...inline(child) })
        continue
      }
      if (!isValidElement(child)) continue
      out.push(...blocksOf(child as ReactElement))
    }
    return out
  }

  function blocksOf(element: ReactElement): AppendixBlock[] {
    if (isFragment(element)) return blocks(propsOf(element).children as ReactNode)
    if (typeof element.type === 'string') return hostBlocks(element)
    return componentBlocks(element)
  }

  /** Whether a subtree contains the appendix's trailing YouTube embed. */
  function hasEmbed(node: ReactNode): boolean {
    for (const child of childArray(node)) {
      if (!isValidElement(child)) continue
      const element = child as ReactElement
      if (nameOf(element.type) === 'YouTubeEmbed') return true
      if (hasEmbed(propsOf(element).children as ReactNode)) return true
    }
    return false
  }

  /** Records every embed in a subtree without walking it for blocks. */
  function collectEmbeds(node: ReactNode): void {
    for (const child of childArray(node)) {
      if (!isValidElement(child)) continue
      const element = child as ReactElement
      if (nameOf(element.type) === 'YouTubeEmbed') {
        componentBlocks(element)
        continue
      }
      collectEmbeds(propsOf(element).children as ReactNode)
    }
  }

  function paragraph(node: ReactNode, style: keyof typeof PARAGRAPH_STYLES): AppendixBlock[] {
    const rich = inline(node)
    if (isEmpty(rich)) return []
    return [{ _type: 'block', _key: key(), style, ...rich }]
  }

  function hostBlocks(element: ReactElement): AppendixBlock[] {
    const tag = element.type as string
    const props = propsOf(element)
    const children = props.children as ReactNode
    const className = classOf(element)

    switch (tag) {
      case 'p': {
        if (is(className, EVIDENCE_INTERLUDE)) {
          return [{ _type: 'appendixInterlude', _key: key(), text: inline(children) }]
        }
        const style = PARAGRAPHS.get(classKey(className))
        if (!style) {
          warn(`unmapped paragraph class "${className}"`)
          return paragraph(children, 'normal')
        }
        return paragraph(children, style)
      }

      case 'section':
      case 'div':
        return containerBlocks(element, tag)

      case 'blockquote': {
        const style = CARDS.get(classKey(className))
        if (!style) {
          warn(`unmapped blockquote class "${className}"`)
          return blocks(children)
        }
        return [calloutBlock(element, style)]
      }

      case 'ul':
      case 'ol':
        return listBlocks(element, tag === 'ol')

      case 'h2':
        // Only ever the title inside a divider, handled by the divider itself.
        warn('a bare heading was dropped; headings only exist inside dividers')
        return []

      default:
        warn(`unmapped block element <${tag}> class "${className}"`)
        return blocks(children)
    }
  }

  // ── containers ─────────────────────────────────────────────────────────────

  function containerBlocks(element: ReactElement, tag: 'section' | 'div'): AppendixBlock[] {
    const children = propsOf(element).children as ReactNode
    const className = classOf(element)
    const kids = elementChildren(children)

    // The video sits in its own section under a "Video" heading. The embed is
    // lifted into payload metadata and AppendixVideo draws its own heading, so
    // the whole section goes with it.
    if (hasEmbed(children)) {
      collectEmbeds(children)
      return []
    }

    if (is(className, DIVIDER_ROW)) {
      const divider = dividerBlocks(kids)
      if (divider) return divider
    }

    // A scripture card and appendix 1's highlight card are written with the
    // same class, so a verse body is what tells them apart.
    const verseStyle = VERSE_CARDS.get(classKey(className))
    if (verseStyle && kids.some((child) => holdsVerseBody(child))) {
      return [verseCardsBlock(element, verseStyle)]
    }

    const cardStyle = CARDS.get(classKey(className))
    if (cardStyle) return [calloutBlock(element, cardStyle)]

    if (is(className, TABLE_SHELL)) return shellBlocks(element)

    if (is(className, GRID_TABLE_CARD)) return [gridTableBlock(element)]

    const codeStyle = CODES.get(classKey(className))
    if (codeStyle) return codeBlocks(element, codeStyle)

    if (is(className, FIGURE_FRAME_SM)) return figureBlocks(element, 'sm')

    // `space-y-3` is both a plain group and the wrapper of a full figure, so a
    // framed image decides which this is.
    if (
      is(className, FIGURE_CARD) &&
      kids.some((child) => is(classOf(child), FIGURE_FRAME))
    ) {
      return figureBlocks(element, 'full')
    }

    if (is(className, EVIDENCE_ROW)) return rowBlocks(element)

    if (is(className, STATEMENT_BOX)) {
      return [{ _type: 'appendixStatement', _key: key(), text: inline(children) }]
    }

    const groupStyle = GROUPS.get(classKey(className))
    if (groupStyle) {
      const content = blocks(children)
      if (content.length === 0) return []
      // A prose group of nothing but plain paragraphs, and an evidence group of
      // nothing but evidence, are the shapes the renderer regroups on its own,
      // so they stay flat and stay editable as ordinary Portable Text.
      //
      // `style === 'normal'` is load-bearing: the renderer only regroups plain
      // paragraphs, so flattening a group that also holds a styled one would
      // leave that paragraph outside any section and drop the `leading-relaxed`
      // it inherited.
      if (
        groupStyle === 'prose' &&
        content.every((block) => block._type === 'block' && block.style === 'normal')
      ) {
        return content
      }
      if (
        groupStyle === 'stackXl' &&
        content.every(
          (block) =>
            block._type === 'appendixEvidence' || block._type === 'appendixInterlude',
        )
      ) {
        return content
      }
      return [{ _type: 'appendixSection', _key: key(), style: groupStyle, tag, content }]
    }

    warn(`unmapped container <${tag}> class "${className}"`)
    return blocks(children)
  }

  /** Whether a card child is, or wraps, a scripture quotation's body. */
  function holdsVerseBody(child: ReactElement): boolean {
    if (child.type === 'p') return VERSE_BODIES.has(classKey(classOf(child)))
    if (child.type !== 'div') return false
    if (!VERSE_WRAPPERS.has(classKey(classOf(child)))) return false
    return elementChildren(propsOf(child).children as ReactNode).some(holdsVerseBody)
  }

  /** `<hr/> title <hr/>`. */
  function dividerBlocks(kids: ReactElement[]): AppendixBlock[] | null {
    const rules = kids.filter((child) => child.type === 'hr')
    const heading = kids.find((child) => child.type === 'h2')
    if (rules.length !== 2 || !heading) return null
    const cls = classOf(heading)
    const centered = is(cls, DIVIDER_TITLE_CENTERED)
    if (!centered && !is(cls, DIVIDER_TITLE)) {
      warn(`unmapped divider title class "${cls}"`)
    }
    return [
      {
        _type: 'appendixDivider',
        _key: key(),
        title: inline(propsOf(heading).children as ReactNode),
        ...(centered ? { centered: true } : {}),
      },
    ]
  }

  // ── scripture cards ────────────────────────────────────────────────────────

  function verseCardsBlock(
    element: ReactElement,
    style: keyof typeof VERSE_CARD_STYLES,
  ): AppendixBlock {
    const kids = elementChildren(propsOf(element).children as ReactNode)
    const entries: AppendixVerseEntry[] = []
    let body: keyof typeof VERSE_BODY_STYLES = 'sm'
    let refStyle: keyof typeof VERSE_REF_STYLES = 'plain'
    let heading: AppendixRichText | undefined
    let headingStyle: keyof typeof PARAGRAPH_STYLES | undefined

    const consume = (nodes: ReactElement[], wrapper: keyof typeof VERSE_ENTRY_STYLES) => {
      for (let i = 0; i < nodes.length; i += 1) {
        const node = nodes[i]
        const cls = classOf(node)

        if (node.type === 'p') {
          const bodyStyle = VERSE_BODIES.get(classKey(cls))
          if (bodyStyle) {
            body = bodyStyle
            const entry: AppendixVerseEntry = {
              _key: key(),
              body: inline(propsOf(node).children as ReactNode),
              wrapper,
            }
            const next = nodes[i + 1]
            const nextRef = next && next.type === 'p' ? VERSE_REFS.get(classKey(classOf(next))) : undefined
            if (next && nextRef) {
              refStyle = nextRef
              entry.reference = inline(propsOf(next).children as ReactNode)
              i += 1
            }
            entries.push(entry)
            continue
          }
          // A card may open with an eyebrow above its quotations.
          const paragraphStyle = PARAGRAPHS.get(classKey(cls))
          if (paragraphStyle && entries.length === 0 && heading === undefined) {
            heading = inline(propsOf(node).children as ReactNode)
            headingStyle = paragraphStyle
            continue
          }
        }

        if (node.type === 'div') {
          const inner = VERSE_WRAPPERS.get(classKey(cls))
          if (inner) {
            consume(elementChildren(propsOf(node).children as ReactNode), inner)
            continue
          }
        }

        warn(`unmapped scripture-card child <${String(node.type)}> class "${cls}"`)
      }
    }

    consume(kids, 'none')

    return {
      _type: 'appendixVerseCards',
      _key: key(),
      style,
      body,
      refStyle,
      ...(heading ? { heading, headingStyle } : {}),
      entries,
      ...revealOf(element),
    }
  }

  // ── callouts ───────────────────────────────────────────────────────────────

  function calloutBlock(
    element: ReactElement,
    style: keyof typeof CARD_STYLES,
  ): Extract<AppendixBlock, { _type: 'appendixCallout' }> {
    return {
      _type: 'appendixCallout',
      _key: key(),
      tone: CARD_TONES[style],
      style,
      content: blocks(propsOf(element).children as ReactNode),
      ...revealOf(element),
    }
  }

  // ── figures ────────────────────────────────────────────────────────────────

  function findImage(node: ReactNode): ReactElement | null {
    for (const child of childArray(node)) {
      if (!isValidElement(child)) continue
      const element = child as ReactElement
      if (nameOf(element.type) === 'Image' || element.type === 'img') return element
      const nested = findImage(propsOf(element).children as ReactNode)
      if (nested) return nested
    }
    return null
  }

  function figureBlocks(element: ReactElement, frame: 'full' | 'sm'): AppendixBlock[] {
    const children = propsOf(element).children as ReactNode
    const kids = elementChildren(children)
    // A `sm` figure is the frame itself, so its image sits directly inside; a
    // `full` figure wraps the frame in a card alongside its caption.
    const frameNode = frame === 'sm' ? null : kids.find((child) => is(classOf(child), FIGURE_FRAME))

    const image = findImage(frameNode ? (propsOf(frameNode).children as ReactNode) : children)
    if (!image) {
      warn('a figure frame had no image')
      return blocks(children)
    }
    const props = propsOf(image)
    const src = typeof props.src === 'string' ? props.src : ''
    if (!src) {
      warn('a figure image had no src')
      return []
    }

    const block = {
      _type: 'appendixFigure' as const,
      _key: key(),
      src,
      alt: typeof props.alt === 'string' ? props.alt : '',
      width: typeof props.width === 'number' ? props.width : 0,
      height: typeof props.height === 'number' ? props.height : 0,
      frame,
      ...revealOf(element),
    }

    if (frame === 'sm') return [block]

    let caption: AppendixRichText | undefined
    let source: Extract<AppendixBlock, { _type: 'appendixCallout' }> | undefined

    for (const child of kids) {
      if (child === frameNode) continue
      const cls = classOf(child)
      if (child.type === 'p' && is(cls, FIGURE_CAPTION)) {
        caption = inline(propsOf(child).children as ReactNode)
        continue
      }
      const cardStyle = CARDS.get(classKey(cls))
      if (cardStyle) {
        source = calloutBlock(child, cardStyle)
        continue
      }
      warn(`unmapped figure child <${String(child.type)}> class "${cls}"`)
    }

    return [{ ...block, ...(caption ? { caption } : {}), ...(source ? { source } : {}) }]
  }

  // ── rows ───────────────────────────────────────────────────────────────────

  /**
   * `flex items-start gap-3`: a numbered evidence item, or a term/definition
   * row. The marker tells them apart — a badge holds a number, a term holds
   * words.
   */
  function rowBlocks(element: ReactElement): AppendixBlock[] {
    const kids = elementChildren(propsOf(element).children as ReactNode)
    const marker = kids.find((child) => MARKERS.has(classKey(classOf(child))))
    if (!marker) {
      warn(`a row had no recognised marker (class "${classOf(element)}")`)
      return blocks(propsOf(element).children as ReactNode)
    }
    const markerStyle = MARKERS.get(classKey(classOf(marker)))!
    const rest = kids.filter((child) => child !== marker)

    if (markerStyle === 'term') {
      const body = rest[0]
      const bodyStyle = body ? LIST_CONTENTS.get(classKey(classOf(body))) : undefined
      if (!body || !bodyStyle) {
        warn(`unmapped definition-row body class "${body ? classOf(body) : ''}"`)
        return blocks(propsOf(element).children as ReactNode)
      }
      return [
        {
          _type: 'appendixDefinitionRow',
          _key: key(),
          term: inline(propsOf(marker).children as ReactNode),
          termStyle: markerStyle,
          body: inline(propsOf(body).children as ReactNode),
          bodyStyle,
        },
      ]
    }

    const column = rest[0]
    const columnStyle = column ? GROUPS.get(classKey(classOf(column))) : undefined
    if (!column || !columnStyle) {
      warn(`unmapped evidence body class "${column ? classOf(column) : ''}"`)
      return blocks(propsOf(element).children as ReactNode)
    }
    return [
      {
        _type: 'appendixEvidence',
        _key: key(),
        n: Number(text(propsOf(marker).children as ReactNode)) || 0,
        marker: markerStyle,
        body: columnStyle,
        content: blocks(propsOf(column).children as ReactNode),
      },
    ]
  }

  // ── lists ──────────────────────────────────────────────────────────────────

  function listBlocks(element: ReactElement, ordered: boolean): AppendixBlock[] {
    const className = classOf(element)
    const style = LISTS.get(classKey(className))
    if (!style) {
      warn(`unmapped list class "${className}"`)
      return []
    }
    const items = elementChildren(propsOf(element).children as ReactNode).filter(
      (child) => child.type === 'li',
    )
    if (items.length === 0) {
      warn(`an empty list was dropped (class "${className}")`)
      return []
    }

    let item: keyof typeof LIST_ITEM_STYLES = 'none'
    let marker: keyof typeof MARKER_STYLES | undefined
    let bullet: string | undefined
    const body = { style: 'none' as keyof typeof LIST_CONTENT_STYLES, tag: 'none' as ItemTag }
    const contents: AppendixListItem[] = []

    for (const li of items) {
      const itemStyle = LIST_ITEMS.get(classKey(classOf(li)))
      if (itemStyle === undefined) warn(`unmapped list item class "${classOf(li)}"`)
      else item = itemStyle

      const kids = elementChildren(propsOf(li).children as ReactNode)
      const markerNode = kids.find(
        (child) => child.type === 'span' && MARKERS.has(classKey(classOf(child))),
      )
      if (markerNode) {
        marker = MARKERS.get(classKey(classOf(markerNode)))
        if (marker === 'bullet') bullet = text(propsOf(markerNode).children as ReactNode)
      }

      const rest = childArray(propsOf(li).children as ReactNode).filter(
        (child) => child !== markerNode,
      )
      contents.push(itemBody(rest, body))
    }

    return [
      {
        _type: 'appendixBadgeList',
        _key: key(),
        ordered,
        style,
        item,
        ...(marker ? { marker } : {}),
        content: body.style,
        contentTag: body.tag,
        ...(bullet ? { bullet } : {}),
        items: contents,
      },
    ]
  }

  type ItemTag = 'none' | 'span' | 'p' | 'div'

  /**
   * The body of one list item, and the wrapper it sits in.
   *
   * The wrapper is not decoration: the corpus writes it as a `<span>`, a `<p>`
   * carrying its own type scale, or a `<div>` holding several paragraphs, and
   * collapsing all three to a span reflowed six appendices. The tag and class
   * are recorded on the list rather than per item, which is how the source
   * writes them; a list that disagreed with itself would be reported.
   */
  function itemBody(
    rest: ReactNode[],
    body: { style: keyof typeof LIST_CONTENT_STYLES; tag: ItemTag },
  ): AppendixListItem {
    const sole =
      rest.filter((child) => typeof child !== 'string' || child.trim() !== '').length === 1 &&
      isValidElement(rest.find(isValidElement))
        ? (rest.find(isValidElement) as ReactElement)
        : null
    const tag = sole && typeof sole.type === 'string' ? (sole.type as ItemTag) : null
    const style =
      sole && (tag === 'span' || tag === 'p' || tag === 'div')
        ? LIST_CONTENTS.get(classKey(classOf(sole)))
        : undefined

    if (sole && tag && style) {
      if (body.tag !== 'none' && (body.tag !== tag || body.style !== style)) {
        warn(`a list mixes item bodies (<${body.tag}>.${body.style} and <${tag}>.${style})`)
      }
      body.tag = tag
      body.style = style
      const children = propsOf(sole).children as ReactNode
      return tag === 'div'
        ? { _key: key(), content: blocks(children) }
        : { _key: key(), text: inline(children) }
    }

    return { _key: key(), text: inline(rest) }
  }

  // ── captioned shells: data tables and list cards ───────────────────────────

  function shellBlocks(element: ReactElement): AppendixBlock[] {
    const kids = elementChildren(propsOf(element).children as ReactNode)
    let caption: AppendixRichText | undefined
    let table: ReactElement | null = null
    let list: ReactElement | null = null
    let note:
      | { style: keyof typeof TABLE_NOTE_STYLES; inside?: boolean; content: AppendixBlock[] }
      | undefined

    for (const child of kids) {
      const cls = classOf(child)
      if (is(cls, TABLE_CAPTION_BAR)) {
        const line = elementChildren(propsOf(child).children as ReactNode)[0]
        if (line && is(classOf(line), TABLE_CAPTION_TEXT)) {
          caption = inline(propsOf(line).children as ReactNode)
        } else {
          warn(`unmapped table caption class "${line ? classOf(line) : ''}"`)
        }
        continue
      }
      if (is(cls, TABLE_SCROLLER)) {
        // The footer note sits beside the table inside the scroller in some
        // appendices and beside the scroller in others, so both are scanned.
        for (const inner of elementChildren(propsOf(child).children as ReactNode)) {
          if (inner.type === 'table') {
            table = inner
            continue
          }
          const innerNote = TABLE_NOTES.get(classKey(classOf(inner)))
          if (innerNote) {
            note = {
              style: innerNote,
              inside: true,
              content: blocks(propsOf(inner).children as ReactNode),
            }
            continue
          }
          warn(`unmapped table-scroller child <${String(inner.type)}> class "${classOf(inner)}"`)
        }
        if (!table) warn('a table scroller held no table')
        continue
      }
      if (child.type === 'table') {
        table = child
        continue
      }
      if (child.type === 'ul' && is(cls, TABLE_LIST_STYLE)) {
        list = child
        continue
      }
      const noteStyle = TABLE_NOTES.get(classKey(cls))
      if (noteStyle) {
        note = { style: noteStyle, content: blocks(propsOf(child).children as ReactNode) }
        continue
      }
      warn(`unmapped table-shell child <${String(child.type)}> class "${cls}"`)
    }

    if (list) return [listCardBlock(element, caption, list)]
    if (!table) {
      warn('a captioned shell held neither a table nor a list')
      return []
    }
    return [dataTableBlock(element, caption, table, note)]
  }

  function listCardBlock(
    shell: ReactElement,
    caption: AppendixRichText | undefined,
    list: ReactElement,
  ): AppendixBlock {
    let item: keyof typeof LIST_ITEM_STYLES = 'none'
    let marker: keyof typeof MARKER_STYLES | undefined
    const body = { style: 'none' as keyof typeof LIST_CONTENT_STYLES, tag: 'none' as ItemTag }
    const items: AppendixListItem[] = []

    for (const li of elementChildren(propsOf(list).children as ReactNode)) {
      if (li.type !== 'li') continue
      const itemStyle = LIST_ITEMS.get(classKey(classOf(li)))
      if (itemStyle === undefined) warn(`unmapped list-card item class "${classOf(li)}"`)
      else item = itemStyle

      const kids = childArray(propsOf(li).children as ReactNode)
      const markerNode = kids.find(
        (child) =>
          isValidElement(child) && MARKERS.has(classKey(classOf(child as ReactElement))),
      ) as ReactElement | undefined
      if (markerNode) marker = MARKERS.get(classKey(classOf(markerNode)))

      items.push(itemBody(kids.filter((child) => child !== markerNode), body))
    }

    return {
      _type: 'appendixListCard',
      _key: key(),
      ...(caption ? { caption } : {}),
      item,
      ...(marker ? { marker } : {}),
      content: body.style,
      contentTag: body.tag,
      items,
      ...revealOf(shell),
    }
  }

  function dataTableBlock(
    shell: ReactElement,
    caption: AppendixRichText | undefined,
    table: ReactElement,
    note:
      | { style: keyof typeof TABLE_NOTE_STYLES; inside?: boolean; content: AppendixBlock[] }
      | undefined,
  ): AppendixBlock {
    const tableStyle = TABLES.get(classKey(classOf(table)))
    if (!tableStyle) warn(`unmapped table class "${classOf(table)}"`)

    const columns: AppendixTableColumn[] = []
    const rows: AppendixTableRow[] = []

    const visit = (node: ReactNode) => {
      for (const child of elementChildren(node)) {
        if (child.type === 'thead' || child.type === 'tbody' || child.type === 'tfoot') {
          visit(propsOf(child).children as ReactNode)
          continue
        }
        if (child.type !== 'tr') continue
        const cells = elementChildren(propsOf(child).children as ReactNode)

        if (cells.length > 0 && cells.every((cell) => cell.type === 'th')) {
          cells.forEach((cell, i) => {
            const style = TABLE_HEADERS.get(classKey(classOf(cell)))
            if (!style) warn(`unmapped table header class "${classOf(cell)}"`)
            const column: AppendixTableColumn = {
              header: inline(propsOf(cell).children as ReactNode),
              headerStyle: style ?? 'left',
              cellStyle: 'plain',
            }
            columns[i] = { ...columns[i], ...column }
          })
          continue
        }

        const rowStyle = TABLE_ROWS.get(classKey(classOf(child)))
        if (!rowStyle) warn(`unmapped table row class "${classOf(child)}"`)
        const cellStyles = cells.map((cell) => {
          const style = TABLE_CELLS.get(classKey(classOf(cell)))
          if (!style) warn(`unmapped table cell class "${classOf(cell)}"`)
          return style ?? 'plain'
        })
        rows.push({
          _key: key(),
          style: rowStyle ?? 'data',
          cells: cells.map((cell) => inline(propsOf(cell).children as ReactNode)),
          cellStyles,
        })
      }
    }
    visit(propsOf(table).children as ReactNode)

    // A cell recipe that every data row agrees on belongs to the column; only
    // the rows that depart from it keep an override. That is how the source
    // reads, and it keeps a totals row's emphasis visible as a difference.
    const dataRows = rows.filter((row) => row.style === 'data')
    const width = Math.max(columns.length, ...rows.map((row) => row.cells.length), 0)
    for (let i = 0; i < width; i += 1) {
      const seen = new Set(dataRows.map((row) => row.cellStyles?.[i]).filter(Boolean))
      const common = seen.size === 1 ? [...seen][0] : undefined
      const existing = columns[i]
      columns[i] = {
        ...(existing?.header ? { header: existing.header } : {}),
        headerStyle: existing?.headerStyle ?? 'left',
        cellStyle: common ?? 'plain',
      }
    }
    for (const row of rows) {
      if (row.cellStyles?.every((style, i) => style === columns[i]?.cellStyle)) {
        delete row.cellStyles
      }
    }

    return {
      _type: 'appendixDataTable',
      _key: key(),
      ...(caption ? { caption } : {}),
      table: tableStyle ?? 'plain',
      columns,
      rows,
      ...(note ? { note } : {}),
      ...revealOf(shell),
    }
  }

  // ── code ───────────────────────────────────────────────────────────────────

  function codeBlocks(
    element: ReactElement,
    style: keyof typeof CODE_STYLES,
  ): AppendixBlock[] {
    const code = elementChildren(propsOf(element).children as ReactNode).find(
      (child) => child.type === 'code',
    )
    if (!code) {
      warn(`a code strip held no <code> (class "${classOf(element)}")`)
      return blocks(propsOf(element).children as ReactNode)
    }
    const textStyle = CODE_TEXTS.get(classKey(classOf(code)))
    if (!textStyle) warn(`unmapped code class "${classOf(code)}"`)
    return [
      {
        _type: 'appendixCode',
        _key: key(),
        style,
        text: textStyle ?? 'sequence',
        value: text(propsOf(code).children as ReactNode),
      },
    ]
  }

  // ── grid tables ────────────────────────────────────────────────────────────

  function gridTableBlock(element: ReactElement): AppendixBlock {
    const headers: AppendixRichText[] = []
    const rows: AppendixGridRow[] = []
    const notes: AppendixRichText[] = []

    const visitRows = (node: ReactNode) => {
      for (const child of elementChildren(node)) {
        if (child.type === 'thead' || child.type === 'tbody' || child.type === 'tfoot') {
          visitRows(propsOf(child).children as ReactNode)
          continue
        }
        if (child.type !== 'tr') continue
        const cells = elementChildren(propsOf(child).children as ReactNode)
        if (cells.length > 0 && cells.every((cell) => cell.type === 'th')) {
          for (const cell of cells) {
            const cls = classOf(cell)
            if (!is(cls, GRID_CELL)) warn(`unmapped grid header class "${cls}"`)
            headers.push(inline(propsOf(cell).children as ReactNode))
          }
          continue
        }
        const rowClass = classOf(child)
        const variant: AppendixGridRow['variant'] =
          rowClass === 'font-semibold'
            ? 'total'
            : cells.some((cell) => is(classOf(cell), `${GRID_CELL} font-semibold`))
              ? 'group'
              : 'data'
        if (rowClass !== '' && rowClass !== 'font-semibold') {
          warn(`unmapped grid row class "${rowClass}"`)
        }
        let alignTop = false
        const built = cells.map((cell) => {
          const cls = classOf(cell)
          if (is(cls, `${GRID_CELL} align-top`)) alignTop = true
          else if (!is(cls, GRID_CELL) && !is(cls, `${GRID_CELL} font-semibold`)) {
            warn(`unmapped grid cell class "${cls}"`)
          }
          const colSpan = propsOf(cell).colSpan
          return {
            content: inline(propsOf(cell).children as ReactNode),
            ...(typeof colSpan === 'number' && colSpan > 1 ? { colSpan } : {}),
          }
        })
        rows.push({ variant, ...(alignTop ? { alignTop: true } : {}), cells: built })
      }
    }

    for (const child of elementChildren(propsOf(element).children as ReactNode)) {
      if (child.type === 'table') {
        visitRows(propsOf(child).children as ReactNode)
        continue
      }
      if (child.type === 'p' && is(classOf(child), GRID_NOTE)) {
        notes.push(inline(propsOf(child).children as ReactNode))
        continue
      }
      warn(`unmapped grid-table child <${String(child.type)}> class "${classOf(child)}"`)
    }

    return {
      _type: 'appendixGridTable',
      _key: key(),
      headers,
      rows,
      ...(notes.length > 0 ? { notes } : {}),
      ...revealOf(element),
    }
  }

  // ── components ─────────────────────────────────────────────────────────────

  /**
   * A local presentational component is never recognised by its name, only by
   * the markup it renders. Several appendices define a component called
   * `MathTable` or `DataTable`, and those components do not agree: appendix 1's
   * draws semibold headers and top-aligned cells where appendix 24's draws
   * medium headers and nowrap monospace ones. Trusting the name once made 31 of
   * appendix 1's tables render with appendix 24's recipe, and produced no
   * warning while doing it.
   */
  function componentBlocks(element: ReactElement): AppendixBlock[] {
    const name = nameOf(element.type)
    const props = propsOf(element)

    if (name === 'YouTubeEmbed') {
      const videoId = typeof props.videoId === 'string' ? props.videoId : ''
      if (!videoId) return []
      embeds.push({ videoId, videoTitle: text(props.title as ReactNode) })
      // The video rides alongside the body as payload metadata and is drawn by
      // AppendixVideo, exactly as on the markdown path.
      return []
    }

    if (name === 'AppendixLink' || name === 'QuranRef' || name === 'ScriptureRef') {
      // Inline constructs never reach block position in this corpus, but if one
      // does it belongs in a paragraph rather than being dropped.
      return paragraph(element, 'normal')
    }

    if (name === 'Image') {
      warn('an image was found outside a figure card')
      return []
    }

    // Everything else is a local presentational wrapper: render it and keep
    // walking, so the card it draws is recognised by its class like any other.
    return blocks(render(element))
  }

  return { blocks: blocks(root), embeds, warnings }
}
