import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'edge'

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null)
  const question = typeof body?.question === 'string' ? body.question.trim() : ''

  if (question.length < 2) {
    return NextResponse.json({ error: 'Question is required.' }, { status: 400 })
  }

  const apiKey = process.env.SUBMITTERAI_API_KEY
  const apiUrl = process.env.SUBMITTERAI_API_URL

  if (!apiKey || !apiUrl) {
    return NextResponse.json({ error: 'AI service is not configured.' }, { status: 500 })
  }

  const upstream = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({ question }),
  })

  if (!upstream.ok) {
    return NextResponse.json(
      { error: `AI service returned ${upstream.status}.` },
      { status: upstream.status }
    )
  }

  const data = await upstream.json()
  return NextResponse.json(data)
}
