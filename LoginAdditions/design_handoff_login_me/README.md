# Handoff — `/me` Profile & Login Features

A design package for the **`feat/login`** branch of `WikiSubmission/wikisubmission-org`. Covers:

- Authentication flow (`/auth/sign-in`, `/auth/verify`)
- `/me` profile page (heavy-user + new-user states, desktop + mobile)
- Bookmarks UI inside the `/quran` reader
- Notes UI inside the `/quran` reader
- `/me/notes` and `/me/bookmarks/[id]` editorial layouts

---

## 1 · How to read this package

The files in this folder are **design references created in HTML/React (Babel-transpiled in-browser)**. They are *not* production code. Your job is to **recreate the designs inside the existing Next.js + Tailwind codebase**, reusing its established patterns (`@/components/ui/*`, `next-auth`, `@tanstack/react-query`, the existing `meApi` / hooks layer, etc.).

Read this README and the source files (`components/*.jsx`, `me.css`, `colors_and_type.css`) and reproduce the look and behaviour pixel-by-pixel. Do **not** introduce new design tokens or fonts — everything you need is documented in §5.

### Fidelity

**High-fidelity.** Final typography, color, spacing, hairlines, and component states are locked in. Treat numbers as authoritative.

### How to run the reference locally

Open `index.html` in any modern browser. No build step. The page is a `<DesignCanvas>` containing every screen as a separate artboard (drag, focus-fullscreen with the icon on hover). Use the **Tweaks** panel (bottom-right) to flip palette (Ink / Violet / Mono), light/dark, density, and the user-state toggle (heavy user vs. new user).

### File map

| File | What it is |
|---|---|
| `index.html` | Entry point — composes the `<DesignCanvas>` of every screen. |
| `me.css` | All custom CSS for the design — every selector you see in the components. |
| `colors_and_type.css` | Brand design system (palettes, fonts, type scale, geometry tokens). |
| `components/auth.jsx` | Sign-in & verify screens. |
| `components/profile.jsx` | `/me` page (heavy user + new user). |
| `components/quran-screens.jsx` | Bookmarks + Notes in `/quran`, `/me/notes` index, `/me/bookmarks/[id]`. |
| `components/shared.jsx` | Sample data, browser/phone frames, top-nav reproduction. |
| `components/icons.jsx` | Minimal SVG icons. **Map these to `lucide-react` + provider-brand icons in implementation** (see §6). |
| `assets/`, `fonts/` | Brand assets already present in the repo at `public/brand-assets/` and the font stack. |
| `design-canvas.jsx`, `tweaks-panel.jsx`, `browser-window.jsx`, `ios-frame.jsx` | Presentation chrome — **not** part of what you ship. |

---

## 2 · Scope vs. what's already on the branch

The data plumbing is in place. **Do not rewrite hooks or API contracts.** Reuse them as you swap markup/styles.

| Existing file in branch | What to do |
|---|---|
| `app/auth/sign-in/sign-in-form.tsx` | **Replace** with the new editorial sign-in layout (§4.1). Add Discord provider. |
| `app/auth/verify/verify-form.tsx` | **Replace** with the new OTP screen (§4.2). |
| `app/me/page.tsx` + `app/me/me-client.tsx` | **Replace** with the new editorial profile (§4.3). Hooks (`useStreak`, `useCoverToCoverProgress`, `useBookmarkCategories`, `useCollections`, `useNoteCount`) keep the same contracts. |
| `app/me/notes/page.tsx` | **Replace** with the new editorial index (§4.6). The `meApi.getNotes` query stays. |
| `app/me/bookmarks/page.tsx` | **Remove** — categories are now a section on `/me` itself; redirect this route to `/me#bookmarks`. |
| `app/me/bookmarks/[id]/page.tsx` | **Replace** with the new editorial detail layout (§4.7). |
| `app/quran/.../mini-components/bookmarks-dialog.tsx` | **Replace** with the new side-sheet (desktop) / bottom-sheet (mobile) — see §4.4. The "add to category" flow is its primary use; the "manage categories" affordance lives at `/me` now. |
| `app/quran/.../mini-components/notes-dialog.tsx` | **Repurpose** as the in-reader note **editor** dialog — single verse, full editor (§4.5). The "browse all notes" experience moves to `/me/notes`. |
| `app/quran/.../mini-components/multi-select-bar.tsx` | Restyle to the editorial dark bar (§4.4). |

