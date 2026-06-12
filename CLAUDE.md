# CLAUDE.md — wikisubmission-org (Next.js Frontend)

## Project Overview

WikiSubmission.org frontend — a Next.js 16 (App Router) application serving as a multilingual Quran reader and faith-based platform. Built with React 19, TypeScript, Tailwind CSS 4, and Radix UI.

**Live site:** wikisubmission.org
**Backend API:** `https://ws-backend.wikisubmission.org/api/v1` (prod) / `http://localhost:8082/api/v1` (dev)
**Backend repo:** `../ws-backend` (relative to this project root)
**Backend OpenAPI spec:** `../ws-backend/openapi.yaml`

> **Frontend redesign in progress.** New UI is being actively built on the `feat/new-ui` branch. Core data-fetching, audio, and performance patterns below must be preserved through the redesign.

---

## Architecture

### App Router conventions

- All pages live under `app/` with Next.js 16 App Router conventions
- Server Components fetch data directly; Client Components use hooks/state
- Route: `app/quran/[[...query]]/` — catch-all for all Quran reader pages
- Route: `app/search/` — unified search page (Quran + Media + Newsletters)

### Data layer

Quran data is fetched directly from **ws-backend** via the type-safe `openapi-fetch` client at `src/api/`. The legacy `wikisubmission-sdk` package is still used for Media and Newsletter queries in `app/search/search-client.tsx`.

| Area | Client |
| --- | --- |
| Quran verses & search | `src/api/client.ts` (`wsApi`) — openapi-fetch |
| Server-side Quran (SSR) | `src/api/server-client.ts` (`wsApiServer`) |
| Media / Newsletters | `lib/wikisubmission-sdk.ts` (SDK, legacy) |

---

## ws-backend API

Base URL: `process.env.NEXT_PUBLIC_API_URL`

**GET `/quran`** — Fetch a range of verses

| Param | Type | Required | Notes |
| --- | --- | --- | --- |
| `chapter_number_start` | integer | ✅ | |
| `chapter_number_end` | integer | | |
| `verse_start` | integer | | |
| `verse_end` | integer | | |
| `langs` | string[] | ✅ | e.g. `["en"]`, `["en","ar"]` |
| `include_words` | boolean | | word-by-word breakdown |
| `include_root` | boolean | | requires `include_words` |
| `include_meaning` | boolean | | requires `include_words` |

**GET `/search`** — Full-text search

| Param | Type | Notes |
| --- | --- | --- |
| `q` | string | 2–200 chars |
| `langs` | string[] | restrict to languages |
| `scope` | `verses\|words` | default `verses` |
| `limit` | integer | 1–100, default 20 |
| `offset` | integer | for pagination |
| `include_words` / `include_root` / `include_meaning` | boolean | |

