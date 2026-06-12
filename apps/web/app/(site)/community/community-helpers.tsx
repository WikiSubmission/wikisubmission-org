import type { components } from '@/src/api/types.gen'

export type ApiCommunity = components['schemas']['Community']

// Wider regional taxonomy that fits the small filter pills (the UI uses
// `r.split(' ')[0]` so the first word is what shows on mobile).
const REGION_BY_COUNTRY: Record<string, string> = {
  // North America
  US: 'North America', CA: 'North America',
  // Latin America
  MX: 'Latin America', BR: 'Latin America', AR: 'Latin America',
  CL: 'Latin America', CO: 'Latin America', PE: 'Latin America',
  VE: 'Latin America', EC: 'Latin America', BO: 'Latin America',
  PY: 'Latin America', UY: 'Latin America', CR: 'Latin America',
  PA: 'Latin America', GT: 'Latin America', HN: 'Latin America',
  SV: 'Latin America', NI: 'Latin America', DO: 'Latin America',
  CU: 'Latin America', PR: 'Latin America',
  // Europe (incl. Türkiye to match existing copy)
  GB: 'Europe', DE: 'Europe', FR: 'Europe', IT: 'Europe', ES: 'Europe',
  NL: 'Europe', BE: 'Europe', PT: 'Europe', IE: 'Europe', SE: 'Europe',
  NO: 'Europe', DK: 'Europe', FI: 'Europe', IS: 'Europe', CH: 'Europe',
  AT: 'Europe', GR: 'Europe', CZ: 'Europe', PL: 'Europe', HU: 'Europe',
  RO: 'Europe', BG: 'Europe', HR: 'Europe', SI: 'Europe', SK: 'Europe',
  EE: 'Europe', LV: 'Europe', LT: 'Europe', RS: 'Europe', TR: 'Europe',
  UA: 'Europe', BA: 'Europe', AL: 'Europe', MK: 'Europe', ME: 'Europe',
  // Middle East & Africa
  SA: 'Middle East & Africa', AE: 'Middle East & Africa', EG: 'Middle East & Africa',
  JO: 'Middle East & Africa', LB: 'Middle East & Africa', IL: 'Middle East & Africa',
  PS: 'Middle East & Africa', IR: 'Middle East & Africa', IQ: 'Middle East & Africa',
  SY: 'Middle East & Africa', YE: 'Middle East & Africa', OM: 'Middle East & Africa',
  QA: 'Middle East & Africa', BH: 'Middle East & Africa', KW: 'Middle East & Africa',
  MA: 'Middle East & Africa', TN: 'Middle East & Africa', DZ: 'Middle East & Africa',
  LY: 'Middle East & Africa', SD: 'Middle East & Africa', NG: 'Middle East & Africa',
  KE: 'Middle East & Africa', ZA: 'Middle East & Africa', GH: 'Middle East & Africa',
  ET: 'Middle East & Africa', SN: 'Middle East & Africa', UG: 'Middle East & Africa',
  TZ: 'Middle East & Africa', CI: 'Middle East & Africa', CM: 'Middle East & Africa',
  RW: 'Middle East & Africa', ZM: 'Middle East & Africa', ZW: 'Middle East & Africa',
  // Asia & Oceania
  IN: 'Asia & Oceania', PK: 'Asia & Oceania', BD: 'Asia & Oceania',
  NP: 'Asia & Oceania', LK: 'Asia & Oceania', CN: 'Asia & Oceania',
  JP: 'Asia & Oceania', KR: 'Asia & Oceania', TW: 'Asia & Oceania',
  HK: 'Asia & Oceania', MY: 'Asia & Oceania', ID: 'Asia & Oceania',
  SG: 'Asia & Oceania', TH: 'Asia & Oceania', VN: 'Asia & Oceania',
  PH: 'Asia & Oceania', KH: 'Asia & Oceania', LA: 'Asia & Oceania',
  MM: 'Asia & Oceania', AU: 'Asia & Oceania', NZ: 'Asia & Oceania',
  FJ: 'Asia & Oceania',
}

export function regionFromCountry(code?: string): string {
  if (!code) return 'Other'
  return REGION_BY_COUNTRY[code.toUpperCase()] ?? 'Other'
}

export function countryName(code?: string): string {
  if (!code) return ''
  try {
    const dn = new Intl.DisplayNames(['en'], { type: 'region' })
    return dn.of(code.toUpperCase()) ?? code.toUpperCase()
  } catch {
    return code.toUpperCase()
  }
}

export type Platform = NonNullable<ApiCommunity['platform']>

export const PLATFORM_COLORS: Record<Platform, string> = {
  discord: '#5865F2',
  telegram: '#0088CC',
  whatsapp: '#25D366',
  facebook: '#1877F2',
  x: '#000000',
  youtube: '#FF0000',
  other: '#6B7280',
}

