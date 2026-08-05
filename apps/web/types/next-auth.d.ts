import type { DefaultSession } from 'next-auth'

declare module 'next-auth' {
  interface Session extends DefaultSession {
    accessToken: string
    // Coarse access flags resolved from the backend's editorial grant snapshot.
    // NAV GATING ONLY — they are baked into the JWT for its 55-minute refresh
    // window and go stale when an admin changes grants. Anything that actually
    // gates access must re-resolve per request via getEditorialSession() and
    // lib/editorial-access.ts. The backend enforces real access regardless.
    isAdmin?: boolean
    /** Can reach at least one games studio under /admin/games. */
    isEditor?: boolean
    /** Can reach at least one content workspace under /editor. */
    isEditorialEditor?: boolean
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    accessToken?: string
    accessTokenExpiry?: number
    authId?: string
    isAdmin?: boolean
    isEditor?: boolean
    isEditorialEditor?: boolean
  }
}
