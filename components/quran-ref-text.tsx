import { QuranRef } from './quran-ref'

/**
 * Regex that matches Quran verse references inside text.
 *
 * Matches:
 *   2:255        → single verse
 *   1:1-7        → verse range (same chapter)
 *   2:255-257    → verse range (same chapter)
 *
 * Deliberately does NOT match bare numbers like "2" (too ambiguous in prose).
 * Requires the form Chapter:Verse or Chapter:VerseStart-VerseEnd.
 *
 * Word-boundary anchors (\b) prevent matching inside longer numbers.
 */
const QURAN_REF_RE = /\b(\d{1,3}:\d{1,3}(?:-\d{1,3})?)\b/g

type Part = string | { ref: string }

function splitByRefs(text: string): Part[] {
  const parts: Part[] = []
  let last = 0
  let match: RegExpExecArray | null

  QURAN_REF_RE.lastIndex = 0
  while ((match = QURAN_REF_RE.exec(text)) !== null) {
    if (match.index > last) parts.push(text.slice(last, match.index))
    parts.push({ ref: match[1] })
    last = match.index + match[0].length
  }
  if (last < text.length) parts.push(text.slice(last))
  return parts
}

/**
 * Renders a text string with any embedded Quran references (e.g. "2:255",
 * "1:1-7") converted to clickable <QuranRef> badges that open a verse dialog.
 *
 * Usage:
 *   <QuranRefText text={tr.f} from="footnote" />
 */
export function QuranRefText({
  text,
  from,
  className,
}: {
  text: string
  from?: string
  className?: string
}) {
  const parts = splitByRefs(text)

  return (
    <span className={className}>
      {parts.map((part, i) =>
        typeof part === 'string' ? (
          <span key={i}>{part}</span>
        ) : (
          <QuranRef key={i} reference={part.ref} from={from} />
        )
      )}
    </span>
  )
}
