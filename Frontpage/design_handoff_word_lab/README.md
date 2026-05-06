# Handoff: Word Lab (Quranic root-search & concordance)

## Overview

The **Word Lab** is a dedicated page in WikiSubmission for studying Quranic vocabulary. Users search by Arabic root letters or by Latin transliteration (e.g. `ktb` → `ك ت ب`), browse roots sorted by frequency or abjadi order, then drill into derived forms, every occurrence in the Quran with the matching word highlighted, and a morphology breakdown of the selected derivative.

This replaces what was previously an entire "word-by-word" reading mode with two distinct things:
1. A **toggle** inside the verse-by-verse Quran reader that shows per-word gloss inline (handled in the Quran reader, not in this handoff).
2. This **standalone Word Lab page** — focused entirely on words rather than verse flow.

## About the design files

The files in `reference/` are **design references created in HTML/JSX** — a working prototype showing the intended look and behavior. They are **not** production code to copy directly. The job is to recreate the design in the target codebase's existing environment (React, Vue, SwiftUI, native, etc.) using its established patterns, component library, routing, and data layer. If no environment exists yet, pick the framework that best fits the broader app and build the Word Lab there.

The prototype uses inline JSX transpiled by Babel-standalone in the browser, with sample/hard-coded data. Real implementations should:
- Pull root, derivative, and occurrence data from a real Quranic corpus (see "Data sources" below).
- Use the codebase's standard routing (e.g. `/words` or `/quran/words`) instead of a static `words.html`.
- Use the codebase's icon library, form primitives, and typography tokens rather than the inline SVG and ad-hoc CSS in the reference.

## Fidelity

**High fidelity.** Colors, type scale, spacing, hover/active states, and interaction model are all final. The reference is meant to be reproduced pixel-faithful within reason — any deviations should be motivated by the host codebase's design system (e.g. swap the warm parchment palette for the host's neutrals, but keep the layout, hierarchy, and density).

## Page layout

```
┌─ Site nav (existing) ─────────────────────────────────────────────┐
├─ Hero ────────────────────────────────────────────────────────────┤
│  H1: "Word lab."                                                  │
│  Lede: short intro mentioning ktb → ك ت ب transliteration        │
├─ Search section ──────────────────────────────────────────────────┤
│  ┌─ Search box (1fr) ──────────────────┐ ┌─ Sort buttons (auto) ─┐│
│  │ 🔍  [input]    [→ ك ت ب preview]  ⌘K│ │ Sort: Freq | Abj | Rev││
│  └─────────────────────────────────────┘ └───────────────────────┘│
│  ▸ Transliteration key (collapsible <details>)                    │
├─ Lab grid (360px sidebar + 1fr detail) ──────────────────────────┤
│  ┌─ Index ──────────┐  ┌─ Detail panel ────────────────────────┐  │
│  │ Roots · count    │  │ Root header card                       │  │
│  │ ─ ا group ─      │  │   kicker · translit · count           │  │
│  │   row [ar][tr]…  │  │   huge Arabic letters                  │  │
│  │   row …          │  │   sense (italic)                       │  │
│  │ ─ ب group ─      │  │   morphology note                      │  │
│  │   …              │  │ § 01 Derived forms (chip grid)        │  │
│  │                  │  │ § 02 Occurrences (verse cards)        │  │
│  │                  │  │ § 03 Morphology of selected deriv.    │  │
│  └──────────────────┘  └────────────────────────────────────────┘  │
├─ Site footer (existing) ──────────────────────────────────────────┤
```

Breakpoint at 960px collapses the lab to a single column; the index becomes a 360px-tall scroll region above the detail panel.

## Components & specs

### 1. Hero

- `h1.page-title` — display serif, ~clamp(48px, 6vw, 80px), `<em>` on "lab" word in muted italic.
- `p.page-lede` — body sans, ~18px, muted color, max ~64ch. Contains an inline mono-styled token (`<span class="qmono">ktb</span>`) and an inline Arabic token (`<span class="qarab">ك ت ب</span>`).

### 2. Search box

- Container: surface bg, 1px rule border, 3px radius, focus-within → border becomes `--fg`.
- Magnifying-glass SVG icon, 20×20, stroke 1.6, muted color.
- Input: 18px display serif, transparent bg, no border, italic muted placeholder. Placeholder copy: *"Search a root — try ktb, rHm, slm, or paste Arabic"*.
- **Live transliteration preview**: when the input contains only Latin letters, render a pill to the right of the input showing `→` in mono-accent + the converted Arabic with letter-spaced display (`ك ت ب`). Pill bg = `--accent-soft`. Hidden when the input is empty or already Arabic (Unicode range `\u0600-\u06FF`).
- `<kbd>⌘K</kbd>` chip on the far right (mono 11px, alt bg, 1px rule).
- Keyboard shortcut: `⌘K` / `Ctrl+K` should focus the input (wire in the host app).

