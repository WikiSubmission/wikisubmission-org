import { ImageResponse } from 'next/og'
import { type NextRequest } from 'next/server'
import fs from 'fs'
import path from 'path'

export const runtime = 'nodejs'

const WIDTH = 1200
const HEIGHT = 630

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

  // Strip trailing " | WikiSubmission" so it's not redundant
  const title = rawTitle.replace(/\s*\|\s*WikiSubmission\s*$/i, '').trim() || 'WikiSubmission'

  const fontData = toArrayBuffer(loadFile('public/font/GlacialIndifference-Regular.ttf'))
  const logoData = loadFile('public/brand-assets/logo-transparent.png')
  const logoSrc = `data:image/png;base64,${logoData.toString('base64')}`

  const fontSize = title.length > 60 ? 52 : title.length > 40 ? 60 : 68

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
          gap: 36,
          padding: '0 100px',
        }}
      >
        {/* Logo */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={logoSrc} width={88} height={88} alt="" />

        {/* Title */}
        <div
          style={{
            color: '#ffffff',
            fontSize,
            fontFamily: 'GlacialIndifference',
            fontWeight: 400,
            textAlign: 'center',
            lineHeight: 1.25,
            letterSpacing: '-0.01em',
          }}
        >
          {title}
        </div>

        {/* Domain */}
        <div
          style={{
            color: '#555555',
            fontSize: 22,
            fontFamily: 'GlacialIndifference',
            letterSpacing: '0.06em',
          }}
        >
          wikisubmission.org
        </div>
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
