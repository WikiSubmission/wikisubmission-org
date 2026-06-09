import NextAuth from 'next-auth'
import Google from 'next-auth/providers/google'
import Apple from 'next-auth/providers/apple'
import Discord from 'next-auth/providers/discord'
import Credentials from 'next-auth/providers/credentials'
import { SignJWT, jwtVerify, importPKCS8 } from 'jose'
import { createHmac, timingSafeEqual } from 'crypto'
import { z } from 'zod'
import { fetchUserAccess } from '@/lib/auth-access'

// Startup validation — fail fast rather than silently minting invalid tokens
const authSecret = process.env.AUTH_SECRET
const backendSecret = process.env.WS_BACKEND_JWT_SECRET
if (!authSecret || authSecret.length < 32) {
  throw new Error('AUTH_SECRET must be set and at least 32 characters')
}
if (!backendSecret || backendSecret.length < 32) {
  throw new Error('WS_BACKEND_JWT_SECRET must be set and at least 32 characters')
}

// Dedicated key for OTP HMAC — separate from the session signing key (key separation).
// Set AUTH_OTP_SECRET independently; falls back to AUTH_SECRET only if not provided.
const otpHmacKey = process.env.AUTH_OTP_SECRET ?? authSecret

// Track consumed OTP JTIs to prevent replay within the 10-minute TTL window.
// Map<jti, expiry> — entries are pruned lazily on each access.
// For multi-instance deployments this should be backed by a shared Redis store.
const usedOtpJtis = new Map<string, number>()

function consumeOtpJti(jti: string, expiryMs: number): boolean {
  const now = Date.now()
  for (const [k, exp] of usedOtpJtis) {
    if (exp < now) usedOtpJtis.delete(k)
  }
  if (usedOtpJtis.has(jti)) return false
  usedOtpJtis.set(jti, expiryMs)
  return true
}

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
    .sign(new TextEncoder().encode(backendSecret))
}

// Apple requires the OAuth client secret to be a short-lived ES256-signed JWT
// (max 6-month expiry), not a static string. Rather than hand-rotating it twice
// a year, we sign it at startup from the .p8 private key. It refreshes on every
// deploy/cold start, so it never silently expires.
//
// Required env vars (all four, or Apple sign-in is disabled):
//   AUTH_APPLE_TEAM_ID      — 10-char Team ID (Developer portal, top-right)
//   AUTH_APPLE_KEY_ID       — Key ID of the "Sign in with Apple" key (Keys section)
//   AUTH_APPLE_ID           — Services ID, e.g. org.wikisubmission.signin (also the clientId)
//   AUTH_APPLE_PRIVATE_KEY  — contents of the downloaded .p8 (PKCS8 PEM; \n-escaped is fine)
async function generateAppleClientSecret(): Promise<string> {
  const teamId = process.env.AUTH_APPLE_TEAM_ID
  const keyId = process.env.AUTH_APPLE_KEY_ID
  const clientId = process.env.AUTH_APPLE_ID
  const privateKeyPem = process.env.AUTH_APPLE_PRIVATE_KEY

  if (!teamId || !keyId || !clientId || !privateKeyPem) {
    // Not fully configured — fall back to a static secret if one was set, else
    // leave it empty (Apple button will fail, but the rest of auth still works).
    return process.env.AUTH_APPLE_SECRET ?? ''
  }

  // Env vars store the PEM with literal "\n"; restore real newlines for parsing.
  const key = await importPKCS8(privateKeyPem.replace(/\\n/g, '\n'), 'ES256')

  return new SignJWT({})
    .setProtectedHeader({ alg: 'ES256', kid: keyId })
    .setIssuer(teamId)
    .setIssuedAt()
    .setExpirationTime('150d') // Apple caps client-secret lifetime at 6 months
    .setAudience('https://appleid.apple.com')
    .setSubject(clientId)
    .sign(key)
}

const appleClientSecret = await generateAppleClientSecret()

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,

  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
    Apple({
      clientId: process.env.AUTH_APPLE_ID,
      clientSecret: appleClientSecret,
    }),
    Discord({
      clientId: process.env.AUTH_DISCORD_ID,
      clientSecret: process.env.AUTH_DISCORD_SECRET,
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

        // JWT values are base64url-encoded (no semicolons), so manual split is safe.
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
            new TextEncoder().encode(authSecret),
          )

          if (payload.email !== email) return null

          // Enforce single-use: consume the JTI or reject if already used
          const jti = payload.jti
          const expiryMs =
            typeof payload.exp === 'number' ? payload.exp * 1000 : Date.now() + 600_000
          if (typeof jti !== 'string' || !consumeOtpJti(jti, expiryMs)) return null

          // Constant-time comparison to prevent timing attacks
          const expected = createHmac('sha256', otpHmacKey).update(code).digest()
          const stored = Buffer.from(payload.codeHash as string, 'hex')
          if (
            expected.length !== stored.length ||
            !timingSafeEqual(expected, stored)
          ) {
            return null
          }

          return {
            id: `email:${email}`,
            email,
            name: email.split('@')[0] ?? email,
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
        const access = await fetchUserAccess(token.accessToken as string)
        token.isAdmin = access.isAdmin
        token.isEditor = access.isEditor
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
        const access = await fetchUserAccess(token.accessToken as string)
        token.isAdmin = access.isAdmin
        token.isEditor = access.isEditor
      }

      return token
    },

    async session({ session, token }) {
      // accessToken is included in the session so client-side hooks can authenticate
      // requests to ws-backend. Migrating to a server-side proxy would eliminate this
      // exposure but requires refactoring all /me/* hooks to server actions.
      session.accessToken = (token.accessToken as string | undefined) ?? ''
      // Access flags come from the backend (role + permissions) and are baked
      // into the JWT for the life of its refresh window. UI-only signals; the
      // backend enforces real access on every request.
      session.isAdmin = token.isAdmin === true
      session.isEditor = token.isEditor === true
      return session
    },
  },

  pages: {
    signIn: '/auth/sign-in',
    error: '/auth/sign-in',
  },
})
