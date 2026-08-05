import { Geist_Mono, Amiri, Cormorant_Garamond, Source_Serif_4, JetBrains_Mono } from 'next/font/google'
import localFont from "next/font/local";

const glacial = localFont({
    src: "../public/font/GlacialIndifference-Regular.ttf",
    weight: '600',
    variable: '--font-glacial',
});

// Only weights actually rendered (single call site: web home-utilities).
// Loading 8 weights shipped 6 unused woff2 files with every page.
const geistMono = Geist_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
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
  geistMono,
  amiri,
  cormorant,
  sourceSerif,
  jetbrainsMono,
}
