# wikisubmission-org

Source code repository for [https://wikisubmission.org](https://wikisubmission.org).

## Local Setup

Clone the repository:

```zsh
git clone git@github.com:wikisubmission/wikisubmission-org
```

Install dependencies using `pnpm`:

```zsh
pnpm install
```

Launch the application ([http://localhost:3000](http://localhost:3000)):

```zsh
pnpm dev
```

## Docker / Coolify Deployment

This repository now includes a production `Dockerfile` for Coolify.

Build and run locally:

```zsh
docker build -t wikisubmission-org .
docker run --rm -p 3000:3000 \
  -e AUTH_SECRET=... \
  -e WS_BACKEND_JWT_SECRET=... \
  -e AUTH_OTP_SECRET=... \
  -e NEXT_PUBLIC_SITE_URL=http://localhost:3000 \
  -e NEXT_PUBLIC_BROWSER_API_URL=/api/ws \
  -e NEXT_PUBLIC_API_URL=http://localhost:8080/api/v1 \
  -e INTERNAL_API_URL=http://ws-backend:8080/api/v1 \
  -e NEXT_PUBLIC_VAPID_PUBLIC_KEY=... \
  -e AWS_SES_ACCESS_KEY_ID=... \
  -e AWS_SES_SECRET_ACCESS_KEY=... \
  -e AWS_SES_REGION=us-east-1 \
  -e AWS_SES_FROM_ADDRESS=noreply@wikisubmission.org \
  wikisubmission-org
```

Coolify configuration notes:

- Build context: repository root
- Dockerfile path: `./Dockerfile`
- Exposed port: `3000`
- Set the same required environment variables for both the build step and runtime container

Required environment variables:

- `AUTH_SECRET` - Auth.js session secret; generate at least 32 random bytes.
- `WS_BACKEND_JWT_SECRET` - shared HS256 secret used to mint frontend bearer tokens for `ws-backend`; must match `ws-backend`.
- `AUTH_OTP_SECRET` - HMAC key for email OTP codes; keep separate from `AUTH_SECRET`.
- `NEXT_PUBLIC_SITE_URL` - canonical site URL.
- `NEXT_PUBLIC_BROWSER_API_URL` - browser API base; normally `/api/ws` so the Next.js proxy can call the backend.
- `NEXT_PUBLIC_API_URL` - public backend API fallback for server-side calls, e.g. `https://api.wikisubmission.org/api/v1`.
- `INTERNAL_API_URL` - internal backend API base for server-side calls, e.g. `http://ws-backend:8080/api/v1`.
- `NEXT_PUBLIC_VAPID_PUBLIC_KEY` - browser VAPID public key for web push.
- `AWS_SES_ACCESS_KEY_ID` - AWS SES access key for OTP email.
- `AWS_SES_SECRET_ACCESS_KEY` - AWS SES secret key for OTP email.
- `AWS_SES_REGION` - SES region; defaults to `us-east-1` when omitted.
- `AWS_SES_FROM_ADDRESS` - verified SES sender; defaults to `noreply@wikisubmission.org` when omitted.

Additional environment variables used by optional integrations:

- `NEXT_PUBLIC_APP_URL`
- `STRIPE_SECRET_KEY`
- `SANITY_PROJECT_ID`
- `NEXT_PUBLIC_SANITY_PROJECT_ID`
- `SANITY_DATASET`
- `NEXT_PUBLIC_SANITY_DATASET`
- `SUBMITTERAI_API_KEY`
- `SUBMITTERAI_API_URL`

Recommended runtime variables:

- `PORT=3000`
- `HOSTNAME=0.0.0.0`

Run `pnpm lint` before `pnpm build`; the build generates `public/sw.js` and `public/swe-worker-*.js`, which are intentionally ignored by ESLint.
## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for more information.

## Contact

Email: [developer@wikisubmission.org](mailto:developer@wikisubmission.org)
