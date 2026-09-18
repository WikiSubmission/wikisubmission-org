export type ReadingTypeSize = 's' | 'm' | 'l'
export type ReadingMeasure = 'normal' | 'wide'
export type ReadingAlignment = 'start' | 'justify'

export interface ReadingSettings {
  size: ReadingTypeSize
  measure: ReadingMeasure
  align: ReadingAlignment
}

export const READING_SETTINGS_STORAGE_KEY = 'ws:blog-reading-settings'

export const DEFAULT_READING_SETTINGS: ReadingSettings = {
  size: 'm',
  measure: 'normal',
  align: 'start',
}

export const READING_SIZE_OPTIONS: ReadonlyArray<{ value: ReadingTypeSize; label: string }> = [
  { value: 's', label: 'Small' },
  { value: 'm', label: 'Medium' },
  { value: 'l', label: 'Large' },
]

export const READING_MEASURE_OPTIONS: ReadonlyArray<{ value: ReadingMeasure; label: string }> = [
  { value: 'normal', label: 'Normal' },
  { value: 'wide', label: 'Wide' },
]

export const READING_ALIGN_OPTIONS: ReadonlyArray<{ value: ReadingAlignment; label: string }> = [
  { value: 'start', label: 'Ragged' },
  { value: 'justify', label: 'Justified' },
]

const DEFAULT_SNAPSHOT = JSON.stringify(DEFAULT_READING_SETTINGS)

export function parseReadingSettings(raw: string | null): ReadingSettings {
  if (!raw) return DEFAULT_READING_SETTINGS

  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch {
    return DEFAULT_READING_SETTINGS
  }

  if (typeof parsed !== 'object' || parsed === null) return DEFAULT_READING_SETTINGS
  const candidate = parsed as Partial<Record<keyof ReadingSettings, unknown>>

  return {
    size: READING_SIZE_OPTIONS.some((o) => o.value === candidate.size)
      ? (candidate.size as ReadingTypeSize)
      : DEFAULT_READING_SETTINGS.size,
    measure: READING_MEASURE_OPTIONS.some((o) => o.value === candidate.measure)
      ? (candidate.measure as ReadingMeasure)
      : DEFAULT_READING_SETTINGS.measure,
    align: READING_ALIGN_OPTIONS.some((o) => o.value === candidate.align)
      ? (candidate.align as ReadingAlignment)
      : DEFAULT_READING_SETTINGS.align,
  }
}

const CHANGE_EVENT = 'ws:blog-reading-change'

export const readingSettingsStore = {
  subscribe(onChange: () => void): () => void {
    if (typeof window === 'undefined') return () => {}
    window.addEventListener(CHANGE_EVENT, onChange)
    window.addEventListener('storage', onChange)

    return () => {
      window.removeEventListener(CHANGE_EVENT, onChange)
      window.removeEventListener('storage', onChange)
    }
  },

  getSnapshot(): string {
    if (typeof window === 'undefined') return DEFAULT_SNAPSHOT
    try {
      return window.localStorage.getItem(READING_SETTINGS_STORAGE_KEY) ?? DEFAULT_SNAPSHOT
    } catch {
      return DEFAULT_SNAPSHOT
    }
  },

  getServerSnapshot(): string {
    return DEFAULT_SNAPSHOT
  },

  write(settings: ReadingSettings): void {
    if (typeof window === 'undefined') return
    try {
      window.localStorage.setItem(READING_SETTINGS_STORAGE_KEY, JSON.stringify(settings))
      window.dispatchEvent(new Event(CHANGE_EVENT))
    } catch {}
  },
}
