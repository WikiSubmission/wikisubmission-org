import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const url = searchParams.get('url')
  const filename = searchParams.get('filename')

  if (!url) {
    return new NextResponse('Missing URL parameter', { status: 400 })
  }

  try {
    const response = await fetch(url)

    if (!response.ok) {
      return new NextResponse(
        `Failed to fetch file from source: ${response.statusText}`,
        { status: response.status }
      )
    }

    const arrayBuffer = await response.arrayBuffer()
    const contentType = response.headers.get('Content-Type') || 'audio/mpeg'

    // Strip metadata based on content type
    let finalData: ArrayBuffer = arrayBuffer
    finalData = stripMetadata(arrayBuffer, contentType)

    return new NextResponse(finalData, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${filename || 'download.mp3'}"`,
        'Cache-Control': 'public, max-age=3600',
      },
    })
  } catch (error) {
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
  // ID3v2 header starts with "ID3" (0x49 0x44 0x33)
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

      // Look for a probable ID3v2 footer
      const flags = uint8[5]
      const hasFooter = (flags & 0x10) !== 0
      if (hasFooter) {
        start += 10
      }
    }
  }

  // 2. Remove ID3v1 (128 bytes at the end, common in MP3)
  // ID3v1 starts with "TAG" (0x54 0x41 0x47)
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
    // Find MP3 sync word (0xFF + 0xE0 mask)
    // Search first 8KB or until end
    const searchLimit = Math.min(start + 8192, end - 1)
    for (let i = start; i < searchLimit; i++) {
      if (uint8[i] === 0xff && (uint8[i + 1] & 0xe0) === 0xe0) {
        start = i
        break
      }
    }
  } else if (type.includes('flac')) {
    // FLAC must start with "fLaC" (0x66 0x4C 0x61 0x43)
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
    // WAV must start with "RIFF" (0x52 0x49 0x46 0x46)
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

  // Only slice if we actually found metadata to remove or bounds changed
  if (start > 0 || end < uint8.length) {
    return buffer.slice(start, end)
  }

  return buffer
}
