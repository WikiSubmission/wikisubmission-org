/**
 * Round-trip converter between Portable Text blocks and a markdown-ish plain
 * string used by the block editor's textareas.
 *
 * Serialization wraps each span's text with inline markers (**strong**, *em*,
 * __underline__, ~~strike~~, `code`, [label](href)) and escapes literal marker
 * characters, so parse(serialize(block)) preserves content exactly. Only text
 * content and inline marks are affected; block-level attributes (style,
 * listItem, level, keys) are managed by the editor around these helpers.
 */

export interface PTSpan {
  _type: 'span'
  _key?: string
  text: string
  marks?: string[]
}

export interface PTMarkDef {
  _key: string
  _type: string
  href?: string
  blank?: boolean
}

export interface PTBlock {
  _type: 'block'
  _key?: string
  style?: string
  children?: PTSpan[]
  markDefs?: PTMarkDef[]
  listItem?: string
  level?: number
  [key: string]: unknown
}

/** Random 12-hex key, matching Sanity's `_key` conventions. */
export function randomKey(): string {
  let out = ''
  for (let i = 0; i < 12; i++) {
    out += Math.floor(Math.random() * 16).toString(16)
  }
  return out
}

const ESCAPABLE = /[\\*_~`[\]]/g

function escapeText(text: string): string {
  return text.replace(ESCAPABLE, (ch) => '\\' + ch)
}

// Decorator marks, serialized inside-out in a canonical order so the output
// is stable regardless of the marks array order.
const DECORATORS: Array<{ mark: string; token: string }> = [
  { mark: 'code', token: '`' },
  { mark: 'strike-through', token: '~~' },
  { mark: 'underline', token: '__' },
  { mark: 'em', token: '*' },
  { mark: 'strong', token: '**' },
]

/** Serializes one text block's children into the editable string. */
export function serializeBlockText(block: PTBlock): string {
  const defs = new Map((block.markDefs ?? []).map((d) => [d._key, d]))
  let out = ''
  for (const child of block.children ?? []) {
    if (child._type !== 'span') continue
    let piece = escapeText(child.text ?? '')
    const marks = child.marks ?? []
    for (const { mark, token } of DECORATORS) {
      if (marks.includes(mark)) piece = token + piece + token
    }
    // Link annotations wrap outermost. Multiple links on one span cannot occur
    // in practice; take the first annotation mark that resolves to a link def.
    const linkKey = marks.find((m) => defs.get(m)?._type === 'link')
    if (linkKey) {
      const def = defs.get(linkKey)!
      piece = `[${piece}](${def.href ?? ''}${def.blank ? ' +blank' : ''})`
    }
    out += piece
  }
  return out
}

interface ParseState {
  spans: PTSpan[]
  markDefs: PTMarkDef[]
}

/**
 * Parses the editable string back into span children + link mark defs.
 * Understands the exact grammar emitted by serializeBlockText plus reasonable
 * hand-typed input; unmatched markers are treated as literal text.
 */
export function parseBlockText(text: string): { children: PTSpan[]; markDefs: PTMarkDef[] } {
  const state: ParseState = { spans: [], markDefs: [] }
  parseSegment(text, [], state)
  if (state.spans.length === 0) {
    state.spans.push({ _type: 'span', _key: randomKey(), text: '', marks: [] })
  }
  return { children: state.spans, markDefs: state.markDefs }
}

function pushSpan(state: ParseState, text: string, marks: string[]) {
  if (text === '') return
  const last = state.spans[state.spans.length - 1]
  if (last && sameMarks(last.marks ?? [], marks)) {
    last.text += text
    return
  }
  state.spans.push({ _type: 'span', _key: randomKey(), text, marks: [...marks] })
}

function sameMarks(a: string[], b: string[]): boolean {
  return a.length === b.length && a.every((m, i) => m === b[i])
}

