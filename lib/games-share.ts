// Encodes a Fill-the-Blank round summary into a short URL-safe token so a
// player can share their result without the receiver needing a database
// lookup. Numbers only — no PII, no answers, no attempt id — so a slightly
// guessable token here is acceptable: anyone can craft any score; the share
// card just shows what is in the URL.
//
// Format: base64url(JSON.stringify({ s, c, t, d? })) where
//   s = score
//   c = correct_count
//   t = total_count
//   d = optional difficulty multiplier (one decimal)

export interface ShareablePayload {
  score: number
  correct: number
  total: number
  difficulty?: number
}

function base64UrlEncode(input: string): string {
  if (typeof Buffer !== 'undefined') {
    return Buffer.from(input, 'utf8').toString('base64url')
  }
  // Browser fallback — btoa is binary-safe only for Latin-1, so URI-encode first.
  const b64 = btoa(unescape(encodeURIComponent(input)))
  return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function base64UrlDecode(input: string): string | null {
  try {
    if (typeof Buffer !== 'undefined') {
      return Buffer.from(input, 'base64url').toString('utf8')
    }
    const b64 = input.replace(/-/g, '+').replace(/_/g, '/').padEnd(
      input.length + ((4 - (input.length % 4)) % 4),
      '=',
    )
    return decodeURIComponent(escape(atob(b64)))
  } catch {
    return null
  }
}

export function encodeSharePayload(p: ShareablePayload): string {
  const compact: Record<string, number> = { s: p.score, c: p.correct, t: p.total }
  if (typeof p.difficulty === 'number') compact.d = Number(p.difficulty.toFixed(1))
  return base64UrlEncode(JSON.stringify(compact))
}

export function decodeSharePayload(token: string): ShareablePayload | null {
  const raw = base64UrlDecode(token)
  if (raw === null) return null
  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch {
    return null
  }
  if (typeof parsed !== 'object' || parsed === null) return null
  const obj = parsed as Record<string, unknown>
  const score = typeof obj.s === 'number' ? obj.s : null
  const correct = typeof obj.c === 'number' ? obj.c : null
  const total = typeof obj.t === 'number' ? obj.t : null
  if (score === null || correct === null || total === null) return null
  if (correct < 0 || total < 1 || correct > total) return null
  const result: ShareablePayload = { score, correct, total }
  if (typeof obj.d === 'number') result.difficulty = obj.d
  return result
}
