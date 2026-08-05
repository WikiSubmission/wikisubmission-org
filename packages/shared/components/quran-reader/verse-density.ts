/**
 * Verse-card layout density.
 *
 * 'sleek' (default) is the tighter layout: smaller verse pill, reduced
 * paddings and word gaps, 28px action buttons — more verses per screen.
 * Flip VERSE_CARD_DENSITY to 'classic' to restore the previous roomier
 * layout in one line if the sleek layout doesn't work out.
 */
const VERSE_CARD_DENSITY: 'sleek' | 'classic' = 'sleek'

type DensityTokens = {
  /** Verse body wrapper (padding + vertical rhythm). */
  body: string
  /** <hr> between verses — horizontal margins matching body padding. */
  divider: string
  /** Verse-key pill (padding + font size). */
  pill: string
  /** Square action buttons (bookmark, notes, play). */
  actionButton: string
  /** Copy split-button height/width fragments. */
  copyButtonHeight: string
  copyButtonWidth: string
  /** Wrapper around the word-by-word block inside VerseCard. */
  wbwWrap: string
  /** Word-by-word card grid (word mode). */
  wbwCards: string
  /** Single word card (word mode). */
  wbwCard: string
  /** Compact inline Arabic word row (verse mode with Arabic on). */
  wbwCompact: string
}

const SLEEK: DensityTokens = {
  body: 'px-4 py-3 sm:px-6 sm:py-3.5 space-y-1.5',
  divider: 'mx-4 sm:mx-6',
  pill: 'px-2 py-0.5 text-[13px]',
  actionButton: 'h-7 w-7',
  copyButtonHeight: 'h-7',
  copyButtonWidth: 'w-7',
  wbwWrap: 'py-1',
  wbwCards: 'gap-y-2 py-1.5',
  wbwCard: 'px-1.5 py-1.5 sm:px-3 sm:py-2',
  wbwCompact: 'gap-x-3.5 gap-y-4 py-1',
}

const CLASSIC: DensityTokens = {
  body: 'px-6 py-4 sm:px-8 sm:py-5 space-y-2',
  divider: 'mx-6 sm:mx-8',
  pill: 'px-2.5 py-0.5 text-lg',
  actionButton: 'h-8 w-8',
  copyButtonHeight: 'h-8',
  copyButtonWidth: 'w-8',
  wbwWrap: 'py-2',
  wbwCards: 'gap-y-3 py-3',
  wbwCard: 'px-1.5 py-2 sm:px-3.5 sm:py-2.5',
  wbwCompact: 'gap-x-4 gap-y-6 py-2',
}

export const DENSITY: DensityTokens =
  VERSE_CARD_DENSITY === 'sleek' ? SLEEK : CLASSIC
