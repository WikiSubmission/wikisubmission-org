'use client'

import { createContext, useContext, type ReactNode } from 'react'
import { useChat, type Message } from './use-chat'

interface ChatContextValue {
  messages: Message[]
  submit: (q: string) => Promise<void>
  clear: () => void
  isPending: boolean
}

const ChatContext = createContext<ChatContextValue>({
  messages: [],
  submit: async () => {},
  clear: () => {},
  isPending: false,
})

export const useChatContext = () => useContext(ChatContext)

export function ChatProvider({ children }: { children: ReactNode }) {
  const chat = useChat()
  return <ChatContext.Provider value={chat}>{children}</ChatContext.Provider>
}
