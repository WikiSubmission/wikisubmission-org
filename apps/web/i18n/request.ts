import { getRequestConfig } from 'next-intl/server'
import { cookies } from 'next/headers'
import { mergeMessages, type MessageCatalog } from '@/lib/merge-messages'
import { onIntlError } from '@/lib/intl-error'
import { DEFAULT_UI_LOCALE, resolveUiLocale } from '@/constants/ui-locales'

import en from '@/messages/en.json'

/**
 * Load a translated catalog layered over English. next-intl resolves a key
 * against exactly one catalog, so a key present in en.json but not yet in the
 * target locale would render as its literal dotted path. Merging fixes that at
 * the source, covering both the server render and the client provider.
 *
 * A locale cookie pointing at a catalog that does not exist falls back to
 * English rather than throwing a module-not-found at request time.
 */
async function loadMessages(locale: string): Promise<MessageCatalog> {
  if (locale === 'en') return en as MessageCatalog
  try {
    const mod = (await import(`@/messages/${locale}.json`)) as { default: MessageCatalog }
    return mergeMessages(en as MessageCatalog, mod.default)
  } catch {
    return en as MessageCatalog
  }
}

export default getRequestConfig(async () => {
  const store = await cookies()
  // resolveUiLocale follows retired codes (a `ku` cookie predates the Kurdish
  // split and means Sorani) and rejects anything unknown, so a stale or
  // hand-edited cookie cannot reach the dynamic import below.
  const locale = resolveUiLocale(store.get('locale')?.value) ?? DEFAULT_UI_LOCALE

  return {
    locale,
    messages: await loadMessages(locale),
    onError: onIntlError,
  }
})
