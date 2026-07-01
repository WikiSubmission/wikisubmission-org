import type { ReactNode } from 'react'
import { ScriptureRef } from '@/components/quran-ref'
import {
  createQuranInlineRefRe,
  createBibleNumericInlineRefRe,
  createBibleNamedInlineRefRe,
} from '@/lib/scripture-parser'

type Match = { start: number; end: number; ref: string; type: 'ref' | 'bold' }

function findAllRefs(text: string): Match[] {
  const matches: Match[] = []

  const scanners = [
    { re: createBibleNamedInlineRefRe(), type: 'ref' as const },
    { re: createBibleNumericInlineRefRe(), type: 'ref' as const },
    { re: createQuranInlineRefRe(), type: 'ref' as const },
    { re: /(\*\*.+?\*\*)/g, type: 'bold' as const },
  ]

  for (const { re, type } of scanners) {
    let m: RegExpExecArray | null
    while ((m = re.exec(text)) !== null) {
      matches.push({
        start: m.index,
        end: m.index + m[0].length,
        ref: m[0],
        type,
      })
    }
  }

  matches.sort(
    (a, b) => a.start - b.start || (b.end - b.start) - (a.end - a.start),
  )

  const out: Match[] = []
  let cursor = 0
  for (const m of matches) {
    if (m.start >= cursor) {
      out.push(m)
      cursor = m.end
    }
  }
  return out
}

export function ScriptureText({
  text,
  from,
  className,
}: {
  text: string
  from?: string
  className?: string
}) {
  const matches = findAllRefs(text)
  if (matches.length === 0) return <>{text}</>

  const parts: ReactNode[] = []
  let last = 0
  matches.forEach((m, i) => {
    if (m.start > last) {
      parts.push(<span key={`t-${i}`}>{text.slice(last, m.start)}</span>)
    }
    if (m.type === 'bold') {
      parts.push(
        <strong key={`b-${i}`}>
          {m.ref.slice(2, -2)}
        </strong>
      )
    } else {
      parts.push(<ScriptureRef key={`r-${i}`} reference={m.ref} from={from} />)
    }
    last = m.end
  })
  if (last < text.length) parts.push(<span key="t-end">{text.slice(last)}</span>)

  return <span className={className}>{parts}</span>
}
