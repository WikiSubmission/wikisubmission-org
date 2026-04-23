import React from 'react'

export const F = {
  display: 'var(--font-cormorant), Georgia, serif',
  mono: 'var(--font-jetbrains), ui-monospace, monospace',
  serif: 'var(--font-source-serif), Georgia, serif',
  arabic: 'var(--font-amiri), "Scheherazade New", serif',
}

export function SectionDivider({
  num,
  title,
  sub,
}: {
  num: string
  title: string
  sub: string
}) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'auto auto 1fr auto',
        alignItems: 'baseline',
        gap: 20,
        marginBottom: 64,
      }}
    >
      <span
        style={{
          fontFamily: F.display,
          fontSize: 14,
          fontStyle: 'italic',
          color: 'var(--ed-accent)',
          letterSpacing: '0.1em',
        }}
      >
        {num}
      </span>
      <span
        style={{
          fontFamily: F.display,
          fontSize: 32,
          letterSpacing: '-0.02em',
          fontWeight: 500,
          color: 'var(--ed-fg)',
        }}
      >
        {title}
      </span>
      <div style={{ height: 1, backgroundColor: 'var(--ed-rule)' }} />
      <span
        style={{
          fontFamily: F.mono,
          fontSize: 11,
          textTransform: 'uppercase' as const,
          letterSpacing: '0.18em',
          color: 'var(--ed-fg-muted)',
        }}
      >
        {sub}
      </span>
    </div>
  )
}

export function Arrow({ size = 14 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path d="M5 12h14M13 5l7 7-7 7" />
    </svg>
  )
}
