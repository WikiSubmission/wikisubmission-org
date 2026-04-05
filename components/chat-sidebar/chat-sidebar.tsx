'use client'

import { useEffect, useRef } from 'react'
import { X, Maximize2, SparklesIcon } from 'lucide-react'
import Image from 'next/image'
import { useRouter, usePathname } from 'next/navigation'
import { useChatPanel } from './panel-context'
import { useChatContext } from '@/components/chat/chat-context'
import { ChatInput, MessageList, SuggestionCards } from '@/components/chat/chat-ui'

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
        Submission AI
      </button>
      <button
        onClick={onClose}
        className="flex items-center text-muted-foreground hover:text-foreground transition-colors"
        aria-label="Dismiss"
      >
        <X size={13} />
      </button>
    </div>
  )
}

// ── Sidebar ────────────────────────────────────────────────────────────────────

export function ChatSidebar() {
  const { state, open, close, minimize } = useChatPanel()
  const { messages, submit, clear, isPending } = useChatContext()
  const bottomRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const pathname = usePathname()
  const isOpen = state === 'open'
  const isOnAskPage = pathname === '/chat'

  // Minimize sidebar when navigating to /ask so it doesn't overlay the page
  useEffect(() => {
    if (isOnAskPage && state === 'open') minimize()
  }, [isOnAskPage, state, minimize])

  useEffect(() => {
    if (isOpen) bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isOpen])

  useEffect(() => {
    const fn = (e: globalThis.KeyboardEvent) => { if (e.key === 'Escape' && isOpen) minimize() }
    document.addEventListener('keydown', fn)
    return () => document.removeEventListener('keydown', fn)
  }, [isOpen, minimize])

  // Don't render anything while on the /ask page — the page IS the chat view
  if (isOnAskPage) return null

  if (state === 'minimized') return <MinimizedPill onOpen={open} onClose={close} />

  const expandToPage = () => {
    minimize()
    router.push('/chat')
  }

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

      {/* Panel */}
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
          <div className="flex items-center gap-0.5">
            <button
              onClick={expandToPage}
              className="size-8 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
              aria-label="Open full page"
            >
              <Maximize2 size={14} />
            </button>
            <button
              onClick={minimize}
              className="size-8 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
              aria-label="Close"
            >
              <X size={15} />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="relative flex-1 overflow-y-auto" style={{ minHeight: 0 }}>
          {messages.length === 0 ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-4 text-center">
              <SparklesIcon size={18} className="text-muted-foreground/40" />
              <p className="text-sm font-medium text-muted-foreground/70">Ask anything.</p>
              <SuggestionCards onSelect={submit} />
            </div>
          ) : (
            <div className="px-4 py-5 space-y-6">
              <MessageList messages={messages} onNavigate={minimize} />
              <div ref={bottomRef} />
            </div>
          )}
        </div>

        {/* Input */}
        <ChatInput onSubmit={submit} isPending={isPending} onClear={messages.length > 0 ? clear : undefined} />
      </aside>
    </>
  )
}