export const PLATFORM_LABELS: Record<Platform, string> = {
  discord: 'Discord',
  telegram: 'Telegram',
  whatsapp: 'WhatsApp',
  facebook: 'Facebook',
  x: 'X',
  youtube: 'YouTube',
  other: 'Online',
}

function IconDiscord() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.3 4.4A19.8 19.8 0 0 0 15.4 3l-.2.4a18 18 0 0 0-5.3 0L9.6 3a19.8 19.8 0 0 0-4.9 1.4C1.5 9.1.6 13.7 1 18.2a19.9 19.9 0 0 0 6 3l.5-.7a13.6 13.6 0 0 1-2.3-1.1l.6-.4a14 14 0 0 0 12.4 0l.6.4a13.6 13.6 0 0 1-2.3 1.1l.5.7a19.9 19.9 0 0 0 6-3c.5-5.2-.9-9.7-2.6-13.8ZM8.4 15.5c-1.2 0-2.2-1.1-2.2-2.4s1-2.4 2.2-2.4 2.2 1.1 2.2 2.4-1 2.4-2.2 2.4Zm7.2 0c-1.2 0-2.2-1.1-2.2-2.4s1-2.4 2.2-2.4 2.2 1.1 2.2 2.4-1 2.4-2.2 2.4Z" />
    </svg>
  )
}
function IconFacebook() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
      <path d="M24 12A12 12 0 1 0 10.1 23.9v-8.4H7v-3.5h3.1V9.4c0-3 1.8-4.7 4.6-4.7 1.3 0 2.7.2 2.7.2v3h-1.5c-1.5 0-2 .9-2 1.9v2.3h3.4l-.6 3.5h-2.8v8.4A12 12 0 0 0 24 12Z" />
    </svg>
  )
}
function IconWhatsapp() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.5 3.5A11.8 11.8 0 0 0 12.1 0 12 12 0 0 0 .7 17.6L0 24l6.6-.7A12 12 0 0 0 12.1 24c6.6 0 12-5.4 12-12 0-3.2-1.3-6.2-3.6-8.5ZM12.1 21.8h-.1a10 10 0 0 1-5.1-1.4l-.4-.2-3.9.4.4-3.8-.3-.4A10 10 0 0 1 22 12a10 10 0 0 1-10 9.8Zm5.5-7.4c-.3-.2-1.8-.9-2-.9-.3-.1-.5-.2-.7.1-.2.3-.8.9-1 1.1-.2.2-.4.2-.7.1-.3-.1-1.3-.5-2.4-1.5-.9-.8-1.5-1.8-1.7-2.1-.2-.3 0-.5.1-.6l.5-.5.3-.5c.1-.2 0-.4 0-.5s-.7-1.7-1-2.3c-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.4s1 2.8 1.2 3c.1.2 2 3.1 4.9 4.3 1.9.9 2.6.9 3.6.8.6-.1 1.8-.7 2-1.4.3-.7.3-1.3.2-1.4-.1-.1-.3-.2-.6-.3Z" />
    </svg>
  )
}
function IconTelegram() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
      <path d="M22 2 2 10.5l6.5 2.3L18 5.5l-7.7 8.3.4 6 4-3.8 4.7 3.4L22 2Z" />
    </svg>
  )
}
function IconX() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231Zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77Z" />
    </svg>
  )
}
function IconYouTube() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
      <path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6A3 3 0 0 0 .5 6.2 31.5 31.5 0 0 0 0 12a31.5 31.5 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.6 9.4.6 9.4.6s7.5 0 9.4-.6a3 3 0 0 0 2.1-2.1A31.5 31.5 0 0 0 24 12a31.5 31.5 0 0 0-.5-5.8ZM9.6 15.6V8.4l6.3 3.6-6.3 3.6Z" />
    </svg>
  )
}
function IconGlobe() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" />
    </svg>
  )
}

export function platformIcon(platform?: Platform): React.ReactNode {
  switch (platform) {
    case 'discord': return <IconDiscord />
    case 'facebook': return <IconFacebook />
    case 'whatsapp': return <IconWhatsapp />
    case 'telegram': return <IconTelegram />
    case 'x': return <IconX />
    case 'youtube': return <IconYouTube />
    default: return <IconGlobe />
  }
}

/** Visible "sub" line (handle, invite, or short URL host). */
export function platformSub(c: ApiCommunity): string {
  if (c.inviteCode) return c.inviteCode
  if (c.url) {
    try {
      const u = new URL(c.url)
      return u.hostname.replace(/^www\./, '') + (u.pathname === '/' ? '' : u.pathname)
    } catch {
      return c.url
    }
  }
  return ''
}
