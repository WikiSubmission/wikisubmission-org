export type ZoomLevel = 'compact' | 'normal' | 'comfortable' | 'wide' | 'full'

export const ZOOM_LEVELS: ZoomLevel[] = [
  'compact',
  'normal',
  'comfortable',
  'wide',
  'full',
]

/** Tailwind max-width class for the outer content container at each zoom level. */
export const ZOOM_WIDTH_CLASS: Record<ZoomLevel, string> = {
  compact: 'max-w-3xl',
  normal: 'max-w-4xl',
  comfortable: 'max-w-5xl',
  wide: 'max-w-6xl',
  full: 'max-w-7xl',
}

/**
 * Pixel equivalent of each zoom level's max-width — used by the virtualizer's
 * estimateSize to compute a content-width-aware words-per-row estimate.
 */
export const ZOOM_WIDTH_PX: Record<ZoomLevel, number> = {
  compact: 768,
  normal: 896,
  comfortable: 1024,
  wide: 1152,
  full: 1280,
}

/** Font-size Tailwind classes for each zoom level. */
export const ZOOM_FONT: Record<
  ZoomLevel,
  {
    /** Primary translation text in verse/word mode. */
    translation: string
    /** Arabic text in verse/word mode (inline block or word-by-word). */
    arabic: string
    /** Translation prose in reading mode. */
    reading: string
    /** Arabic prose in reading mode. */
    readingArabic: string
  }
> = {
  compact: {
    translation: 'text-base',
    arabic: 'text-xl',
    reading: 'text-sm',
    readingArabic: 'text-xl',
  },
  normal: {
    translation: 'text-lg',
    arabic: 'text-2xl',
    reading: 'text-base',
    readingArabic: 'text-2xl',
  },
  comfortable: {
    translation: 'text-xl',
    arabic: 'text-[27px]',
    reading: 'text-[18px]',
    readingArabic: 'text-[27px]',
  },
  wide: {
    translation: 'text-2xl',
    arabic: 'text-[32px]',
    reading: 'text-xl',
    readingArabic: 'text-[32px]',
  },
  full: {
    translation: 'text-[28px]',
    arabic: 'text-[38px]',
    reading: 'text-2xl',
    readingArabic: 'text-[38px]',
  },
}
