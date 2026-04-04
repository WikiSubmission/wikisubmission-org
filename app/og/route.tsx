import { ImageResponse } from 'next/og'
import { type NextRequest } from 'next/server'
import fs from 'fs'
import path from 'path'

export const runtime = 'nodejs'

function loadFile(relativePath: string): Buffer {
  return fs.readFileSync(path.join(process.cwd(), relativePath))
}

function toArrayBuffer(buf: Buffer): ArrayBuffer {
  const ab = new ArrayBuffer(buf.byteLength)
  new Uint8Array(ab).set(buf)
  return ab
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const rawTitle = searchParams.get('title') ?? 'WikiSubmission'
  const rawSubtitle = searchParams.get('subtitle') ?? ''
  const small = searchParams.get('small') === '1'

  // Strip trailing " | WikiSubmission" so it's not redundant
  const title = rawTitle.replace(/\s*\|\s*WikiSubmission\s*$/i, '').trim() || 'WikiSubmission'
  const subtitle = rawSubtitle.slice(0, 200).trim()

  const WIDTH = small ? 600 : 1200
  const HEIGHT = small ? 315 : 630

  const fontData = toArrayBuffer(loadFile('public/font/GlacialIndifference-Regular.ttf'))
  const logoData = loadFile('public/brand-assets/logo-transparent.png')
  const logoSrc = `data:image/png;base64,${logoData.toString('base64')}`

  const scale = small ? 0.5 : 1
  const logoSize = Math.round(128 * scale)
  const fontSize = Math.round(
    (subtitle
      ? (title.length > 20 ? 48 : 60)
      : (title.length > 60 ? 52 : title.length > 40 ? 60 : 68)) * scale
  )
  const subtitleSize = Math.round(30 * scale)
  const gap = Math.round((subtitle ? 28 : 48) * scale)
  const padding = Math.round(120 * scale)

  const imageResponse = new ImageResponse(
    (
      <div
        style={{
          background: '#000000',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap,
          padding: `0 ${padding}px`,
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={logoSrc} width={logoSize} height={logoSize} alt="" />

        <div
          style={{
            color: '#ffffff',
            fontSize,
            fontFamily: 'GlacialIndifference',
            fontWeight: 400,
            textAlign: 'center',
            lineHeight: 1.3,
            letterSpacing: '-0.01em',
          }}
        >
          {title}
        </div>

        {subtitle && (
          <div
            style={{
              color: '#999999',
              fontSize: subtitleSize,
              fontFamily: 'GlacialIndifference',
              fontWeight: 400,
              textAlign: 'center',
              lineHeight: 1.5,
            }}
          >
            {subtitle}
          </div>
        )}
      </div>
    ),
    {
      width: WIDTH,
      height: HEIGHT,
      fonts: [
        {
          name: 'GlacialIndifference',
          data: fontData,
          weight: 400,
          style: 'normal',
        },
      ],
    }
  )

  // Return with proper caching so CDN/Discord/Twitter can cache the image
  const buffer = await imageResponse.arrayBuffer()
  return new Response(buffer, {
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800',
    },
  })
}
