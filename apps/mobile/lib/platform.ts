import { Capacitor } from '@capacitor/core'

/**
 * Sign in with Apple is only offered on iOS. On Android (Play Store) the app is
 * a Google-first build and Apple sign-in is hidden; the same codebase ships to
 * the App Store where the Apple button appears. Guarded so it is safe to call in
 * the web/preview context too (returns false).
 */
export function isAppleSignInAvailable(): boolean {
  return Capacitor.getPlatform() === 'ios'
}
