import type { CapacitorConfig } from '@capacitor/cli'
import { KeyboardResize } from '@capacitor/keyboard'

const config: CapacitorConfig = {
  appId: 'org.wikisubmission.app',
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
    StatusBar: {
      // The status bar sits above the webview (does not overlay), so the
      // safe-area-inset-top padding in the chrome stays 0 and this color fills
      // the bar. NativeInit re-syncs style + color to the active theme.
      overlaysWebView: false,
      style: 'DARK',
      backgroundColor: '#F6F2EA',
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
