'use client'

import { useState } from 'react'
import { Check, Copy } from 'lucide-react'

const F = {
  display: 'var(--font-cormorant), Georgia, serif',
  mono: 'var(--font-jetbrains), ui-monospace, monospace',
  glacial: 'var(--font-glacial), sans-serif',
}

interface BrandBriefProps {
  text: string
}

export function BrandBrief({ text }: BrandBriefProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {
      // clipboard unavailable — silently ignore
    }
  }

  return (
    <div
      style={{
        position: 'relative',
        border: '1px solid var(--ed-rule)',
        backgroundColor: 'var(--ed-bg-alt)',
        borderRadius: 3,
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 16px',
          borderBottom: '1px solid var(--ed-rule)',
        }}
      >
        <span
          style={{
            fontFamily: F.glacial,
            fontSize: 10.5,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: 'var(--ed-fg-muted)',
            fontWeight: 600,
          }}
        >
          design-brief.md
        </span>
        <button
          type="button"
          onClick={handleCopy}
          aria-label={copied ? 'Copied' : 'Copy brief'}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '6px 12px',
            border: '1px solid var(--ed-rule)',
            borderRadius: 2,
            backgroundColor: 'transparent',
            color: copied ? 'var(--ed-accent)' : 'var(--ed-fg)',
            fontFamily: F.glacial,
            fontSize: 11,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'border-color 200ms ease, color 200ms ease',
          }}
        >
          {copied ? <Check size={12} /> : <Copy size={12} />}
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <pre
        style={{
          margin: 0,
          padding: '20px 24px',
          fontFamily: F.mono,
          fontSize: 12,
          lineHeight: 1.7,
          color: 'var(--ed-fg)',
          whiteSpace: 'pre-wrap',
          overflowX: 'auto',
        }}
      >
        {text}
      </pre>
    </div>
  )
}