### Data model gap to confirm with backend

The design adds three things the current `NoteData` shape doesn't yet support:

1. **Tags** (`string[]`, e.g. `["tafsir", "study"]`)
2. **Markdown content** (currently `content` is rendered as plain text)
3. **Verse cross-references** inside the body (rendered as `§ 36:69` pills linking to the verse)

The UI is designed to accept all three, but is forward-compatible if some land later. Flag this with the data owner before starting.

---

## 3 · Information architecture

```
/auth/sign-in        Sign in — magic link primary, OAuth secondary
  ↳ /auth/verify     6-digit code entry
/me                  Editorial profile — masthead, stats, c2c, bookmarks,
                     notes preview, collections, sign-out
  ↳ /me/bookmarks/:id   Category detail (verse list)
  ↳ /me/notes        Full notes index with search + tag filters
  ↳ /me/collections  (existing; out of scope this round)
/quran/...           Reader, augmented with:
                       · bookmark side-sheet (desktop) / bottom-sheet (mobile)
                       · multi-select bar (across the bottom)
                       · note editor as a centered MODAL DIALOG
                       · margin notes shown inline below each verse on mobile
```

**Key rule:** notes inside the reader are a **modal dialog**, not a side panel and not a separate page. The "browse all notes" experience lives at `/me/notes` and is reachable from the `/me` profile (§ III link) and from the top-nav user menu.

---

## 4 · Screen-by-screen

Class names referenced below are defined in `me.css`. Look at the matching artboard in `index.html` for the visual source of truth.

### 4.1 Sign in — `/auth/sign-in`

Centered card, `max-width: 380px`. Source: `components/auth.jsx → AuthSignIn`.

- **Logo** 36px, centered.
- **Eyebrow** "Sign in" — Glacial Indifference 10.5px, tracking `0.18em`, color `--ed-accent`.
- **H1** Cormorant Garamond weight 500, `36px`, letter-spacing `-0.025em`. Italic accent on "of the scripture" in `--ed-accent`.
- **Lede** Source Serif 14px, `--ed-fg-muted`, max 32ch, line-height 1.5.
- **Email input** underline-only border (`1px` bottom, `--ed-rule`); focus flips to `--ed-accent`. Source Serif 15px. No box, no radius on the input.
- **Primary button** (`.auth-primary`) solid `--ed-fg` bg, `--ed-bg` text, 1px matched border, radius 2px, 13px vertical pad. Mail icon left of label.
- **Divider** "OR CONTINUE WITH" centered between two 1px rules.
- **OAuth providers** (`.auth-provider`) outlined rows: Google (full-color), Apple (monochrome), Discord (Discord-blue glyph `#5865F2`). Hover bumps border to `--ed-fg` and bg to `--ed-bg-alt`. `→` glyph right-aligned.
- **Footer** italic Cormorant 12.5px: "We will never email you anything other than what you ask for. Read the privacy note."

**Behaviour:** keep all existing logic — `fetch('/api/auth/send-otp')`, redirect to `/auth/verify?email=…&next=…`, NextAuth OAuth callbacks. Add a third `signIn('discord')` handler.

### 4.2 Verify code — `/auth/verify`

Source: `components/auth.jsx → AuthVerify`.

- Same masthead pattern: logo · eyebrow "Check your email" · H1 with italic accent on "A six-digit" · lede with bolded email.
- **OTP boxes** (`.otp-box`) 6 cells in CSS grid, gap 6px. Aspect-ratio `1 / 1.2`. 1px border in `--ed-rule`, no radius. Digit: Cormorant 500, 28px.
  - **Active** cell: border-color `--ed-accent`, bottom border 2px.
  - **Filled** cell: border-color `--ed-fg-muted`.
- **Footer line** "Didn't receive it? Resend or use a different method." Cormorant 13px, muted.

**Behaviour:** existing `code.map` logic, paste handler (digits-only, 6-char slice), auto-advance, auto-submit when all six filled. On error reset to empty and refocus first cell.

### 4.3 `/me` profile (heavy user, default)

Source: `components/profile.jsx → MePage / HeavyUser`.

Single column, `max-width: 1080px`, `padding: 56px 40px 96px`. Density modifier classes (`.compact`, `.spacious`) are nice-to-have; ship comfy default.

**Sections, top to bottom:**

