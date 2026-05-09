import { NextRequest, NextResponse } from 'next/server'
import { SignJWT } from 'jose'
import { createHmac, randomInt } from 'crypto'
import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses'
import { z } from 'zod'

const schema = z.object({ email: z.string().email() })

function getSESClient() {
  return new SESClient({
    region: process.env.AWS_SES_REGION ?? 'us-east-1',
    credentials: {
      accessKeyId: process.env.AWS_SES_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SES_SECRET_ACCESS_KEY!,
    },
  })
}

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

  if (process.env.AWS_SES_ACCESS_KEY_ID) {
    const ses = getSESClient()
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
  } else {
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
