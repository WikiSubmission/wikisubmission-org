import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'org.wikisubmission.app',
  appName: 'WikiSubmission',
  // Next static export output. `next build` writes here; `cap sync` copies it
  // into the native iOS/Android projects.
  webDir: 'out',
  plugins: {
    SplashScreen: {
      launchAutoHide: true,
      backgroundColor: '#14110E',
      showSpinner: false,
    },
  },
}

export default config