**GET `/chapters`**, **GET `/appendices`**, **GET `/languages`** — metadata endpoints used in SSR layout.

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
# Sync spec from backend repo, then regenerate types
npm run sync-api   # cp ../ws-backend/openapi.yaml src/api/openapi.yaml
npm run generate   # openapi-ts --input src/api/openapi.yaml --output src/api/types.gen.ts
```

---

## Quran Reader — Architecture

The Quran reader (`app/quran/[[...query]]/`) is the core feature. Understanding it is required before making any changes.

### Scroll model — window scrolling

The reader uses **window-level scrolling** via `useWindowVirtualizer` from `@tanstack/react-virtual` v3. The page itself scrolls (no inner scroll container). This means:

- `window.scrollY` / `window.innerHeight` / `document.documentElement.scrollHeight` are the scroll primitives everywhere
- The virtual list container is a **fixed-height `position: relative` div** sized to `virtualizer.getTotalSize()` — it drives page height but does not scroll internally
- Each virtual item uses `position: absolute; transform: translateY(item.start - scrollMargin)` where `scrollMargin` = distance from document top to the list container (measured via `useLayoutEffect`)
- `scrollPaddingStart: 120` in virtualizer options keeps `scrollToIndex` results below the fixed header stack

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

`quran-fixed-headers` is a CSS class defined in `globals.css`:

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

The minimap is the sole scroll indicator on Quran pages. Other pages (home, search) are unaffected.

### Data flow (chapter view)

1. **SSR** (`page.tsx`): fetches first 50 verses with `en+ar` via `wsApiServer`
2. **`ChapterReader`** (client): receives `initialData`, mounts with verses already visible
3. **`useChapterReader`** hook (`hooks/use-chapter-reader.ts`): manages verse windows, load-more, seek, prefetch
4. **`useWindowVirtualizer`** (`@tanstack/react-virtual` v3): renders only visible verses; window is the scroll element
5. **Minimap** (`verse-minimap.tsx`): fixed right-edge overlay for fast seeking; uses pointer capture for drag-on-mobile

### SSR language mismatch

SSR always fetches `en+ar` (can't know client prefs). On mount, `ChapterReader` checks if the user's primary language is present in the SSR data and reloads if not. This is handled in a one-time `useEffect([], [])`.

### URL sync

`?verse=N` is kept in sync with the verse at the viewport centre using `window.history.replaceState` (NOT `router.replace`). Using `router.replace` would re-render all `useSearchParams()` consumers — including all 114 sidebar chapter links.

**Overscan bias:** `useWindowVirtualizer` renders overscan items outside the viewport. The midpoint of `getVirtualItems()` is biased. Always use scroll position to find the truly visible centre item:
```typescript
const centerY = window.scrollY + window.innerHeight / 2
const centerItem = items.find(v => v.start <= centerY && v.start + v.size > centerY)
```

### Minimap sync

`currentVerseNumber` is computed in a **dedicated `window.scroll` listener** (not in the render body). This means the minimap dot updates on every scroll event rather than waiting for React to re-render from the virtualizer's batched subscription.

The listener reads `verses` and `virtualizer` through `minimapStateRef.current` (synced each render) — a stable `[]` listener with no stale closures.

Minimap dot transition is `0.08s linear` (not `0.35s cubic-bezier`) so it tracks the scroll position directly without visible lag.

### GSAP border loader

`useChapterBorderLoader(listRef, loading)` runs a GSAP animation on the virtual list container's border while verses are loading. A green glow pulses around the card outline, completing with a flash when the first batch arrives. Hook lives at `hooks/use-chapter-border-loader.ts`.

### Sidebar `useSearchParams` isolation

`useSearchParams()` fires on every `window.history.replaceState` call (Next.js patches it). Putting it in a tiny sub-component (`BackToQuranLink`) prevents the 114 chapter links from re-rendering on every scroll.

---

## Audio Player — Architecture

`lib/quran-audio-context.tsx` manages audio playback. It is split into three contexts to prevent unnecessary re-renders:

| Context | Contents | Re-renders when |
| --- | --- | --- |
| `QuranPlayerContext` | `currentVerse`, `isPlaying`, `queue`, `reciter`, `isBuffering`, `volume` + all callbacks | any state changes |
| `QuranPlayerCallbacksContext` | callbacks only (`playFromVerse`, `togglePlayPause`, `nextVerse`, …) | never (stable refs) |
| `QuranProgressContext` | `progress`, `duration`, `currentTime` | every `timeupdate` event |

**Hooks:** `useQuranPlayer()`, `useQuranPlayerCallbacks()`, `useQuranProgress()`

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

`VerseCard` does NOT call `useQuranPlayer()`. Instead, `ChapterReader` computes `isCurrentAudio = currentVerse?.verse_id === verse.vk` and passes it as a prop. This way only the active card re-renders when the verse advances, not all 300+.

`arePropsEqual` in `VerseCard`'s `memo` skips `isPlaying`/`isBuffering` checks for cards that are not currently playing.

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

`opts` in `ChapterReader` is memoized on `[primaryLanguage, secondaryLanguage, arabic]`. This prevents callbacks that list `opts` as a dep from recreating on unrelated re-renders.

### `overscroll-contain` on verse list

The `parentRef` scroll container has `overscroll-contain` to prevent the iOS rubber-band from propagating to the page when the user hits the top/bottom of the verse list.

### Global overflow

`globals.css` sets `overflow-x: clip` on `html` to prevent any element from causing horizontal page scroll without breaking vertical scrolling or `position: fixed` elements.

---

## Key File Map

| File | Purpose |
| --- | --- |
| `app/quran/[[...query]]/layout.tsx` | Quran layout: sidebar, header, audio player provider |
| `app/quran/[[...query]]/page.tsx` | Server component: parses query, SSR-fetches verses, dispatches to ChapterReader or SearchResult |
| `app/quran/[[...query]]/client-components/chapter-reader.tsx` | Main chapter reader: virtual list, audio sync, URL sync, minimap |
| `app/quran/[[...query]]/client-components/sidebar.tsx` | Chapter navigation sidebar (114 chapters + appendices) |
| `app/quran/[[...query]]/client-components/result-search.tsx` | Quran text search results |
| `app/quran/[[...query]]/client-components/now-playing-bar.tsx` | Fixed audio player bar |
| `app/quran/[[...query]]/mini-components/verse-card.tsx` | Individual verse card (memoized) |
| `app/quran/[[...query]]/mini-components/verse-minimap.tsx` | Right-edge seek minimap |
| `app/search/search-client.tsx` | Unified search (Quran + Media + Newsletters) |
| `hooks/use-chapter-reader.ts` | Verse window management (load, load-more, seek, prefetch) |
| `hooks/use-quran-preferences.ts` | User language + display preferences |
| `lib/quran-audio-context.tsx` | Audio player context (3-context split) |
| `src/api/client.ts` | openapi-fetch client (browser) |
| `src/api/server-client.ts` | openapi-fetch client (server/SSR) |
| `src/api/types.gen.ts` | Generated TypeScript types from OpenAPI spec |
| `src/api/openapi.yaml` | Synced OpenAPI spec from ws-backend |

---

## Environment Variables

```bash
NEXT_PUBLIC_API_URL=https://ws-backend.wikisubmission.org/api/v1
# or for local dev:
NEXT_PUBLIC_API_URL=http://localhost:8082/api/v1
```

---

## Tech Stack

| Concern | Library |
| --- | --- |
| Framework | Next.js 16 (App Router) |
| Language | TypeScript + React 19 |
| Styling | Tailwind CSS 4 + Radix UI |
| Virtual list | `@tanstack/react-virtual` v3 |
| Data fetching | `@tanstack/react-query` v5 + `openapi-fetch` |
| Auth | `next-auth` v5 (Auth.js) |
| State | Zustand v5 |
| Animation | Framer Motion v12 |
| Notifications | Sonner v2 |
| Validation | Zod v4 |
| i18n | `next-intl` v4 |

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
