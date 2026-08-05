import { NextRequest, NextResponse } from 'next/server'

const UPSTREAM_BASE = 'https://practices.wikisubmission.org'
const FETCH_TIMEOUT_MS = 20_000

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ location: string }> },
) {
  const { location } = await params

  if (!location.trim()) {
    return NextResponse.json({ error: 'Location is required.' }, { status: 400 })
  }

  const upstreamUrl = new URL(
    `/prayer-times/${encodeURIComponent(location)}`,
    UPSTREAM_BASE,
  )

  const asrAdjustment = request.nextUrl.searchParams.get('asr_adjustment')
  const includeSchedule = request.nextUrl.searchParams.get('include_schedule')
  if (asrAdjustment === 'true') upstreamUrl.searchParams.set('asr_adjustment', 'true')
  if (includeSchedule === 'true') upstreamUrl.searchParams.set('include_schedule', 'true')

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS)

  try {
    const upstream = await fetch(upstreamUrl, {
      cache: 'no-store',
      signal: controller.signal,
    })
    const body = await upstream.text()

    return new NextResponse(body, {
      status: upstream.status,
      headers: {
        'Content-Type': upstream.headers.get('Content-Type') ?? 'application/json',
        'Cache-Control': 'no-store',
      },
    })
  } catch (error) {
    const message =
      error instanceof Error && error.name === 'AbortError'
        ? 'Prayer times service timed out.'
        : 'Prayer times service is unavailable.'

    return NextResponse.json({ error: message }, { status: 502 })
  } finally {
    clearTimeout(timeout)
  }
}
