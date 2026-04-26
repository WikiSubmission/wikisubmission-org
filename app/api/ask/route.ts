import { NextRequest, NextResponse } from 'next/server'

// ── Rate limiting ──────────────────────────────────────────────────────────────
// Module-level store persists across warm Lambda invocations.
// Not perfect across multiple instances, but provides a meaningful first layer.

const WINDOW_MS = 60_000 // 1 minute
const MAX_REQUESTS = 15 // per IP per window

const store = new Map<string, { count: number; reset: number }>()

function getIp(req: NextRequest): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0].trim() ??
    req.headers.get('x-real-ip') ??
    'unknown'
  )
}

function isRateLimited(ip: string): boolean {
  const now = Date.now()
  const entry = store.get(ip)
  if (!entry || now > entry.reset) {
    store.set(ip, { count: 1, reset: now + WINDOW_MS })
    return false
  }
  if (entry.count >= MAX_REQUESTS) return true
  entry.count++
  return false
}

// ── Route ──────────────────────────────────────────────────────────────────────

const MAX_QUESTION_LEN = 500
const MIN_QUESTION_LEN = 2
const MAX_CONVERSATION_ID_LEN = 64
const CONVERSATION_ID_RE = /^[a-zA-Z0-9_-]{1,64}$/
const UPSTREAM_TIMEOUT_MS = 20_000

type AskResponse = {
  answer: string
  sources?: string[]
}

function isValidConversationId(value: unknown): value is string {
  return (
    typeof value === 'string' &&
    value.length > 0 &&
    value.length <= MAX_CONVERSATION_ID_LEN &&
    CONVERSATION_ID_RE.test(value)
  )
}

function isAskResponse(value: unknown): value is AskResponse {
  if (!value || typeof value !== 'object') return false

  const data = value as Record<string, unknown>
  if (typeof data.answer !== 'string' || data.answer.trim().length === 0)
    return false

  if (data.sources == null) return true
  return (
    Array.isArray(data.sources) &&
    data.sources.every((item) => typeof item === 'string')
  )
}

export async function POST(req: NextRequest) {
  // Content-type check
  const ct = req.headers.get('content-type') ?? ''
  if (!ct.includes('application/json')) {
    return NextResponse.json(
      { error: 'Invalid content type.' },
      { status: 415 }
    )
  }

  // Rate limiting
  const ip = getIp(req)
  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: 'Too many requests. Please wait a moment.' },
      { status: 429, headers: { 'Retry-After': '60' } }
    )
  }

  // Parse + validate
  const body = await req.json().catch(() => null)
  const question =
    typeof body?.question === 'string'
      ? body.question.trim().slice(0, MAX_QUESTION_LEN)
      : ''
  const conversationId = isValidConversationId(body?.conversation_id)
    ? body.conversation_id
    : undefined

  if (question.length < MIN_QUESTION_LEN) {
    return NextResponse.json(
      { error: 'Question is required.' },
      { status: 400 }
    )
  }

  if (body?.conversation_id != null && !conversationId) {
    return NextResponse.json(
      { error: 'Invalid conversation id.' },
      { status: 400 }
    )
  }

  // Upstream
  const apiKey = process.env.SUBMITTERAI_API_KEY
  const apiUrl = process.env.SUBMITTERAI_API_URL

  if (!apiKey || !apiUrl) {
    return NextResponse.json(
      { error: 'AI service is not configured.' },
      { status: 500 }
    )
  }

  const upstream = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      question,
      ...(conversationId && { conversation_id: conversationId }),
    }),
  })

  if (!upstream.ok) {
    return NextResponse.json(
      { error: `AI service returned ${upstream.status}.` },
      { status: upstream.status }
    )
  }

  if (!['https:', 'http:'].includes(parsedUrl.protocol)) {
    return NextResponse.json(
      { error: 'AI service is not configured.' },
      { status: 500 }
    )
  }

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), UPSTREAM_TIMEOUT_MS)

  try {
    const upstream = await fetch(parsedUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        question,
        ...(conversationId && { conversation_id: conversationId }),
      }),
      signal: controller.signal,
      cache: 'no-store',
    })

    const raw = await upstream.text()
    const data = raw ? JSON.parse(raw) : null

    if (!upstream.ok) {
      const message =
        data &&
        typeof data === 'object' &&
        'error' in data &&
        typeof data.error === 'string' &&
        data.error.trim().length > 0
          ? data.error
          : `AI service returned ${upstream.status}.`

      return NextResponse.json({ error: message }, { status: upstream.status })
    }

    if (!isAskResponse(data)) {
      return NextResponse.json(
        { error: 'AI service returned an invalid response.' },
        { status: 502 }
      )
    }

    return NextResponse.json({
      answer: data.answer,
      sources: Array.isArray(data.sources) ? data.sources.slice(0, 24) : [],
    })
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      return NextResponse.json(
        { error: 'AI service timed out.' },
        { status: 504 }
      )
    }

    return NextResponse.json(
      { error: 'AI service is unavailable right now.' },
      { status: 502 }
    )
  } finally {
    clearTimeout(timeout)
  }
}
