/**
 * Reader typography — text size and content width.
 *
 * These used to be a single `zoomLevel` scale where one step moved the font and
 * the column together, so a reader could not have large text in a narrow column
 * (or the reverse), and its widest step still capped the page at 1280px despite
 * being called "Full". They are two independent settings now.
 *
 * The defaults (`md` / `medium`) are matched to quran.com, measured on their
 * reader: 20px translation, ~25px Arabic, and a ~1020px text column.
 */

export type FontSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

/** Small → large. The mobile stepper and the settings +/- buttons walk this. */
export const FONT_SIZES: FontSize[] = ['xs', 'sm', 'md', 'lg', 'xl']

export const DEFAULT_FONT_SIZE: FontSize = 'md'

export type FontSizeClasses = {
  /** Primary translation text in verse/word mode. */
  translation: string
  /** Arabic text in verse/word mode (inline block or word-by-word). */
  arabic: string
  /** Translation prose in reading mode. */
  reading: string
  /** Arabic prose in reading mode. */
  readingArabic: string
}

/** Font-size classes per step. `md` is the quran.com-matched default. */
export const FONT_SIZE_CLASS: Record<FontSize, FontSizeClasses> = {
  xs: {
    translation: 'text-base',
    arabic: 'text-[21px]',
    reading: 'text-[15px]',
    readingArabic: 'text-[21px]',
  },
  sm: {
    translation: 'text-lg',
    arabic: 'text-[23px]',
    reading: 'text-base',
    readingArabic: 'text-[23px]',
  },
  md: {
    translation: 'text-xl',
    arabic: 'text-[26px]',
    reading: 'text-[18px]',
    readingArabic: 'text-[26px]',
  },
  lg: {
    translation: 'text-2xl',
    arabic: 'text-[31px]',
    reading: 'text-[21px]',
    readingArabic: 'text-[31px]',
  },
  xl: {
    translation: 'text-[28px]',
    arabic: 'text-[37px]',
    reading: 'text-2xl',
    readingArabic: 'text-[37px]',
  },
}

export type ContentWidth = 'narrow' | 'medium' | 'wide' | 'full'

/** Narrow → full. */
export const CONTENT_WIDTHS: ContentWidth[] = ['narrow', 'medium', 'wide', 'full']

export const DEFAULT_CONTENT_WIDTH: ContentWidth = 'medium'

/**
 * Tailwind max-width class for the outer content container.
 *
 * `full` is genuinely full-bleed (only the container's own horizontal padding
 * holds the text off the edge) — it is the one step that has no pixel cap.
 */
export const CONTENT_WIDTH_CLASS: Record<ContentWidth, string> = {
  narrow: 'max-w-3xl', // 768px
  medium: 'max-w-5xl', // 1024px — quran.com's column
  wide: 'max-w-7xl', // 1280px
  full: 'max-w-none',
}

/**
 * Pixel sizes behind `FONT_SIZE_CLASS`, for the settings panel's preview line —
 * it renders a sample at the real size, which Tailwind classes can't do inline.
 */
export const FONT_SIZE_PX: Record<FontSize, { translation: number; arabic: number }> = {
  xs: { translation: 16, arabic: 21 },
  sm: { translation: 18, arabic: 23 },
  md: { translation: 20, arabic: 26 },
  lg: { translation: 24, arabic: 31 },
  xl: { translation: 28, arabic: 37 },
}