#### Masthead (`.profile-mast`)
Two-column grid: title on the left, "Member since…" / "Last read…" rail on the right.
- **Eyebrow row** small `--ed-accent` square + "Vol. IV · MMXXVI · Reader's Edition" (Glacial 10.5px, tracked).
- **H1** Cormorant 500, `clamp(38px, 5vw, 56px)`, letter-spacing `-0.025em`. **Last name italicized in `--ed-accent`** as a visual hook. Split user's `name` on whitespace; render last token in `<em>`.
- **Meta row** mono 12px, muted: `email · @handle · Edit profile · Settings`. Separator `·` in `--ed-rule`.
- **Right rail** "— Member since April —" italic Cormorant 16px; below it tracked small-caps "Last read · 2 hours ago".
- Bottom 1px rule.

#### Stats (`.stats`)
4 equal columns separated by 1px rules, framed top + bottom by the same.
- Each cell: 24px pad. Eyebrow Glacial 10px tracked. Big number Cormorant 500 `56px`, with optional small italic unit (e.g. `47 days`). Sub-line italic Cormorant 13px in muted.
- **Mobile**: 2×2 grid with rules on all internal edges; number drops to 36px.
- Cells are links: Quran streak → `/me/streak`, Notes → `/me/notes`, Bookmarks → `/me#bookmarks`.

#### § I · Cover *to* cover (`.c2c-grid`)
Two cards side-by-side (one column on mobile), separated by 1px rules and wrapped in one 1px border.
- Each card: title (Cormorant 500 24px) + mono pill `QURAN · 31%` on the right.
- 2px progress bar (`.c2c-progress-bar.thick`), accent fill, 600ms ease-out transition on width.
- Meta row: `Currently at 36:5` left, `36 of 114` right (mono 11px).
- **Pull quote**: Cormorant italic 18px, 1px accent left-border, padding-left 14px. Cite line below in mono 11px.
- Foot: flame + "47-day streak" left, `Continue reading →` right. Hover expands the gap from 8px→14px in 200ms.

#### § II · Bookmarks · *by category* (`.cat-grid`)
2-col grid (1-col on mobile), 1px rules between rows.
- Each row (`.cat-row`): 4px-wide colored mark (`cat.color`) bleeding to full row height on the left. Middle: name + zero-padded count in mono (`042`) + one-line italic preview verse. Right: tracked small-caps `Open →`.
- Hover lifts bg to `--ed-bg-alt`.
- Section header right: `.section-action` outlined "New category" button. Opens `CreateCategoryDialog` (existing).

#### § III · Notes *& marginalia* (`.notes-preview`)
**This is the new section.** 4-card grid on desktop, single-column on mobile.
- Each card (`.note-card`): head row with verse key (accent mono) + date (tracked small-caps right) · verse quote (Cormorant italic 14px, hairline left rule, clamp 2 lines) · body (Source Serif 13.5px, clamp 4 lines) · tag chips foot.
- Card is a link to `/me/notes?focus={note.id}` (or directly to the verse — pick one and stay consistent).
- Section header right: `Open all 38 →` link to `/me/notes`.

Use `meApi.getNotes('quran')` + `meApi.getNotes('bible')` combined, take the 4 most recent. Add a count badge "38 total" in the section eyebrow.

#### § IV · Collections (`.coll-list`)
Vertical list of rows, hairline-separated.
- Each row: `§ I` roman numeral in italic accent · title (Cormorant 22px) + optional description below · verse count (mono right) · Public/Private badge (outlined 1px, tracked small-caps, accent color when public).
- Section header right: `View all N →` link to `/me/collections`.

#### Sign out (`.signout`)
- Bottom-aligned, separated by top 1px rule, 64px above.
- Button is plain text with hairline underline; turns to `--ed-accent` on hover.
- Right side: tracked mono caption "Signed in via Magic link" (read provider from session).

### 4.3.b `/me` profile (new user — empty state)

Source: `components/profile.jsx → NewUserStarter`.

Same masthead + same stats grid (all zeros, muted). Then two sections:
- **§ I · Begin *to read*** — a single full-width `.empty` block with §-glyph, eyebrow "WELCOME", verse quote 73:20, citation, and a primary CTA "Open chapter one →" to `/quran/1`.
- **§ II · Three *first steps*** — 3-up grid (1-col mobile) of step cards (Open a chapter / Bookmark a verse / Write a note) with `§ I`, `§ II`, `§ III` numerals.

