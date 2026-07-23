'use client'

import { useEffect, useRef } from 'react'
import { PanelTopOpen, SparklesIcon } from 'lucide-react'
import { useRouter, usePathname } from 'next/navigation'
import { useChatPanel } from '@/components/chat-sidebar/panel-context'
import { useChatContext } from './chat-context'
import { ChatInput, MessageList, SuggestionCards } from './chat-ui'

export function ChatPageClient() {
  const { messages, submit, clear, isPending } = useChatContext()
  const { open } = useChatPanel()
  const router = useRouter()
  const pathname = usePathname()
  const containerRef = useRef<HTMLDivElement>(null)
  const lastAnswerRef = useRef<HTMLDivElement>(null)
  const wasPendingRef = useRef(false)

  // Prevent the window from scrolling to the footer while chat is open
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    if (isPending) {
      el.scrollTop = el.scrollHeight
    } else if (wasPendingRef.current && !isPending) {
      // Scroll within container to the top of the last answer (no window scroll)
      if (lastAnswerRef.current) {
        const offset = lastAnswerRef.current.offsetTop - 16
        el.scrollTo({ top: offset, behavior: 'smooth' })
      }
    }

    wasPendingRef.current = isPending
  }, [messages, isPending])

  const collapseToSidebar = () => {
    open()
    router.back()
  }

  return (
    <div className="flex flex-col h-[calc(100dvh-4rem)] overflow-hidden">
      {/* Controls row */}
      <div className="shrink-0 flex items-center px-6 pt-3 pb-2 max-w-3xl w-full mx-auto">
        {!pathname.startsWith('/chat') && (
          <button
            onClick={collapseToSidebar}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Collapse to sidebar"
          >
            <PanelTopOpen size={13} />
            Minimize
          </button>
        )}
      </div>

      {/* Messages */}
      <div ref={containerRef} className="relative flex-1 overflow-y-auto" style={{ minHeight: 0 }}>
        {messages.length === 0 ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 px-6 text-center">
            <SparklesIcon />
            <h1 className="text-4xl font-light">Ask anything.</h1>
            <SuggestionCards onSelect={submit} />
          </div>
        ) : (
          <div className="max-w-3xl mx-auto px-6 pt-6 pb-6 space-y-6">
            <MessageList messages={messages} lastAnswerRef={lastAnswerRef} />
          </div>
        )}
      </div>

      {/* Input — shrink-0 keeps it pinned at the bottom */}
      <div className="shrink-0 max-w-3xl w-full mx-auto">
        <ChatInput onSubmit={submit} isPending={isPending} autoFocus onClear={messages.length > 0 ? clear : undefined} />
      </div>
    </div>
  )
}
