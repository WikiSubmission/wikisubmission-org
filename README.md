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
  -e NEXT_PUBLIC_SITE_URL=http://localhost:3000 \
  -e NEXT_PUBLIC_SUPABASE_URL=... \
  -e NEXT_PUBLIC_SUPABASE_ANON_KEY=... \
  -e SUPABASE_SERVICE_ROLE_KEY=... \
  -e NEXT_PUBLIC_API_URL=... \
  wikisubmission-org
```

Coolify configuration notes:

- Build context: repository root
- Dockerfile path: `./Dockerfile`
- Exposed port: `3000`
- Set the same required environment variables for both the build step and runtime container

Required environment variables:

- `NEXT_PUBLIC_SITE_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_API_URL`

Additional environment variables used by optional integrations:

- `INTERNAL_API_URL`
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
## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for more information.

## Contact

Email: [developer@wikisubmission.org](mailto:developer@wikisubmission.org)
