import ReactMarkdown from 'react-markdown'

function uppercaseSections(content: string): string {
  return content.replace(
    /(##\s+Unavoidable Legal Stuff\n)([\s\S]*?)(?=\n##|$)/,
    (_, heading, body) => heading + body.toUpperCase()
  )
}

export function LegalMarkdown({ content }: { content: string }) {
  const processed = uppercaseSections(content)

  return (
    <ReactMarkdown
      components={{
        h2: ({ children }) => (
          <h2 className="text-lg font-semibold mb-2 mt-6">{children}</h2>
        ),
        p: ({ children }) => (
          <p className="text-sm text-muted-foreground mb-4">{children}</p>
        ),
        ul: ({ children }) => (
          <ul className="list-disc list-inside ml-4 space-y-1 text-sm text-muted-foreground mb-4">
            {children}
          </ul>
        ),
        a: ({ href, children }) => (
          <a
            href={href}
            className="text-primary hover:underline"
            {...(href?.startsWith('http')
              ? { target: '_blank', rel: 'noopener noreferrer' }
              : {})}
          >
            {children}
          </a>
        ),
      }}
    >
      {processed}
    </ReactMarkdown>
  )
}
