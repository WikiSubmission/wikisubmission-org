# CLAUDE.md — wikisubmission-org (Next.js Monorepo)

## Project Overview

WikiSubmission.org — a pnpm monorepo serving a multilingual Quran reader and faith-based platform. Built with Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4, and Radix UI.

```
apps/web          SSR site (wikisubmission.org) — Next.js server, PWA via Serwist
apps/mobile       Capacitor 8 app (iOS/Android) — Next.js static export (output: 'export'),
                  no server features; the out/ bundle ships inside the native shell
packages/shared   Everything reused by both: quran-reader, quran-player, hooks, lib, src/api,
                  messages/ (i18n catalogs), ui primitives
```

The mobile tsconfig maps `@/*` to `["./*", "../../packages/shared/*"]` — a mobile-local file **shadows** the shared one of the same path (used deliberately, e.g. `apps/mobile/constants/fonts.ts`).

**Live site:** wikisubmission.org
**Backend API:** `https://ws-backend.wikisubmission.org/api/v1` (prod) / `http://localhost:8082/api/v1` (dev)
**Backend repo:** `../ws-backend` (relative to this project root)
**Backend OpenAPI spec:** `../ws-backend/openapi.yaml`

### Build tooling — webpack only, no Turbopack

**All builds and dev servers must use webpack** (`next build --webpack` / `next dev --webpack`). Turbopack broke when the Capacitor plugins were added for the PWA and Android — it cannot resolve the dynamic imports in the Capacitor/sqlite offline stack (e.g. `@sqlite.org/sqlite-wasm`) and fails with `Module not found: Can't resolve <dynamic>`. Both apps' package.json scripts already pass `--webpack`; **never run bare `next build`/`next dev`** (Next 16 defaults to Turbopack).

Common commands (run inside `apps/web` or `apps/mobile`):

```bash
pnpm dev            # next dev --webpack
pnpm build          # next build --webpack (mobile: static export to out/)
pnpm test           # vitest (both apps; mobile suite is node-env pure-logic tests in test/)
pnpm sync           # mobile only: bundles + build + cap sync into ios/ + android/
npx tsc --noEmit    # typecheck — MUST be run from the app dir, not the repo root
```

---

## Architecture

### App Router conventions

- Each app has its own `app/` tree with Next.js 16 App Router conventions
- Server Components fetch data directly (web only); Client Components use hooks/state
- Web route: `app/quran/[[...query]]/` — catch-all for all Quran reader pages; text queries are detected by `parseQueryType` in `page.tsx` and dispatch to the search results view (there is no separate `app/search/` route)
- Web route: `app/bible/[[...query]]/` — Bible reader (web only; hidden on mobile for now)
- Web marketing/content pages live in the `app/(site)/` route group
- Mobile routes mirror a subset (`app/quran/[chapter]/` is SSG via `generateStaticParams` — all 114 chapters prerendered; search lives at `app/quran/search/`)

### Data layer

Quran data is fetched directly from **ws-backend** via the type-safe `openapi-fetch` client at `packages/shared/src/api/`. The legacy `wikisubmission-sdk` package remains only in the web archive page (`app/(site)/archive/archive-client.tsx`).

| Area | Client |
| --- | --- |
| Quran verses & search | `packages/shared/src/api/client.ts` (`wsApi`) — openapi-fetch |
| Server-side Quran (SSR, web) | `packages/shared/src/api/server-client.ts` (`wsApiServer`) |
| Media / Newsletters (archive) | `wikisubmission-sdk` (legacy) |

---

## ws-backend API

Base URL: `process.env.NEXT_PUBLIC_API_URL`

Endpoints: **GET `/quran`** (verse ranges), **GET `/search`** (full-text), **GET `/chapters`** / **`/appendices`** / **`/languages`** (metadata, used in SSR layout). Full params live in the synced spec at `packages/shared/src/api/openapi.yaml` (regenerated types in `types.gen.ts`) — read those rather than duplicating the tables here.

### Response shape (Quran)

