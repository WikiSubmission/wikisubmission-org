export interface WordToken {
  arabic: string
  transliteration: string
  english: string
  isGod?: boolean
}

export interface FeaturedVerseData {
  id: string
  label: string
  ref: string
  suraNumber: number
  verseNumber: number
  suraNameEn: string
  suraNameAr: string
  suraMeaning: string
  theme: string
  arabic: string
  translation: string
  highlightWords?: string[]
  words: WordToken[]
  audioUrl: string
}

export const FEATURED_VERSES: FeaturedVerseData[] = [
  {
    id: 'universal-salvation',
    label: '2:62',
    ref: 'Sura 2, Verse 62',
    suraNumber: 2,
    verseNumber: 62,
    suraNameEn: 'Al-Baqarah',
    suraNameAr: 'البقرة',
    suraMeaning: 'The Heifer',
    theme: 'Universal Salvation',
    arabic:
      'إِنَّ الَّذِينَ آمَنُوا وَالَّذِينَ هَادُوا وَالنَّصَارَىٰ وَالصَّابِئِينَ مَنْ آمَنَ بِاللَّهِ وَالْيَوْمِ الْآخِرِ وَعَمِلَ صَالِحًا فَلَهُمْ أَجْرُهُمْ عِندَ رَبِّهِمْ وَلَا خَوْفٌ عَلَيْهِمْ وَلَا هُمْ يَحْزَنُونَ',
    translation:
      'Surely, those who believe, those who are Jewish, the Christians, and the converts; anyone who (1) believes in GOD, and (2) believes in the Last Day, and (3) leads a righteous life, will receive their recompense from their Lord. They have nothing to fear, nor will they grieve.',
    highlightWords: ['GOD', 'Last Day', 'righteous life'],
    audioUrl: 'https://cdn.wikisubmission.org/media/quran-recitations/arabic-mishary/2-62.mp3',
    words: [
      { arabic: 'إِنَّ', transliteration: 'Inna', english: 'Indeed' },
      { arabic: 'الَّذِينَ', transliteration: 'alladheena', english: 'those who' },
      { arabic: 'آمَنُوا', transliteration: 'aamanu', english: 'believe' },
      { arabic: 'وَالَّذِينَ', transliteration: 'walladheena', english: 'and those who' },
      { arabic: 'هَادُوا', transliteration: 'haadu', english: 'are Jewish' },
      { arabic: 'وَالنَّصَارَىٰ', transliteration: 'wannaSaara', english: 'and the Christians' },
      { arabic: 'وَالصَّابِئِينَ', transliteration: 'waS-Saabi\'een', english: 'and the converts' },
      { arabic: 'مَنْ', transliteration: 'man', english: 'whoever' },
      { arabic: 'آمَنَ', transliteration: 'aamana', english: 'believes' },
      { arabic: 'بِاللَّهِ', transliteration: 'billaahi', english: 'in GOD', isGod: true },
      { arabic: 'وَالْيَوْمِ', transliteration: 'wal-yawmi', english: 'and the Day' },
      { arabic: 'الْآخِرِ', transliteration: 'al-aakhir', english: 'the Last' },
      { arabic: 'وَعَمِلَ', transliteration: 'wa \'amila', english: 'and works' },
      { arabic: 'صَالِحًا', transliteration: 'SaaliHan', english: 'righteousness' },
      { arabic: 'فَلَهُمْ', transliteration: 'falahum', english: 'for them' },
      { arabic: 'أَجْرُهُمْ', transliteration: 'ajruhum', english: 'their reward' },
      { arabic: 'عِندَ', transliteration: '\'inda', english: 'with' },
      { arabic: 'رَبِّهِمْ', transliteration: 'rabbihim', english: 'their Lord' },
      { arabic: 'وَلَا خَوْفٌ', transliteration: 'wa laa khawf', english: 'no fear' },
      { arabic: 'عَلَيْهِمْ', transliteration: '\'alayhim', english: 'upon them' },
      { arabic: 'وَلَا هُمْ', transliteration: 'wa laa hum', english: 'nor will they' },
      { arabic: 'يَحْزَنُونَ', transliteration: 'yaHzanoon', english: 'grieve' },
    ],
  },
  {
    id: 'god-alone',
    label: '39:45',
    ref: 'Sura 39, Verse 45',
    suraNumber: 39,
    verseNumber: 45,
    suraNameEn: 'Az-Zumar',
    suraNameAr: 'الزمر',
    suraMeaning: 'The Throngs',
    theme: 'God Alone',
    arabic:
      'وَإِذَا ذُكِرَ اللَّهُ وَحْدَهُ اشْمَأَزَّتْ قُلُوبُ الَّذِينَ لَا يُؤْمِنُونَ بِالْآخِرَةِ ۖ وَإِذَا ذُكِرَ الَّذِينَ مِن دُونِهِ إِذَا هُمْ يَسْتَبْشِرُونَ',
    translation:
      'When GOD ALONE is mentioned, the hearts of those who do not believe in the Hereafter shrink with aversion. But when others are mentioned alongside Him, they become satisfied.',
    highlightWords: ['GOD ALONE'],
    audioUrl: 'https://cdn.wikisubmission.org/media/quran-recitations/arabic-mishary/39-45.mp3',
    words: [
      { arabic: 'وَإِذَا', transliteration: 'Wa idhaa', english: 'And when' },
      { arabic: 'ذُكِرَ', transliteration: 'dhukira', english: 'is mentioned' },
      { arabic: 'اللَّهُ', transliteration: 'Allaahu', english: 'GOD', isGod: true },
      { arabic: 'وَحْدَهُ', transliteration: 'waHdahu', english: 'ALONE' },
      { arabic: 'اشْمَأَزَّتْ', transliteration: 'ishma\'azzat', english: 'shrink with aversion' },
      { arabic: 'قُلُوبُ', transliteration: 'quloobu', english: 'the hearts of' },
      { arabic: 'الَّذِينَ', transliteration: 'alladheena', english: 'those who' },
      { arabic: 'لَا يُؤْمِنُونَ', transliteration: 'laa yu\'minoon', english: 'do not believe' },
      { arabic: 'بِالْآخِرَةِ', transliteration: 'bil-aakhirati', english: 'in the Hereafter' },
      { arabic: 'وَإِذَا', transliteration: 'wa idhaa', english: 'and when' },
      { arabic: 'ذُكِرَ', transliteration: 'dhukira', english: 'are mentioned' },
      { arabic: 'الَّذِينَ', transliteration: 'alladheena', english: 'those' },
      { arabic: 'مِن دُونِهِ', transliteration: 'min doonihi', english: 'besides Him' },
      { arabic: 'إِذَا هُمْ', transliteration: 'idhaa hum', english: 'at once they' },
      { arabic: 'يَسْتَبْشِرُونَ', transliteration: 'yastabshiroon', english: 'rejoice' },
    ],
  },
  {
    id: 'ultimate-testimony',
    label: '3:18',
    ref: 'Sura 3, Verse 18',
    suraNumber: 3,
    verseNumber: 18,
    suraNameEn: 'Ali \'Imran',
    suraNameAr: 'آل عمران',
    suraMeaning: 'The Family of Imran',
    theme: 'The Testimony',
    arabic:
      'شَهِدَ اللَّهُ أَنَّهُ لَا إِلَٰهَ إِلَّا هُوَ وَالْمَلَائِكَةُ وَأُولُو الْعِلْمِ قَائِمًا بِالْقِسْطِ ۚ لَا إِلَٰهَ إِلَّا هُوَ الْعَزِيزُ الْحَكِيمُ',
    translation:
      'GOD bears witness that there is no god except He, and so do the angels and those who possess knowledge. Truthfully and equitably, He is the absolute god; there is no god but He, the Almighty, Most Wise.',
    highlightWords: ['GOD', 'no god except He', 'Most Wise'],
    audioUrl: 'https://cdn.wikisubmission.org/media/quran-recitations/arabic-mishary/3-18.mp3',
    words: [
      { arabic: 'شَهِدَ', transliteration: 'Shahida', english: 'Bears witness' },
      { arabic: 'اللَّهُ', transliteration: 'Allaahu', english: 'GOD', isGod: true },
      { arabic: 'أَنَّهُ', transliteration: 'annahu', english: 'that' },
      { arabic: 'لَا إِلَٰهَ', transliteration: 'laa ilaaha', english: 'there is no god' },
      { arabic: 'إِلَّا هُوَ', transliteration: 'illaa huwa', english: 'except He' },
      { arabic: 'وَالْمَلَائِكَةُ', transliteration: 'wal-malaa\'ikatu', english: 'and the angels' },
      { arabic: 'وَأُولُو الْعِلْمِ', transliteration: 'wa ulul-\'ilmi', english: 'and of knowledge' },
      { arabic: 'قَائِمًا', transliteration: 'qaa\'iman', english: 'upholding' },
      { arabic: 'بِالْقِسْطِ', transliteration: 'bil-qisTi', english: 'with justice' },
      { arabic: 'لَا إِلَٰهَ', transliteration: 'laa ilaaha', english: 'no god' },
      { arabic: 'إِلَّا هُوَ', transliteration: 'illaa huwa', english: 'except He' },
      { arabic: 'الْعَزِيزُ', transliteration: 'al-\'Azeezu', english: 'the Almighty' },
      { arabic: 'الْحَكِيمُ', transliteration: 'al-Hakeem', english: 'the Most Wise' },
    ],
  },
  {
    id: 'code-nineteen',
    label: '74:30',
    ref: 'Sura 74, Verse 30',
    suraNumber: 74,
    verseNumber: 30,
    suraNameEn: 'Al-Muddaththir',
    suraNameAr: 'المدثر',
    suraMeaning: 'The Hidden Secret',
    theme: 'Physical Miracle',
    arabic: 'عَلَيْهَا تِسْعَةَ عَشَرَ',
    translation:
      'Over it is nineteen. We appointed angels to be guardians of Hell, and we assigned their number to disturb the disbelievers, to convince the Christians and Jews, and to strengthen the faith of the faithful.',
    highlightWords: ['nineteen'],
    audioUrl: 'https://cdn.wikisubmission.org/media/quran-recitations/arabic-mishary/74-30.mp3',
    words: [
      { arabic: 'عَلَيْهَا', transliteration: '\'Alayhaa', english: 'Over it' },
      { arabic: 'تِسْعَةَ', transliteration: 'tis\'ata', english: 'nine' },
      { arabic: 'عَشَرَ', transliteration: '\'ashar', english: '-teen (19)' },
    ],
  },
]
