# WikiSubmission Desktop

The Quran browser as an offline desktop app (Windows, macOS, Linux). A static
Next.js export runs in Electron and talks to a bundled ws-backend sidecar with
its own embedded PostgreSQL. Only recitation audio and appendix videos need the
internet. The plan and its progress are in `docs/desktop-offline-plan.md`
(local, gitignored).

```
Electron main (electron/)
 ├─ starts ws-backend --desktop (host/sidecar.mts)
 │    └─ embedded Postgres + Quran content snapshot + the user's data
 └─ serves app://wikisubmission/
      ├─ static export from out/ (host/static-routes.mts)
      └─ /api/ws/* proxied to the sidecar with the local user's token
         (electron/app-protocol.ts); the page never sees the token
```

## What you need

From ws-backend (`../../../ws-backend`, branch `feat/desktop-offline`):

- the sidecar binary: `just desktop-build windows amd64 <out-dir>`
- a content snapshot: `just desktop-snapshot <backup.sql.gz> <out-dir>`
- the embedded Postgres archive `embedded-postgres-binaries-<os>-<arch>-18.3.0.txz`

Point the app at them in `host.config.local.json` (gitignored) or the same
names as environment variables:

```json
{
  "WS_DESKTOP_SIDECAR": "D:/work/dist/ws-backend-desktop-windows-amd64.exe",
  "WS_DESKTOP_PG_ARCHIVE": "D:/work",
  "WS_DESKTOP_SNAPSHOT": "D:/work/snapshot",
  "WS_DESKTOP_DATA": "D:/work/data"
}
```

`WS_DESKTOP_DATA` is optional: the Electron app defaults to its user-data
folder, the dev host to `.desktop-data/`. Never point two running instances at
the same data folder.

## Commands

```bash
pnpm build          # static export to out/ (webpack, as everywhere in this repo)
pnpm electron       # bundle electron/ and run the app against out/
pnpm host:static    # same app in a normal browser at http://127.0.0.1:3200
pnpm dev            # next dev on :3100, then:
pnpm host:dev       # browser host in front of next dev, with hot reload
pnpm test           # unit tests (static route resolver, API path mapping)
pnpm typecheck      # app and Electron main
```

If `node_modules/electron/dist` is missing after `pnpm install`, run
`node node_modules/electron/install.js` once.

## Packaging and releases

```bash
pnpm dist:dir       # unpacked app in dist/<platform>-unpacked, for testing
pnpm dist           # installer for this platform in dist/
```

Both stage the backend pieces into `build-resources/` first
(`scripts/stage-resources.mjs`, same settings as above, or `--sidecar`,
`--pg`, `--snapshot`). The Postgres archive for any platform comes from
ws-backend, checksum-verified: `just desktop-pg-archive <goos> <goarch> <dir>`.

Releases are built by `.github/workflows/desktop-release.yml` on Windows x64,
macOS (Apple silicon and Intel) and Linux x64. Each job builds the sidecar,
fetches its Postgres, runs the backend end-to-end test on that OS, then
packages the app. Pushing a `desktop-v<version>` tag also drafts a GitHub
Release with the installers; running it by hand only uploads build artifacts.

One-time setup the workflow needs:

1. The content snapshot as a release asset of this repository (done for
   content version 293bd5156a03597e): a release
   tagged `desktop-content-<content version>` with `desktop-content.tar.gz`
   (`tar -czf desktop-content.tar.gz -C <snapshot folder> .`).
2. A `WS_BACKEND_TOKEN` secret (ws-backend is private): a fine-grained token
   with read-only Contents access to WikiSubmission/ws-backend.
3. Optional signing secrets, listed at the top of the workflow. Without them
   the installers are unsigned: Windows shows a SmartScreen warning and macOS
   requires right-click, Open on first launch.

## How it differs from apps/web

- No server: data loads on the client from the local backend.
- Free-form Quran URLs (`/quran/2:255`, verse lists, text search) live at
  `/quran/search/?q=` because the export has one page per chapter. Links go
  through `packages/shared/lib/quran-links.ts`; the host redirects anything
  else.
- The reader chrome is imported from `apps/web` through the `@web/*` alias.
  `next-auth/react` is aliased to `lib/next-auth-shim.ts` (one local user who
  is always signed in).
- Appendix text comes from the bundled content, never from a backend.
- Settings are desktop-specific: language, theme, backup and restore.
