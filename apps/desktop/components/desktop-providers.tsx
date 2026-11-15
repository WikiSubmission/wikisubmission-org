'use client'

import { useState } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ThemeProvider } from '@/components/theme-provider'
import { Toaster } from '@/components/ui/sonner'
import { PaletteProvider } from '@/lib/theme-palette-context'
import { QuranPlayerProvider } from '@/lib/quran-audio-context'
import { ScriptureAuthProvider } from '@/lib/scripture-auth-context'
import { PointerEventsRecovery } from '@/components/pointer-events-recovery'
import { IntlProvider } from '@/app/intl-provider'
import { registerDesktopLinks } from '@/lib/desktop-links'

registerDesktopLinks()

// The desktop app has exactly one user, signed in for good: the shell adds the
// local user's token to every proxied API request. Reader components that
// gate features behind sign-in therefore always see a signed-in user, and the
// sign-in prompt is never needed.
const LOCAL_USER = { isSignedIn: true, promptSignIn: () => {} }

/**
 * Client provider tree for the desktop app: the web app's providers without
 * next-auth, chat, the command menu or offline sync, since the local backend
 * is always reachable.
 */
export function DesktopProviders({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            // The backend is local; a failure is not a flaky network.
            retry: 1,
          },
        },
      }),
  )

  return (
    <IntlProvider>
      <ThemeProvider attribute="class" defaultTheme="system" disableTransitionOnChange>
        <PaletteProvider>
          <QueryClientProvider client={queryClient}>
            <ScriptureAuthProvider value={LOCAL_USER}>
              <QuranPlayerProvider>
                <PointerEventsRecovery />
                {children}
                <Toaster />
              </QuranPlayerProvider>
            </ScriptureAuthProvider>
          </QueryClientProvider>
        </PaletteProvider>
      </ThemeProvider>
    </IntlProvider>
  )
}
