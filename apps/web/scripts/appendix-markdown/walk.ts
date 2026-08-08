/**
 * Walks a rendered appendix's React element tree and emits markdown.
 *
 * Why the element tree and not HTML: the appendix TSX builds its tables from
 * structured props (`MathTable`/`DataTable` take `headers` + `rows`), and the
 * embeds carry a `videoId`. Reading those props directly keeps the structure
 * that an HTML round-trip would have already flattened into divs.
 *
 * Presentational components with no markdown equivalent (Prose, NoteBox,
 * EvidenceItem, …) are handled by name where a name buys a better mapping, and
 * otherwise invoked so the walk continues through whatever host elements they
 * produce. None of them use hooks, so calling them outside React is safe.
 */
import { isValidElement, type ReactElement, type ReactNode } from 'react'
import {
  blockquote,
  codeFence,
  collapse,
  escapeText,
  gfmTable,
  heading,
  listItem,
  tidyBlock,
} from './md'

/** How a YouTube embed, which markdown cannot express, is written out. */
export type EmbedMode = 'link' | 'shortcode' | 'drop'

export interface ConvertOptions {
  embeds: EmbedMode
}

/** An appendix's single trailing YouTube embed, lifted out as metadata. */
export interface EmbedRef {
  videoId: string
  videoTitle: string
}

export interface ConvertResult {
  markdown: string
  /**
   * Every YouTube embed found, in document order. An appendix carries at most
   * one, so callers take the first; more than one means the corpus changed and
   * the metadata model no longer holds.
   */
  embeds: EmbedRef[]
  /** Everything the conversion could not carry over losslessly. */
  warnings: string[]
}

type Props = Record<string, unknown>

const FRAGMENT: unknown = Symbol.for('react.fragment')

/** `<>…</>`: transparent, so its children fold into the surrounding flow. */
function isFragment(element: ReactElement): boolean {
  return (element.type as unknown) === FRAGMENT
}

/** Tags whose content belongs in the surrounding paragraph, not its own block. */
const INLINE_TAGS = new Set([
  'span', 'em', 'i', 'strong', 'b', 'a', 'code', 'sup', 'sub', 'small', 'u', 'abbr', 'mark', 'br',
])

const HEADING_TAGS: Record<string, number> = { h1: 1, h2: 2, h3: 3, h4: 4, h5: 5, h6: 6 }

/** Components whose output is a fenced monospace block. */
const MONO_COMPONENTS = new Set(['MonoBlock', 'MathSeq'])

/** Components that render as a callout card. */
const CALLOUT_COMPONENTS = new Set(['NoteBox', 'Highlight', 'StatementBox'])

/** Components that are a horizontal rule wrapping a section title. */
const DIVIDER_COMPONENTS = new Set(['SectionDivider', 'Divider'])

/** Components that add styling only. */
const TRANSPARENT_COMPONENTS = new Set(['Prose'])

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

function propsOf(element: ReactElement): Props {
  return (element.props ?? {}) as Props
}

function childArray(node: ReactNode): ReactNode[] {
  if (node === null || node === undefined || node === false || node === true) return []
  return Array.isArray(node) ? node.flat(Infinity) as ReactNode[] : [node]
}

function str(value: unknown): string | undefined {
  return typeof value === 'string' ? value : undefined
}

