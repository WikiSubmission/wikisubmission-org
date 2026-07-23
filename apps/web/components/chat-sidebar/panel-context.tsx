'use client'

import { createContext, useContext, useState } from 'react'

type ChatPanelState = 'closed' | 'open' | 'minimized'

interface ChatPanelContextValue {
  state: ChatPanelState
  open: () => void
  close: () => void
  minimize: () => void
  toggle: () => void
}

const ChatPanelContext = createContext<ChatPanelContextValue>({
  state: 'closed',
  open: () => {},
  close: () => {},
  minimize: () => {},
  toggle: () => {},
})

export const useChatPanel = () => useContext(ChatPanelContext)

export function ChatPanelProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<ChatPanelState>('closed')
  return (
    <ChatPanelContext.Provider
      value={{
        state,
        open: () => setState('open'),
        close: () => setState('closed'),
        minimize: () => setState('minimized'),
        // navbar toggle: closed→open, open→minimized, minimized→open
        toggle: () => setState((s) => (s === 'open' ? 'minimized' : 'open')),
      }}
    >
      {children}
    </ChatPanelContext.Provider>
  )
}
