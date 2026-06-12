import type { HTMLAttributes } from 'react'

interface VerseKeyProps extends HTMLAttributes<HTMLSpanElement> {
  verseKey: string
  muted?: boolean
}

export function VerseKey({ verseKey, muted = false, className = '', ...rest }: VerseKeyProps) {
  const color = muted ? 'text-[var(--ed-fg-muted)]' : 'text-[var(--ed-accent)]'
  return (
    <span
      className={`font-[var(--font-jetbrains)] text-[12px] tracking-[0.04em] ${color} ${className}`.trim()}
      {...rest}
    >
      {verseKey}
    </span>
  )
}
