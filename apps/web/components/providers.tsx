'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { SessionProvider } from 'next-auth/react'
import { useState } from 'react'
import { ChatPanelProvider } from '@/components/chat-sidebar/panel-context'
import { ChatSidebar } from '@/components/chat-sidebar/chat-sidebar'
import { ChatProvider } from '@/components/chat/chat-context'
import { SignInPrompt } from '@/components/sign-in-prompt'
import { ScriptureAuthBridge } from '@/components/scripture-auth-bridge'
import { QuranPlayerProvider } from '@/lib/quran-audio-context'
import { NavigationReferrerTracker } from '@/components/navigation-referrer-tracker'
import { registerWebApiAuth } from '@/lib/register-api-auth'

// Wire the shared browser API client to next-auth's session on the client.
registerWebApiAuth()

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
        <ScriptureAuthBridge>
          <QuranPlayerProvider>
            <ChatPanelProvider>
              <ChatProvider>
                <NavigationReferrerTracker />
                {children}
                <ChatSidebar />
                <SignInPrompt />
              </ChatProvider>
            </ChatPanelProvider>
          </QuranPlayerProvider>
        </ScriptureAuthBridge>
      </QueryClientProvider>
    </SessionProvider>
  )
}
