/** Parse a human duration string like "1h 23m" or "45m 10s" into seconds. */
export function parseDurationToSeconds(text: string): number {
  let total = 0
  const h = /(\d+)\s*h/.exec(text)
  const m = /(\d+)\s*m/.exec(text)
  const s = /(\d+)\s*s/.exec(text)
  if (h) total += Number(h[1]) * 3600
  if (m) total += Number(m[1]) * 60
  if (s) total += Number(s[1])
  return total
}

/** Format a second count as a compact countdown, e.g. "1h 05m 09s". */
export function formatRemaining(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  const pad = (n: number) => String(n).padStart(2, '0')
  if (h > 0) return `${h}h ${pad(m)}m ${pad(s)}s`
  if (m > 0) return `${m}m ${pad(s)}s`
  return `${s}s`
}
