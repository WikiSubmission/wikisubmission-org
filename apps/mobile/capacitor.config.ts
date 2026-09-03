import type { CapacitorConfig } from '@capacitor/cli'
import { KeyboardResize } from '@capacitor/keyboard'

const config: CapacitorConfig = {
  appId: 'com.wikisubmission.app',
  appName: 'WikiSubmission',
  // Next static export output. `next build` writes here; `cap sync` copies it
  // into the native iOS/Android projects.
  webDir: 'out',
  plugins: {
    SplashScreen: {
      // The startup zikr overlay calls SplashScreen.hide() after it paints
      // (lib/splash-handoff.ts) so the native splash hands off to the JS
      // overlay without a blank frame. NativeInit arms a 6s safety timeout in
      // case the overlay never mounts.
      launchAutoHide: false,
      backgroundColor: '#14110E',
      showSpinner: false,
    },
    SystemBars: {
      // Capacitor 8's built-in replacement for @capacitor/status-bar. Android
      // 15+ enforces edge-to-edge, so `overlaysWebView`/`backgroundColor` no
      // longer exist: the WebView always paints behind the status bar and
      // gesture bar, and the top bar's own background fills that area.
      //
      // 'css' keeps the plugin feeding the real window insets into
      // env(safe-area-inset-*) (via --safe-area-inset-* on <html>), which is
      // what the top bar and bottom nav pad themselves with. It needs
      // viewport-fit=cover, set in app/layout.tsx.
      insetsHandling: 'css',
      // Follow the system light/dark appearance until NativeInit applies the
      // resolved app theme, so the first painted frame is never wrong.
      style: 'DEFAULT',
    },
    Keyboard: {
      resize: KeyboardResize.Native,
      resizeOnFullScreen: true,
    },
    LocalNotifications: {
      // Monochrome status-bar icon (res/drawable/ic_stat_notify.xml); without
      // one Android renders the adaptive launcher icon as a grey square.
      smallIcon: 'ic_stat_notify',
      iconColor: '#C8A24B',
    },
  },
}

export default config
