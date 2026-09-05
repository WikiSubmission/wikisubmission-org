import React from 'react'
import ReactMarkdown from 'react-markdown'
import { ExternalLink, ShieldAlert } from 'lucide-react'

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
}

function uppercaseSections(content: string): string {
  return content.replace(
    /(##\s+Unavoidable Legal Stuff\n)([\s\S]*?)(?=\n##|$)/,
    (_, heading, body) => heading + body.toUpperCase()
  )
}

export function LegalMarkdown({ content }: { content: string }) {
  const processed = uppercaseSections(content)

  return (
    <div className="legal-prose space-y-6">
      <ReactMarkdown
        components={{
          h2: ({ children }) => {
            const text = String(children || '')
            const id = slugify(text)
            const isCritical =
              text.toLowerCase().includes('unavoidable legal') ||
              text.toLowerCase().includes('disclaimer') ||
              text.toLowerCase().includes('what we do not do')

            return (
              <div id={id} className="scroll-mt-24 pt-6 first:pt-0">
                <div className="flex items-center gap-3 mb-3">
                  {isCritical ? (
                    <ShieldAlert className="h-5 w-5 text-amber-500 shrink-0" />
                  ) : (
                    <div className="h-2 w-2 rounded-full bg-primary/60 shrink-0" />
                  )}
                  <h2 className="font-headline text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                    {children}
                  </h2>
                </div>
                <div className="h-px w-full bg-border/40 mb-5" />
              </div>
            )
          },
          h3: ({ children }) => (
            <h3 className="font-headline text-lg sm:text-xl font-semibold tracking-tight text-foreground/90 mt-5 mb-2">
              {children}
            </h3>
          ),
          p: ({ children }) => (
            <p className="font-serif text-[15px] sm:text-base text-muted-foreground leading-relaxed mb-4">
              {children}
            </p>
          ),
          ul: ({ children }) => (
            <ul className="my-4 space-y-2.5 pl-1 text-[15px] sm:text-base text-muted-foreground">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal list-inside my-4 space-y-2.5 pl-1 text-[15px] sm:text-base text-muted-foreground">
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="flex items-start gap-2.5">
              <span className="h-1.5 w-1.5 rounded-full bg-primary/80 mt-2 shrink-0" />
              <span className="leading-relaxed">{children}</span>
            </li>
          ),
          strong: ({ children }) => (
            <strong className="font-semibold text-foreground">{children}</strong>
          ),
          blockquote: ({ children }) => (
            <blockquote className="my-6 border-l-2 border-primary/60 bg-primary/5 rounded-r-xl p-4 sm:p-5 font-serif text-sm sm:text-base text-foreground/90 italic">
              {children}
            </blockquote>
          ),
          a: ({ href, children }) => {
            const isExternal = href?.startsWith('http')
            return (
              <a
                href={href}
                className="text-primary font-medium underline underline-offset-4 decoration-primary/40 hover:decoration-primary transition-colors inline-flex items-center gap-1"
                {...(isExternal ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
              >
                <span>{children}</span>
                {isExternal && <ExternalLink className="h-3 w-3 inline-block shrink-0 opacity-70" />}
              </a>
            )
          },
          code: ({ children }) => (
            <code className="px-1.5 py-0.5 rounded-md bg-muted font-mono text-xs text-foreground/90 border border-border/50">
              {children}
            </code>
          ),
        }}
      >
        {processed}
      </ReactMarkdown>
    </div>
  )
}
