import type { HTMLAttributes } from 'react'

interface EyebrowProps extends HTMLAttributes<HTMLSpanElement> {
  accent?: boolean
}

export function Eyebrow({ accent = false, className = '', children, ...rest }: EyebrowProps) {
  const base =
    'font-[var(--font-glacial)] uppercase text-[10.5px] tracking-[0.18em] leading-none'
  const color = accent ? 'text-[var(--ed-accent)]' : 'text-[var(--ed-fg-muted)]'
  return (
    <span className={`${base} ${color} ${className}`.trim()} {...rest}>
      {children}
    </span>
  )
}
