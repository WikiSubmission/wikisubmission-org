import type { DefaultSession } from 'next-auth'

declare module 'next-auth' {
  interface Session extends DefaultSession {
    accessToken: string
    // Soft editorial flag, derived server-side from the email allowlist. UX
    // only — gates the studio nav link; the backend enforces real access.
    isEditor?: boolean
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    accessToken?: string
    accessTokenExpiry?: number
    authId?: string
  }
}
