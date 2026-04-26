import './globals.css'
import { Fonts } from '@/constants/fonts'
import { Metadata } from '@/constants/metadata'
import { Toaster } from '@/components/ui/sonner'
import { ThemeProvider } from '@/components/theme-provider'
import { ScrollToTop } from '@/components/scroll-to-top'
import { GeometryDots } from '@/components/geometry-dots'
import Providers from '@/components/providers'
import type { Viewport } from 'next'
import { NextIntlClientProvider } from 'next-intl'
import { getLocale, getMessages } from 'next-intl/server'
import { ReactScanInit } from '@/components/react-scan-init'
import {
  PaletteProvider,
  PALETTE_INIT_SCRIPT,
} from '@/lib/theme-palette-context'

export const metadata = Metadata

const RTL_LOCALES = ['ar', 'fa', 'ur', 'ku']

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const locale = await getLocale()
  const messages = await getMessages()
  const dir = RTL_LOCALES.includes(locale) ? 'rtl' : 'ltr'

  return (
    <html lang={locale} dir={dir} suppressHydrationWarning>
      <head>
        <script
          // Runs before hydration so [data-palette] is on <html> for the first paint.
          dangerouslySetInnerHTML={{ __html: PALETTE_INIT_SCRIPT }}
        />
      </head>
      <body
        className={`${Fonts.amiri.variable} ${Fonts.cormorant.variable} ${Fonts.sourceSerif.variable} ${Fonts.jetbrainsMono.variable} ${Fonts.glacial.variable} antialiased wrap-break-words`}
        suppressHydrationWarning
      >
        <NextIntlClientProvider locale={locale} messages={messages}>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            disableTransitionOnChange
          >
            <PaletteProvider>
              <Providers>
                <GeometryDots />
                {children}
                <ScrollToTop />
                <Toaster />
                {process.env.NODE_ENV === 'development' && <ReactScanInit />}
              </Providers>
            </PaletteProvider>
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}

// Prevent mobile browser zoom on input focus.
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}
