import { NextRequest, NextResponse } from 'next/server'
import { SignJWT } from 'jose'
import { createHmac, randomInt } from 'crypto'
import { Resend } from 'resend'
import { z } from 'zod'

const schema = z.object({ email: z.string().email() })

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null)
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'invalid email' }, { status: 400 })
  }

  const { email } = parsed.data
  const secret = new TextEncoder().encode(process.env.AUTH_SECRET!)

  const code = String(randomInt(100000, 999999))
  const codeHash = createHmac('sha256', process.env.AUTH_SECRET!)
    .update(code)
    .digest('hex')

  const otpJwt = await new SignJWT({ email, codeHash })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('10m')
    .sign(secret)

  if (process.env.AUTH_RESEND_KEY) {
    const resend = new Resend(process.env.AUTH_RESEND_KEY)
    await resend.emails.send({
      from: 'WikiSubmission <noreply@wikisubmission.org>',
      to: email,
      subject: 'Your sign-in code',
      text: `Your WikiSubmission sign-in code is: ${code}\n\nThis code expires in 10 minutes.`,
    })
  } else {
    // Dev: print to stdout so local testing works without Resend configured
    console.log(`[OTP dev] Code for ${email}: ${code}`)
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
