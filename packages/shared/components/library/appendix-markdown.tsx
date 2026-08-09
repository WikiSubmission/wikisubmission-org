'use client'

import { Fragment, type ReactNode } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { QuranRef } from '@/components/quran-ref'
import { sanitizeUrl } from '@/lib/safe-url'

/**
 * Renders an appendix body authored as markdown in /editor.
 *
 * Safety: raw HTML is never enabled (no rehype-raw), so anything an editor
 * types as markup is escaped rather than parsed into elements. Link and image
 * URLs go through the shared `sanitizeUrl` allow-list, the same helper the
 * Portable Text renderer uses, so a `javascript:` URL cannot reach an href or
 * a src. Those two rules are what keep this markdown path from reopening the
 * stored-XSS hole closed in a8ec310; do not add rehype-raw or a bare
 * urlTransform passthrough here.
 *
 * Scripture references written as bare brackets ("[74:35]") become the same
 * interactive QuranRef badge the hardcoded appendix components use, so a
 * migrated body keeps the cross-reference behaviour readers have today.
 */

interface AppendixMarkdownProps {
  /** Markdown source. */
  content: string
  className?: string
}

// "[74:35]" or a range, "[3:81-85]". Matched only inside text leaves, so a
// reference inside a code span or a link label is left alone.
const BRACKET_REF = /\[(\d{1,3}:\d{1,3}(?:-\d{1,3})?)\]/g

function linkifyRefs(text: string): ReactNode {
  const nodes: ReactNode[] = []
  let lastIndex = 0
  let match: RegExpExecArray | null
  BRACKET_REF.lastIndex = 0
  while ((match = BRACKET_REF.exec(text)) !== null) {
    if (match.index > lastIndex) nodes.push(text.slice(lastIndex, match.index))
    nodes.push(<QuranRef key={`${match[1]}-${match.index}`} reference={match[1]} />)
    lastIndex = match.index + match[0].length
  }
  if (lastIndex === 0) return text
  if (lastIndex < text.length) nodes.push(text.slice(lastIndex))
  return nodes.map((node, i) => <Fragment key={i}>{node}</Fragment>)
}

function walk(children: ReactNode): ReactNode {
  if (typeof children === 'string') return linkifyRefs(children)
  if (Array.isArray(children)) {
    return children.map((child, i) => (
      <Fragment key={i}>{typeof child === 'string' ? linkifyRefs(child) : child}</Fragment>
    ))
  }
  return children
}

// Rejected URLs collapse to undefined so the attribute is omitted entirely,
// rather than rendering a link that points back at the current page.
const safeHref = (raw: string | undefined): string | undefined =>
  raw ? sanitizeUrl(raw) : undefined

export function AppendixMarkdown({ content, className = '' }: AppendixMarkdownProps) {
  return (
    <div className={`space-y-5 text-base leading-relaxed ${className}`.trim()}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        // Belt to the braces of the per-element checks below: react-markdown
        // funnels every href/src through this before it reaches the DOM.
        urlTransform={(url) => sanitizeUrl(url) ?? ''}
        components={{
          h1: ({ children }) => <h2 className="pt-4 text-xl font-bold">{walk(children)}</h2>,
          h2: ({ children }) => <h2 className="pt-4 text-lg font-semibold">{walk(children)}</h2>,
          h3: ({ children }) => <h3 className="pt-2 text-base font-semibold">{walk(children)}</h3>,
          p: ({ children }) => <p className="text-foreground/90">{walk(children)}</p>,
          li: ({ children }) => <li className="text-foreground/90">{walk(children)}</li>,
          ul: ({ children }) => <ul className="list-disc space-y-1 ps-6">{children}</ul>,
          ol: ({ children }) => <ol className="list-decimal space-y-1 ps-6">{children}</ol>,
          blockquote: ({ children }) => (
            <blockquote className="border-primary/30 text-muted-foreground border-s-2 ps-4 italic">
              {children}
            </blockquote>
          ),
          hr: () => <hr className="border-border/40" />,
          // GFM tables: the appendix corpus is table-heavy, so they scroll
          // inside their own container rather than widening the page.
          table: ({ children }) => (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">{children}</table>
            </div>
          ),
          th: ({ children }) => (
            <th className="border-border/50 border px-3 py-2 text-start font-semibold">
              {walk(children)}
            </th>
          ),
          td: ({ children }) => (
            <td className="border-border/40 border px-3 py-2 align-top">{walk(children)}</td>
          ),
          code: ({ children }) => (
            <code className="bg-muted/40 rounded px-1 py-0.5 font-mono text-[0.9em]">
              {children}
            </code>
          ),
          pre: ({ children }) => (
            <pre className="bg-muted/30 overflow-x-auto rounded-lg p-4 font-mono text-sm">
              {children}
            </pre>
          ),
          a: ({ href, children }) => {
            const safe = safeHref(href)
            if (!safe) return <>{walk(children)}</>
            const external = /^https?:/i.test(safe)
            return (
              <a
                href={safe}
                className="text-primary hover:underline"
                {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
              >
                {walk(children)}
              </a>
            )
          },
          img: ({ src, alt }) => {
            const safe = safeHref(typeof src === 'string' ? src : undefined)
            if (!safe) return null
            // eslint-disable-next-line @next/next/no-img-element
            return (
              <img src={safe} alt={alt ?? ''} className="mx-auto h-auto max-w-full rounded-lg" />
            )
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}