### 3. Sort control

Three segmented mono-uppercase buttons:
- `Frequency` — sort by descending occurrence count (default).
- `Abjadi  ا → ي` — group by first letter of root in Arabic alphabet order.
- `Reverse  ي → ا` — same, reversed.

Active button: `--fg` bg, `--bg` text. Inactive: transparent bg, muted text, 1px rule. Padding 8/12, font 10.5px mono uppercase, letter-spacing 0.1em.

### 4. Transliteration key (collapsible)

Native `<details>` with custom summary styling (no marker). When open, reveals a `repeat(auto-fill, minmax(64px, 1fr))` grid of letter-pair cards inside a `--bg-alt` panel. Each card stacks the Latin token (mono, accent color, 11px) over the Arabic letter (Amiri, 18px). The full mapping is in "Transliteration scheme" below.

### 5. Roots index (left rail)

- Sticky at top: 80px, max-height: `calc(100vh - 100px)`, internal scroll.
- Surface bg, 1px rule, 3px radius, 8px padding.
- Header row: "Roots" (mono uppercase muted) + count chip in accent.
- When sort = abjadi/reverse: insert group headers `[Arabic letter (24px Amiri, accent)] [count (mono 10px muted)]` separated by a dotted rule.
- Row: 3-col grid `auto 1fr auto`, gap 12px, padding 10/12. Columns:
  - **wr-ar** — Arabic root letters, Amiri 20px, RTL, right-aligned, min 76px, letter-spacing 0.08em
  - **wr-mid** — stacked: translit (mono 10.5px accent lowercase) + sense (display 13px italic muted, single-line ellipsis)
  - **wr-count** — total occurrence count, mono 10.5px, tabular-nums
- Hover: bg `--bg-alt`. Active: bg `--accent-soft`.
- Empty state: "No roots match. Try the transliteration key below the search." — italic muted, 13.5px.

### 6. Detail panel

#### 6a. Root header card

- `--bg-alt` background, 1px rule, 3px radius, padding 32/36, gap 14px.
- Top row (flex, baseline, gap 18, wrap):
  - Kicker "Root" — mono 10.5px accent uppercase, letter-spacing 0.18em
  - Translit — mono 14px fg
  - Count — mono 11px uppercase muted, pushed right with `margin-left: auto`. Inner `<strong>` colored fg (e.g. *"<strong>2,851</strong> occurrences"*).
- Letters: huge Amiri, `clamp(64px, 8vw, 104px)`, weight 700, line-height 1, letter-spacing 0.12em.
- Sense: display serif 22px italic.
- Morph note: 14px muted, line-height 1.6, max 64ch, separated by 1px rule on top, padding-top 12.

#### 6b. Section heads

Used by all three subsections. Layout: flex baseline, gap 12, padding-bottom 8, border-bottom 1px rule.
- `wsh-num` — display italic 14px accent (e.g. "01", "02", "03")
- `wsh-title` — display 22px (regular, letter-spacing -0.01em)
- `wsh-count` — mono 10.5px uppercase muted, `margin-left: auto` (e.g. *"showing 3 of 2,851"*)

#### 6c. Derived forms (section 01)

`repeat(auto-fill, minmax(180px, 1fr))` grid, gap 8.

Each chip is a button with:
- Surface bg, 1px rule, 3px radius, padding 14/16/12, flex column gap 4.
- Hover: `border-color: --fg`, `translateY(-2px)`.
- Active (selected derivative): `border-color: --accent`, bg `--accent-soft`.
- Content stack:
  - `wd-ar` — Amiri 28px
  - `wd-tr` — mono 11px accent
  - `wd-en` — display 14px italic
  - `wd-meta` — flex space-between, mono 10px muted, top dotted rule, padding-top 6, margin-top 4. Left = POS code in accent, right = `count×`.

#### 6d. Occurrences (section 02)

Stacked verse cards, gap 4, each a link to the verse in the reader:
- 3-col grid `64px 1fr 24px`, gap 18, items align start, padding 18/16, surface bg, 1px rule, 3px radius.
- Hover: `border-color: --fg`.
- **wo-ref** — mono 12px accent, tabular-nums, padding-top 4 (e.g. "2:282")
- **wo-body** — flex column gap 8:
  - `wo-ar` — Amiri 26px, line-height 1.7, RTL. The matched word is wrapped in `<mark class="words-hl">` — `--accent-soft` bg, accent text, 0/4 padding, 2px radius, weight 700.
  - `wo-en` — display 15px, line-height 1.55, muted color.
