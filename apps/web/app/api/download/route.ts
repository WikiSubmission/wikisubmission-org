import { NextRequest, NextResponse } from 'next/server'

// ── Allowlist ──────────────────────────────────────────────────────────────────
// Only permit fetching from known CDN hostnames. This prevents SSRF against
// internal services, cloud metadata endpoints, and arbitrary third-party hosts.
//
// To add a new CDN, set DOWNLOAD_ALLOWED_HOSTS in your environment:
//   DOWNLOAD_ALLOWED_HOSTS=cdn.wikisubmission.org,audio.qurancdn.com,new-cdn.example.com

const DEFAULT_ALLOWED_HOSTS = ['cdn.wikisubmission.org', 'audio.qurancdn.com']

const ALLOWED_HOSTS = new Set(
  process.env.DOWNLOAD_ALLOWED_HOSTS
    ? process.env.DOWNLOAD_ALLOWED_HOSTS.split(',').map((h) => h.trim()).filter(Boolean)
    : DEFAULT_ALLOWED_HOSTS,
)

const ALLOWED_CONTENT_TYPES = new Set([
  'audio/mpeg',
  'audio/mp3',
  'audio/flac',
  'audio/wav',
  'audio/wave',
  'audio/x-wav',
  'audio/ogg',
  'audio/aac',
  'audio/mp4',
  'audio/x-m4a',
])

const MAX_BODY_BYTES = 50 * 1024 * 1024 // 50 MB
const FETCH_TIMEOUT_MS = 15_000

function validateUrl(raw: string): URL {
  let parsed: URL
  try {
    parsed = new URL(raw)
  } catch {
    throw new Error('invalid URL')
  }
  if (parsed.protocol !== 'https:') throw new Error('https only')
  if (!ALLOWED_HOSTS.has(parsed.hostname)) {
    throw new Error(
      `host not permitted: ${parsed.hostname}. Add it to DOWNLOAD_ALLOWED_HOSTS to enable.`,
    )
  }
  return parsed
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const rawUrl = searchParams.get('url')
  const filename = searchParams.get('filename')

  if (!rawUrl) {
    return new NextResponse('Missing URL parameter', { status: 400 })
  }

  let parsed: URL
  try {
    parsed = validateUrl(rawUrl)
  } catch (err) {
    return new NextResponse((err as Error).message, { status: 400 })
  }

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS)

  try {
    const response = await fetch(parsed.toString(), { signal: controller.signal })
    clearTimeout(timeout)

    if (!response.ok) {
      return new NextResponse('Failed to fetch file from source', { status: response.status })
    }

    // Reject oversized responses before buffering
    const contentLengthHeader = response.headers.get('content-length')
    if (contentLengthHeader) {
      const declared = parseInt(contentLengthHeader, 10)
      if (!isNaN(declared) && declared > MAX_BODY_BYTES) {
        return new NextResponse('File too large', { status: 413 })
      }
    }

    const arrayBuffer = await response.arrayBuffer()

    if (arrayBuffer.byteLength > MAX_BODY_BYTES) {
      return new NextResponse('File too large', { status: 413 })
    }

    // Only forward known audio content types; default to audio/mpeg
    const rawContentType = (response.headers.get('Content-Type') ?? 'audio/mpeg')
      .split(';')[0]
      .trim()
      .toLowerCase()
    const contentType = ALLOWED_CONTENT_TYPES.has(rawContentType)
      ? rawContentType
      : 'audio/mpeg'

    const finalData = stripMetadata(arrayBuffer, contentType)

    const safeFilename = (filename ?? 'download.mp3').replace(/[^a-zA-Z0-9._-]/g, '_')

    return new NextResponse(finalData, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${safeFilename}"`,
        'Cache-Control': 'public, max-age=3600',
        'X-Content-Type-Options': 'nosniff',
      },
    })
  } catch (error) {
    clearTimeout(timeout)
    if ((error as Error).name === 'AbortError') {
      return new NextResponse('Request timed out', { status: 504 })
    }
    console.error('Download proxy error:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

/**
 * Strips common metadata (ID3v1, ID3v2) and aligns to the start of the audio stream
 * for various formats (MP3, FLAC, WAV).
 */
function stripMetadata(buffer: ArrayBuffer, contentType: string): ArrayBuffer {
  const uint8 = new Uint8Array(buffer)
  let start = 0
  let end = uint8.length

  // 1. Remove ID3v2 (Prepended to many formats, even non-MP3)
  if (
    uint8.length > 10 &&
    uint8[0] === 0x49 &&
    uint8[1] === 0x44 &&
    uint8[2] === 0x33
  ) {
    const size =
      ((uint8[6] & 0x7f) << 21) |
      ((uint8[7] & 0x7f) << 14) |
      ((uint8[8] & 0x7f) << 7) |
      (uint8[9] & 0x7f)

    const totalTagSize = size + 10
    if (totalTagSize < uint8.length) {
      start = totalTagSize
      const flags = uint8[5]
      const hasFooter = (flags & 0x10) !== 0
      if (hasFooter) start += 10
    }
  }

  // 2. Remove ID3v1 (128 bytes at the end, common in MP3)
  if (uint8.length > 128) {
    const tagOffset = uint8.length - 128
    if (
      uint8[tagOffset] === 0x54 &&
      uint8[tagOffset + 1] === 0x41 &&
      uint8[tagOffset + 2] === 0x47
    ) {
      end = tagOffset
    }
  }

  // 3. Format-specific alignment
  const type = contentType.toLowerCase()

  if (type.includes('mpeg') || type.includes('mp3')) {
    const searchLimit = Math.min(start + 8192, end - 1)
    for (let i = start; i < searchLimit; i++) {
      if (uint8[i] === 0xff && (uint8[i + 1] & 0xe0) === 0xe0) {
        start = i
        break
      }
    }
  } else if (type.includes('flac')) {
    const searchLimit = Math.min(start + 4096, end - 4)
    for (let i = start; i < searchLimit; i++) {
      if (
        uint8[i] === 0x66 &&
        uint8[i + 1] === 0x4c &&
        uint8[i + 2] === 0x61 &&
        uint8[i + 3] === 0x43
      ) {
        start = i
        break
      }
    }
  } else if (type.includes('wav') || type.includes('wave')) {
    const searchLimit = Math.min(start + 4096, end - 4)
    for (let i = start; i < searchLimit; i++) {
      if (
        uint8[i] === 0x52 &&
        uint8[i + 1] === 0x49 &&
        uint8[i + 2] === 0x46 &&
        uint8[i + 3] === 0x46
      ) {
        start = i
        break
      }
    }
  }

  if (start > 0 || end < uint8.length) {
    return buffer.slice(start, end)
  }

  return buffer
}
