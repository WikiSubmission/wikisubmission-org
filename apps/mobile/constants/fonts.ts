import { Amiri, Cormorant_Garamond, Source_Serif_4, JetBrains_Mono } from 'next/font/google'
import localFont from 'next/font/local'

// Mobile-only font set. Shadows packages/shared/constants/fonts.ts (the
// "@/*" path checks apps/mobile first): the shared module also instantiates
// Geist Mono in 8 weights, which next/font would emit into this bundle even
// though nothing on mobile references it. Every family below is used by the
// shared globals (--font-arabic, --font-display/headline, --font-body,
// --font-ref/mono-ish, --font-glacial).
const glacial = localFont({
  src: '../../../packages/shared/public/font/GlacialIndifference-Regular.ttf',
  weight: '600',
  variable: '--font-glacial',
})

const amiri = Amiri({
  subsets: ['arabic'],
  weight: ['400', '700'],
  variable: '--font-amiri',
})

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  style: ['normal', 'italic'],
  variable: '--font-cormorant',
})

const sourceSerif = Source_Serif_4({
  subsets: ['latin'],
  weight: ['300', '400', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-source-serif',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-jetbrains',
})

export const Fonts = {
  glacial,
  amiri,
  cormorant,
  sourceSerif,
  jetbrainsMono,
}