- **wo-arrow** — mono `↗`, muted, right-aligned.

#### 6e. Morphology grid (section 03)

3-column grid (2-column under 960px), 1px gap, 1px rule wrapper, 3px radius, overflow-hidden — the gap creates visible dividers because the wrapper itself is `--rule` colored and each cell uses `--surface` bg.

Each cell:
- Padding 14/16, flex column gap 4.
- `wmg-k` — mono 10.5px uppercase muted, letter-spacing 0.14em
- `wmg-v` — display 16px fg. When `lang="ar"`: switch to Amiri 22px.

Six cells: Lemma · Translit. · Gloss · POS · Root · Count.

## Interactions & behavior

- **Typing in the search input** updates the visible roots list every keystroke. Input handler:
  1. If input contains any character in Unicode range `\u0600-\u06FF`, treat as Arabic; strip diacritics (`\u064B-\u0652\u0670`) and match by substring against root letters (with internal whitespace stripped).
  2. Otherwise, transliterate to Arabic via the scheme below, render the conversion in the preview pill, and substring-match the result against root letters. Also fall back to matching the raw Latin against the lowercased root translit (hyphens stripped) and the English sense.
- **Sort buttons** are mutually exclusive; switching sort re-groups the index.
- **Selecting a root row** sets the active root for the detail panel and resets the active derivative to index 0.
- **Selecting a derivative chip** updates section 03 (the morphology grid) without changing the active root or scrolling.
- **Occurrence cards** link to the verse in the Quran reader (`/quran#<sura>:<verse>` or equivalent in the host router). The href is `quran.html` in the reference.
- **Filtering empties the active root**: if the previously-selected root is no longer in the visible list, fall back to the first visible root (and reset derivative index to 0).
- **`⌘K`/`Ctrl+K`** focuses the search input. Implement at the page level.
- **Transliteration key `<details>`** is closed by default.
- All hover/active transitions: 180ms ease, applied to `border-color`, `background`, and `transform` only.

## State

```ts
type RootRecord = {
  letters: string;          // "ك ت ب" — space-separated Arabic letters
  tr: string;               // "k-t-b" — hyphenated Latin translit
  sense: string;            // English gloss / semantic field
  count: number;            // total occurrences in Quran
  derivs: Derivative[];
  occ: Occurrence[];
  morph: string;            // free-text morphology note
};
type Derivative = {
  ar: string; tr: string; en: string;
  count: number;
  pos: 'V' | 'N' | 'ADJ' | 'PASS' | 'PRO' | 'NEG' | 'P' | 'REL';
};
type Occurrence = {
  ref: string;              // "2:282"
  ar: string;               // verse Arabic with diacritics
  en: string;               // verse translation
  hi: string;               // exact substring of `ar` to highlight
};

// Page state
const [query, setQuery]          = useState('');
const [latinPreview, setPreview] = useState('');   // derived from query
const [sort, setSort]            = useState<'frequency'|'abjadi'|'reverse'>('frequency');
const [activeRoot, setActiveRoot] = useState<RootRecord>(initial);
const [activeDeriv, setActiveDeriv] = useState(0);
```

Derived (memoized):
- `visible: RootRecord[]` — filter by query, sort by mode.
- `grouped: Record<arabicLetter, RootRecord[]> | null` — only when sort is abjadi/reverse, group `visible` by `letters[0]` and render in `ABJAD` order (or reversed).

## Transliteration scheme

Buckwalter-flavored simplified mapping. Apply digraphs greedily *before* single-letter mapping.

**Digraphs (greedy, lowercase only):**
| Latin | Arabic |
|---|---|
| `kh` | خ |
| `gh` | غ |
| `sh` | ش |
| `th` | ث |
| `dh` | ذ |
| `ts` | ث |
| `ph` | ف |

**Single letters (case-sensitive — capitals are emphatics):**
| Latin | Arabic | | Latin | Arabic |
|---|---|---|---|---|
| `a` | ا | | `S` | ص |
| `b` | ب | | `D` | ض |
| `t` | ت | | `T` | ط |
| `j` | ج | | `Z` | ظ |
| `H` | ح | | `c` or `` ` `` | ع |
| `h` | ه | | `G` | غ |
| `d` | د | | `f` | ف |
| `r` | ر | | `q` | ق |
| `z` | ز | | `k` | ك |
| `s` | س | | `l` | ل |
| `m` | م | | `n` | ن |
| `w` | و | | `y` | ي |
| `'` | ء | | | |

