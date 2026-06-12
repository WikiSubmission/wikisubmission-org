export type ContactPrayerVideo = {
  id: string
  title: string
  units: string
  subtitle: string
  description: string
  youtubeId: string
  videoSrc?: string
  thumbnail?: string
  youtubeStart?: number
  youtubeEnd?: number
}

export const PRAYER_DEMO_VIDEOS: ContactPrayerVideo[] = [
  {
    id: 'dawn-prayer',
    title: 'Dawn Prayer',
    units: '2 Units',
    subtitle: 'Full Demonstration',
    description: 'A full demonstration of the two-unit dawn Contact Prayer.',
    youtubeId: 'VQHbZZqWC1k',
    thumbnail: '/images/thumbnails/morning-thumb.jpg',
  },
  {
    id: 'four-unit-prayer',
    title: 'Noon, Afternoon, Night',
    units: '4 Units',
    subtitle: 'Identical Structure',
    description: 'A demonstration of the shared four-unit prayer structure.',
    youtubeId: '3NZajxWT2Ok',
    thumbnail: '/images/thumbnails/four-unit-thumb.jpg',
  },
  {
    id: 'sunset-prayer',
    title: 'Sunset Prayer',
    units: '3 Units',
    subtitle: 'Full Demonstration',
    description: 'A full demonstration of the three-unit sunset Contact Prayer.',
    youtubeId: 'aK2KY8wYJ9E',
    thumbnail: '/images/thumbnails/sunset-thumb.jpg',
  },
]

export const SUPPORTING_CONTACT_PRAYER_VIDEOS: ContactPrayerVideo[] = [
  {
    id: 'ablution-guide',
    title: 'Ablution Guide',
    units: 'Preparation',
    subtitle: 'Visual Demonstration',
    description: 'A guide to the Quranic four-step ablution before Contact Prayer.',
    youtubeId: 'Y8QnnhDGgtw',
  },
  {
    id: 'azaan-guide',
    title: 'Azaan',
    units: 'Call to Prayer',
    subtitle: 'The Call to Prayer',
    description: 'A guide to the original call to prayer without additions.',
    youtubeId: 'Pulv7-MY18E',
  },
  {
    id: 'group-prayer',
    title: 'The Group Prayer',
    units: 'Example',
    subtitle: 'Dr. Rashad Khalifa',
    description: 'An explanation of group prayer and how followers observe behind the imam.',
    youtubeId: 'tbxOH3KNOvA',
    youtubeStart: 4339,
    youtubeEnd: 4443,
  },
  {
    id: 'fatiha-recitation',
    title: 'Al-Fatiha',
    units: 'Recitation',
    subtitle: 'Full Recitation Tutorial',
    description: 'A recitation tutorial for The Key, Al-Fatiha.',
    youtubeId: 'GA7M9qfpNUQ',
  },
]

export const CONTACT_PRAYER_VIDEOS = [
  ...PRAYER_DEMO_VIDEOS,
  ...SUPPORTING_CONTACT_PRAYER_VIDEOS,
]
