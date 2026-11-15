import '@/styles/globals.css'
import type { Metadata } from 'next'
import Script from 'next/script'
import { Fonts } from '@/constants/fonts'
import { PALETTE_INIT_SCRIPT } from '@/lib/theme-palette-context'
import { DesktopProviders } from '@/components/desktop-providers'

export const metadata: Metadata = {
  title: 'WikiSubmission',
  description: 'Quran: The Final Testament. Read, search, and study offline.',
}

// Server-light on purpose: there is no request context in a static export, so
// locale, theme and data are all resolved on the client.
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" dir="ltr" suppressHydrationWarning>
      <head>
        {/* Runs before hydration so [data-palette] is set for first paint. */}
        <Script
          id="palette-init"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: PALETTE_INIT_SCRIPT }}
        />
      </head>
      <body
        className={`${Fonts.amiri.variable} ${Fonts.cormorant.variable} ${Fonts.sourceSerif.variable} ${Fonts.jetbrainsMono.variable} ${Fonts.glacial.variable} antialiased wrap-break-words`}
        suppressHydrationWarning
      >
        <DesktopProviders>{children}</DesktopProviders>
      </body>
    </html>
  )
}
