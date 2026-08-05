'use client'

import { toast } from 'sonner'

/**
 * Renders text containing `<b>...</b>` highlight markers as click-to-copy
 * pills. Tap (mobile) or click (desktop) writes the matched text to the
 * clipboard.
 */
export function HighlightText({ text }: { text?: string | null }) {
  if (!text) return null
  const normalized = text.replace(/(<b>)+/g, '<b>').replace(/(<\/b>)+/g, '</b>')
  return (
    <>
      {normalized.split(/(<b>.*?<\/b>)/g).map((part, i) =>
        part.startsWith('<b>') && part.endsWith('</b>') ? (
          <CopyMark key={i} text={part.slice(3, -4)} />
        ) : (
          part || null
        )
      )}
    </>
  )
}

function CopyMark({ text }: { text: string }) {
  return (
    <button
      type="button"
      onClick={async (e) => {
        e.stopPropagation()
        e.preventDefault()
        try {
          await navigator.clipboard.writeText(text)
          toast.success(`Copied: ${text}`)
        } catch {
          toast.error('Could not copy to clipboard')
        }
      }}
      className="bg-primary/10 text-primary rounded-sm not-italic font-semibold px-0.5 hover:bg-primary/20 active:scale-95 cursor-copy transition-all"
      aria-label={`Copy ${text}`}
      title={`Copy: ${text}`}
    >
      {text}
    </button>
  )
}

/** Wraps every case-insensitive occurrence of `query` in `<b>` tags. */
export function markQuery(text: string, query: string): string {
  if (!query) return text
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  return text.replace(new RegExp(`(${escaped})`, 'gi'), '<b>$1</b>')
}
