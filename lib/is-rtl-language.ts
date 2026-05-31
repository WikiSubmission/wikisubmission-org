export function isRtlLanguage(language: string) {
  return ['arabic', 'urdu', 'persian', 'arabic_clean'].includes(language)
}

export function isRtlLocale(locale: string) {
  return ['ar', 'ac', 'fa', 'ur'].includes(locale)
}
