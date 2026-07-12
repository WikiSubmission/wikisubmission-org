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
import { NativeInit } from '@/components/native-init'
import { MobileNotificationsBridge } from '@/components/mobile-notifications-bridge'
import { MobileOfflineSyncBridge } from '@/components/mobile-offline-sync-bridge'
import { MobileBundleAutoload } from '@/components/mobile-bundle-autoload'
import { MobileWordBundleAutoload } from '@/components/mobile-word-bundle-autoload'
import { NotificationPermissionPrompt } from '@/components/notification-permission-prompt'
import { StartupZikrOverlay } from '@/components/startup-zikr-overlay'
import { StartupZikrProvider } from '@/lib/startup-zikr-context'

/**
 * Client provider tree for the mobile app. This is the native counterpart to
 * apps/web/components/providers.tsx, but with next-auth's SessionProvider
 * replaced by MobileAuthProvider and no web-only chat/sign-in widgets.
 */
export function MobileProviders({
  dailySeed,
  children,
}: {
  /** Day seed from the server (root layout) for the deterministic daily zikr. */
  dailySeed: number
  children: React.ReactNode
}) {
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
                  <NativeInit />
                  <MobileNotificationsBridge />
                  <MobileOfflineSyncBridge />
                  {/* The startup overlay is a sibling of the shell: the zikr
                      flight hands off between them via a captured GSAP Flip
                      state (lib/zikr-flight.ts). The bundle autoloaders sit
                      inside the provider because they wait for the startup
                      phase to settle before doing catalog/manifest I/O. */}
                  <StartupZikrProvider dailySeed={dailySeed}>
                    <MobileBundleAutoload />
                    <MobileWordBundleAutoload />
                    <MobileShell>{children}</MobileShell>
                    <StartupZikrOverlay />
                    <NotificationPermissionPrompt />
                  </StartupZikrProvider>
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