```typescript
// Minified key legend:
// cn = chapter_number, vk = verse_key (e.g. "1:1")
// tr = translations keyed by lang code
// tx = text, s = subtitle, f = footer, hl = search highlight
// w = words, r = root, m = meaning

interface QuranResponse {
  info: { result_count: number; total?: number; limit?: number; offset?: number }
  chapters: Array<{
    cn: number
    titles: Record<string, string>
    verses: VerseData[]
  }>
}

interface VerseData {
  vk: string
  tr: Record<string, { lc: string; d: 'ltr'|'rtl'; tx: string; s?: string; f?: string; hl?: string }>
  w?: WordData[]
}
```

### API client setup

```bash
# From apps/web: sync spec from backend repo, then regenerate types
pnpm sync-api   # cp ../../../ws-backend/openapi.yaml ../../packages/shared/src/api/openapi.yaml
pnpm generate   # openapi-typescript → packages/shared/src/api/types.gen.ts
```

---

## Quran Reader — Architecture

The Quran reader (shared `packages/shared/components/quran-reader/`, mounted by both apps) is the core feature. Understanding it is required before making any changes.

### Scroll model — window scrolling

The reader uses **window-level scrolling** via `react-virtuoso` v4 with the `useWindowScroll` prop. The page itself scrolls (no inner scroll container). This means:

- `window.scrollY` / `window.innerHeight` / `document.documentElement.scrollHeight` are the scroll primitives everywhere
- Virtuoso owns item measurement and windowing; each rendered item wrapper carries `data-index`, which the skeleton-reveal and seek logic query
- Seeking uses `virtuosoRef.current.scrollToIndex({ index, align, behavior })`
- (`@tanstack/react-virtual` survives only in the web word-lab page, `apps/web/app/quran/words/word-lab.tsx` — not in the reader)

**Do not revert to a contained scroll container.** Window scrolling was chosen so the browser's native scroll engine handles momentum/rubber-band/accessibility — no custom scroll logic needed.

### Fixed header stack

```
<div class="quran-fixed-headers">   ← position: fixed, top-0, z-50
  <SiteNav />                        ← 64px (h-16)
  <header class="h-14 ...">         ← 56px sub-header (only when a chapter/query is active)
</div>

<div class="pt-30">                  ← 120px offset (pt-16 when no sub-header)
  <QuranScrollContainer>             ← adds/removes `quran-page` class on <html>
    {children}
  </QuranScrollContainer>
</div>
```

`quran-fixed-headers` is a CSS class defined in `packages/shared/styles/globals.css` (all `globals.css` references in this document point there):

```css
.quran-fixed-headers { position: fixed; top: 0; left: 0; right: 0; z-index: 50; transition: transform 280ms ease; }
html[data-nav-hidden] .quran-fixed-headers { transform: translateY(-64px); }
```

On scroll-down the entire stack slides up 64px (hiding the SiteNav), giving 64px more reading space. The sub-header rises to `top-0`. `data-nav-hidden` is toggled by `useNavScroll` (hides after 120px down, shows only after 2000px continuous upward scroll).

### Native scrollbar suppression

`QuranScrollContainer` adds `quran-page` to `document.documentElement` on mount and removes it on unmount. `globals.css` hides the native scrollbar for that class:

```css
html.quran-page::-webkit-scrollbar { display: none; }
html.quran-page { scrollbar-width: none; }
```

The minimap is the sole scroll indicator on Quran pages. Other pages (home, `(site)` pages) are unaffected.

### Data flow (chapter view)

1. **SSR** (web `page.tsx`): fetches a 50-verse window with `en+ar` via `wsApiServer`. With `?verse=N` the window starts 5 verses before the target so `scrollToIndex` only crosses a few unmeasured items. (Mobile has no SSR — `ChapterReader` loads client-side, showing first-load skeletons.)
2. **`ChapterReader`** (client): receives `initialData`, mounts with verses already visible
3. **`useChapterReader`** hook (`packages/shared/hooks/use-chapter-reader.ts`): manages verse windows, load-more, seek, prefetch
4. **`Virtuoso`** (`react-virtuoso` v4, `useWindowScroll`): renders only visible verses; window is the scroll element
5. **Minimap** (`verse-minimap.tsx`): fixed right-edge overlay for fast seeking; uses pointer capture for drag-on-mobile

### SSR language mismatch

