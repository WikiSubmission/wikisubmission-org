/**
 * Pure helpers for editing an appendix `body_pt` value — the Portable Text
 * block array produced by the TSX conversion. Kept free of React and of any
 * @portabletext/editor import so the structural rules are unit-testable.
 *
 * Two rules drive every function here, the same two that drive pt-table.ts:
 *
 * 1. Nothing is ever dropped. Every returned value is a shallow copy of the
 *    input with only the touched field replaced, so unknown fields on a block,
 *    a row, an entry or a column survive an edit. Untouched nodes keep their
 *    identity — the same object reference and the same `_key`. That matters
 *    more here than usual: these blocks carry typed presentation fields the
 *    editing surface deliberately does not expose, and a rewrite that dropped
 *    them would undo the conversion this migration exists for.
 * 2. Rich text round-trips through a marker string. A run of inline content
 *    becomes an editable one-line syntax and parses back into the same spans,
 *    scripture badges and appendix cross-references. Anything the grammar
 *    cannot express is left alone rather than flattened.
 */
import type {
  AppendixBlock,
  AppendixInlineChild,
  AppendixLinkMarkDef,
  AppendixRichText,
} from '@/lib/appendix-portable-text'

import { randomKey } from './pt-text'

// ── tolerant accessors ───────────────────────────────────────────────────────

/**
 * The stored value is JSON this app does not re-validate block by block, so a
 * hand-edited or half-migrated body must not crash the whole editor.
 */
export function appendixBlocks(value: unknown): AppendixBlock[] {
  return Array.isArray(value) ? (value as AppendixBlock[]) : []
}

export function isBlock(value: unknown): value is AppendixBlock {
  return typeof value === 'object' && value !== null && typeof (value as AppendixBlock)._type === 'string'
}

// ── rich text round trip ─────────────────────────────────────────────────────

/**
 * The marker grammar, chosen to stay readable in a one-line input:
 *
 *   **bold**  *italic*  `code`  __mono__  ++term++
 *   [label](href)          link annotation
 *   {{9:128}}              scripture badge (quranRef)
 *   {{A24}}                cross-reference to appendix 24
 *
 * `\n` is a hard break and is written as a literal newline, which is why the
 * fields that hold rich text are textareas rather than inputs.
 */
/** Serialization order: innermost first, so `strong` ends up outermost. */
const DECORATOR_TOKENS: Array<{ mark: string; token: string }> = [
  { mark: 'code', token: '`' },
  { mark: 'term', token: '++' },
  { mark: 'monoStrong', token: '__' },
  { mark: 'em', token: '*' },
  { mark: 'strong', token: '**' },
]

/**
 * Parsing order: longest token first, so `**bold**` is not read as an empty
 * `*` pair followed by stray text.
 */
const PARSE_TOKENS = [...DECORATOR_TOKENS].sort((a, b) => b.token.length - a.token.length)

