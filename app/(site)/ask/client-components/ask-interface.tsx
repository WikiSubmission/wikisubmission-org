'use client'

import { useEffect, useRef, useState, type FormEvent } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Sparkles, ArrowRight, Loader2, ExternalLink } from 'lucide-react'
import { QuranRef } from '@/components/quran-ref'

// ── Types ─────────────────────────────────────────────────────────────────────

interface AiResponse {
  answer: string
  sources: string[]
}

interface ParsedSource {
  label: string
  href: string
  external?: boolean
}

// ── Source parsing ─────────────────────────────────────────────────────────────

function parseSource(source: string): ParsedSource | null {
  // appendix:N:M → /appendices/N
  const appendixMatch = source.match(/^appendix:(\d+):\d+$/)
  if (appendixMatch) {
    return { label: `Appendix ${appendixMatch[1]}`, href: `/appendices/${appendixMatch[1]}` }
  }
  // qurantalk:Title → qurantalk.com
  const qurantalkMatch = source.match(/^qurantalk:(.+)$/)
  if (qurantalkMatch) {
    const title = qurantalkMatch[1].trim()
    const slug = title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
    return { label: title, href: `https://www.qurantalk.com/${slug}`, external: true }
  }
  // N:N(-M)? → verse link
  const verseMatch = source.match(/^(\d+):(\d+)(?:-\d+)?$/)
  if (verseMatch) {
    return { label: source, href: `/quran/${verseMatch[1]}?verse=${verseMatch[2]}` }
  }
  return null
}

// ── Answer renderer ────────────────────────────────────────────────────────────

/** Splits text into plain strings and verse refs (N:N or N:N-M), renders each. */
function parseInline(text: string): React.ReactNode[] {
  const re = /(\*\*.+?\*\*|\b\d{1,3}:\d{1,3}(?:-\d{1,3})?\b)/g
  const parts: React.ReactNode[] = []
  let last = 0
  let key = 0
  let match: RegExpExecArray | null
  while ((match = re.exec(text)) !== null) {
    if (match.index > last) parts.push(text.slice(last, match.index))
    const m = match[0]
    if (m.startsWith('**')) {
      parts.push(<strong key={key++}>{m.slice(2, -2)}</strong>)
    } else {
      parts.push(<QuranRef key={key++} reference={m} />)
    }
    last = match.index + m.length
  }
  if (last < text.length) parts.push(text.slice(last))
  return parts
}

function AiAnswer({ text }: { text: string }) {
  const paragraphs = text.split(/\n\n+/)
  return (
    <div className="space-y-4 text-foreground/90">
      {paragraphs.map((para, i) => {
        const lines = para.split(/\n/).filter(Boolean)

        if (/^\d+\.\s/.test(para)) {
          return (
            <ol key={i} className="space-y-2 list-decimal list-outside pl-5">
              {lines.map((line, j) => (
                <li key={j} className="text-base leading-relaxed pl-1">
                  {parseInline(line.replace(/^\d+\.\s*/, ''))}
                </li>
              ))}
            </ol>
          )
        }

        if (/^[-*]\s/.test(para)) {
          return (
            <ul key={i} className="space-y-2 list-disc list-outside pl-5">
              {lines.map((line, j) => (
                <li key={j} className="text-base leading-relaxed pl-1">
                  {parseInline(line.replace(/^[-*]\s*/, ''))}
                </li>
              ))}
            </ul>
          )
        }

        return (
          <p key={i} className="text-base leading-relaxed">
            {parseInline(para)}
          </p>
        )
      })}
    </div>
  )
}

// ── Main component ─────────────────────────────────────────────────────────────

