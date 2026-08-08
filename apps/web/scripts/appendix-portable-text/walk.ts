/**
 * Walks a rendered appendix's React element tree and emits Portable Text.
 *
 * Adapted from the markdown walk in ../appendix-markdown/walk.ts, and for the
 * same reason: the appendix TSX builds its tables from structured props
 * (`MathTable` takes `headers`/`rows`/`totals`) and its embeds carry a
 * `videoId`, so reading props off the elements keeps structure that an HTML
 * round-trip would already have flattened into divs.
 *
 * The difference is what it emits. Markdown has one container, the blockquote,
 * so five distinct card meanings collapsed into it and the totals rows of 42
 * tables became ordinary data rows. Portable Text blocks carry `tone`,
 * `divided`, `caption` and `totals` as typed fields instead.
 *
 * This walk is deliberately strict. Cards are recognised by their exact class
 * string against a closed table, and anything unrecognised produces a warning
 * naming the class rather than a best-effort guess, because a silent
 * approximation is exactly the failure mode this conversion exists to fix.
 */
import { isValidElement, type ReactElement, type ReactNode } from 'react'

import type {
  AppendixBlock,
  AppendixCalloutParagraph,
  AppendixCalloutStyle,
  AppendixGap,
  AppendixGridRow,
  AppendixInlineChild,
  AppendixLinkMarkDef,
  AppendixMathCell,
  AppendixRichText,
  AppendixTone,
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

/** Element children only, with whitespace-only text dropped. */
function elementChildren(node: ReactNode): ReactElement[] {
  return childArray(node).filter(
    (child) => isValidElement(child) && !isFragment(child as ReactElement),
  ) as ReactElement[]
}

// ── the closed class tables ──────────────────────────────────────────────────

type CardSpec =
  | { kind: 'verseCards'; align: 'start' | 'center'; size: 'sm' | 'base'; gap: AppendixGap; divided: boolean }
  | { kind: 'callout'; tone: AppendixTone; style: AppendixCalloutStyle }
  | { kind: 'gridTable' }
  | { kind: 'figure'; frame: 'full' | 'sm' }

/**
 * Every card class string that occurs in the corpus, mapped to the typed block
 * it becomes. Matching on the exact string is what makes the conversion
 * verifiable: a card the corpus grows that is not in this table is reported,
 * never approximated.
 */
const CARD_CLASSES: Record<string, CardSpec> = {
  'rounded-xl border border-primary/20 bg-primary/5 p-6 space-y-4': {
    kind: 'verseCards', align: 'start', size: 'sm', gap: 'md', divided: true,
  },
  'rounded-xl border border-primary/20 bg-primary/5 p-6 space-y-5': {
    kind: 'verseCards', align: 'start', size: 'sm', gap: 'lg', divided: true,
  },
  'rounded-xl border border-primary/20 bg-primary/5 p-6 text-center space-y-2': {
    kind: 'verseCards', align: 'center', size: 'base', gap: 'xs', divided: false,
  },
  'rounded-xl border border-destructive/20 bg-destructive/5 p-5 space-y-2 text-sm': {
    kind: 'callout', tone: 'destructive', style: 'statement',
  },
  'rounded-xl border border-primary/20 bg-primary/5 p-5 space-y-2 text-sm text-foreground/85': {
    kind: 'callout', tone: 'primary', style: 'summary',
  },
  'rounded-xl border border-border/60 p-5 text-sm italic text-foreground/75 leading-relaxed': {
    kind: 'callout', tone: 'neutral', style: 'aside',
  },
  'rounded-xl border border-primary/20 bg-primary/5 p-5 space-y-4 text-sm italic text-foreground/80': {
    kind: 'callout', tone: 'primary', style: 'quotation',
  },
  'rounded-xl border border-border/60 p-5 text-sm italic text-foreground/80 leading-relaxed': {
    kind: 'callout', tone: 'neutral', style: 'source',
  },
  'rounded-xl border border-primary/20 bg-primary/5 p-5 space-y-2 text-sm text-center font-mono': {
    kind: 'callout', tone: 'primary', style: 'arithmetic',
  },
  'rounded-xl border border-border/60 bg-muted/20 px-5 py-4 text-sm leading-relaxed text-foreground/80': {
    kind: 'callout', tone: 'muted', style: 'remark',
  },
  'rounded-xl border border-border/60 bg-muted/20 px-5 py-4 space-y-2': {
    kind: 'callout', tone: 'muted', style: 'result',
  },
  'rounded-xl border border-primary/20 bg-primary/5 p-5 space-y-3 text-sm overflow-x-auto': {
    kind: 'gridTable',
  },
  'space-y-3': { kind: 'figure', frame: 'full' },
  'rounded-lg border border-border/30 overflow-hidden bg-muted/20 max-w-sm mx-auto': {
    kind: 'figure', frame: 'sm',
  },
}

/** Class of the frame a figure's image sits in. */
const FIGURE_FRAME = 'rounded-lg border border-border/30 overflow-hidden bg-muted/20'

/** Paragraph classes inside a card, mapped to the typed emphasis they become. */
const PARAGRAPH_CLASSES: Record<string, { emphasis?: AppendixCalloutParagraph['emphasis']; spaced?: boolean }> = {
  '': {},
  'font-bold text-base': { emphasis: 'result' },
  'font-bold text-base pt-2': { emphasis: 'result', spaced: true },
  'font-mono text-sm text-primary break-words': { emphasis: 'mono' },
  'text-xs text-muted-foreground leading-relaxed': { emphasis: 'caption' },
  'italic text-foreground/80 leading-relaxed': { emphasis: 'passage' },
}

/** The eyebrow label of a card, per tone. */
const LABEL_CLASSES = new Set([
  'font-semibold text-destructive/80 uppercase tracking-widest text-xs',
  'font-semibold text-primary/80 uppercase tracking-widest text-xs',
])

/** The trailing monospace attribution of a card. */
const FOOTNOTE_CLASSES: Record<string, boolean> = {
  'text-xs not-italic text-muted-foreground font-mono': false,
  'text-xs not-italic text-muted-foreground font-mono mt-2': true,
}

/** A scripture quotation's body paragraph, and the size it implies. */
const VERSE_BODY_CLASSES: Record<string, 'sm' | 'base'> = {
  'text-sm leading-relaxed italic text-foreground/90': 'sm',
  'text-base leading-relaxed italic text-foreground/90': 'base',
}

/** A scripture quotation's reference paragraph. */
const VERSE_REF_CLASSES = new Set([
  'text-xs text-muted-foreground font-mono',
  'text-xs text-muted-foreground font-mono mt-1',
])

/** `<section>` classes, mapped to the rhythm they carry. */
const SECTION_CLASSES: Record<string, { gap: AppendixGap; prose: boolean }> = {
  'space-y-5 text-base leading-relaxed text-foreground/90': { gap: 'lg', prose: true },
  'space-y-4 text-base leading-relaxed text-foreground/90': { gap: 'md', prose: true },
  'space-y-4 text-sm leading-relaxed text-foreground/90': { gap: 'md', prose: true },
  'space-y-6': { gap: 'xl', prose: false },
  'space-y-3': { gap: 'sm', prose: false },
}

/** The interlude paragraph that sits unattached between evidence items. */
const INTERLUDE_CLASS = 'text-sm leading-relaxed text-foreground/85 italic pl-10'

/** Badge span classes inside a numbered list, mapped to tone and density. */
const BADGE_CLASSES: Record<string, { tone: AppendixTone; density: 'compact' | 'comfortable' }> = {
  'shrink-0 flex items-center justify-center size-7 rounded-md bg-destructive/10 text-destructive font-mono text-xs font-semibold mt-0.5': {
    tone: 'destructive', density: 'comfortable',
  },
  'shrink-0 flex items-center justify-center size-7 rounded-md bg-primary/10 text-primary font-mono text-xs font-semibold mt-0.5': {
    tone: 'primary', density: 'comfortable',
  },
  'shrink-0 flex items-center justify-center size-6 rounded-md bg-primary/10 text-primary font-mono text-xs font-semibold': {
    tone: 'primary', density: 'compact',
  },
}

const GRID_CELL_CLASS = 'border border-border/40 px-3 py-2 text-left'
const GRID_NOTE_CLASS = 'text-xs text-muted-foreground'

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

  // ── inline ─────────────────────────────────────────────────────────────────

  /** Collects a node's inline content into spans, refs and link annotations. */
  function inline(node: ReactNode): AppendixRichText {
    const children: AppendixInlineChild[] = []
    const markDefs: AppendixLinkMarkDef[] = []

    const push = (text: string, marks: string[]) => {
      if (text === '') return
      const last = children[children.length - 1]
      if (
        last &&
        last._type === 'span' &&
        (last.marks ?? []).join(' ') === marks.join(' ')
      ) {
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
            return push(' ', marks)
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

  /** The verse key of a `<QuranRef>` sitting alone in a paragraph. */
  function soleReference(node: ReactNode): string | undefined {
    const rich = inline(node)
    const refs = rich.children.filter((child) => child._type === 'quranRef')
    const rest = rich.children.filter(
      (child) => child._type === 'span' && child.text.trim() !== '',
    )
    if (refs.length === 1 && rest.length === 0) {
      return (refs[0] as { reference: string }).reference
    }
    return undefined
  }

  // ── blocks ─────────────────────────────────────────────────────────────────

  function blocks(node: ReactNode): AppendixBlock[] {
    const out: AppendixBlock[] = []
    for (const child of childArray(node)) {
      if (child === null || child === undefined || typeof child === 'boolean') continue
      if (typeof child === 'string' && child.trim() === '') continue
      if (typeof child === 'string' || typeof child === 'number') {
        // Bare text at block level: the acknowledgement card and a couple of
        // remark cards write their prose without a wrapping <p>.
        out.push({ _type: 'block', _key: key(), style: 'normal', ...inline(child) })
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

  function paragraph(node: ReactNode): AppendixBlock[] {
    const rich = inline(node)
    if (isEmpty(rich)) return []
    return [{ _type: 'block', _key: key(), style: 'normal', ...rich }]
  }

  function hostBlocks(element: ReactElement): AppendixBlock[] {
    const tag = element.type as string
    const props = propsOf(element)
    const children = props.children as ReactNode
    const className = classOf(element)

    switch (tag) {
      case 'p':
        if (className === INTERLUDE_CLASS) {
          return [{ _type: 'appendixInterlude', _key: key(), text: inline(children) }]
        }
        if (className !== '') {
          warn(`unmapped paragraph class "${className}"`)
        }
        return paragraph(children)

      case 'section': {
        // The video sits in its own section under a "Video" heading. The embed
        // is lifted into payload metadata and AppendixVideo draws its own
        // heading, so the whole section goes with it.
        if (hasEmbed(children)) {
          collectEmbeds(children)
          return []
        }
        const spec = SECTION_CLASSES[className]
        if (!spec) {
          warn(`unmapped section class "${className}"`)
          return blocks(children)
        }
        const content = blocks(children)
        if (content.length === 0) return []
        // A prose section of nothing but paragraphs, and an evidence section of
        // nothing but evidence, are the shapes the renderer regroups on its own,
        // so they stay flat and stay editable as ordinary Portable Text.
        if (
          spec.gap === 'lg' &&
          spec.prose &&
          content.every((block) => block._type === 'block')
        ) {
          return content
        }
        if (
          spec.gap === 'xl' &&
          !spec.prose &&
          content.every(
            (block) =>
              block._type === 'appendixEvidence' || block._type === 'appendixInterlude',
          )
        ) {
          return content
        }
        return [{ _type: 'appendixSection', _key: key(), gap: spec.gap, prose: spec.prose, content }]
      }

      case 'div':
        return divBlocks(element)

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

  /** `<hr/> title <hr/>` written inline rather than through a component. */
  function dividerBlocks(element: ReactElement): AppendixBlock[] | null {
    const kids = elementChildren(propsOf(element).children as ReactNode)
    const rules = kids.filter((child) => child.type === 'hr')
    const heading = kids.find((child) => child.type === 'h2')
    if (rules.length !== 2 || !heading) return null
    return [
      {
        _type: 'appendixDivider',
        _key: key(),
        title: inline(propsOf(heading).children as ReactNode),
      },
    ]
  }

  function divBlocks(element: ReactElement): AppendixBlock[] {
    const props = propsOf(element)
    const children = props.children as ReactNode
    const className = classOf(element)

    if (className === 'flex items-center gap-4') {
      const divider = dividerBlocks(element)
      if (divider) return divider
    }

    const spec = CARD_CLASSES[className]
    if (!spec) {
      warn(`unmapped card class "${className}"`)
      return blocks(children)
    }

    switch (spec.kind) {
      case 'verseCards':
        return [
          {
            _type: 'appendixVerseCards',
            _key: key(),
            align: spec.align,
            size: spec.size,
            gap: spec.gap,
            divided: spec.divided,
            entries: verseEntries(children),
          },
        ]
      case 'callout':
        return [calloutBlock(spec.tone, spec.style, children)]
      case 'gridTable':
        return [gridTableBlock(children)]
      case 'figure':
        return figureBlocks(spec.frame, children)
    }
  }

  // ── scripture cards ────────────────────────────────────────────────────────

  function verseEntries(children: ReactNode): AppendixVerseEntry[] {
    const entries: AppendixVerseEntry[] = []
    const consume = (nodes: ReactElement[]) => {
      for (let i = 0; i < nodes.length; i += 1) {
        const node = nodes[i]
        const cls = classOf(node)
        if (node.type === 'p' && VERSE_BODY_CLASSES[cls]) {
          const entry: AppendixVerseEntry = { body: inline(propsOf(node).children as ReactNode) }
          const next = nodes[i + 1]
          if (next && next.type === 'p' && VERSE_REF_CLASSES.has(classOf(next))) {
            entry.reference = soleReference(propsOf(next).children as ReactNode)
            i += 1
          }
          entries.push(entry)
          continue
        }
        if (node.type === 'div') {
          // A divided stack wraps each quotation so the rule has something to
          // hang on; the wrapper carries no meaning of its own.
          consume(elementChildren(propsOf(node).children as ReactNode))
          continue
        }
        warn(`unmapped scripture-card child <${String(node.type)}> class "${cls}"`)
      }
    }
    consume(elementChildren(children))
    return entries
  }

  // ── callouts ───────────────────────────────────────────────────────────────

  function calloutBlock(
    tone: AppendixTone,
    style: AppendixCalloutStyle,
    children: ReactNode,
  ): AppendixBlock {
    let label: AppendixRichText | undefined
    let footnote: AppendixRichText | undefined
    let footnoteSpaced = false
    const paragraphs: AppendixCalloutParagraph[] = []

    for (const child of childArray(children)) {
      if (typeof child === 'string') {
        if (child.trim() === '') continue
        paragraphs.push(inline(child))
        continue
      }
      if (typeof child === 'number') {
        paragraphs.push(inline(String(child)))
        continue
      }
      if (!isValidElement(child)) continue
      const element = child as ReactElement
      const cls = classOf(element)

      if (element.type !== 'p') {
        warn(`unmapped callout child <${String(element.type)}> class "${cls}"`)
        continue
      }
      if (LABEL_CLASSES.has(cls)) {
        label = inline(propsOf(element).children as ReactNode)
        continue
      }
      if (cls in FOOTNOTE_CLASSES) {
        footnote = inline(propsOf(element).children as ReactNode)
        footnoteSpaced = FOOTNOTE_CLASSES[cls]
        continue
      }
      const emphasis = PARAGRAPH_CLASSES[cls]
      if (!emphasis) {
        warn(`unmapped callout paragraph class "${cls}"`)
        paragraphs.push(inline(propsOf(element).children as ReactNode))
        continue
      }
      paragraphs.push({
        ...inline(propsOf(element).children as ReactNode),
        ...(emphasis.emphasis ? { emphasis: emphasis.emphasis } : {}),
        ...(emphasis.spaced ? { spaced: true } : {}),
      })
    }

    return {
      _type: 'appendixCallout',
      _key: key(),
      tone,
      style,
      ...(label ? { label } : {}),
      paragraphs,
      ...(footnote ? { footnote } : {}),
      ...(footnoteSpaced ? { footnoteSpaced: true } : {}),
    }
  }

  // ── figures ────────────────────────────────────────────────────────────────

  function imageProps(node: ReactNode): ReactElement | null {
    for (const child of childArray(node)) {
      if (!isValidElement(child)) continue
      const element = child as ReactElement
      if (nameOf(element.type) === 'Image' || element.type === 'img') return element
      const nested = imageProps(propsOf(element).children as ReactNode)
      if (nested) return nested
    }
    return null
  }

  function figureBlocks(frame: 'full' | 'sm', children: ReactNode): AppendixBlock[] {
    const kids = elementChildren(children)
    // A `sm` figure is the frame itself, so its image sits directly inside;
    // a `full` figure wraps the frame in a card alongside its caption.
    const frameNode =
      frame === 'sm' ? null : kids.find((child) => classOf(child) === FIGURE_FRAME)
    if (frame === 'full' && !frameNode) {
      warn('a figure card had no framed image')
      return blocks(children)
    }

    const image = imageProps(
      frameNode ? (propsOf(frameNode).children as ReactNode) : children,
    )
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
    }

    if (frame === 'sm') return [block]

    let caption: AppendixRichText | undefined
    let source: { body: AppendixRichText; footnote?: AppendixRichText } | undefined

    for (const child of kids) {
      if (child === frameNode) continue
      const cls = classOf(child)
      if (child.type === 'p' && cls === 'text-xs text-muted-foreground leading-relaxed') {
        caption = inline(propsOf(child).children as ReactNode)
        continue
      }
      if (CARD_CLASSES[cls]?.kind === 'callout') {
        const callout = calloutBlock('neutral', 'source', propsOf(child).children as ReactNode)
        if (callout._type !== 'appendixCallout') continue
        source = {
          body: { children: callout.paragraphs.flatMap((p) => p.children) },
          ...(callout.footnote ? { footnote: callout.footnote } : {}),
        }
        continue
      }
      warn(`unmapped figure child <${String(child.type)}> class "${cls}"`)
    }

    return [
      {
        ...block,
        ...(caption ? { caption } : {}),
        ...(source ? { source } : {}),
      },
    ]
  }

  // ── badge lists ────────────────────────────────────────────────────────────

  function listBlocks(element: ReactElement, ordered: boolean): AppendixBlock[] {
    const items = elementChildren(propsOf(element).children as ReactNode).filter(
      (child) => child.type === 'li',
    )
    if (items.length === 0) {
      warn(`an empty list was dropped (class "${classOf(element)}")`)
      return []
    }

    let tone: AppendixTone = 'primary'
    let density: 'compact' | 'comfortable' = 'comfortable'
    const contents: AppendixRichText[] = []

    for (const item of items) {
      const kids = elementChildren(propsOf(item).children as ReactNode)
      const badge = kids.find((child) => child.type === 'span' && BADGE_CLASSES[classOf(child)])
      if (badge) {
        const spec = BADGE_CLASSES[classOf(badge)]
        tone = spec.tone
        density = spec.density
      } else {
        warn(`a list item had no recognised badge (class "${classOf(item)}")`)
      }
      const body = kids.filter((child) => child !== badge)
      contents.push(inline(body.map((child) => propsOf(child).children as ReactNode)))
    }

    return [
      { _type: 'appendixBadgeList', _key: key(), tone, ordered, density, items: contents },
    ]
  }

  // ── grid tables ────────────────────────────────────────────────────────────

  function gridTableBlock(children: ReactNode): AppendixBlock {
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
        if (cells.every((cell) => cell.type === 'th')) {
          for (const cell of cells) {
            const cls = classOf(cell)
            if (cls !== GRID_CELL_CLASS) warn(`unmapped grid header class "${cls}"`)
            headers.push(inline(propsOf(cell).children as ReactNode))
          }
          continue
        }
        const rowClass = classOf(child)
        const variant: AppendixGridRow['variant'] =
          rowClass === 'font-semibold'
            ? 'total'
            : cells.some((cell) => classOf(cell) === `${GRID_CELL_CLASS} font-semibold`)
              ? 'group'
              : 'data'
        if (rowClass !== '' && rowClass !== 'font-semibold') {
          warn(`unmapped grid row class "${rowClass}"`)
        }
        let alignTop = false
        const built = cells.map((cell) => {
          const cls = classOf(cell)
          if (cls === `${GRID_CELL_CLASS} align-top`) alignTop = true
          else if (cls !== GRID_CELL_CLASS && cls !== `${GRID_CELL_CLASS} font-semibold`) {
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

    for (const child of elementChildren(children)) {
      if (child.type === 'table') {
        visitRows(propsOf(child).children as ReactNode)
        continue
      }
      if (child.type === 'p' && classOf(child) === GRID_NOTE_CLASS) {
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
    }
  }

  // ── components ─────────────────────────────────────────────────────────────

  function mathCells(value: unknown): AppendixMathCell[][] {
    if (!Array.isArray(value)) return []
    return value.map((row) =>
      (Array.isArray(row) ? row : [row]).map((cell) =>
        typeof cell === 'number' ? cell : text(cell as ReactNode),
      ),
    )
  }

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

    if (name === 'SectionDivider' || name === 'Divider') {
      return [
        {
          _type: 'appendixDivider',
          _key: key(),
          title: inline((props.title ?? props.children) as ReactNode),
        },
      ]
    }

    if (name === 'EvidenceItem') {
      return [
        {
          _type: 'appendixEvidence',
          _key: key(),
          n: typeof props.n === 'number' ? props.n : 0,
          content: blocks(props.children as ReactNode),
        },
      ]
    }

    if (name === 'StatementBox') {
      return [{ _type: 'appendixStatement', _key: key(), text: inline(props.children as ReactNode) }]
    }

    if (name === 'MathTable' || name === 'DataTable') {
      const note = props.note === undefined ? undefined : inline(props.note as ReactNode)
      return [
        {
          _type: 'appendixMathTable',
          _key: key(),
          caption: text(props.caption as ReactNode),
          headers: (Array.isArray(props.headers) ? props.headers : []).map((h) =>
            text(h as ReactNode),
          ),
          rows: mathCells(props.rows),
          ...(Array.isArray(props.totals) && props.totals.length > 0
            ? { totals: mathCells(props.totals) }
            : {}),
          ...(note && !isEmpty(note) ? { note } : {}),
        },
      ]
    }

    if (name === 'AppendixLink' || name === 'QuranRef' || name === 'ScriptureRef') {
      // Inline constructs never reach block position in this corpus, but if one
      // does it belongs in a paragraph rather than being dropped.
      return paragraph(element)
    }

    if (name === 'Image') {
      warn('an image was found outside a figure card')
      return []
    }

    return blocks(render(element))
  }

  return { blocks: blocks(root), embeds, warnings }
}
