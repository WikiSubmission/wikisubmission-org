import '@testing-library/jest-dom'
import { vi } from 'vitest'

// next-intl: return the key as-is so component tests are locale-agnostic
vi.mock('next-intl', () => ({
  useTranslations: () => (key: string, values?: Record<string, unknown>) => {
    if (!values) return key
    return Object.entries(values).reduce(
      (s, [k, v]) => s.replace(`{${k}}`, String(v)),
      key
    )
  },
  getTranslations: async () => (key: string) => key,
  useLocale: () => 'en',
  useFormatter: () => ({ dateTime: (d: Date) => d.toISOString() }),
}))

// next/navigation
vi.mock('next/navigation', async () => {
  // Real implementation: it is an instanceof check against the error class the
  // router throws on a client/server build mismatch, so a stub would make
  // call-admin-action's skew branch untestable.
  const { unstable_isUnrecognizedActionError } = await import(
    'next/dist/client/components/unrecognized-action-error'
  )

  return {
    useRouter: () => ({
      push: vi.fn(),
      replace: vi.fn(),
      refresh: vi.fn(),
      back: vi.fn(),
      prefetch: vi.fn(),
    }),
    usePathname: () => '/',
    useSearchParams: () => new URLSearchParams(),
    useParams: () => ({}),
    unstable_isUnrecognizedActionError,
  }
})
