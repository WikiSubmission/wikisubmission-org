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
vi.mock('next/navigation', () => ({
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
}))
