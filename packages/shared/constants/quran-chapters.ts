/** Transliterated Arabic chapter names. Index 0 = chapter 1. */
export const CHAPTER_TRANSLITERATIONS: readonly string[] = [
  'Al-Fatiha', 'Al-Baqara', 'Al-Imran', 'An-Nisa', 'Al-Maida',
  'Al-Anam', 'Al-Araf', 'Al-Anfal', 'At-Tawba', 'Yunus',
  'Hud', 'Yusuf', 'Ar-Rad', 'Ibrahim', 'Al-Hijr',
  'An-Nahl', 'Al-Isra', 'Al-Kahf', 'Maryam', 'Ta-Ha',
  'Al-Anbiya', 'Al-Hajj', 'Al-Muminun', 'An-Nur', 'Al-Furqan',
  'Ash-Shuara', 'An-Naml', 'Al-Qasas', 'Al-Ankabut', 'Ar-Rum',
  'Luqman', 'As-Sajda', 'Al-Ahzab', 'Saba', 'Fatir',
  'Ya-Sin', 'As-Saffat', 'Sad', 'Az-Zumar', 'Ghafir',
  'Fussilat', 'Ash-Shura', 'Az-Zukhruf', 'Ad-Dukhan', 'Al-Jathiya',
  'Al-Ahqaf', 'Muhammad', 'Al-Fath', 'Al-Hujurat', 'Qaf',
  'Adh-Dhariyat', 'At-Tur', 'An-Najm', 'Al-Qamar', 'Ar-Rahman',
  'Al-Waqia', 'Al-Hadid', 'Al-Mujadila', 'Al-Hashr', 'Al-Mumtahina',
  'As-Saf', 'Al-Jumua', 'Al-Munafiqun', 'At-Taghabun', 'At-Talaq',
  'At-Tahrim', 'Al-Mulk', 'Al-Qalam', 'Al-Haqqa', 'Al-Maarij',
  'Nuh', 'Al-Jinn', 'Al-Muzzammil', 'Al-Muddaththir', 'Al-Qiyama',
  'Al-Insan', 'Al-Mursalat', 'An-Naba', 'An-Naziat', 'Abasa',
  'At-Takwir', 'Al-Infitar', 'Al-Mutaffifin', 'Al-Inshiqaq', 'Al-Buruj',
  'At-Tariq', 'Al-Ala', 'Al-Ghashiya', 'Al-Fajr', 'Al-Balad',
  'Ash-Shams', 'Al-Layl', 'Ad-Duha', 'Ash-Sharh', 'At-Tin',
  'Al-Alaq', 'Al-Qadr', 'Al-Bayyina', 'Az-Zalzala', 'Al-Adiyat',
  'Al-Qaria', 'At-Takathur', 'Al-Asr', 'Al-Humaza', 'Al-Fil',
  'Quraysh', 'Al-Maun', 'Al-Kawthar', 'Al-Kafirun', 'An-Nasr',
  'Al-Masad', 'Al-Ikhlas', 'Al-Falaq', 'An-Nas',
] as const

/** Verse counts per chapter (immutable — this is the Quran). Index 0 = chapter 1. */
export const VERSE_COUNTS: readonly number[] = [
  7, 286, 200, 176, 120, 165, 206, 75, 127, 109, 123, 111, 43, 52, 99, 128,
  111, 110, 98, 135, 112, 78, 118, 64, 77, 227, 93, 88, 69, 60, 34, 30, 73,
  54, 45, 83, 182, 88, 75, 85, 54, 53, 89, 59, 37, 35, 38, 29, 18, 45, 60,
  49, 62, 55, 78, 96, 29, 22, 24, 13, 14, 11, 11, 18, 12, 12, 30, 52, 52,
  44, 28, 28, 20, 56, 40, 31, 50, 40, 46, 42, 29, 19, 36, 25, 22, 17, 19,
  26, 30, 20, 15, 21, 11, 8, 8, 19, 5, 8, 8, 11, 11, 8, 3, 9, 5, 4, 7, 3,
  6, 3, 5, 4, 5, 6,
] as const

/** Returns { chapter, verse } for a cryptographically-seeded random verse. */
export function randomQuranRef(): { chapter: number; verse: number } {
  const chapter = Math.floor(Math.random() * 114) + 1
  const verseCount = VERSE_COUNTS[chapter - 1]
  const verse = Math.floor(Math.random() * verseCount) + 1
  return { chapter, verse }
}
