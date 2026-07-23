'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { SessionProvider } from 'next-auth/react'
import type { Session } from 'next-auth'
import { useState } from 'react'
import { ChatPanelProvider } from '@/components/chat-sidebar/panel-context'
import { ChatSidebar } from '@/components/chat-sidebar/chat-sidebar'
import { ChatProvider } from '@/components/chat/chat-context'
import { SignInPrompt } from '@/components/sign-in-prompt'
import { ScriptureAuthBridge } from '@/components/scripture-auth-bridge'
import { QuranPlayerProvider } from '@/lib/quran-audio-context'
import { NavigationReferrerTracker } from '@/components/navigation-referrer-tracker'
import { OfflineSyncBridge } from '@/components/offline-sync-bridge'
import { OfflineSyncStatus } from '@/components/offline-sync-status'
import { registerWebApiAuth } from '@/lib/register-api-auth'
import { registerWebOfflineStore } from '@/lib/register-offline'

// Wire the shared browser API client to next-auth's session on the client.
registerWebApiAuth()
// Make installed offline bundles available to the shared reader/search hooks.
registerWebOfflineStore()

export default function Providers({
  children,
  session,
}: {
  children: React.ReactNode
  // Hydrated from the server (root layout) so useSession() starts in the correct
  // authenticated/unauthenticated state on first render — no signed-out → signed-in
  // flash while the client fetches /api/auth/session.
  session: Session | null
}) {
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
    <SessionProvider session={session}>
      <QueryClientProvider client={queryClient}>
        <ScriptureAuthBridge>
          <QuranPlayerProvider>
            <ChatPanelProvider>
              <ChatProvider>
                <NavigationReferrerTracker />
                <OfflineSyncBridge />
                <OfflineSyncStatus />
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
