'use client'

import { Fragment, type ReactNode } from 'react'
import ReactMarkdown from 'react-markdown'
import { VerseRefPill } from './verse-ref-pill'

interface EditorialMarkdownProps {
  content: string
  scripture?: 'quran' | 'bible'
  className?: string
}

const VERSE_REF = /§\s?(\d{1,3}:\d{1,3})/g

function renderTextWithRefs(text: string, scripture: 'quran' | 'bible'): ReactNode {
  const nodes: ReactNode[] = []
  let lastIndex = 0
  let match: RegExpExecArray | null
  VERSE_REF.lastIndex = 0
  while ((match = VERSE_REF.exec(text)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(text.slice(lastIndex, match.index))
    }
    nodes.push(<VerseRefPill key={`${match[1]}-${match.index}`} verseKey={match[1]} scripture={scripture} />)
    lastIndex = match.index + match[0].length
  }
  if (lastIndex < text.length) nodes.push(text.slice(lastIndex))
  return nodes.map((n, i) => <Fragment key={i}>{n}</Fragment>)
}

/**
 * Renders Markdown content with the editorial verse-reference pills.
 * Falls back to plain text on parse failure (react-markdown is itself
 * resilient — it treats unknown syntax as text).
 */
export function EditorialMarkdown({ content, scripture = 'quran', className = '' }: EditorialMarkdownProps) {
  return (
    <div className={className}>
      <ReactMarkdown
        components={{
          // Substitute verse refs inline within any text leaf.
          p: ({ children, ...props }) => (
            <p {...props}>{walkChildren(children, scripture)}</p>
          ),
          li: ({ children, ...props }) => (
            <li {...props}>{walkChildren(children, scripture)}</li>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}

function walkChildren(children: ReactNode, scripture: 'quran' | 'bible'): ReactNode {
  if (typeof children === 'string') return renderTextWithRefs(children, scripture)
  if (Array.isArray(children)) {
    return children.map((child, i) =>
      typeof child === 'string' ? (
        <Fragment key={i}>{renderTextWithRefs(child, scripture)}</Fragment>
      ) : (
        <Fragment key={i}>{child}</Fragment>
      ),
    )
  }
  return children
}
