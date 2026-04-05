'use client'

import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from 'react'
import { X, ArrowUp, Loader2, ChevronDown } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useAsk } from './ask-context'
import { QuranRef } from '@/components/quran-ref'

// ── Types ──────────────────────────────────────────────────────────────────────

interface Message {
  question: string
  answer?: string
  sources?: string[]
  error?: string
  pending?: boolean
}

// ── Inline text renderer ───────────────────────────────────────────────────────

function parseInline(text: string): React.ReactNode[] {
  const re = /(\*\*.+?\*\*|\b\d{1,3}:\d{1,3}(?:-\d{1,3})?\b)/g
  const nodes: React.ReactNode[] = []
  let last = 0, key = 0
  let m: RegExpExecArray | null
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) nodes.push(text.slice(last, m.index))
    const s = m[0]
    if (s.startsWith('**')) nodes.push(<strong key={key++}>{s.slice(2, -2)}</strong>)
    else nodes.push(<QuranRef key={key++} reference={s} />)
    last = m.index + s.length
  }
  if (last < text.length) nodes.push(text.slice(last))
  return nodes
}

function AiAnswer({ text }: { text: string }) {
  return (
    <div className="space-y-3 text-sm leading-relaxed text-foreground/90">
      {text.split(/\n\n+/).map((para, i) => {
        const lines = para.split(/\n/).filter(Boolean)
        if (/^\d+\.\s/.test(para))
          return (
            <ol key={i} className="list-decimal list-outside pl-4 space-y-1.5">
              {lines.map((l, j) => <li key={j}>{parseInline(l.replace(/^\d+\.\s*/, ''))}</li>)}
            </ol>
          )
        if (/^[-*]\s/.test(para))
          return (
            <ul key={i} className="list-disc list-outside pl-4 space-y-1.5">
              {lines.map((l, j) => <li key={j}>{parseInline(l.replace(/^[-*]\s*/, ''))}</li>)}
            </ul>
          )
        return <p key={i}>{parseInline(para)}</p>
      })}
    </div>
  )
}

function TypingDots() {
  return (
    <div className="flex gap-1 items-center h-5 px-1">
      {[0, 120, 240].map((d) => (
        <span
          key={d}
          className="size-1.5 rounded-full bg-muted-foreground/40 animate-bounce"
          style={{ animationDelay: `${d}ms` }}
        />
      ))}
    </div>
  )
}

function VerseChip({ sources, onNavigate }: { sources: string[]; onNavigate: () => void }) {
  const refs = sources.filter((s) => /^\d+:\d+/.test(s))
  if (!refs.length) return null
  return (
    <Link
      href={`/quran?q=${refs.join(',')}`}
      onClick={onNavigate}
      className="mt-2.5 inline-flex items-center text-[11px] font-mono text-violet-600 dark:text-violet-400 bg-violet-500/10 hover:bg-violet-500/20 px-2 py-0.5 rounded-md transition-colors"
    >
      {refs.join(', ')}
    </Link>
  )
}

// ── Minimized pill ─────────────────────────────────────────────────────────────

function MinimizedPill({ onOpen, onClose }: { onOpen: () => void; onClose: () => void }) {
  return (
    <div className="fixed bottom-4 right-4 z-50 flex items-center gap-2 bg-background border border-border/50 shadow-lg rounded-full px-3 py-2 text-sm font-medium">
      <button onClick={onOpen} className="flex items-center gap-2 hover:opacity-70 transition-opacity">
        <Image
          src="/brand-assets/logo-transparent.png"
          alt=""
          width={20}
          height={20}
          className="rounded-full size-5"
        />
        SubmitterAI
      </button>
      <button onClick={onClose} className="flex items-center text-muted-foreground hover:text-foreground transition-colors" aria-label="Dismiss">
        <X size={13} />
      </button>
    </div>
  )
}

// ── Sidebar ────────────────────────────────────────────────────────────────────

