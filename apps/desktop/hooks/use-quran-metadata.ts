'use client'

import { useQuery } from '@tanstack/react-query'
import { useLocale } from 'next-intl'
import { wsApi } from '@/src/api/client'
import { contentLangForUiLocale, DEFAULT_CONTENT_LANG } from '@/constants/ui-locales'
import type { components } from '@/src/api/types.gen'

export type Chapter = components['schemas']['Chapter']
export type Appendix = components['schemas']['Appendix']
export type Language = components['schemas']['Language']

// The content never changes while the app runs; refetching is pointless.
const FOREVER = { staleTime: Infinity, gcTime: Infinity } as const

/**
 * Client-side counterpart of apps/web/lib/quran-metadata.ts. Same rules: the UI
 * locale maps to a content language, and a failed request retries in English,
 * so a missing translation costs localized titles, never the page. An empty
 * list from a successful request is kept (some languages have no appendices).
 */
async function withEnglishFallback<T>(
  locale: string,
  fetchIn: (lang: string) => Promise<T[] | undefined>,
): Promise<T[]> {
  const lang = contentLangForUiLocale(locale)
  const first = await fetchIn(lang).catch(() => undefined)
  if (first) return first
  if (lang === DEFAULT_CONTENT_LANG) return []
  return (await fetchIn(DEFAULT_CONTENT_LANG).catch(() => undefined)) ?? []
}

export function useChapters() {
  const locale = useLocale()
  return useQuery({
    queryKey: ['desktop', 'chapters', contentLangForUiLocale(locale)],
    queryFn: () =>
      withEnglishFallback(locale, (lang) =>
        wsApi.GET('/chapters', { params: { query: { lang } } }).then((r) => r.data),
      ),
    ...FOREVER,
  })
}

export function useAppendices() {
  const locale = useLocale()
  return useQuery({
    queryKey: ['desktop', 'appendices', contentLangForUiLocale(locale)],
    queryFn: () =>
      withEnglishFallback(locale, (lang) =>
        wsApi.GET('/appendices', { params: { query: { lang } } }).then((r) => r.data),
      ),
    ...FOREVER,
  })
}

export function useLanguages() {
  return useQuery({
    queryKey: ['desktop', 'languages'],
    queryFn: () => wsApi.GET('/languages').then((r) => r.data ?? []),
    ...FOREVER,
  })
}