**Trigger**: user has `streak.current === 0` AND `bookmarks.length === 0` AND `notes.length === 0`. Otherwise show heavy-user view.

### 4.4 Bookmarks in `/quran`

Three pieces:

#### Side-sheet / bottom-sheet (`.sheet`)
Sources: `QuranWithBookmarkSheet` (desktop), `PhoneBookmarkSheet` (mobile).

Triggered when the user taps the bookmark icon on a verse OR uses the multi-select bar's "Bookmark" action.

- **Desktop**: absolutely positioned at `top: 96px; right: 24px`, width 320px. Hairline border, no shadow (a single `box-shadow: 0 1px 0 var(--ed-rule)`).
- **Mobile**: bottom sheet, full-width, top-rounded 12px, drag handle, slides up from the bottom over a dimmed reader.
- **Head**: eyebrow "BOOKMARK · 36:5", title "Add to a category" (Cormorant 22px), sub-text with the verse quote in mono 11px.
- **Item rows** (`.sheet-item`): 10px square color swatch · name + count small-caps · checkmark (visible when `.is-on`).
- **Foot**: new-category quick-add. Color swatch (clickable picker) + underline-only text input + tracked "ADD" button.

#### Multi-select bar (`.multibar`)
Source: `QuranWithMultiSelect`.

- Fixed at `bottom: 28px; left: 50%; translateX(-50%)`.
- Background `--ed-fg` (dark in light mode), text `--ed-bg`. Radius 2px.
- Pill divided by 1px rgba(255,255,255,0.18) vertical rules: count ("3 verses · 36:5–7") · Bookmark · Note · Copy · Collection · X.
- Each button: 12×16 pad, 13px Source Serif, with an icon at the left.
- Enters/exits with a 200ms fade + 8px translate-y.

#### Verse row affordances (`.verse`)
- Verse rows already exist in `chapter-reader.tsx`. Add these accents:
  - **Bookmarked**: `.is-bookmarked` adds a 4px-wide colored bar at `left: -16px; top: 22px; height: 16px` using the category color (CSS variable `--cat-color`).
  - **Has note**: `.has-note` adds a 1px accent left-border on the body with 14px padding-left.
  - **Hovered**: action column (`.verse-actions`) fades from 0 → 1 opacity in 180ms.
- Each verse has three actions (Bookmark, Note, Copy) as 26×26 ghost buttons; active state turns icon to `--ed-accent`.

#### Category detail page — `/me/bookmarks/[id]`
Source: `BookmarkCategoryPage`.

- Crumb: "← PROFILE · BOOKMARKS" (tracked small-caps, muted).
- Masthead with the category's color dot + count, italicized name accent, meta row ("Created Feb 14, 2026 · Rename · Change colour · Export"), and a right-rail "Make a Collection from this" button (`.section-action` with Share icon).
- Verse list: hairline-framed top + bottom, each row is a 3-col grid: `verse_key (mono accent) | body (Source Serif 17px) | Open →`. 1px rule between rows.

### 4.5 Notes in `/quran`

#### Note editor — centered modal dialog
Source: `QuranWithNotesDialog` and CSS `.note-scrim` / `.note-dialog`.

- **Scrim**: full-stage overlay, background `color-mix(in oklab, var(--ed-bg) 60%, transparent)`, `backdrop-filter: blur(2px)`. Click-outside closes.
- **Dialog**: max-width 600px, hairline border, radius 3px, drop shadow `0 24px 60px -20px rgba(0,0,0,0.35)`. Max-height 88% with internal scroll on body only. Esc to close.
- **Head**: 2-col grid (content + close button).
  - Eyebrow line "NOTE · 36:5 · EDITED 2h ago"
  - H3 Cormorant 500 26px (note title)
  - Quote — Cormorant italic 14px, muted, line-clamp 2
  - Close button (`.note-dialog-close`) 28×28 hairline square, currentColor X icon
- **Toolbar** (`.note-dialog-tools`) hairline strip on `--ed-bg-alt`:
  - B / I / H · • / " · §: (verse-ref inserter) / ⌒ (link) · spacer · ⤡ (expand to /me/notes editor)
  - Each button 28×28 ghost.
