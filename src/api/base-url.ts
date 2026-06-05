const trim = (value: string) => value.replace(/\/+$/, '')

export function resolveServerApiBaseUrl(): string {
  const base = process.env.INTERNAL_API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? ''
  return trim(base)
}

export function resolveBrowserApiBaseUrl(): string {
  return trim(process.env.NEXT_PUBLIC_BROWSER_API_URL ?? '/api/ws')
}
