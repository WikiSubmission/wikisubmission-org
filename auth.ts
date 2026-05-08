import NextAuth from 'next-auth'
import Google from 'next-auth/providers/google'
import Apple from 'next-auth/providers/apple'
import Credentials from 'next-auth/providers/credentials'
import { SignJWT, jwtVerify } from 'jose'
import { createHmac } from 'crypto'
import { z } from 'zod'

const otpSchema = z.object({
  email: z.string().email(),
  code: z.string().regex(/^\d{6}$/),
})

async function mintBackendToken({
  sub,
  email,
  name,
}: {
  sub: string
  email: string
  name?: string | null
}): Promise<string> {
  const payload: Record<string, string> = { sub, email }
  if (name) payload.name = name
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('1h')
    .sign(new TextEncoder().encode(process.env.WS_BACKEND_JWT_SECRET))
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
    Apple({
      clientId: process.env.AUTH_APPLE_ID,
      clientSecret: process.env.AUTH_APPLE_SECRET,
    }),
    Credentials({
      credentials: {
        email: {},
        code: {},
      },
      async authorize(credentials, request) {
        const parsed = otpSchema.safeParse(credentials)
        if (!parsed.success) return null

        const { email, code } = parsed.data
        const cookieHeader = request.headers.get('cookie') ?? ''
        const otpCookie = cookieHeader
          .split(';')
          .map((c) => c.trim())
          .find((c) => c.startsWith('pending_otp='))
          ?.slice('pending_otp='.length)
        if (!otpCookie) return null

        try {
          const { payload } = await jwtVerify(
            otpCookie,
            new TextEncoder().encode(process.env.AUTH_SECRET),
          )
          if (payload.email !== email) return null

          const codeHash = createHmac('sha256', process.env.AUTH_SECRET!)
            .update(code)
            .digest('hex')

          if (payload.codeHash !== codeHash) return null

          return {
            id: `email:${email}`,
            email,
            name: (email.split('@')[0] ?? email),
          }
        } catch {
          return null
        }
      },
    }),
  ],

  session: { strategy: 'jwt' },

  callbacks: {
    async jwt({ token, account, user }) {
      if (account) {
        const authId =
          account.provider === 'credentials'
            ? `email:${user.email}`
            : `${account.provider}:${account.providerAccountId}`

        token.authId = authId
        token.accessToken = await mintBackendToken({
          sub: authId,
          email: user.email!,
          name: user.name,
        })
        token.accessTokenExpiry = Date.now() + 55 * 60 * 1000
        return token
      }

      if (
        token.accessToken &&
        typeof token.accessTokenExpiry === 'number' &&
        Date.now() > token.accessTokenExpiry - 5 * 60 * 1000
      ) {
        token.accessToken = await mintBackendToken({
          sub: token.authId as string,
          email: token.email as string,
          name: token.name as string | null | undefined,
        })
        token.accessTokenExpiry = Date.now() + 55 * 60 * 1000
      }

      return token
    },

    async session({ session, token }) {
      session.accessToken = (token.accessToken as string | undefined) ?? ''
      return session
    },
  },

  pages: {
    signIn: '/auth/sign-in',
    error: '/auth/sign-in',
  },
})