- **Body** (`.note-dialog-body`): Source Serif 15px, line-height 1.65. Markdown rendered. **Verse references** render as `.ref` pills — accent color, accent-soft bg, mono 12px, padding 1px 6px.
- **Foot** (`.note-dialog-foot`): tag chips on the left, Cancel (text-link) + Save note (primary button) on the right.

Implementation notes:
- Editor: `@uiw/react-md-editor` or `tiptap` is fine; keep it simple. The reference doesn't actually edit — it shows the rendered state.
- "§:" toolbar action should pop a small verse picker (chapter+verse) and insert as a typed pill, not raw text, so later edits don't mangle the markup. Stored as `§36:69` or similar in the markdown source.

#### Mobile: margin notes
Source: `PhoneReaderWithNotes`.

Below each verse that has a note, render `.note-margin`: a 1px accent left-border, 14px padding-left, 8px top margin. Contents:
- Meta line (Glacial 9.5px tracked): "YOUR NOTE" · tag chip(s).
- Note body in Source Serif 14px, color `--ed-fg`.
- Verse refs as `.ref` pills.

Tap opens the same dialog (full-screen on mobile — `max-width: 100%`, no scrim padding).

Mobile reader also has a fixed bottom action bar (`var(--ed-fg)` bg, 4-column grid: Bookmark · Note · Listen · More). 12×6 pad, tracked small-caps labels under icons.

### 4.6 `/me/notes` index
Source: `NotesIndexPage`.

- **Masthead**: 2-col grid (title + search box).
  - Title: eyebrow "§ II · NOTES", H1 "Marginalia & references" (italic accent on "& references"), meta row "38 notes · across both scriptures · Export all".
  - Search: hairline pill, magnifier icon + placeholder + ⌘K keycap (mono 10px, hairline box).
- **Filter row**: "FILTER" eyebrow + tag chips ("All · 38", "Tafsir", "Study", "Late Makkan", "Cross-ref", "Drafts") · "Newest first ↓" on the right (mono 11px).
  - Chips (`.tag-chip`): tracked small-caps, hairline outline. `.is-on` switches to accent border + accent text.
- **List** (`.notes-index`): hairline-framed. Each row (`.notes-row`) is a 2-col grid (80px verse key column · body column).
  - **Key column** (`.key`): verse key in accent mono · italic relative-date in muted Cormorant.
  - **Body column**: a verse quote (Cormorant italic 14.5px, 1px left rule, padding-left 12px) · note text (Source Serif 15.5px) · tag chips.

Behaviour: same `useQuery(meApi.getNotes)` queries combined; client-side filter on text + verse_key. Tag filter is a string match against `note.tags`. Date sort: `updated_at` desc.

### 4.7 Common chrome: top nav
Source: `shared.jsx → SiteNav`.

Reproduce the existing wikisubmission.org top bar:
- 14px padding × 24px horizontal. 1px bottom rule. Sticky.
- Left: 24px square logo + "WikiSubmission" (Cormorant 500 18px).
- Center: nav links (Home · Quran · Bible · Words · Tools · Blog) in Glacial 11px tracked uppercase.
- Right: search icon + avatar square (28×28 hairline, Cormorant initial).
- Active link gets `--ed-fg` color, others `--ed-fg-muted`.

The user menu (clicking the avatar) should drop to `/me`, `/me/notes`, `/me/collections`, Sign out.

---

## 5 · Design tokens (single source of truth)

All defined in `colors_and_type.css`. Scope on `[data-palette][data-mode]`. Implement via CSS variables, **not** Tailwind defaults.

### Fonts

| Variable | Family | Used for |
|---|---|---|
| `--font-cormorant` | Cormorant Garamond | Display, section titles, italic accents, OTP digits |
| `--font-source-serif` | Source Serif 4 | Body, verse text, buttons, inputs |
| `--font-jetbrains` | JetBrains Mono | Verse keys, %, kbd, dates |
| `--font-glacial` | Glacial Indifference (local TTF) | Eyebrow labels (10–11px, tracked `0.18em`, uppercase) |
| `--font-amiri` | Amiri | Arabic (sura masthead) |

### Palette · `ink · light` (default reference)