SSR always fetches `en+ar` (can't know client prefs). Client preferences hydrate from localStorage (zustand persist) right after first paint; if they differ from the SSR defaults, the memoized `opts` object changes reference and the reload effect re-fetches — anchored to the `?verse=N` target (or the current centre verse) so the user isn't yanked back to the start of the SSR window. An `isFirstMount` guard prevents a spurious reload when the prefs already match.

### URL sync + current-verse tracking

`?verse=N` is kept in sync with the verse at the viewport centre using `window.history.replaceState` (NOT `router.replace`). Using `router.replace` would re-render every `useSearchParams()` consumer on each scroll tick.

`currentVerseNumber` (drives the minimap dot and the URL) is computed in a **dedicated `window.scroll` listener** (not in the render body), so it updates on every scroll event instead of waiting for a React re-render. The centre verse is found by hit-testing the viewport centre against the DOM:

- Virtuoso reports the rendered window via `rangeChanged` into `visibleRangeRef`; the listener walks that index range and `getBoundingClientRect()`s each verse element (`document.getElementById(vk)`) to find the one straddling `scrollY + innerHeight / 2`
- At the extremes (`scrollY <= 8` / bottom −8px) it clamps to the first/last loaded verse
- The URL write is debounced 200ms, only after the user has actually scrolled, and suppressed while a seek is in flight

Minimap dot transition is `0.08s linear` (not `0.35s cubic-bezier`) so it tracks the scroll position directly without visible lag.

### Loading states

- **First load (no verses yet):** pulsing skeleton verse cards with staggered `animationDelay`; when real verses arrive, a GSAP stagger reveals the `[data-index]` item wrappers (`wasEmptyRef` gates it to the empty→filled transition only).
- **Loading glow (subsequent loads):** a pulsing inset ring (colored from `--primary`) along the list container's border — a plain overlay div animated with CSS `animate-pulse` + an opacity transition, compositor-only. (Replaced the old GSAP box-shadow tween, which repainted the full-height container every frame and caused load stutter.)

---

## Audio Player — Architecture

`packages/shared/lib/quran-audio-context.tsx` manages audio playback. It's shared across the monorepo — both `apps/web` and `apps/mobile` mount `QuranPlayerProvider` in their respective provider trees. It is split into three contexts to prevent unnecessary re-renders:

| Context | Contents | Re-renders when |
| --- | --- | --- |
| `QuranPlayerContext` | `currentVerse`, `isPlaying`, `queue`, `reciter`, `isBuffering`, `volume` + all callbacks | any state changes |
| `QuranPlayerCallbacksContext` | callbacks only (`playFromVerse`, `togglePlayPause`, `nextVerse`, …) | never (stable refs) |
| `QuranProgressContext` | `progress`, `duration`, `currentTime` | every `timeupdate` event |

**Hooks:** `useQuranPlayer()`, `useQuranPlayerCallbacks()`, `useQuranProgress()`

### Reciters and audio URLs

Five reciters: English translation audio `english-callum` (default) and `english-onyx`, and Arabic reciters `mishary` (Alafasy), `basit`, `minshawi`. Selection persists via `useLocalStorage('reciter', ...)`; the picker UI lives in the shared `now-playing-bar.tsx` (separate English/Arabic lists, desktop popover + mobile dialog variants). The bar is mounted by the web Quran layout and globally by the mobile shell (`positionClassName` prop offsets it above the mobile tab bar).

Audio is fetched directly from CloudFront — there is no backend proxy in the request path:

```
https://cdn.wikisubmission.org/media/quran-recitations/{folder}/{chapter}-{verse}.mp3
// folder = "english-onyx" | "arabic-{reciter}"
```

`../ws-lib` (deployed as `library.wikisubmission.org`) does **not** proxy or serve recitation audio — it's a generic S3-object file library unrelated to the Quran reader: it fuzzy-searches a Postgres-indexed table of S3 keys (`db.SearchObjects`) and redirects to a signed/public CloudFront URL via `/file/*filepath` (`aws/cloudfront.go`, `api/handlers/file.go`). Recitation mp3s aren't indexed through it, so the frontend talks to the `cdn.wikisubmission.org` CloudFront host directly instead.

A second, hidden `<audio>` element (`nextAudioRef`) preloads the next verse in the queue as soon as the current one starts playing.

### Stable callback pattern

Callbacks read mutable state via refs instead of closing over it, so they can have `[]` deps:

```typescript
// Synced each render — lets [] callbacks always see fresh state
currentVerseRef.current = currentVerse
queueRef.current = queue

const nextVerse = useCallback(() => {
  const q = queueRef.current  // reads current queue without being a dep
  // ...
}, [])  // stable reference — never recreated
```

### Per-card audio state

`VerseCard` does NOT call `useQuranPlayer()`. Instead, `ChapterReader` (`packages/shared/components/quran-reader/chapter-reader.tsx`) computes `isCurrentAudio = currentVerse?.verse_id === verse.vk` and passes it as a prop. This way only the active card re-renders when the verse advances, not all 300+. `ChapterReader` also keeps the player's queue synced to the currently loaded verse range via `setChapterQueue`.

`arePropsEqual` in `VerseCard`'s `memo` skips `isPlaying`/`isBuffering` checks for cards that are not currently playing.

### Word-by-word audio (separate system)

`packages/shared/lib/word-audio.ts` drives word-by-word audio playback (word-by-word display mode). It does not go through `QuranPlayerProvider` — it's a distinct, simpler playback path from the verse-level recitation system above.

---

## Performance Patterns

### `stateRef` for stable hook callbacks

`useChapterReader` exposes `loadMore`, `prefetch`, `seekToVerse` as stable references. They read current state via `stateRef.current` rather than closing over state, so callers can list them as deps without triggering infinite loops:

```typescript
const stateRef = useRef(state)
stateRef.current = state  // synced each render

const loadMore = useCallback((opts) => {
  const { lastVerseEnd } = stateRef.current  // never a stale closure
  // ...
}, [fetchVerses])  // stable
```

### `useMemo` for options objects

`opts` in `ChapterReader` is memoized on the API-relevant preferences (`primaryLanguage`, `secondaryLanguage`, `arabic`, `wordByWord`, `displayMode`). This prevents callbacks/effects that list `opts` as a dep from firing on unrelated re-renders — the reload-on-prefs-change effect keys off this reference.

### Global overflow

`packages/shared/styles/globals.css` sets `overflow-x: clip` on `html` to prevent any element from causing horizontal page scroll without breaking vertical scrolling or `position: fixed` elements.

---

## Mobile App (`apps/mobile`) — Essentials

- **Static export inside Capacitor 8.** `output: 'export'` — no route handlers, server actions, middleware, or image optimizer. All 114 chapter pages are SSG'd. `pnpm sync` builds and copies `out/` into the native projects.
- **Hydration discipline is critical.** The export prerenders at build time and hydrates in the webview; `useState` initializers must be side-effect-free and deterministic (React may replay them), or you get minified error #418.
- **Auth:** native token flow (Google/Apple/email OTP) with the session in encrypted storage (`@aparajita/capacitor-secure-storage`); access tokens auto-refresh single-flight with a 60s expiry skew, and the shared API client replays 401'd GET/HEAD requests once after refresh.
- **Offline content:** SQLite bundles downloaded from the backend, sha256-verified before install, staged via Filesystem cache then moved in by `@capacitor-community/sqlite`.
- **Animations are GSAP-only** (`apps/mobile/lib/gsap.ts` is the single registration point; `GsapPresence` replaces `AnimatePresence`; Flip powers shared-element flights).
- **Crash reporting:** global error/rejection listeners (`lib/crash-reporter.ts`) batch to `POST /api/v1/client-errors` on ws-backend; route + global error boundaries report too.
- **Notifications:** a soft in-app card precedes the one-shot OS permission dialog; notification tap routes are whitelisted in `lib/notification-routes.ts`.
- **Tests:** `pnpm test` — node-env Vitest suite over the pure logic in `apps/mobile/test/`.

---

## Key File Map

| File | Purpose |
| --- | --- |
| `apps/web/app/quran/[[...query]]/layout.tsx` | Quran layout: sidebar, header, audio player provider |
| `apps/web/app/quran/[[...query]]/page.tsx` | Server component: parses query, SSR-fetches verses, dispatches to ChapterReader or SearchResult |
| `packages/shared/components/quran-player/now-playing-bar.tsx` | Fixed audio player bar, reciter selection UI (shared by web + mobile) |
| `packages/shared/lib/media-session-adapter.ts` | OS media-session seam: web uses `navigator.mediaSession`, mobile registers a native Capacitor adapter |
| `packages/shared/components/quran-reader/chapter-reader.tsx` | Main chapter reader: virtual list, audio sync, URL sync, minimap |
| `packages/shared/components/quran-reader/result-search.tsx` | Quran text search results |
| `packages/shared/components/quran-reader/verse-card.tsx` | Individual verse card (memoized) |
| `packages/shared/components/quran-reader/verse-minimap.tsx` | Right-edge seek minimap |
| `packages/shared/hooks/use-chapter-reader.ts` | Verse window management (load, load-more, seek, prefetch) |
| `packages/shared/hooks/use-quran-preferences.ts` | User language + display preferences |
| `packages/shared/lib/quran-audio-context.tsx` | Audio player context (3-context split), shared by web + mobile |
| `packages/shared/lib/word-audio.ts` | Word-by-word audio playback (separate from verse recitation) |
| `packages/shared/src/api/client.ts` | openapi-fetch client (browser) |
| `packages/shared/src/api/server-client.ts` | openapi-fetch client (server/SSR) |
| `packages/shared/src/api/types.gen.ts` | Generated TypeScript types from OpenAPI spec |
| `packages/shared/src/api/openapi.yaml` | Synced OpenAPI spec from ws-backend |
| `packages/shared/src/api/base-url.ts` | Resolves server vs browser API base URLs from env |
| `apps/mobile/lib/mobile-auth-storage.ts` | Session persistence in Keychain/Keystore (secure storage) |
| `apps/mobile/lib/register-api-auth-mobile.ts` | Token provider + single-flight refresh wired into the shared API client |
| `apps/mobile/lib/crash-reporter.ts` | Global error listeners → `POST /api/v1/client-errors` on ws-backend |
| `apps/mobile/lib/gsap.ts` | Single GSAP registration point (Flip plugin, shared eases) |
| `apps/mobile/components/startup-zikr-overlay.tsx` | Startup splash animation (GSAP timeline + Flip flight to Today) |

---

## Environment Variables

Resolved in `packages/shared/src/api/base-url.ts`:

```bash
# Server-side (SSR, apps/web): INTERNAL_API_URL wins (Railway-internal host),
# NEXT_PUBLIC_API_URL is the fallback.
NEXT_PUBLIC_API_URL=https://ws-backend.wikisubmission.org/api/v1   # dev: http://localhost:8082/api/v1

# Browser-side: defaults to the same-origin /api/ws proxy on web. The mobile
# static export has no proxy, so its next.config.ts bakes in an absolute URL.
NEXT_PUBLIC_BROWSER_API_URL=https://ws-backend.wikisubmission.org/api/v1
```

---

## Conventions

- **Server Components** for initial data fetches (SSR)
- **Client Components** (`'use client'`) for interactive state
- URL search params (`?verse=N`) for scroll position — survives refresh, shareable
- Use `window.history.replaceState` (NOT `router.replace`) for frequently-updating URL state to avoid triggering Next.js router re-renders
- `useSearchParams()` in the smallest possible component scope — it re-renders on every `replaceState` call
- Don't mock the API in tests — the backend has a real `/health` endpoint
- No magic height subtractions — use flex chain with `flex-1 min-h-0` throughout

---

## Everything Claude Code — Useful Skills

Invoke these as slash commands in Claude Code (VSCode extension or terminal — both work identically).

| Command | When to use |
| --- | --- |
| `/everything-claude-code:typescript-reviewer` | After writing or modifying any TS/React/Next.js code |
| `/everything-claude-code:security-reviewer` | After touching auth, API routes, user input, or env vars |
| `/everything-claude-code:code-reviewer` | General post-session code quality pass |
| `/everything-claude-code:planner` | Before starting a non-trivial feature — get a step-by-step plan |
| `/everything-claude-code:architect` | For architectural decisions (new routes, context splits, data layer changes) |
| `/everything-claude-code:build-error-resolver` | When `next build` or `tsc` fails |
| `/everything-claude-code:frontend-patterns` | React/Next.js pattern questions |
| `/everything-claude-code:tdd` | When writing new features test-first |
| `/everything-claude-code:refactor-cleaner` | Dead code cleanup, unused imports, consolidation |
| `/everything-claude-code:doc-updater` | After significant changes — update READMEs and codemaps |
