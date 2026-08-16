'use client'

import { useEffect } from 'react'
import { useTheme } from 'next-themes'
import { Capacitor } from '@capacitor/core'
import { StatusBar, Style } from '@capacitor/status-bar'
import { Keyboard } from '@capacitor/keyboard'
import { installCrashReporter } from '@/lib/crash-reporter'
import { hideNativeSplash } from '@/lib/splash-handoff'

// Global error/rejection listeners: installed at module scope so they cover
// everything from the first evaluated frame onwards, not just post-mount.
installCrashReporter()

// App chrome background per color scheme. Mirrors the themeColor values in the
// root layout viewport so the native status bar matches the web header.
const STATUS_BAR_BACKGROUND = {
  light: '#F6F2EA',
  dark: '#14110E',
} as const

/**
 * One-time native shell configuration. Everything here is guarded by
 * Capacitor.isNativePlatform(), so it no-ops in the browser dev preview and
 * only runs inside the iOS/Android webview.
 *
 * Renders nothing; mounted once near the top of the provider tree.
 */
export function NativeInit() {
  const { resolvedTheme } = useTheme()

  // Keyboard + splash run once on mount; they do not depend on the theme.
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return

    // Keep the WebView edge-to-edge so the top bar itself paints the status
    // bar/notch area. Its safe-area padding protects the interactive content.
    // Applying this at runtime also covers installs upgraded from an older
    // native config before the next full Capacitor sync.
    StatusBar.setOverlaysWebView({ overlay: true }).catch(() => {})

    // Resize mode is declared once in capacitor.config.ts (KeyboardResize.Native);
    // only the accessory bar has no config-file equivalent.
    Keyboard.setAccessoryBarVisible({ isVisible: false }).catch(() => {})

    // The startup zikr overlay owns SplashScreen.hide(): it lifts the native
    // splash only after its own first frame has painted, so there is never a
    // blank flash between the two (launchAutoHide is off). This timeout is the
    // safety net — if the overlay ever fails to mount, the user still gets in.
    const splashSafetyTimer = window.setTimeout(hideNativeSplash, 6000)

    // Route the shared audio player's media-session calls to the native
    // MediaSession plugin (foreground service + lock-screen controls). The
    // adapter seam replays state, so this late async registration is safe.
    Promise.all([
      import('@/lib/native-media-session'),
      import('@/lib/media-session-adapter'),
    ])
      .then(([{ nativeMediaSessionAdapter }, { registerMediaSessionAdapter }]) =>
        registerMediaSessionAdapter(nativeMediaSessionAdapter)
      )
      .catch(() => {})

    return () => window.clearTimeout(splashSafetyTimer)
  }, [])

  // Keep the status bar legible against the current theme. Style.Dark means
  // dark content (for light backgrounds); Style.Light means light content.
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return

    const isDark = resolvedTheme === 'dark'
    StatusBar.setStyle({ style: isDark ? Style.Light : Style.Dark }).catch(() => {})

    // setBackgroundColor is Android-only; it throws on iOS, which the catch
    // swallows. It remains a fallback for Android versions/configurations that
    // do not draw edge-to-edge, and matches the header background either way.
    StatusBar.setBackgroundColor({
      color: isDark ? STATUS_BAR_BACKGROUND.dark : STATUS_BAR_BACKGROUND.light,
    }).catch(() => {})
  }, [resolvedTheme])

  return null
}