| Token | Value | Role |
|---|---|---|
| `--ed-bg` | `#F6F2EA` | Page background |
| `--ed-bg-alt` | `#EFE9DC` | Band, toolbar, drawer foot |
| `--ed-surface` | `#FBF8F1` | Cards, dialogs, sheets |
| `--ed-fg` | `#1A1715` | Primary text |
| `--ed-fg-muted` | `#6E6557` | Eyebrows, meta, secondary |
| `--ed-rule` | `#D9CFB9` | All hairlines and 1px borders |
| `--ed-accent` | `#6B3410` | Burnt sienna — section numerals, links, accent rules |
| `--ed-accent-soft` | `#EFE4D1` | Verse-ref pill bg |

Dark mode + Violet + Mono variants are in `colors_and_type.css`. Expose palette + mode via user preference; the default is `<html data-palette="ink" data-mode="light">`.

### Geometry

| Token | Value | Notes |
|---|---|---|
| `--ed-radius-sm` | `2px` | Buttons, inputs |
| `--ed-radius` | `3px` | Cards, dialogs |
| `--ed-hairline` | `1px` | Every rule, every border |
| `--ed-max` | `1240px` | Page max-width |
| Spacing scale | `8 / 12 / 16 / 24 / 32 / 48 / 64 / 96` | `--ed-1` through `--ed-8` |
| Eyebrow tracking | `0.18em` | Uppercase eyebrows always |

**No rounded-pill chrome anywhere.** All radii are 2–3px. Shadows reserved for the centered note dialog (`0 24px 60px -20px rgba(0,0,0,0.35)`); everything else is hairlines only.

---

## 6 · Icon mapping (design → `lucide-react` + brand)

The reference's `components/icons.jsx` defines minimal SVGs. Map them to the existing icon library:

| Design name | Replacement |
|---|---|
| `IBookmark`, `IBookmarkFill` | `<Bookmark />` (stroke + filled variants) |
| `INote` | `<StickyNote />` |
| `IFlame` | `<Flame />` |
| `IBook` | `<BookOpen />` |
| `ILibrary` | `<Library />` |
| `IShare` | `<Share2 />` |
| `IPlus` | `<Plus />` |
| `ISearch` | `<Search />` |
| `IChevR` / `IChevL` | `<ChevronRight />` / `<ChevronLeft />` |
| `IArrowR` | `<ArrowRight />` |
| `ICheck` | `<Check />` |
| `IClose` / `IX` | `<X />` |
| `IMore` | `<MoreHorizontal />` |
| `ICopy` | `<Copy />` |
| `ITrash` | `<Trash2 />` |
| `IExternal` | `<ExternalLink />` |
| `IMenu` | `<Menu />` |
| `ISettings` | `<Settings />` |
| `ILogout` | `<LogOut />` |
| `IEdit` | `<Pencil />` |
| `ITag` | `<Tag />` |
| `IPlay` | `<Play />` |
| `IHeadphones` | `<Headphones />` |
| `ICompass` | `<Compass />` |
| `IMail` | `<Mail />` |
| `IGoogle` | `<FcGoogle />` from `react-icons/fc` (existing) |
| `IApple` | `<FaApple />` from `react-icons/fa` (existing) |
| `IDiscord` | `<FaDiscord />` from `react-icons/fa` — **new**; brand color `#5865F2` |

All icons should be 1.6px stroke-width to match. Default `size={14}` in body, `{12}` in small chrome, `{16}` in primary buttons.

---

## 7 · Interactions & animation

Keep motion economical. The whole design has only a few moving parts:

- **Hover lifts**: 180ms ease for borders and bg color changes.
- **Progress bars**: 600ms cubic-bezier(0.4, 0, 0.2, 1) on width changes.
- **Continue-reading link**: gap animates 8px → 14px on hover (200ms).
- **Verse actions**: opacity 0 → 1 on row hover, 180ms.
- **Modal dialog**: scrim fade 200ms; dialog itself does not animate position (no slide-in).
- **Multi-select bar**: enter/exit fades + 8px translate-Y, 200ms.

No spring physics, no parallax, no layout shifts. The aesthetic is "newspaper that respects your reading."

---

## 8 · State management notes

The reference is static. In implementation, reuse existing patterns:

