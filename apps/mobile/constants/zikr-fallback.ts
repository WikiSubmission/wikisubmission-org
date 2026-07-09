import type { ZikrItem } from '@/lib/zikr'

/**
 * Bundled zikr fallback: shown on first launch (before the backend list is
 * cached) and offline. Short remembrances of God, phrased consistently with
 * site copy; verse references in `source`.
 *
 * NOTE: content pending owner review — replace or extend via the admin
 * notifications page (zikr tab), which takes precedence once fetched.
 */
export const ZIKR_FALLBACK: ZikrItem[] = [
  { id: -1, text: 'In the remembrance of God the hearts rejoice', source: 'Quran 13:28' },
  { id: -2, text: 'There is no other god beside God', source: 'Quran 47:19' },
  { id: -3, text: 'God is the Most Gracious, the Most Merciful', source: 'Quran 1:3' },
  { id: -4, text: 'Praise be to God, Lord of the universe', source: 'Quran 1:2' },
  { id: -5, text: 'God is with those who lead a righteous life', source: 'Quran 16:128' },
  { id: -6, text: 'Remember Me, that I may remember you', source: 'Quran 2:152' },
  { id: -7, text: 'God is the Light of the heavens and the earth', source: 'Quran 24:35' },
  { id: -8, text: 'My Lord, increase my knowledge', source: 'Quran 20:114' },
  { id: -9, text: 'God is sufficient for me', source: 'Quran 9:129' },
  { id: -10, text: 'To God belongs everything in the heavens and the earth', source: 'Quran 2:284' },
  { id: -11, text: 'Whoever trusts in God, He suffices him', source: 'Quran 65:3' },
  { id: -12, text: 'God never burdens a soul beyond its means', source: 'Quran 2:286' },
]
