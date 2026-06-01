# Android (Trusted Web Activity) — Google Play packaging

This packages the production PWA at https://wikisubmission.org as a Trusted Web
Activity (TWA) for the Google Play Store. The Android app is the website rendered
in Chrome's engine with no browser UI — there is no separate UI codebase.

Prerequisites: the PWA must be live in production first (installable manifest at
`/manifest.webmanifest`, a registered service worker, and a 200 `/offline`
fallback — all shipped in this repo).

## Requirements

- Node.js 18+
- JDK 17+
- Android SDK with command-line tools
- Bubblewrap CLI: `npm i -g @bubblewrap/cli`
- Target API level **35 (Android 15)** or higher — mandatory for new Google Play
  apps since 31 Aug 2025. Bubblewrap's current default targets this; confirm
  `targetSdkVersion` in the generated `twa-manifest.json`.

## 1. Initialize (generates twa-manifest.json — commit it)

```bash
cd android
bubblewrap init --manifest=https://wikisubmission.org/manifest.webmanifest
```

When prompted:

- Application ID / package name: `org.wikisubmission.app`
- Host: `wikisubmission.org`
- Start URL: `/`
- Status bar / nav colors: match the manifest (`#F6F2EA` light surface)
- Splash: background `#F6F2EA`, icon from the 512 maskable
- Include the manifest `shortcuts` (Quran, Bible, Practices) when offered

## 2. Build the App Bundle

```bash
bubblewrap build        # produces app-release-bundle.aab + signs with the upload key
```

This creates an **upload keystore** on first run. Back it up — losing it blocks
future updates unless Play App Signing key rotation is used.

## 3. Upload to Play Console (internal testing track)

1. Create the app in Play Console ($25 developer account required).
2. Upload the `.aab` to the internal testing track.
3. Enable **Play App Signing** (recommended). Play re-signs with its own key.

## 4. Digital Asset Links (verifies the domain owns the app)

The final SHA-256 must be the **Play App Signing** key's, NOT the local upload
key (this is the common gotcha — a mismatch leaves a URL bar in the app).

1. Play Console → your app → **Setup → App integrity → App signing**.
2. Copy the **SHA-256 certificate fingerprint** of the *app signing key*.
3. Paste it into `public/.well-known/assetlinks.json`, replacing
   `REPLACE_WITH_PLAY_APP_SIGNING_SHA256_FINGERPRINT`.
4. Deploy the site, then verify it is reachable and returns 200:
   `curl https://wikisubmission.org/.well-known/assetlinks.json`
5. Reinstall the app from the internal track — a correctly verified TWA shows
   **no browser URL bar**.

Validate with Google's tester:
https://developers.google.com/digital-asset-links/tools/generator

## 5. Store listing & release

Required before production rollout:

- Privacy policy URL: https://wikisubmission.org/legal/privacy
- Data Safety form: declare push token + account data + audio streaming
- Content rating questionnaire
- Target audience / content declarations
- App icon (512²), feature graphic (1024×500), phone + 7" tablet screenshots

Promote internal → closed → production once verified.

## Quality gates (Android Vitals treats these as crashes)

- Digital Asset Links must verify at launch.
- Offline navigations must return HTTP 200 (handled by the `/offline` fallback).
- No 404/5xx on launch.
- Lighthouse PWA/quality score ≥ 80 on the production URL.

## Keeping in sync

The TWA reads the live manifest. Manifest/theme changes ship via the normal web
deploy. Rebuild + re-upload the AAB only when changing app-shell config
(package name, app name, splash, shortcuts, target SDK).
