import { NextRequest, NextResponse } from 'next/server'
import { SignJWT } from 'jose'
import { createHmac, randomInt, randomUUID } from 'crypto'
import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses'
import { z } from 'zod'

// ── Rate limiting ──────────────────────────────────────────────────────────────
// Per-IP: max 5 sends per 10 minutes
// Per-email: max 3 sends per 10 minutes

const WINDOW_MS = 10 * 60_000

const ipStore = new Map<string, { count: number; reset: number }>()
const emailStore = new Map<string, { count: number; reset: number }>()

function checkLimit(
  store: Map<string, { count: number; reset: number }>,
  key: string,
  max: number,
): boolean {
  const now = Date.now()
  const entry = store.get(key)
  if (!entry || now > entry.reset) {
    store.set(key, { count: 1, reset: now + WINDOW_MS })
    return false
  }
  if (entry.count >= max) return true
  entry.count++
  return false
}

function getIp(req: NextRequest): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0].trim() ??
    req.headers.get('x-real-ip') ??
    'unknown'
  )
}

// ── SES client ────────────────────────────────────────────────────────────────

function getSESClient() {
  return new SESClient({
    region: process.env.AWS_SES_REGION ?? 'us-east-1',
    credentials: {
      accessKeyId: process.env.AWS_SES_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SES_SECRET_ACCESS_KEY!,
    },
  })
}

// ── Route ─────────────────────────────────────────────────────────────────────

const schema = z.object({ email: z.string().email() })

export async function POST(req: NextRequest) {
  const ip = getIp(req)

  const body = await req.json().catch(() => null)
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'invalid email' }, { status: 400 })
  }

  const { email } = parsed.data

  if (checkLimit(ipStore, ip, 5)) {
    return NextResponse.json({ error: 'too many requests' }, { status: 429 })
  }
  if (checkLimit(emailStore, email, 3)) {
    return NextResponse.json({ error: 'too many requests' }, { status: 429 })
  }

  const authSecret = process.env.AUTH_SECRET!
  const otpHmacKey = process.env.AUTH_OTP_SECRET ?? authSecret
  const secret = new TextEncoder().encode(authSecret)

  // Full 6-digit range with leading-zero support
  const code = String(randomInt(0, 1_000_000)).padStart(6, '0')
  const codeHash = createHmac('sha256', otpHmacKey).update(code).digest('hex')

  const otpJwt = await new SignJWT({ email, codeHash })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('10m')
    .setJti(randomUUID())
    .sign(secret)

  if (process.env.AWS_SES_ACCESS_KEY_ID) {
    const ses = getSESClient()
    try {
      await ses.send(
        new SendEmailCommand({
          Source: process.env.AWS_SES_FROM_ADDRESS ?? 'noreply@wikisubmission.org',
          Destination: { ToAddresses: [email] },
          Message: {
            Subject: { Data: 'Your WikiSubmission sign-in code', Charset: 'UTF-8' },
            Body: {
              Text: {
                Data: `Your WikiSubmission sign-in code is: ${code}\n\nThis code expires in 10 minutes.`,
                Charset: 'UTF-8',
              },
            },
          },
        }),
      )
    } catch (err) {
      console.error('[OTP] SES send failed', { error: (err as Error).message })
      return NextResponse.json({ error: 'failed to send code' }, { status: 500 })
    }
  } else if (process.env.NODE_ENV === 'development') {
    // Dev-only: log code without email to avoid an exploitable email+code pair in logs
    console.log('[OTP dev] Code:', code)
  } else {
    return NextResponse.json({ error: 'email delivery not configured' }, { status: 503 })
  }

  const response = NextResponse.json({ ok: true })
  response.cookies.set('pending_otp', otpJwt, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 600,
    path: '/',
  })
  return response
}
