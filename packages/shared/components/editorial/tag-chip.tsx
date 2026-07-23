import type { ButtonHTMLAttributes } from 'react'

interface TagChipProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  on?: boolean
  asSpan?: boolean
}

export function TagChip({ on = false, asSpan = false, className = '', children, ...rest }: TagChipProps) {
  const cls = `tag-chip${on ? ' is-on' : ''} ${className}`.trim()
  if (asSpan) {
    return <span className={cls}>{children}</span>
  }
  return (
    <button type="button" className={cls} {...rest}>
      {children}
    </button>
  )
}
