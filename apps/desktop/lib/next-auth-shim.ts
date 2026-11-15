/**
 * Stand-in for `next-auth/react`, wired in by the webpack alias in
 * next.config.ts. A few reader components reused from apps/web check the
 * next-auth session before showing personal features. The desktop app has a
 * single local user who is always signed in, and the shell attaches the real
 * access token to every proxied API call, so this session carries a
 * placeholder token that is never sent anywhere.
 */
const session = {
  user: { name: 'Local user', email: null, image: null },
  accessToken: 'desktop-local',
  expires: '9999-12-31T23:59:59.000Z',
}

export function useSession() {
  return { data: session, status: 'authenticated' as const, update: async () => session }
}

export async function getSession() {
  return session
}

export async function signIn(): Promise<undefined> {
  return undefined
}

export async function signOut(): Promise<undefined> {
  return undefined
}

export function SessionProvider({ children }: { children: React.ReactNode }) {
  return children
}
