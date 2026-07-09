'use client'

import { useEffect } from 'react'
import { useTheme } from 'next-themes'
import { Capacitor } from '@capacitor/core'
import { StatusBar, Style } from '@capacitor/status-bar'
import { Keyboard, KeyboardResize } from '@capacitor/keyboard'
import { hideNativeSplash } from '@/lib/splash-handoff'

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

    // Resize the webview (not just pan) so focused inputs stay visible above
    // the keyboard — matters for search and the sign-in screen.
    Keyboard.setResizeMode({ mode: KeyboardResize.Native }).catch(() => {})
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
    // swallows. The status bar does not overlay the webview, so this color
    // fills the area above the header.
    StatusBar.setBackgroundColor({
      color: isDark ? STATUS_BAR_BACKGROUND.dark : STATUS_BAR_BACKGROUND.light,
    }).catch(() => {})
  }, [resolvedTheme])

  return null
}
