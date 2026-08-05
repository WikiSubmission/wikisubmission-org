'use client'

import { useState, useRef } from 'react'

export interface Message {
  question: string
  answer?: string
  sources?: string[]
  error?: string
  pending?: boolean
}

const MAX_LEN = 500

function newConversationId(): string {
  return Math.random().toString(36).slice(2, 8)
}

export function useChat() {
  const [messages, setMessages] = useState<Message[]>([])
  const conversationIdRef = useRef<string | null>(null)

  const isPending = messages.at(-1)?.pending ?? false

  const submit = async (q: string) => {
    if (isPending) return
    const trimmed = q.trim().slice(0, MAX_LEN)
    if (trimmed.length < 2) return

    // Generate conversation_id on first message; reuse for all subsequent
    if (!conversationIdRef.current) {
      conversationIdRef.current = newConversationId()
    }

    const idx = messages.length
    setMessages(prev => [...prev, { question: trimmed, pending: true }])

    try {
      const res = await fetch('/api/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: trimmed, conversation_id: conversationIdRef.current }),
      })
      const raw = await res.text()
      let data: { answer?: string; sources?: string[]; error?: string } = {}
      try {
        data = raw ? JSON.parse(raw) : {}
      } catch {
        throw new Error(res.ok ? 'AI service returned an invalid response.' : 'AI service is unavailable right now.')
      }
      if (!res.ok) throw new Error(data.error || `Error ${res.status}`)
      setMessages(prev =>
        prev.map((m, i) =>
          i === idx
            ? { question: trimmed, answer: data.answer, sources: data.sources ?? [], pending: false }
            : m
        )
      )
    } catch (err) {
      setMessages(prev =>
        prev.map((m, i) =>
          i === idx
            ? { question: trimmed, error: err instanceof Error ? err.message : 'Something went wrong.', pending: false }
            : m
        )
      )
    }
  }

  const clear = () => {
    setMessages([])
    conversationIdRef.current = null
  }

  return { messages, submit, clear, isPending }
}
