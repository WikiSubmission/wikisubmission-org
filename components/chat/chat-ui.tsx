'use client'

import Link from 'next/link'
import { ArrowUp, Loader2, ChevronDown, Trash2 } from 'lucide-react'
import Image from 'next/image'
import { type FormEvent, type KeyboardEvent, useRef, useState } from 'react'
import { QuranRef } from '@/components/quran-ref'
import type { Message } from './use-chat'

// ── Inline text renderer ───────────────────────────────────────────────────────

export function parseInline(text: string): React.ReactNode[] {
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

// ── Answer renderer ────────────────────────────────────────────────────────────

export function AiAnswer({ text }: { text: string }) {
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

// ── Loading indicator ──────────────────────────────────────────────────────────

export function TypingDots() {
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

// ── Verse source chip ──────────────────────────────────────────────────────────

export function VerseChip({ sources, onNavigate }: { sources: string[]; onNavigate?: () => void }) {
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

// ── Suggestion prompts ─────────────────────────────────────────────────────────

const SUGGESTIONS = [
  'What is the significance of 19?',
  'What does the Quran say about prayer?',
  "What are the Quran's unique initials?",
]

export function SuggestionCards({ onSelect }: { onSelect: (s: string) => void }) {
  return (
    <div className="flex flex-col gap-2 w-full max-w-xs">
      {SUGGESTIONS.map((s) => (
        <button
          key={s}
          onClick={() => onSelect(s)}
          className="text-xs text-left text-muted-foreground hover:text-foreground border border-border/40 hover:border-border/70 hover:bg-muted/20 px-3 py-2 rounded-lg transition-colors"
        >
          {s}
        </button>
      ))}
    </div>
  )
}

// ── Message list ───────────────────────────────────────────────────────────────

export function MessageList({
  messages,
  onNavigate,
}: {
  messages: Message[]
  onNavigate?: () => void
}) {
  const bottomRef = useRef<HTMLDivElement>(null)
  // scroll to bottom whenever messages change
  // (caller is responsible for calling scrollIntoView if needed, or we do it here)
  return (
    <>
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
                <VerseChip sources={msg.sources ?? []} onNavigate={onNavigate} />
              </>
            )}
          </div>
        </div>
      ))}
      <div ref={bottomRef} />
    </>
  )
}

// ── Chat input ─────────────────────────────────────────────────────────────────

export function ChatInput({
  onSubmit,
  isPending,
  autoFocus = false,
  onClear,
}: {
  onSubmit: (q: string) => void
  isPending: boolean
  autoFocus?: boolean
  onClear?: () => void
}) {
  const [input, setInput] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const handleSubmit = () => {
    if (input.trim().length < 2 || isPending) return
    onSubmit(input)
    setInput('')
  }

  const handleKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') { e.preventDefault(); handleSubmit() }
  }

  return (
    <div className="shrink-0 px-3 pb-4 pt-3 border-t border-border/30 space-y-2.5">
      {/* Model row */}
      <div className="flex items-center justify-between">
        <button
          disabled
          className="flex items-center gap-1.5 text-[11px] text-muted-foreground/60 cursor-default select-none"
        >
          <Image
            src="/brand-assets/logo-transparent.png"
            alt=""
            width={14}
            height={14}
            className="rounded-full opacity-60"
          />
          <span><strong>Model:</strong> SubmitterAI v1</span>
          <ChevronDown className="size-3 opacity-40" />
        </button>
        {onClear && (
          <button
            onClick={onClear}
            disabled={isPending}
            className="flex items-center gap-1 text-[11px] text-muted-foreground/50 hover:text-muted-foreground disabled:opacity-30 transition-colors"
          >
            <Trash2 size={11} />
            Clear
          </button>
        )}
      </div>

      {/* Input row */}
      <form
        onSubmit={(e: FormEvent) => { e.preventDefault(); handleSubmit() }}
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
          autoFocus={autoFocus}
          className="flex-1 h-9 rounded-xl border border-border/50 bg-muted/20 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-colors placeholder:text-muted-foreground/40"
        />
        <button
          type="submit"
          disabled={input.trim().length < 2 || isPending}
          className="shrink-0 size-9 flex items-center justify-center rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-30 disabled:cursor-not-allowed transition-opacity"
        >
          {isPending
            ? <Loader2 className="size-4 animate-spin" />
            : <ArrowUp className="size-4" />
          }
        </button>
      </form>

      <p className="text-[10px] text-muted-foreground/40 text-center">
        May contain inaccuracies — verify all information
      </p>
    </div>
  )
}
