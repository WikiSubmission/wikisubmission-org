# mobile (Capacitor)

Native iOS + Android app built from a Next.js **static export** (`output: 'export'`)
wrapped by Capacitor. SSR stays in `apps/web`; this app is client-only and shares
code from `packages/shared` via the `@/*` path alias.

## Build

```bash
pnpm --filter mobile build      # produces apps/mobile/out/
pnpm --filter mobile sync       # build + cap sync (needs native projects)
pnpm --filter mobile ios        # cap open ios   (needs Xcode)
pnpm --filter mobile android    # cap open android (needs Android Studio)
```

The native `ios/` and `android/` projects do not exist yet. Create them once a
native toolchain is available:

```bash
cd apps/mobile
pnpm exec cap add ios
pnpm exec cap add android
```

## Auth

There is no next-auth on mobile. `MobileAuthProvider`
(`components/mobile-auth-context.tsx`) runs the native Google / Apple flow via
`@capgo/capacitor-social-login`, exchanges the provider ID token at the
ws-backend native-auth endpoints, and stores the session in
`@capacitor/preferences`:

- `POST /api/v1/auth/mobile/exchange` — provider ID token to backend session
- `POST /api/v1/auth/mobile/refresh` — rotate an expiring session

The shared API client reads the stored access token through
`registerMobileApiAuth()` (`lib/register-api-auth-mobile.ts`).

## Environment

`NEXT_PUBLIC_BROWSER_API_URL` defaults to the production backend in
`next.config.ts`. The native sign-in plugin needs these public client IDs at
build time, which must match the backend allowlist
(`AUTH_GOOGLE_MOBILE_CLIENT_IDS` / `AUTH_APPLE_BUNDLE_IDS`):

- `NEXT_PUBLIC_GOOGLE_WEB_CLIENT_ID`
- `NEXT_PUBLIC_GOOGLE_IOS_CLIENT_ID`
- `NEXT_PUBLIC_APPLE_CLIENT_ID`

Set them in a (gitignored) `.env.local` or the CI build environment.
