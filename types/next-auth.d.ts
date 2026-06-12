import type { DefaultSession } from 'next-auth'

declare module 'next-auth' {
  interface Session extends DefaultSession {
    accessToken: string
    // Access flags sourced from the backend's users.role and users.permissions.
    // UX only — the backend enforces real access on every request.
    isAdmin?: boolean
    isEditor?: boolean
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    accessToken?: string
    accessTokenExpiry?: number
    authId?: string
    isAdmin?: boolean
    isEditor?: boolean
  }
}
