import { Capacitor } from '@capacitor/core'
import { SplashScreen } from '@capacitor/splash-screen'

/**
 * Native splash → JS overlay handoff. launchAutoHide is off
 * (capacitor.config.ts), so the native splash stays up until the startup zikr
 * overlay has painted and calls this — no blank frame between the two.
 * NativeInit arms a safety timeout so a crashed overlay can never strand the
 * user on the native splash.
 */
export function hideNativeSplash(): void {
  if (!Capacitor.isNativePlatform()) return
  SplashScreen.hide().catch(() => {})
}