const ESCAPABLE = /[\\*_`+[\]{}]/g

const escapeText = (text: string) => text.replace(ESCAPABLE, (ch) => '\\' + ch)

/** Serializes a run of inline content into the editable string. */
export function serializeRich(rich: AppendixRichText | undefined): string {
  if (!rich || !Array.isArray(rich.children)) return ''
  const defs = new Map((rich.markDefs ?? []).map((d) => [d._key, d]))
  let out = ''

  for (const child of rich.children) {
    if (child._type === 'quranRef') {
      out += `{{${child.reference}}}`
      continue
    }
    if (child._type === 'appendixLink') {
      out += `{{A${child.n}}}`
      continue
    }
    if (child._type !== 'span') continue

    let piece = escapeText(child.text ?? '')
    const marks = child.marks ?? []
    for (const { mark, token } of DECORATOR_TOKENS) {
      if (marks.includes(mark)) piece = token + piece + token
    }
    const linkKey = marks.find((m) => defs.get(m)?._type === 'link')
    if (linkKey) {
      const def = defs.get(linkKey)!
      piece = `[${piece}](${def.href ?? ''})`
    }
    out += piece
  }
  return out
}

interface ParseState {
  children: AppendixInlineChild[]
  markDefs: AppendixLinkMarkDef[]
}

function pushSpan(state: ParseState, text: string, marks: string[]) {
  if (text === '') return
  const last = state.children[state.children.length - 1]
  if (
    last &&
    last._type === 'span' &&
    (last.marks ?? []).join(' ') === marks.join(' ')
  ) {
    last.text += text
    return
  }
  state.children.push(
    marks.length > 0
      ? { _type: 'span', _key: randomKey(), text, marks: [...marks] }
      : { _type: 'span', _key: randomKey(), text },
  )
}

const REFERENCE = /^\{\{([^}]+)\}\}/
const APPENDIX_REF = /^A(\d+)$/
const LINK = /^\[((?:\\.|[^\\\]])*)\]\(([^)]*)\)/

function parseSegment(text: string, marks: string[], state: ParseState) {
  let i = 0
  let plain = ''
  const flush = () => {
    pushSpan(state, plain, marks)
    plain = ''
  }

  while (i < text.length) {
    const rest = text.slice(i)

    if (rest[0] === '\\' && i + 1 < text.length) {
      plain += text[i + 1]
      i += 2
      continue
    }

    const ref = REFERENCE.exec(rest)
    if (ref) {
      flush()
      const inner = ref[1].trim()
      const appendix = APPENDIX_REF.exec(inner)
      if (appendix) {
        state.children.push({ _type: 'appendixLink', _key: randomKey(), n: Number(appendix[1]) })
      } else {
        state.children.push({ _type: 'quranRef', _key: randomKey(), reference: inner })
      }
      i += ref[0].length
      continue
    }

    const link = LINK.exec(rest)
    if (link) {
      flush()
      const def: AppendixLinkMarkDef = { _key: randomKey(), _type: 'link', href: link[2] }
      state.markDefs.push(def)
      parseSegment(link[1], [...marks, def._key], state)
      i += link[0].length
      continue
    }

    const token = PARSE_TOKENS.find(
      ({ mark, token }) =>
        !marks.includes(mark) &&
        rest.startsWith(token) &&
        rest.indexOf(token, token.length) > 0,
    )
    if (token) {
      const close = rest.indexOf(token.token, token.token.length)
      flush()
      parseSegment(rest.slice(token.token.length, close), [...marks, token.mark], state)
      i += close + token.token.length
      continue
    }

    plain += text[i]
    i += 1
  }
  flush()
}

/** Parses the editable string back into inline children + link mark defs. */
export function parseRich(text: string): AppendixRichText {
  const state: ParseState = { children: [], markDefs: [] }
  parseSegment(text, [], state)
  if (state.children.length === 0) {
    state.children.push({ _type: 'span', _key: randomKey(), text: '' })
  }
  return state.markDefs.length > 0
    ? { children: state.children, markDefs: state.markDefs }
    : { children: state.children }
}

/** Plain text of a run, for previews and block labels. */
export function richPreview(rich: AppendixRichText | undefined, maxLength = 80): string {
  if (!rich || !Array.isArray(rich.children)) return ''
  const text = rich.children
    .map((child) =>
      child._type === 'span'
        ? child.text
        : child._type === 'quranRef'
          ? child.reference
          : `Appendix ${child.n}`,
    )
    .join('')
    .replace(/\s+/g, ' ')
    .trim()
  return text.length > maxLength ? `${text.slice(0, maxLength - 1)}…` : text
}

// ── immutable structural edits ───────────────────────────────────────────────

/**
 * A path into the nested block tree: alternating array indices and field names,
 * e.g. `[3, 'content', 0]` for the first block inside the fourth block's
 * `content`. Every step is rebuilt as a shallow copy, so siblings and untouched
 * fields keep their identity.
 */
export type BlockPath = Array<number | string>

type AnyRecord = Record<string, unknown>

/** Replaces the value at `path`, shallow-copying only the nodes along the way. */
export function updateAtPath(root: unknown, path: BlockPath, next: unknown): unknown {
  if (path.length === 0) return next
  const [head, ...rest] = path

  if (typeof head === 'number') {
    const list = Array.isArray(root) ? root : []
    if (head < 0 || head >= list.length) return root
    const copy = list.slice()
    copy[head] = updateAtPath(list[head], rest, next)
    return copy
  }

  const record = (typeof root === 'object' && root !== null ? root : {}) as AnyRecord
  return { ...record, [head]: updateAtPath(record[head], rest, next) }
}

/** Reads the value at `path`, or undefined when the path does not resolve. */
export function readAtPath(root: unknown, path: BlockPath): unknown {
  let node: unknown = root
  for (const step of path) {
    if (node === null || node === undefined) return undefined
    node =
      typeof step === 'number'
        ? Array.isArray(node)
          ? node[step]
          : undefined
        : (node as AnyRecord)[step]
  }
  return node
}

/** Removes the item at `index` from the array at `path`. */
export function removeItem(root: unknown, path: BlockPath, index: number): unknown {
  const list = readAtPath(root, path)
  if (!Array.isArray(list)) return root
  return updateAtPath(root, path, list.filter((_, i) => i !== index))
}

/**
 * Moves the item at `index` by `delta`. Out-of-range moves are no-ops rather
 * than errors, so a button at the end of a list can stay enabled-looking
 * without corrupting the value.
 */
export function moveItem(root: unknown, path: BlockPath, index: number, delta: number): unknown {
  const list = readAtPath(root, path)
  if (!Array.isArray(list)) return root
  const target = index + delta
  if (target < 0 || target >= list.length) return root
  const copy = list.slice()
  const [item] = copy.splice(index, 1)
  copy.splice(target, 0, item)
  return updateAtPath(root, path, copy)
}

/** Appends an item to the array at `path`, creating the array if absent. */
export function appendItem(root: unknown, path: BlockPath, item: unknown): unknown {
  const list = readAtPath(root, path)
  return updateAtPath(root, path, [...(Array.isArray(list) ? list : []), item])
}

/** An empty paragraph, the block every "add" action starts from. */
export function emptyParagraph(): AppendixBlock {
  return {
    _type: 'block',
    _key: randomKey(),
    style: 'normal',
    children: [{ _type: 'span', _key: randomKey(), text: '' }],
  }
}
