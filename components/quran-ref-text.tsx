import { QuranRef } from './quran-ref'
import { createQuranInlineRefRe } from '@/lib/scripture-parser'

type Part = string | { ref: string }

function splitByRefs(text: string): Part[] {
  const parts: Part[] = []
  let last = 0
  let match: RegExpExecArray | null

  const re = createQuranInlineRefRe()
  while ((match = re.exec(text)) !== null) {
    if (match.index > last) parts.push(text.slice(last, match.index))
    parts.push({ ref: match[1] })
    last = match.index + match[0].length
  }
  if (last < text.length) parts.push(text.slice(last))
  return parts
}

/** Inline badge that calls onNavigateRef instead of opening its own dialog.
 *  Used inside QuranRef / FootnoteDialog to keep navigation within one dialog. */
function InlineRefBadge({
  reference,
  onNavigateRef,
}: {
  reference: string
  onNavigateRef: (ref: string) => void
}) {
  const [cn, rest] = reference.split(':')
  const [vs, ve] = (rest ?? '').split('-')
  const label = ve && ve !== vs ? `${cn}:${vs}–${ve}` : `${cn}:${vs}`
  return (
    <button
      onClick={() => onNavigateRef(reference)}
      className="inline-flex items-center font-glacial text-[10px] font-bold text-primary hover:underline px-0.5 transition-colors cursor-pointer align-baseline select-none mx-0.5"
      aria-label={`View verse ${reference}`}
    >
      {label}
    </button>
  )
}

/**
 * Renders a text string with any embedded Quran references (e.g. "2:255",
 * "1:1-7") converted to clickable badges.
 *
 * When `onNavigateRef` is provided (inside a QuranRef/FootnoteDialog), clicking
 * a ref badge navigates within the parent dialog instead of opening a new one.
 *
 * Usage:
 *   <QuranRefText text={tr.f} from="footnote" />
 *   <QuranRefText text={tr.f} onNavigateRef={navigate} />  ← inside a dialog
 */
export function QuranRefText({
  text,
  from,
  className,
  onNavigateRef,
}: {
  text: string
  from?: string
  className?: string
  onNavigateRef?: (ref: string) => void
}) {
  const parts = splitByRefs(text)

  return (
    <span className={className}>
      {parts.map((part, i) =>
        typeof part === 'string' ? (
          <span key={i}>{part}</span>
        ) : onNavigateRef ? (
          <InlineRefBadge key={i} reference={part.ref} onNavigateRef={onNavigateRef} />
        ) : (
          <QuranRef key={i} reference={part.ref} from={from} />
        )
      )}
    </span>
  )
}