Algorithm:
1. If input already contains Arabic (`/[\u0600-\u06FF]/`), strip diacritics and return.
2. Otherwise: lowercase, drop everything outside `[a-zA-Z'\`]`, then walk left-to-right consuming digraphs first, falling back to single-letter map (try the literal char, then its lowercase).

The reference implementation lives in `toArabicLetters(input)` in `reference/words.jsx`.

## Abjadi order

```
ا ب ت ث ج ح خ د ذ ر ز س ش ص ض ط ظ ع غ ف ق ك ل م ن ه و ي
```

When sort = `abjadi`, compare two roots letter-by-letter using their index in the array above. Reverse comparison for `reverse`.

## Design tokens

These should map to the host codebase's existing tokens. The reference values (warm parchment palette):

| Token | Value | Usage |
|---|---|---|
| `--bg` | `#f6f2ea` | page bg |
| `--bg-alt` | `#efe8d9` | hero card / panel insets |
| `--surface` | `#fbf8f1` | cards, inputs, search box |
| `--fg` | `#1a1715` | primary text, active states |
| `--fg-muted` | `#6a6158` | meta, captions, labels |
| `--rule` | `#d9cfb9` | borders, dividers |
| `--accent` | `#6b3410` | accent text, highlights, active dot |
| `--accent-soft` | `#ecd9c5` | active row bg, highlight bg, preview pill |
| `--display` | `'Source Serif 4', Georgia, serif` | titles, English text, derivative chips |
| `--body` | `'Inter', system-ui, sans-serif` | body |
| `--mono` | `'JetBrains Mono', ui-monospace, monospace` | metadata, kickers, transliteration |
| `--arabic` | `'Amiri', 'Scheherazade New', serif` | all Arabic text |

**Spacing scale used:** 4 / 6 / 8 / 12 / 14 / 16 / 18 / 24 / 32 / 36 (px).
**Radius:** 2 (kbd, chip), 3 (cards, panels). No larger radii.
**Borders:** always 1px solid; dotted variants for "weaker" rules inside rows.
**Shadows:** none. Lift via `transform: translateY(-1 to -2px)` on hover.

## Data sources

The reference uses a hand-crafted slice of 11 roots. For production:
- The Tanzil project and the Quranic Arabic Corpus (corpus.quran.com) provide root indexes, morphological tags, and occurrence lists. License terms vary — review before redistributing.
- A minimal API surface for this page is:
  - `GET /api/roots?sort=…&q=…` → paginated `RootRecord[]` (without `occ`/`derivs`).
  - `GET /api/roots/:letters` → full `RootRecord` with `derivs` and the first N occurrences.
  - `GET /api/roots/:letters/occurrences?offset=…&limit=…` → paginate the rest.
- The morphology note is editorial — store as plain text per root.

## Accessibility

- Sort buttons should be a `role="radiogroup"` with `aria-checked` per option, or native `<input type="radio">` styled as buttons.
- The wbw toggle in the Quran reader is a real `<input type="checkbox">` visually styled — keep that pattern here too.
- Search input needs `aria-label="Search Quranic roots"`; the live preview pill should have `aria-live="polite"`.
- The detail panel is the page's main content — wrap in `<main>` or give it `role="region"` with an `aria-labelledby` pointing to the root header.
- Highlighted occurrences use `<mark>` — already correct semantically.
- Min hit target for index rows: ensure rows are at least 40px tall (current padding gets close; verify with the host's type stack).

## Files in this handoff

```
design_handoff_word_lab/
├── README.md                       ← this file
└── reference/
    ├── words.html                  ← page shell (script tags + mount)
    ├── words.jsx                   ← React component, transliteration logic, sample data
    └── words.css                   ← extracted CSS slice for the page
```

`words.jsx` is the canonical reference for layout, state, and the transliteration algorithm. `words.css` is the extracted style slice — use it to read off exact rules; do not copy verbatim into a different design system.

## Out of scope for this handoff

- The Quran reader itself (verse-by-verse mode, reading mode, the WBW toggle inside it). That is shipped in `quran.html` / `components/pages/quran.jsx` in the same project — handle separately.
- Real corpus data wiring.
- Bookmarking / sharing root URLs (recommended next step: make the active root part of the URL, e.g. `/words/k-t-b`).
- Pagination of occurrences (the reference shows the first 1–3 per root).
