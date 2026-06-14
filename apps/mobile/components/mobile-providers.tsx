'use client'

import { useState } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ThemeProvider } from '@/components/theme-provider'
import { Toaster } from '@/components/ui/sonner'
import { PaletteProvider } from '@/lib/theme-palette-context'
import { QuranPlayerProvider } from '@/lib/quran-audio-context'
import { IntlProvider } from '@/app/intl-provider'
import { MobileAuthProvider } from '@/components/mobile-auth-context'
import { MobileScriptureAuthBridge } from '@/components/mobile-scripture-auth-bridge'
import { MobileShell } from '@/components/mobile-shell'

/**
 * Client provider tree for the mobile app. This is the native counterpart to
 * apps/web/components/providers.tsx, but with next-auth's SessionProvider
 * replaced by MobileAuthProvider and no web-only chat/sign-in widgets.
 */
export function MobileProviders({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
          },
        },
      }),
  )

  return (
    <IntlProvider>
      <ThemeProvider attribute="class" defaultTheme="system" disableTransitionOnChange>
        <PaletteProvider>
          <QueryClientProvider client={queryClient}>
            <MobileAuthProvider>
              <MobileScriptureAuthBridge>
                <QuranPlayerProvider>
                  <MobileShell>{children}</MobileShell>
                  <Toaster />
                </QuranPlayerProvider>
              </MobileScriptureAuthBridge>
            </MobileAuthProvider>
          </QueryClientProvider>
        </PaletteProvider>
      </ThemeProvider>
    </IntlProvider>
  )
}
