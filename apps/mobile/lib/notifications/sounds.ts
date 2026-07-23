/**
 * Prayer notification sound options. Android channel sounds are immutable
 * after channel creation, so every selectable sound maps to its own channel
 * id; picking a sound means scheduling on that channel.
 *
 * `rawResource` is the file in android/app/src/main/res/raw/ (names must be
 * lowercase a-z0-9_). `previewUrl` is the same audio shipped in public/audio/
 * for in-app preview playback in the webview.
 */

export type PrayerSoundId = 'default' | 'adhan_alafasy' | 'adhan_omar_hisham'

export interface PrayerSoundOption {
  id: PrayerSoundId
  label: string
  description: string
  channelId: string
  rawResource?: string
  previewUrl?: string
}

export const PRAYER_SOUNDS: Record<PrayerSoundId, PrayerSoundOption> = {
  default: {
    id: 'default',
    label: 'System default',
    description: "Your device's standard notification sound",
    channelId: 'prayer-times',
  },
  adhan_alafasy: {
    id: 'adhan_alafasy',
    label: 'Adhan — Alafasy',
    description: 'Call to prayer recited by Mishary Alafasy',
    channelId: 'prayer-adhan-alafasy',
    rawResource: 'adhan_alafasy.mp3',
    previewUrl: '/audio/adhan_alafasy.mp3',
  },
  adhan_omar_hisham: {
    id: 'adhan_omar_hisham',
    label: 'Adhan — Omar Hisham',
    description: 'Call to prayer recited by Omar Hisham Al Arabi',
    channelId: 'prayer-adhan-omar-hisham',
    rawResource: 'adhan_omar_hisham.mp3',
    previewUrl: '/audio/adhan_omar_hisham.mp3',
  },
}

export const PRAYER_SOUND_ORDER: PrayerSoundId[] = [
  'default',
  'adhan_alafasy',
  'adhan_omar_hisham',
]

export function isPrayerSoundId(value: unknown): value is PrayerSoundId {
  return typeof value === 'string' && value in PRAYER_SOUNDS
}
