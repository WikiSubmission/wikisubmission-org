/**
 * Markdown emission primitives for the appendix converter.
 *
 * Everything here targets the exact dialect
 * `packages/shared/components/library/appendix-markdown.tsx` understands:
 * CommonMark plus remark-gfm tables, with NO raw HTML (the renderer omits
 * rehype-raw on purpose), and with link/image URLs that survive `sanitizeUrl`.
 */

/**
 * Characters that would otherwise be read as markdown syntax mid-line.
 *
 * `|` is deliberately absent: only table cells care about it, and `gfmTable`
 * escapes it there, so escaping it here too would double into a literal
 * backslash inside every cell.
 */
const INLINE_ESCAPE = /([\\`*_<])/g

/**
 * Brackets are escaped only where they could open a link, an image, or a
 * reference definition. The appendix prose numbers its points "[1]", "[2]",
 * and CommonMark already leaves those literal, so escaping every bracket would
 * only make the stored source harder for an editor to read.
 */
const BRACKET_ESCAPE = /!?\[([^\]\n]*)\](?=[([:])/g

/**
 * Line-leading markers that would otherwise start a block. The trailing
 * whitespace is optional because a run that is nothing but a marker still
 * opens a list: appendix 24's `<StatementBox>1919.</StatementBox>` would
 * otherwise become an empty `<li>` numbered 1919.
 */
const LEADING_ESCAPE = /^(\s*)(?:([#>+-])|(\d+)([.)]))(\s|$)/

/**
 * Escapes literal prose so it renders as written. Verse references are NOT
 * routed through this: the walker emits them as pre-built tokens so the
 * renderer's bracket-reference rule can still see `[74:35]`.
 */
export function escapeText(text: string): string {
  return text
    .replace(INLINE_ESCAPE, '\\$1')
    .replace(BRACKET_ESCAPE, '\\[$1\\]')
    .replace(LEADING_ESCAPE, (_match, indent, symbol, digits, punctuation, tail) =>
      // A backslash only escapes ASCII punctuation, so an ordered-list marker
      // has to be broken at its dot ("1919\.") rather than at its digits.
      symbol ? `${indent}\\${symbol}${tail}` : `${indent}${digits}\\${punctuation}${tail}`,
    )
}

/** Collapses JSX whitespace runs (newlines, indentation) to single spaces. */
export function collapse(text: string): string {
  return text.replace(/[\t\n\r ]+/g, ' ')
}

/** Trims a block and drops the interior blank-line runs markdown would eat. */
export function tidyBlock(block: string): string {
  return block.replace(/[ \t]+$/gm, '').replace(/\n{3,}/g, '\n\n').trim()
}

/** Prefixes every line so a run of blocks renders as one blockquote. */
export function blockquote(blocks: readonly string[]): string {
  const body = blocks.filter(Boolean).join('\n\n')
  if (!body) return ''
  return body
    .split('\n')
    .map((line) => (line ? `> ${line}` : '>'))
    .join('\n')
}

/** Fenced code block. Content is emitted verbatim, so no escaping applies. */
export function codeFence(content: string): string {
  const body = content.replace(/\n+$/, '')
  if (!body.trim()) return ''
  // Widen the fence past any backtick run inside the body.
  const longest = (body.match(/`+/g) ?? []).reduce((n, run) => Math.max(n, run.length), 0)
  const fence = '`'.repeat(Math.max(3, longest + 1))
  return `${fence}\n${body}\n${fence}`
}

/** Heading of the given level. */
export function heading(level: number, text: string): string {
  const depth = Math.min(6, Math.max(1, level))
  return `${'#'.repeat(depth)} ${text.trim()}`
}

/**
 * A GFM table. A pipe table cannot contain a newline, so multi-line cells are
 * flattened to a single spaced line; that is a real fidelity loss and the
 * caller reports it.
 */
export function gfmTable(header: readonly string[], rows: readonly string[][]): string {
  const width = Math.max(header.length, ...rows.map((r) => r.length), 1)
  const cell = (value: string | undefined) =>
    collapse(value ?? '')
      .replace(/\|/g, '\\|')
      .trim() || ' '
  const pad = (row: readonly string[]) =>
    `| ${Array.from({ length: width }, (_, i) => cell(row[i])).join(' | ')} |`

  const lines = [pad(header), `| ${Array.from({ length: width }, () => '---').join(' | ')} |`]
  for (const row of rows) lines.push(pad(row))
  return lines.join('\n')
}

/** Indents the continuation lines of a list item under its marker. */
export function listItem(marker: string, blocks: readonly string[]): string {
  const body = blocks.filter(Boolean).join('\n\n')
  const indent = ' '.repeat(marker.length)
  return body
    .split('\n')
    .map((line, i) => (i === 0 ? `${marker}${line}` : line ? `${indent}${line}` : ''))
    .join('\n')
}
