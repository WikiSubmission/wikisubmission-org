import '@/styles/globals.css'
import type { Metadata, Viewport } from 'next'
import Script from 'next/script'
import { Fonts } from '@/constants/fonts'
import { PALETTE_INIT_SCRIPT } from '@/lib/theme-palette-context'
import { MobileProviders } from '@/components/mobile-providers'
import { currentDaySeed } from '@/lib/zikr'

export const metadata: Metadata = {
  title: 'WikiSubmission',
  description: 'Quran: The Final Testament — read, search, and study.',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#F6F2EA' },
    { media: '(prefers-color-scheme: dark)', color: '#14110E' },
  ],
}

// The mobile root layout is intentionally server-light: locale, theme, and auth
// are all resolved on the client (there is no request context in a static
// export). It only sets up the document shell, fonts, and the pre-hydration
// palette script, then hands off to the client provider tree.
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  // Seed the "zikr of the day" here, on the server, so the value is serialized
  // into the payload and reused verbatim on the client. In the static export
  // this is the build day (rebuild to rotate); under SSR it is the request day.
  const dailySeed = currentDaySeed()
  return (
    <html lang="en" dir="ltr" suppressHydrationWarning>
      <head>
        {/* Runs before hydration so [data-palette] is on <html> for first paint. */}
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
        <MobileProviders dailySeed={dailySeed}>{children}</MobileProviders>
      </body>
    </html>
  )
}