export function AskSidebar() {
  const { state, open, close, minimize } = useAsk()
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<Message[]>([])
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const isOpen = state === 'open'

  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 200)
  }, [isOpen])

  useEffect(() => {
    if (isOpen) bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isOpen])

  useEffect(() => {
    const fn = (e: globalThis.KeyboardEvent) => { if (e.key === 'Escape' && isOpen) minimize() }
    document.addEventListener('keydown', fn)
    return () => document.removeEventListener('keydown', fn)
  }, [isOpen, minimize])

  const submit = async (q: string) => {
    const trimmed = q.trim()
    if (!trimmed) return
    setInput('')

    // Add message immediately with pending state
    const idx = messages.length
    setMessages((prev) => [...prev, { question: trimmed, pending: true }])

    try {
      const res = await fetch('/api/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: trimmed }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || `Error ${res.status}`)
      setMessages((prev) =>
        prev.map((m, i) =>
          i === idx ? { question: trimmed, answer: data.answer, sources: data.sources ?? [], pending: false } : m
        )
      )
    } catch (err: unknown) {
      setMessages((prev) =>
        prev.map((m, i) =>
          i === idx
            ? { question: trimmed, error: err instanceof Error ? err.message : 'Something went wrong.', pending: false }
            : m
        )
      )
    }
  }

  const handleKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') { e.preventDefault(); submit(input) }
  }

  if (state === 'minimized') return <MinimizedPill onOpen={open} onClose={close} />

  return (
    <>
      {/* Backdrop */}
      <div
        aria-hidden
        onClick={minimize}
        className={`fixed inset-0 z-40 bg-black/20 backdrop-blur-[1px] transition-opacity duration-300 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      />

      {/* Panel — full height, fixed width, slides from right */}
      <aside
        className={`fixed top-0 right-0 z-50 h-full flex flex-col bg-background border-l border-border/40 shadow-2xl transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        style={{ width: '420px', maxWidth: 'calc(100vw - 48px)' }}
      >
        {/* Header */}
        <div className="shrink-0 h-14 flex items-center justify-between px-4 border-b border-border/30">
          <div className="flex items-center gap-2.5">
            <Image
              src="/brand-assets/logo-transparent.png"
              alt="WikiSubmission"
              width={22}
              height={22}
              className="rounded-full"
            />
            <span className="text-sm font-semibold">Submission AI</span>
          </div>
          <button
            onClick={minimize}
            className="size-8 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
            aria-label="Close"
          >
            <X size={15} />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-5 space-y-6" style={{ minHeight: 0 }}>
          {messages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center gap-5 text-center">
              <div className="space-y-1">
                <p className="text-sm font-semibold">Ask about Submission</p>
                <p className="text-xs text-muted-foreground">
                  Quran, Submission, the Miracle, Practices
                </p>
              </div>
              <div className="flex flex-col gap-2 w-full max-w-xs">
                {[
                  'What is the significance of 19?',
                  'What does the Quran say about prayer?',
                  'What are the Quran\'s unique initials?',
                ].map((s) => (
                  <button
                    key={s}
                    onClick={() => submit(s)}
                    className="text-xs text-left text-muted-foreground hover:text-foreground border border-border/40 hover:border-border/70 hover:bg-muted/20 px-3 py-2 rounded-lg transition-colors"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg, i) => (
            <div key={i} className="space-y-3">
              {/* User bubble */}
              <div className="flex justify-end">
                <div className="max-w-[80%] bg-muted/50 text-foreground text-sm leading-relaxed px-3 py-1.5 rounded-2xl rounded-tr-sm">
                  {msg.question}
                </div>
              </div>

              {/* AI response */}
              <div className="pr-4">
                {msg.pending && <TypingDots />}
                {msg.error && <p className="text-xs text-destructive">{msg.error}</p>}
                {msg.answer && (
                  <>
                    <AiAnswer text={msg.answer} />
                    <VerseChip sources={msg.sources ?? []} onNavigate={minimize} />
                  </>
                )}
              </div>
            </div>
          ))}

          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="shrink-0 px-3 pb-4 pt-3 border-t border-border/30 space-y-2.5">
          {/* Model selector */}
          <button
            disabled
            className="flex items-center gap-1.5 text-[11px] text-muted-foreground/60 hover:text-muted-foreground cursor-default select-none transition-colors"
          >
            <Image
              src="/brand-assets/logo-transparent.png"
              alt=""
              width={14}
              height={14}
              className="rounded-full opacity-60"
            />
            <span><strong>Model:</strong> SubmitterAI</span>
          </button>

          {/* Input row */}
          <form
            onSubmit={(e: FormEvent) => { e.preventDefault(); submit(input) }}
            className="flex items-center gap-2"
          >
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Ask anything…"
              maxLength={500}
              className="flex-1 h-9 rounded-xl border border-border/50 bg-muted/20 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-colors placeholder:text-muted-foreground/40"
            />
            <button
              type="submit"
              disabled={input.trim().length < 2}
              className="shrink-0 size-9 flex items-center justify-center rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-30 disabled:cursor-not-allowed transition-opacity"
            >
              {messages.at(-1)?.pending
                ? <Loader2 className="size-4 animate-spin" />
                : <ArrowUp className="size-4" />
              }
            </button>
          </form>

          <p className="text-[10px] text-muted-foreground/40 text-center">
            May contain inaccuracies — verify all information
          </p>
        </div>
      </aside>
    </>
  )
}