// Tokens ordered longest-first so *** wins over ** wins over *. The ***
// compound resolves the classic markdown ambiguity of strong+em stacking.
const TOKENS: Array<{ token: string; marks: string[] }> = [
  { token: '***', marks: ['strong', 'em'] },
  { token: '**', marks: ['strong'] },
  { token: '__', marks: ['underline'] },
  { token: '~~', marks: ['strike-through'] },
  { token: '*', marks: ['em'] },
  { token: '`', marks: ['code'] },
]

function parseSegment(text: string, marks: string[], state: ParseState) {
  let literal = ''
  let i = 0

  const flush = () => {
    pushSpan(state, literal, marks)
    literal = ''
  }

  outer: while (i < text.length) {
    const ch = text[i]

    if (ch === '\\' && i + 1 < text.length) {
      literal += text[i + 1]
      i += 2
      continue
    }

    // Link: [label](href) or [label](href +blank)
    if (ch === '[') {
      const link = matchLink(text, i)
      if (link) {
        flush()
        const def: PTMarkDef = { _key: randomKey(), _type: 'link', href: link.href }
        if (link.blank) def.blank = true
        state.markDefs.push(def)
        parseSegment(link.label, [...marks, def._key], state)
        i = link.end
        continue
      }
    }

    for (const { token, marks: tokenMarks } of TOKENS) {
      if (!text.startsWith(token, i)) continue
      if (tokenMarks.some((m) => marks.includes(m))) continue
      const close = findClosing(text, i + token.length, token)
      if (close === -1) continue
      flush()
      parseSegment(text.slice(i + token.length, close), [...marks, ...tokenMarks], state)
      i = close + token.length
      continue outer
    }

    literal += ch
    i++
  }
  flush()
}

/** Finds the matching closing token, skipping escaped characters. */
function findClosing(text: string, from: number, token: string): number {
  let i = from
  while (i < text.length) {
    if (text[i] === '\\') {
      i += 2
      continue
    }
    if (text.startsWith(token, i)) {
      // A closing token must not open an empty pair (e.g. "****").
      if (i === from) return -1
      return i
    }
    i++
  }
  return -1
}

function matchLink(
  text: string,
  from: number,
): { label: string; href: string; blank: boolean; end: number } | null {
  let i = from + 1
  let label = ''
  while (i < text.length && text[i] !== ']') {
    if (text[i] === '\\' && i + 1 < text.length) {
      label += text[i] + text[i + 1]
      i += 2
      continue
    }
    label += text[i]
    i++
  }
  if (i >= text.length || text[i + 1] !== '(') return null
  let j = i + 2
  let href = ''
  while (j < text.length && text[j] !== ')') {
    href += text[j]
    j++
  }
  if (j >= text.length) return null
  let blank = false
  if (href.endsWith(' +blank')) {
    blank = true
    href = href.slice(0, -' +blank'.length)
  }
  return { label, href: href.trim(), blank, end: j + 1 }
}

/** Builds a fresh text block from an editable string plus block-level attrs. */
export function makeTextBlock(
  text: string,
  attrs: { style?: string; listItem?: string; level?: number; key?: string },
): PTBlock {
  const { children, markDefs } = parseBlockText(text)
  const block: PTBlock = {
    _type: 'block',
    _key: attrs.key ?? randomKey(),
    style: attrs.style ?? 'normal',
    children,
    markDefs,
  }
  if (attrs.listItem) {
    block.listItem = attrs.listItem
    block.level = attrs.level ?? 1
  }
  return block
}

/** Plain-text preview of any PT array (for list rows and teasers). */
export function ptPreview(blocks: unknown, maxLength = 160): string {
  if (!Array.isArray(blocks)) return ''
  let out = ''
  for (const raw of blocks) {
    const block = raw as PTBlock
    if (block?._type !== 'block' || !Array.isArray(block.children)) continue
    for (const child of block.children) {
      if (child?._type === 'span' && typeof child.text === 'string') out += child.text
    }
    out += ' '
    if (out.length >= maxLength) break
  }
  out = out.trim()
  return out.length > maxLength ? out.slice(0, maxLength - 1) + '…' : out
}
