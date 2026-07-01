'use client'

import dynamic from 'next/dynamic'

export const AblutionSlideshow = dynamic(
  () => import('./ablution-slideshow').then((m) => ({ default: m.AblutionSlideshow })),
)

export const PrayerDemos = dynamic(
  () => import('./prayer-demos').then((m) => ({ default: m.PrayerDemos })),
)

export const FatihaAudio = dynamic(
  () => import('./fatiha-audio').then((m) => ({ default: m.FatihaAudio })),
)

export const AzaanCard = dynamic(
  () => import('./azaan-card').then((m) => ({ default: m.AzaanCard })),
)

export const MiniPrayerTimes = dynamic(
  () => import('./mini-prayer-times').then((m) => ({ default: m.MiniPrayerTimes })),
)
