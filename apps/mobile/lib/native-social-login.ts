import type { AuthProvider } from './mobile-auth-client'

// Minimal surface of @capgo/capacitor-social-login that we depend on. We cast
// the imported module to this local interface (rather than relying on the
// package's exported types) so a plugin API drift cannot break the build; the
// runtime contract is verified on-device when the native projects exist.
interface SocialLoginResult {
  provider: string
  result: {
    idToken?: string | null
    nonce?: string | null
  }
}

interface SocialLoginPlugin {
  initialize(options: unknown): Promise<void>
  login(options: { provider: string; options?: unknown }): Promise<SocialLoginResult>
  logout(options: { provider: string }): Promise<void>
}

// Provider client IDs are public configuration (NEXT_PUBLIC_*) and must match
// the backend's AUTH_GOOGLE_MOBILE_CLIENT_IDS / AUTH_APPLE_BUNDLE_IDS allowlist.
const GOOGLE_WEB_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_WEB_CLIENT_ID ?? ''
const GOOGLE_IOS_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_IOS_CLIENT_ID ?? ''
const APPLE_CLIENT_ID = process.env.NEXT_PUBLIC_APPLE_CLIENT_ID ?? ''

let initialized = false

async function loadPlugin(): Promise<SocialLoginPlugin> {
  // Dynamic import keeps the native bridge out of the build-time render path.
  const mod = (await import('@capgo/capacitor-social-login')) as unknown as {
    SocialLogin: SocialLoginPlugin
  }
  return mod.SocialLogin
}

async function ensureInitialized(plugin: SocialLoginPlugin): Promise<void> {
  if (initialized) return
  await plugin.initialize({
    google: {
      webClientId: GOOGLE_WEB_CLIENT_ID,
      iOSClientId: GOOGLE_IOS_CLIENT_ID,
    },
    apple: {
      clientId: APPLE_CLIENT_ID,
    },
  })
  initialized = true
}

export interface NativeIdToken {
  idToken: string
  nonce?: string
}

/**
 * Runs the native Google / Apple sign-in flow and returns the provider ID
 * token to hand to the backend exchange endpoint. Throws if the flow is
 * cancelled or the plugin returns no token.
 */
export async function nativeSignIn(provider: AuthProvider): Promise<NativeIdToken> {
  const plugin = await loadPlugin()
  await ensureInitialized(plugin)

  const { result } = await plugin.login({ provider })
  const idToken = result?.idToken
  if (!idToken) {
    throw new Error(`${provider} sign-in returned no id token`)
  }

  return { idToken, nonce: result?.nonce ?? undefined }
}

export async function nativeSignOut(provider: AuthProvider): Promise<void> {
  try {
    const plugin = await loadPlugin()
    await plugin.logout({ provider })
  } catch {
    // Best-effort: a failed native logout must not block clearing local state.
  }
}
