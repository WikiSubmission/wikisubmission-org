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
      className="grid-cols-1 gap-y-3 sm:grid-cols-[auto_auto_1fr_auto] sm:gap-x-5 sm:gap-y-0"
      style={{
        display: 'grid',
        alignItems: 'baseline',
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
          fontSize: 'clamp(28px, 5vw, 32px)',
          letterSpacing: '-0.02em',
          fontWeight: 500,
          color: 'var(--ed-fg)',
        }}
      >
        {title}
      </span>
      <div
        className="hidden sm:block"
        style={{ height: 1, backgroundColor: 'var(--ed-rule)' }}
      />
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
