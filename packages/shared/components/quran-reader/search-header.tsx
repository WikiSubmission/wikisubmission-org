'use client'

import { toast } from 'sonner'
import { SearchLoadingBar } from './search-loading-bar'

/** Click-to-copy text — used to let users grab the active search query. */
function CopyableText({
  text,
  copyText,
  className,
  ariaLabel,
}: {
  text: string
  copyText?: string
  className?: string
  ariaLabel?: string
}) {
  const valueToCopy = copyText ?? text
  return (
    <button
      type="button"
      onClick={async (e) => {
        e.stopPropagation()
        try {
          await navigator.clipboard.writeText(valueToCopy)
          toast.success(`Copied: ${valueToCopy}`)
        } catch {
          toast.error('Could not copy to clipboard')
        }
      }}
      className={`text-left cursor-copy hover:text-primary active:scale-[0.98] transition-all ${className ?? ''}`}
      title={`Copy: ${valueToCopy}`}
      aria-label={ariaLabel ?? `Copy ${valueToCopy}`}
    >
      {text}
    </button>
  )
}

export function SearchHeader({
  query,
  loading,
}: {
  query: string
  loading?: boolean
}) {
  return (
    <header className="space-y-3 px-1">
      <CopyableText
        text={`“${query}”`}
        copyText={query}
        className="text-3xl sm:text-4xl font-semibold tracking-tight leading-none"
        ariaLabel={`Copy search query ${query}`}
      />
      {loading && <SearchLoadingBar />}
    </header>
  )
}
