/**
 * Bible reader zoom — one scale that moves the column width.
 *
 * The Quran reader used to share this scale; it now splits text size and column
 * width into two settings (`lib/quran-typography.ts`). The Bible reader keeps the
 * single scale for now, so the type lives here rather than in the Quran module.
 */
export type ZoomLevel = 'compact' | 'normal' | 'comfortable' | 'wide' | 'full'

export const ZOOM_LEVELS: ZoomLevel[] = [
  'compact',
  'normal',
  'comfortable',
  'wide',
  'full',
]
