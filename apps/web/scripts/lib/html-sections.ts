/**
 * HTML to plain-text section extraction, shared by the two content extractors.
 *
 * `extract-library-text.tsx` renders the library TSX and splits the result;
 * `extract-site-text.ts` crawls the rendered site and splits that. Both want the
 * same thing, so the implementation lives here rather than in two copies that
 * drift.
 */
import { convert } from 'html-to-text'

export interface HtmlSection {
  idx: number
  heading: string | null
  /**
   * The `id` of the heading that opens this section, as a fragment (`#slug`),
   * when it has one. This is what makes a search hit deep-linkable.
   */
  anchor: string | null
  body: string
}

/**
 * Puts a space between directly-adjacent tags.
 *
 * Sibling elements are separate words, but their visual separation usually comes
 * from CSS (a flex `gap`, a margin) that html-to-text cannot see, so it
 * concatenates them: `<span>§ I</span><span>North star</span>` becomes
 * "§ INorth star", and a row of nav links becomes "QuranOld TestamentNew
 * Testament". Both are then unsearchable, since the tokens are "inorth" and
 * "quranold".
 *
 * Only a `>` immediately followed by a `<` is touched, which is always a
 * boundary between two elements and never inside a text node — so a word
 * wrapped mid-way in markup (`<b>Zak</b>at`) is left alone.
 */
function separateAdjacentTags(html: string): string {
  return html.replace(/></g, '> <')
}

/** Rendered HTML to readable plain text, dropping chrome that carries no meaning. */
export function toText(html: string): string {
  return convert(separateAdjacentTags(html), {
    wordwrap: false,
    selectors: [
      { selector: 'a', options: { ignoreHref: true } },
      { selector: 'img', format: 'skip' },
      { selector: 'svg', format: 'skip' },
      { selector: 'h1', options: { uppercase: false } },
      { selector: 'h2', options: { uppercase: false } },
      { selector: 'h3', options: { uppercase: false } },
      { selector: 'table', format: 'dataTable' },
    ],
  })
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

/** Pulls `id="…"` out of a tag's attribute string. */
function idAttribute(attrs: string): string | null {
  const match = attrs.match(/\bid=["']([^"']+)["']/)
  return match ? `#${match[1]}` : null
}

/**
 * Splits rendered HTML into sections on `<h2>` boundaries.
 *
 * The text before the first `<h2>` becomes section 0 with a null heading, which
 * is the page's own lead copy.
 */
export function splitSections(html: string): HtmlSection[] {
  const h2 = /<h2([^>]*)>([\s\S]*?)<\/h2>/g
  const sections: HtmlSection[] = []
  let lastIndex = 0
  let lastHeading: string | null = null
  let lastAnchor: string | null = null
  let match: RegExpExecArray | null

  const push = (heading: string | null, anchor: string | null, chunk: string) => {
    const body = toText(chunk)
    if (body) sections.push({ idx: sections.length, heading, anchor, body })
  }

  while ((match = h2.exec(html)) !== null) {
    push(lastHeading, lastAnchor, html.slice(lastIndex, match.index))
    lastHeading = toText(match[2] ?? '') || null
    lastAnchor = idAttribute(match[1] ?? '')
    lastIndex = h2.lastIndex
  }
  push(lastHeading, lastAnchor, html.slice(lastIndex))
  return sections
}

/**
 * Returns the inner HTML of the outermost `<main>` element.
 *
 * A balanced-tag scan rather than a regex, because pages legitimately nest a
 * second `<main>` inside the layout's one, and a greedy or lazy regex would take
 * either too much or too little. Returns null when there is no `<main>` at all,
 * which the caller treats as a failed extraction rather than an empty page.
 */
export function extractMain(html: string): string | null {
  const open = /<main\b[^>]*>/gi
  const first = open.exec(html)
  if (!first) return null

  const bodyStart = first.index + first[0].length
  const tag = /<(\/?)main\b[^>]*>/gi
  tag.lastIndex = bodyStart

  let depth = 1
  let match: RegExpExecArray | null
  while ((match = tag.exec(html)) !== null) {
    depth += match[1] === '/' ? -1 : 1
    if (depth === 0) return html.slice(bodyStart, match.index)
  }

  // Unbalanced markup: take everything after the opening tag rather than
  // discarding the page.
  return html.slice(bodyStart)
}

/** Strips subtrees the extractor should never index, by data attribute. */
export function stripSkipped(html: string): string {
  // Only handles non-nested skip regions, which is all the markup needs.
  return html.replace(
    /<([a-z]+)\b[^>]*\bdata-search-skip\b[^>]*>[\s\S]*?<\/\1>/gi,
    ' ',
  )
}
