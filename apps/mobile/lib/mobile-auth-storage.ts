import { Preferences } from '@capacitor/preferences'

// The authenticated user as returned by the ws-backend native-auth endpoints
// (mirror of mobileAuthUser in api/handlers/auth_mobile.go).
export interface MobileAuthUser {
  id: number
  auth_id: string
  email: string
  display_name?: string | null
  role: string
  permissions: Record<string, unknown>
  is_active: boolean
  is_admin: boolean
  is_editor: boolean
}

// A persisted session: the short-lived access token, the long-lived refresh
// token used to rotate it, the absolute access-token expiry (epoch ms), and the
// user profile. Stored as one JSON blob under a single Preferences key.
export interface StoredSession {
  accessToken: string
  refreshToken: string
  expiresAt: number
  user: MobileAuthUser
}

const SESSION_KEY = 'ws.auth.session'

export async function loadSession(): Promise<StoredSession | null> {
  try {
    const { value } = await Preferences.get({ key: SESSION_KEY })
    if (!value) return null
    return JSON.parse(value) as StoredSession
  } catch {
    // Corrupt blob or unavailable bridge: treat as signed out.
    return null
  }
}

export async function saveSession(session: StoredSession): Promise<void> {
  await Preferences.set({ key: SESSION_KEY, value: JSON.stringify(session) })
}

export async function clearSession(): Promise<void> {
  await Preferences.remove({ key: SESSION_KEY })
}
