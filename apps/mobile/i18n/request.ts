import { getRequestConfig } from 'next-intl/server'

// Static export has no request context (no cookies/headers), so the build-time
// render always uses English. The real, user-selected locale is applied on the
// client by IntlProvider (app/intl-provider.tsx), which reads the stored
// preference and swaps messages without a server round-trip.
export default getRequestConfig(async () => {
  const locale = 'en'
  return {
    locale,
    messages: (await import(`@/messages/${locale}.json`)).default,
  }
})