export function convertTree(root: ReactNode, options: ConvertOptions): ConvertResult {
  const embeds: EmbedRef[] = []
  const warnings: string[] = []
  const warn = (message: string) => {
    if (!warnings.includes(message)) warnings.push(message)
  }

  /** Invokes a presentational component so the walk can continue into it. */
  function render(element: ReactElement): ReactNode {
    const type = element.type as
      | ((props: Props) => ReactNode)
      | { render?: (props: Props, ref: unknown) => ReactNode }
    try {
      if (typeof type === 'function') return type(propsOf(element))
      if (type && typeof type.render === 'function') return type.render(propsOf(element), null)
    } catch (error) {
      warn(
        `could not render <${nameOf(element.type) || 'anonymous'}>: ` +
          `${error instanceof Error ? error.message : String(error)}`,
      )
    }
    return propsOf(element).children as ReactNode
  }

  // ── inline ───────────────────────────────────────────────────────────────

  function inline(node: ReactNode, pre = false): string {
    if (node === null || node === undefined || typeof node === 'boolean') return ''
    if (typeof node === 'number') return String(node)
    if (typeof node === 'string') return pre ? node : escapeText(collapse(node))
    if (Array.isArray(node)) return node.map((child) => inline(child, pre)).join('')
    if (!isValidElement(node)) return ''

    const element = node as ReactElement
    const props = propsOf(element)
    const kids = () => inline(props.children as ReactNode, pre)

    if (typeof element.type === 'string') {
      switch (element.type) {
        case 'br':
          return pre ? '\n' : ' '
        case 'em':
        case 'i': {
          const body = kids().trim()
          return body ? `*${body}*` : ''
        }
        case 'strong':
        case 'b': {
          const body = kids().trim()
          return body ? `**${body}**` : ''
        }
        case 'code':
          return pre ? kids() : inlineCode(props.children as ReactNode)
        case 'a':
          return link(str(props.href), kids())
        case 'img':
          return image(str(props.src), str(props.alt))
        default:
          return kids()
      }
    }

    if (isFragment(element)) return kids()

    const name = nameOf(element.type)
    if (name === 'QuranRef' || name === 'ScriptureRef') {
      // Emitted unescaped so the renderer's bracket rule turns it back into a
      // QuranRef badge. This is the whole cross-reference migration path.
      const reference = str(props.reference)
      return reference ? `[${reference}]` : ''
    }
    if (name === 'AppendixLink') {
      const n = props.n
      return typeof n === 'number' ? `[Appendix ${n}](/appendices/${n})` : ''
    }
    if (typeof props.href === 'string') return link(props.href, kids())
    if (typeof props.src === 'string') return image(props.src, str(props.alt))

    return inline(render(element), pre)
  }

  function inlineCode(children: ReactNode): string {
    const raw = rawText(children)
    if (!raw.trim()) return ''
    const longest = (raw.match(/`+/g) ?? []).reduce((n, run) => Math.max(n, run.length), 0)
    const ticks = '`'.repeat(longest + 1)
    return `${ticks}${raw}${ticks}`
  }

  /** Text with no markdown escaping, for code spans and fences. */
  function rawText(node: ReactNode): string {
    if (node === null || node === undefined || typeof node === 'boolean') return ''
    if (typeof node === 'string') return node
    if (typeof node === 'number') return String(node)
    if (Array.isArray(node)) return node.map(rawText).join('')
    if (!isValidElement(node)) return ''
    const element = node as ReactElement
    if (element.type === 'br') return '\n'
    if (typeof element.type === 'string' || isFragment(element)) {
      return rawText(propsOf(element).children as ReactNode)
    }
    return rawText(render(element))
  }

  function link(href: string | undefined, label: string): string {
    const text = label.trim()
    if (!href) return text
    // Parentheses in a URL would close the markdown destination early.
    const safe = href.replace(/[()]/g, (c) => (c === '(' ? '%28' : '%29'))
    return text ? `[${text}](${safe})` : `<${safe}>`
  }

  function image(src: string | undefined, alt: string | undefined): string {
    if (!src) return ''
    return `![${escapeText(collapse(alt ?? ''))}](${src})`
  }

  // ── blocks ───────────────────────────────────────────────────────────────

  function blocksOf(node: ReactNode): string[] {
    const out: string[] = []
    let buffer = ''
    const flush = () => {
      const text = buffer.replace(/\s+/g, ' ').trim()
      if (text) out.push(text)
      buffer = ''
    }
    for (const child of childArray(node)) {
      const block = asBlocks(child)
      if (block === null) {
        buffer += inline(child)
        continue
      }
      flush()
      out.push(...block)
    }
    flush()
    return out
  }

  /** Returns markdown blocks, or null when the node belongs inline. */
  function asBlocks(node: ReactNode): string[] | null {
    if (node === null || node === undefined || typeof node === 'boolean') return []
    if (typeof node === 'string' || typeof node === 'number') return null
    if (Array.isArray(node)) return blocksOf(node)
    if (!isValidElement(node)) return []

    const element = node as ReactElement
    if (isFragment(element)) return blocksOf(propsOf(element).children as ReactNode)
    if (typeof element.type === 'string') return hostBlocks(element)
    return componentBlocks(element)
  }

  function hostBlocks(element: ReactElement): string[] | null {
    const tag = element.type as string
    const props = propsOf(element)
    const children = props.children as ReactNode

    if (INLINE_TAGS.has(tag)) return null
    if (tag === 'hr') return ['---']
    if (tag === 'img') {
      const md = image(str(props.src), str(props.alt))
      return md ? [md] : []
    }

    const level = HEADING_TAGS[tag]
    if (level !== undefined) {
      const text = inline(children).trim()
      return text ? [heading(level, text)] : []
    }

    switch (tag) {
      case 'p': {
        const text = inline(children).trim()
        return text ? [text] : []
      }
      case 'blockquote':
        return [blockquote(blocksOf(children))].filter(Boolean)
      case 'pre':
        return [codeFence(rawText(children))].filter(Boolean)
      case 'ul':
      case 'ol':
        return list(element, tag === 'ol')
      case 'li':
        // A stray <li>: emit its content so nothing is silently dropped.
        return blocksOf(children)
      case 'table':
        return tableBlocks(element)
      case 'thead':
      case 'tbody':
      case 'tfoot':
      case 'tr':
      case 'td':
      case 'th':
      case 'caption':
        return blocksOf(children)
      case 'svg':
      case 'button':
        return []
      default:
        return divBlocks(element)
    }
  }

  /** A block that is nothing but an ATX heading. */
  const isHeadingBlock = (block: string) => /^#{1,6} \S/.test(block) && !block.includes('\n')

  /** div / section / figure and friends: card, divider, mono block, or passthrough. */
  function divBlocks(element: ReactElement): string[] {
    const props = propsOf(element)
    const children = props.children as ReactNode
    const kids = childArray(children).filter((child) => isValidElement(child))

    // The video sits in its own `<section>` under a "Video" heading. When the
    // embed is lifted out into metadata, that heading would be left labelling
    // nothing, and the reader prints its own heading above the embed, so the
    // whole section goes with it.
    if (
      options.embeds === 'drop' &&
      kids.some((child) => nameOf((child as ReactElement).type) === 'YouTubeEmbed')
    ) {
      const blocks = blocksOf(children)
      if (blocks.every(isHeadingBlock)) return []
      return blocks
    }

    // SectionDivider / Divider shape: <hr /><h2>Title</h2><hr />
    const rule = kids.find((child) => (child as ReactElement).type === 'hr')
    const head = kids.find(
      (child) => HEADING_TAGS[(child as ReactElement).type as string] !== undefined,
    )
    if (rule && head) {
      const text = inline(propsOf(head as ReactElement).children as ReactNode).trim()
      return text ? [heading(2, text)] : []
    }

    // MonoBlock shape: a single <code> child rendered with whitespace-pre.
    if (kids.length === 1 && (kids[0] as ReactElement).type === 'code') {
      const fence = codeFence(rawText(propsOf(kids[0] as ReactElement).children as ReactNode))
      if (fence) return [fence]
    }

    if (props['data-card'] !== undefined) {
      const blocks = blocksOf(children)
      // A card that exists only to frame a table keeps the table at top level:
      // a blockquoted GFM table renders with a quote rule down its left edge,
      // which reads as a quotation rather than as a data table.
      if (blocks.some((block) => block.startsWith('|'))) return blocks
      warn('card styling (bordered/tinted callout) becomes a blockquote')
      return [blockquote(blocks)].filter(Boolean)
    }

    return blocksOf(children)
  }

  function list(element: ReactElement, ordered: boolean): string[] {
    const items = childArray(propsOf(element).children as ReactNode).filter(
      (child) => isValidElement(child) && (child as ReactElement).type === 'li',
    ) as ReactElement[]
    if (items.length === 0) return blocksOf(propsOf(element).children as ReactNode)

    const stripped = items.map((item) => stripCounter(propsOf(item).children as ReactNode))
    // A <ul> whose every item carries a numbered badge is a numbered list that
    // opted out of native markers for styling; markdown can number it properly.
    const numbered = ordered || stripped.every((item) => item.hadCounter)

    const rendered = stripped.map((item, i) =>
      listItem(numbered ? `${i + 1}. ` : '- ', blocksOf(item.children)),
    )
    return [rendered.filter(Boolean).join('\n')]
  }

  /**
   * The appendix lists number themselves with a styled badge span (the list is
   * `list-none`). Markdown renumbers, so the badge is dropped to avoid "1. 1".
   */
  function stripCounter(children: ReactNode): { children: ReactNode[]; hadCounter: boolean } {
    const kids = childArray(children)
    const first = kids.find((child) => child !== null && child !== undefined && child !== '')
    if (
      isValidElement(first) &&
      (first as ReactElement).type === 'span' &&
      /^\d+[.)]?$/.test(rawText(propsOf(first as ReactElement).children as ReactNode).trim())
    ) {
      return { children: kids.filter((child) => child !== first), hadCounter: true }
    }
    return { children: kids, hadCounter: false }
  }

  function tableBlocks(element: ReactElement): string[] {
    const rows: { cells: string[]; head: boolean }[] = []
    const visit = (node: ReactNode, inHead: boolean) => {
      for (const child of childArray(node)) {
        if (!isValidElement(child)) continue
        const el = child as ReactElement
        const tag = el.type
        const kids = propsOf(el).children as ReactNode
        if (tag === 'thead') visit(kids, true)
        else if (tag === 'tbody' || tag === 'tfoot') visit(kids, inHead)
        else if (tag === 'tr') {
          const cells = childArray(kids)
            .filter((c) => isValidElement(c))
            .map((c) => cellText(c as ReactElement))
          const head =
            inHead ||
            childArray(kids).some((c) => isValidElement(c) && (c as ReactElement).type === 'th')
          rows.push({ cells, head })
        } else if (tag === 'caption') {
          const text = inline(kids).trim()
          if (text) rows.unshift({ cells: [text], head: false })
        } else visit(kids, inHead)
      }
    }
    visit(propsOf(element).children as ReactNode, false)
    if (rows.length === 0) return []

    const headerIndex = rows.findIndex((row) => row.head)
    const header = headerIndex >= 0 ? rows[headerIndex].cells : []
    const body = rows.filter((_, i) => i !== headerIndex).map((row) => row.cells)
    if (headerIndex < 0) warn('a table had no header row; an empty header row was emitted')
    return [gfmTable(header, body)]
  }

  function cellText(cell: ReactElement): string {
    const props = propsOf(cell)
    const text = inline(props.children as ReactNode)
    if (/\n/.test(text)) warn('a multi-line table cell was flattened onto one line')
    if (typeof props.colSpan === 'number' && props.colSpan > 1) {
      // GFM has no colspan: the spanning cell keeps its text but the row is
      // padded out with empty cells instead of merging them.
      warn('a spanning table cell (colSpan) became one cell plus empty padding')
    }
    return text
  }

  // ── components ───────────────────────────────────────────────────────────

  function componentBlocks(element: ReactElement): string[] | null {
    const name = nameOf(element.type)
    const props = propsOf(element)

    if (name === 'QuranRef' || name === 'ScriptureRef' || name === 'AppendixLink') return null
    if (typeof props.href === 'string' && props.src === undefined) return null

    if (name === 'YouTubeEmbed') return embedBlocks(props)
    if (name === 'MathTable' || name === 'DataTable') return propTableBlocks(props)
    if (MONO_COMPONENTS.has(name)) {
      return [codeFence(rawText(props.children as ReactNode))].filter(Boolean)
    }
    if (DIVIDER_COMPONENTS.has(name)) {
      const text = inline((props.title ?? props.children) as ReactNode).trim()
      return text ? [heading(2, text)] : []
    }
    if (CALLOUT_COMPONENTS.has(name)) {
      warn(`<${name}> becomes a blockquote (its emphasis styling is lost)`)
      return [blockquote(blocksOf(props.children as ReactNode))].filter(Boolean)
    }
    if (name === 'VerseCard') {
      warn('<VerseCard> becomes a blockquote with the reference on its own line')
      const body = blocksOf(props.children as ReactNode)
      const reference = inline(props.reference as ReactNode).trim()
      return [blockquote(reference ? [...body, `— ${reference}`] : body)].filter(Boolean)
    }
    if (name === 'EvidenceItem') {
      // The numbered badge has no markdown equivalent; keep the number inline
      // so the cross-references in the surrounding prose still resolve.
      const body = blocksOf(props.children as ReactNode)
      const n = props.n
      if (typeof n === 'number' && body.length > 0) {
        warn('<EvidenceItem> numbering becomes a bold "[n]" prefix')
        return [`**[${n}]** ${body[0]}`, ...body.slice(1)]
      }
      return body
    }
    if (TRANSPARENT_COMPONENTS.has(name)) return blocksOf(props.children as ReactNode)
    if (typeof props.src === 'string') {
      const md = image(props.src, str(props.alt))
      return md ? [md] : []
    }

    return blocksOf(render(element))
  }

  function embedBlocks(props: Props): string[] {
    const videoId = str(props.videoId)
    if (!videoId) return []
    const title = collapse(str(props.title) ?? '').trim()
    // Recorded whatever the mode: the manifest is how the video reaches the
    // editorial payload once the body itself has stopped carrying it.
    embeds.push({ videoId, videoTitle: title })
    if (options.embeds === 'drop') {
      warn(`YouTube embed ${videoId} lifted out of the body into video metadata`)
      return []
    }
    if (options.embeds === 'shortcode') {
      warn(`YouTube embed ${videoId} written as a shortcode the renderer does not yet understand`)
      return [`:::youtube[${videoId}]${title ? ` ${title}` : ''}`]
    }
    warn(`YouTube embed ${videoId} became a plain link (the inline player is lost)`)
    const label = escapeText(title || 'Watch on YouTube')
    return [`[▶ ${label}](https://www.youtube.com/watch?v=${videoId})`]
  }

  function propTableBlocks(props: Props): string[] {
    const headers = Array.isArray(props.headers) ? (props.headers as ReactNode[]) : []
    const rows = Array.isArray(props.rows) ? (props.rows as ReactNode[][]) : []
    const totals = Array.isArray(props.totals) ? (props.totals as ReactNode[][]) : []
    const out: string[] = []

    const caption = inline(props.caption as ReactNode).trim()
    if (caption) out.push(`**${caption}**`)

    if (totals.length > 0) {
      warn('table total rows lose their emphasis styling (they become ordinary rows)')
    }
    out.push(
      gfmTable(
        headers.map((h) => inline(h)),
        [...rows, ...totals].map((row) => row.map((cell) => inline(cell))),
      ),
    )

    const note = inline(props.note as ReactNode).trim()
    if (note) out.push(note)
    return out
  }

  const markdown = blocksOf(root)
    .map(tidyBlock)
    .filter(Boolean)
    .join('\n\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()

  return { markdown: `${markdown}\n`, embeds, warnings }
}
