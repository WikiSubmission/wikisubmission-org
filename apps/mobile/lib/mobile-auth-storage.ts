import { SecureStorage } from '@aparajita/capacitor-secure-storage'
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
// user profile. Stored as one JSON blob under a single key in the platform
// secure store (iOS Keychain / Android Keystore-encrypted storage) — never in
// plain Preferences, which is unencrypted SharedPreferences/UserDefaults.
export interface StoredSession {
  accessToken: string
  refreshToken: string
  expiresAt: number
  user: MobileAuthUser
}

const SESSION_KEY = 'ws.auth.session'

// Keep tokens device-local: never let iOS roam them through iCloud Keychain.
// Fire-and-forget — the plugin default is already non-synchronized; this just
// pins the behavior against future default changes.
void SecureStorage.setSynchronize(false).catch(() => {})

/**
 * One-time migration: sessions written by earlier builds live in plain
 * Preferences under the same key. Move the blob into the secure store and
 * destroy the plaintext copy. Returns the migrated raw value, if any.
 */
async function migrateLegacySession(): Promise<string | null> {
  try {
    const { value } = await Preferences.get({ key: SESSION_KEY })
    if (!value) return null
    await SecureStorage.setItem(SESSION_KEY, value)
    await Preferences.remove({ key: SESSION_KEY })
    return value
  } catch {
    return null
  }
}

export async function loadSession(): Promise<StoredSession | null> {
  try {
    const value =
      (await SecureStorage.getItem(SESSION_KEY)) ?? (await migrateLegacySession())
    if (!value) return null
    return JSON.parse(value) as StoredSession
  } catch {
    // Corrupt blob or unavailable bridge: treat as signed out.
    return null
  }
}

export async function saveSession(session: StoredSession): Promise<void> {
  await SecureStorage.setItem(SESSION_KEY, JSON.stringify(session))
}

export async function clearSession(): Promise<void> {
  await SecureStorage.remove(SESSION_KEY)
  // Belt-and-braces: also clear any pre-migration plaintext copy.
  await Preferences.remove({ key: SESSION_KEY }).catch(() => {})
}