- **Notes preview on /me**: `useNotes('quran')` + `useNotes('bible')` combined, sort by `updated_at` desc, slice top 4.
- **In-reader note dialog**: local component state for content + tags; debounced `meApi.upsertNote` (assumed to exist; if not, mirror the bookmarks pattern). Persist on Save, or on blur if you want autosave.
- **Bookmark sheet on a verse**: list = `useBookmarkCategories`. Toggling an item calls `meApi.toggleBookmark({verse_key, category_id})`. Adding a new category inline calls `meApi.createCategory(name, color)` then assigns the just-bookmarked verse.
- **Multi-select** in the reader: `useState<Set<string>>(new Set())` keyed by verse_key. Clearing on Escape, on route change, and after a successful bulk action.
- **OTP screen**: same logic that already exists in `verify-form.tsx`. The visual changes are the only diff.
- **Sign-in**: add Discord provider config to NextAuth — `signIn('discord', { callbackUrl })` from a new button. Server-side, add `DiscordProvider` to `authOptions.providers`.

---

## 9 · Empty states

Beyond the new-user state on `/me`:

- **Empty notes section on /me**: skip § III entirely if `note_count === 0`. Don't draw a section header.
- **Empty bookmarks section on /me**: same — skip § II if no categories. The CategoriesSection itself doesn't need its old "create one to start" empty state because the empty-section is hidden at the parent level.
- **Empty /me/notes index**: show the verse 73:20 quote (same as new-user state) with a "Open chapter one →" link.
- **Empty bookmark category** (`/me/bookmarks/[id]` with no verses): show "No verses in this category yet. Open the reader and tap the bookmark icon on any verse." in the same `.empty` style — single block, no chrome.

---

## 10 · Responsive breakpoints

- Reference defines two viewports: **desktop** (≥ 768px) and **mobile** (< 768px). Tailwind `md:` works.
- Profile mast on mobile drops the right rail entirely and uses `.profile-mast-mobile` (single column).
- Stats grid: 4-col desktop → 2×2 mobile.
- Cover-to-cover, Bookmark categories: 2-col desktop → 1-col mobile.
- Notes preview: 4-col desktop → 1-col mobile (2-card slice).
- Reader: side-sheet (desktop) ↔ bottom-sheet (mobile). Note dialog stays centered but fills 100% width on mobile.
- All editorial sections collapse their right-rail eyebrow on mobile.

---

## 11 · QA checklist

Run through these once implementation is done:

- [ ] Three palettes × two modes (`ink/violet/mono` × `light/dark`) all render with no contrast regressions
- [ ] Every `1px` border uses `--ed-rule` — no hardcoded `#…` borders
- [ ] Every eyebrow is uppercase, tracked `0.18em`, Glacial Indifference
- [ ] Every `§ N` numeral is italic Cormorant in `--ed-accent`
- [ ] No rounded-pill anywhere; max radius is 3px
- [ ] No drop shadows except on `.note-dialog`
- [ ] H1 names italicize the last token in accent color
- [ ] Verse keys (`36:5`) are JetBrains Mono everywhere
- [ ] OTP boxes auto-advance and auto-submit; paste-six-digits handler works
- [ ] Note dialog: Esc closes, click-outside closes, scrim has blur
- [ ] Bookmark sheet: desktop = side-sheet, mobile = bottom-sheet
- [ ] Multi-select bar uses inverted colors (`--ed-fg` bg)
- [ ] New-user state triggers when zero streak + zero bookmarks + zero notes
- [ ] Empty notes section is **hidden** (not empty-state-decorated) on `/me`
- [ ] Discord provider added and themed (`#5865F2` glyph)

---

## 12 · Open questions for the team

1. **Notes data model**: confirm `tags: string[]` and `updated_at` exist on `NoteData`, or scope them in.
2. **Markdown rendering**: confirm an existing renderer (e.g. `react-markdown` config) is in use, or pick one. Verse-reference pills are custom; suggest a remark/rehype plugin that matches `§\s?\d+:\d+` and renders as the `.ref` pill.
3. **Discord provider**: confirm OAuth app is provisioned and `DISCORD_CLIENT_ID` / `DISCORD_CLIENT_SECRET` are in env.
4. **"Italicize last name"**: works for "Agent Forty-Seven" → "Agent *Forty-Seven*". For mononyms or non-Latin scripts, fall back to italicising the whole name. Confirm desired behaviour.
5. **Username/handle**: `@agent-47` shown in meta — confirm this field exists on the user model. If not, drop that segment from the meta row.
6. **Cover-to-Cover Bible progress**: design assumes the same shape as Quran (book + verse). Existing hook returns just `verse_key`; confirm or fall back to "Not started yet".

End of handoff.
