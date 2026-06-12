import type { CSSProperties } from 'react'

// Shared inline-style tokens for the Quran editor screens. Uses the editor
// scope's --ed-* CSS variables (defined in editor.css / globals.css).

export const page: CSSProperties = { padding: '32px 36px', maxWidth: 1040, width: '100%' }

export const kicker: CSSProperties = {
  margin: 0,
  fontFamily: 'var(--font-glacial)',
  fontSize: 11,
  letterSpacing: '0.14em',
  textTransform: 'uppercase',
  color: 'var(--ed-fg-muted)',
}

export const heading: CSSProperties = {
  margin: '6px 0 10px',
  fontFamily: 'var(--font-cormorant)',
  fontSize: 34,
  lineHeight: 1.05,
  color: 'var(--ed-fg)',
}

export const lede: CSSProperties = {
  margin: 0,
  maxWidth: 620,
  fontSize: 14,
  lineHeight: 1.55,
  color: 'var(--ed-fg-muted)',
}

export const crumb: CSSProperties = {
  display: 'inline-flex',
  gap: 8,
  alignItems: 'center',
  marginBottom: 18,
  fontFamily: 'var(--font-glacial)',
  fontSize: 11,
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  color: 'var(--ed-fg-muted)',
}

export const surface: CSSProperties = {
  border: '1px solid var(--ed-rule)',
  borderRadius: 'var(--ed-radius)',
  background: 'var(--ed-surface)',
}

export const tag: CSSProperties = {
  fontFamily: 'var(--font-glacial)',
  fontSize: 10,
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
  color: 'var(--ed-accent)',
}

export const mutedTag: CSSProperties = {
  ...tag,
  color: 'var(--ed-fg-muted)',
}

export const label: CSSProperties = {
  display: 'block',
  fontFamily: 'var(--font-glacial)',
  fontSize: 10,
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
  color: 'var(--ed-fg-muted)',
  marginBottom: 6,
}

export const input: CSSProperties = {
  width: '100%',
  padding: '8px 10px',
  border: '1px solid var(--ed-rule)',
  borderRadius: 'var(--ed-radius-sm)',
  background: 'var(--ed-bg)',
  color: 'var(--ed-fg)',
  resize: 'vertical',
}

export const button: CSSProperties = {
  padding: '8px 16px',
  border: '1px solid var(--ed-accent)',
  borderRadius: 'var(--ed-radius-sm)',
  background: 'var(--ed-accent)',
  color: 'var(--ed-bg)',
  fontFamily: 'var(--font-glacial)',
  fontSize: 12,
  letterSpacing: '0.04em',
}

export const buttonGhost: CSSProperties = {
  ...button,
  background: 'transparent',
  color: 'var(--ed-fg)',
  borderColor: 'var(--ed-rule)',
}

export const statusPill: Record<string, CSSProperties> = {
  pending: { color: '#b8860b', borderColor: '#b8860b' },
  approved: { color: 'var(--ed-accent)', borderColor: 'var(--ed-accent)' },
  rejected: { color: '#b04444', borderColor: '#b04444' },
  cancelled: { color: 'var(--ed-fg-muted)', borderColor: 'var(--ed-rule)' },
}

export function pillBase(): CSSProperties {
  return {
    display: 'inline-block',
    padding: '2px 8px',
    border: '1px solid',
    borderRadius: 999,
    fontFamily: 'var(--font-glacial)',
    fontSize: 10,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
  }
}
