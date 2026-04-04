/**
 * Renders text containing `<b>...</b>` highlight markers as styled marks.
 * Use `markQuery(text, query)` to produce the marked string from plain text + query.
 */
export function HighlightText({ text }: { text?: string | null }) {
  if (!text) return null
  return (
    <>
      {text.split(/(<b>.*?<\/b>)/g).map((part, i) =>
        part.startsWith('<b>') && part.endsWith('</b>') ? (
          <mark
            key={i}
            className="bg-violet-600/10 text-violet-600 dark:text-violet-400 rounded-sm not-italic font-semibold px-0.5"
          >
            {part.slice(3, -4)}
          </mark>
        ) : (
          part || null
        )
      )}
    </>
  )
}

/** Wraps every case-insensitive occurrence of `query` in `<b>` tags. */
export function markQuery(text: string, query: string): string {
  if (!query) return text
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  return text.replace(new RegExp(`(${escaped})`, 'gi'), '<b>$1</b>')
}
