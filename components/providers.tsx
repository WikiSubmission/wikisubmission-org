'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { SessionProvider } from 'next-auth/react'
import { useState } from 'react'
import { ChatPanelProvider } from '@/components/chat-sidebar/panel-context'
import { ChatSidebar } from '@/components/chat-sidebar/chat-sidebar'
import { ChatProvider } from '@/components/chat/chat-context'
import { SignInPrompt } from '@/components/sign-in-prompt'
import { QuranPlayerProvider } from '@/lib/quran-audio-context'

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
          },
        },
      })
  )

  return (
    <SessionProvider>
      <QueryClientProvider client={queryClient}>
        <QuranPlayerProvider>
          <ChatPanelProvider>
            <ChatProvider>
              {children}
              <ChatSidebar />
              <SignInPrompt />
            </ChatProvider>
          </ChatPanelProvider>
        </QuranPlayerProvider>
      </QueryClientProvider>
    </SessionProvider>
  )
}
