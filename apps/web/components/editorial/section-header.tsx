import type { ReactNode } from 'react'

interface SectionHeaderProps {
  roman?: string
  eyebrow?: string
  title: ReactNode
  action?: ReactNode
}

/**
 * Editorial section header used on /me sections, /me/notes, etc.
 * Renders the § N roman numeral, the uppercase eyebrow, the H2 title (whose
 * last word — wrap it in <em>…</em> in the title prop — italicizes in accent),
 * and an optional right-rail action (link or button).
 */
export function SectionHeader({ roman, eyebrow, title, action }: SectionHeaderProps) {
  return (
    <div className="section-head">
      {roman ? <span className="section-roman">{roman}</span> : null}
      {eyebrow ? <span className="section-eyebrow">{eyebrow}</span> : null}
      <h2 className="section-title">{title}</h2>
      <span className="section-spacer" />
      {action ?? null}
    </div>
  )
}

/** Renders a name with the last whitespace-separated token italicized in accent. */
export function italicizeLast(name: string): ReactNode {
  const trimmed = name.trim()
  if (!trimmed) return null
  const parts = trimmed.split(/\s+/)
  if (parts.length === 1) {
    return <em>{trimmed}</em>
  }
  const head = parts.slice(0, -1).join(' ')
  const tail = parts[parts.length - 1]
  return (
    <>
      {head} <em>{tail}</em>
    </>
  )
}