export function AskInterface() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const initialQ = searchParams.get('q') ?? ''

  const [input, setInput] = useState(initialQ)
  const [loading, setLoading] = useState(false)
  const [response, setResponse] = useState<AiResponse | null>(null)
  const [question, setQuestion] = useState('')
  const [error, setError] = useState<string | null>(null)
  const answerRef = useRef<HTMLDivElement>(null)

  const submit = async (q: string) => {
    const trimmed = q.trim()
    if (!trimmed || loading) return

    setLoading(true)
    setError(null)
    setResponse(null)
    setQuestion(trimmed)
    router.replace(`/ask?q=${encodeURIComponent(trimmed)}`, { scroll: false })

    try {
      const res = await fetch('/api/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: trimmed }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || `Error ${res.status}`)
      setResponse(data)
      setTimeout(() => answerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  // Auto-submit on load if ?q= is present
  useEffect(() => {
    if (initialQ.length >= 2) submit(initialQ)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    submit(input)
  }

  const verseSources = (response?.sources ?? []).filter((s) => /^\d+:\d+/.test(s))
  const otherSources = (response?.sources ?? [])
    .filter((s) => !/^\d+:\d+/.test(s))
    .map(parseSource)
    .filter(Boolean) as ParsedSource[]

  return (
    <main className="min-h-screen py-16 px-4">
      <div className="max-w-2xl mx-auto space-y-8">

        {/* Header */}
        <header className="text-center space-y-3">
          <div className="flex justify-center">
            <div className="size-12 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Sparkles className="size-5 text-primary" />
            </div>
          </div>
          <div>
            <h1 className="text-2xl font-bold">SubmitterAI</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Ask questions about the Quran and Submission
            </p>
          </div>
        </header>

        {/* Search form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="relative">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  submit(input)
                }
              }}
              placeholder="Ask a question about the Quran, submission, or Islamic practice…"
              maxLength={500}
              rows={2}
              className="w-full rounded-xl border border-border/60 bg-background px-4 py-3 pr-24 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all placeholder:text-muted-foreground/60"
            />
            <button
              type="submit"
              disabled={loading || input.trim().length < 2}
              className="absolute right-2.5 bottom-2.5 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              {loading ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <ArrowRight className="size-3.5" />
              )}
              Ask
            </button>
          </div>
        </form>

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center gap-2 py-12 text-muted-foreground text-sm">
            <Loader2 className="size-4 animate-spin" />
            <span>Thinking…</span>
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div className="rounded-xl border border-destructive/30 bg-destructive/5 px-5 py-4 text-sm text-destructive">
            {error}
          </div>
        )}

        {/* Answer */}
        {response && !loading && (
          <div ref={answerRef} className="space-y-5">
            {/* Question echo */}
            <div className="flex items-start gap-3">
              <span className="shrink-0 size-6 rounded-full bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground mt-0.5">
                Q
              </span>
              <p className="text-sm font-medium leading-relaxed pt-0.5">{question}</p>
            </div>

            {/* Answer card */}
            <div className="flex items-start gap-3">
              <span className="shrink-0 size-6 rounded-full bg-primary/10 flex items-center justify-center mt-0.5">
                <Sparkles className="size-3 text-primary" />
              </span>
              <div className="flex-1 min-w-0 rounded-xl border border-border/40 bg-muted/10 px-5 py-4">
                <AiAnswer text={response.answer} />
              </div>
            </div>

            {/* Sources */}
            {(verseSources.length > 0 || otherSources.length > 0) && (
              <div className="pl-9 space-y-2">
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">
                  Sources
                </p>
                <div className="flex flex-wrap gap-2">
                  {verseSources.length > 0 && (
                    <Link
                      href={`/quran/?q=${verseSources.join(',')}`}
                      className="inline-flex items-center gap-1 text-xs font-mono bg-violet-600/10 text-violet-600 hover:bg-violet-600/20 px-2.5 py-1 rounded-md transition-colors"
                    >
                      {verseSources.join(', ')}
                    </Link>
                  )}
                  {otherSources.map((src) =>
                    src.external ? (
                      <a
                        key={src.href}
                        href={src.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground px-2.5 py-1 rounded-md transition-colors"
                      >
                        {src.label}
                        <ExternalLink className="size-2.5 opacity-60" />
                      </a>
                    ) : (
                      <Link
                        key={src.href}
                        href={src.href}
                        className="inline-flex items-center gap-1 text-xs bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground px-2.5 py-1 rounded-md transition-colors"
                      >
                        {src.label}
                      </Link>
                    )
                  )}
                </div>
              </div>
            )}

            {/* Disclaimer */}
            <p className="pl-9 text-[11px] text-muted-foreground/60">
              Answers may contain inaccuracies. Please verify all information.
            </p>
          </div>
        )}

        {/* Empty state (no question yet) */}
        {!loading && !response && !error && !initialQ && (
          <div className="space-y-3">
            <p className="text-xs text-muted-foreground text-center">Try asking:</p>
            <div className="flex flex-wrap justify-center gap-2">
              {[
                'What is the significance of the number 19 in the Quran?',
                'What does the Quran say about the Five Pillars?',
                'What is Submission (Islam) according to the Quran?',
                'What are the initials at the beginning of some suras?',
              ].map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => {
                    setInput(suggestion)
                    submit(suggestion)
                  }}
                  className="text-xs text-muted-foreground hover:text-primary border border-border/40 hover:border-primary/30 px-3 py-1.5 rounded-full transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}

      </div>
    </main>
  )
}
