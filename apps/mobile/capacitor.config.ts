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
      // NativeInit calls SplashScreen.hide() once the web bundle hydrates;
      // launchAutoHide is the fallback if that never runs.
      launchAutoHide: true,
      launchShowDuration: 2000,
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
  },
}

export default config
