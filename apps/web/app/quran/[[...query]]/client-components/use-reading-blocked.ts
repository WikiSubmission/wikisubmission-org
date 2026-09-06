'use client'

import { useParams, useSearchParams } from 'next/navigation'
import { parseQuranRef, normalizeQuranInput } from '@/lib/scripture-parser'

/** Mirrors the server-side parseQueryType from page.tsx. */
function detectQueryType(raw: string | undefined): 'chapter' | 'verse-list' | 'search' | null {
  if (!raw) return null
  if (raw.includes(',')) {
    const parts = raw.split(',').map((s) => normalizeQuranInput(s.trim()))
    if (parts.length > 0 && parts.every((p) => parseQuranRef(p) !== null)) return 'verse-list'
  }
  if (/^\d{1,3}$/.test(raw)) {
    const n = parseInt(raw)
    if (n >= 1 && n <= 114) return 'chapter'
  }
  if (parseQuranRef(normalizeQuranInput(raw)) !== null) return 'verse-list'
  return 'search'
}

/**
 * True on the reader routes that have no single-chapter flow to read through.
 *
 * The header's mode selector and the settings panel's mode row both need this,
 * and they sit in the same toolbar — disagreeing about it would be visible.
 */
export function useReadingBlocked(): boolean {
  const params = useParams()
  const searchParams = useSearchParams()

  const q = searchParams.get('q')
  const rawQuery = q || (params.query as string[] | undefined)?.join(' ')
  const queryType = detectQueryType(rawQuery ? decodeURIComponent(rawQuery) : undefined)
  return queryType === 'search' || queryType === 'verse-list'
}
