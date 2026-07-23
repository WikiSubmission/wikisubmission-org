export interface ModeSwatches {
  bg: string
  fg: string
  accent: string
  rule: string
}

export interface PaletteDoc {
  key: 'ink' | 'violet' | 'mono'
  label: string
  tagline: string
  light: ModeSwatches
  dark: ModeSwatches
}

export interface BrandRule {
  label: string
  body: string
}

export interface BrandCard {
  title: string
  body: string
}

export const BRAND_MARKDOWN_PATH = '/brand/brand.md'

export const PALETTES: PaletteDoc[] = [
  {
    key: 'ink',
    label: 'Ink on Parchment',
    tagline: 'Editorial. Default. The canonical look.',
    light: { bg: '#F6F2EA', fg: '#1A1715', accent: '#6B3410', rule: '#D9CFB9' },
    dark: { bg: '#14110E', fg: '#EEE4D0', accent: '#D4A373', rule: '#2A241E' },
  },
  {
    key: 'violet',
    label: 'Sharpened Violet',
    tagline: 'Contemporary. High contrast. Modernist.',
    light: { bg: '#FAFAFA', fg: '#121214', accent: '#5A1FD4', rule: '#E5E5EA' },
    dark: { bg: '#0C0C0E', fg: '#F4F4F5', accent: '#B48CFF', rule: '#27272C' },
  },
  {
    key: 'mono',
    label: 'Monochrome',
    tagline: 'Minimal. True black on warm white.',
    light: { bg: '#F4F4F2', fg: '#0E0E0D', accent: '#0E0E0D', rule: '#D8D8D4' },
    dark: { bg: '#0A0A09', fg: '#F1F1EC', accent: '#F1F1EC', rule: '#23231F' },
  },
]

export const TOKENS: Array<{ name: string; role: string; mapsTo: string }> = [
  { name: '--ed-bg', role: 'Page background', mapsTo: '--background' },
  { name: '--ed-fg', role: 'Primary text', mapsTo: '--foreground' },
  { name: '--ed-fg-muted', role: 'Secondary text, captions', mapsTo: '--muted-foreground' },
  { name: '--ed-accent', role: 'Highlights, links, key motifs', mapsTo: '--primary' },
  { name: '--ed-accent-soft', role: 'Tinted accent surface', mapsTo: '--accent' },
  { name: '--ed-rule', role: 'Hairline borders, dividers', mapsTo: '--border' },
  { name: '--ed-bg-alt', role: 'Muted surface (cards, callouts)', mapsTo: '--muted' },
  { name: '--ed-surface', role: 'Card surface (elevated)', mapsTo: '--card' },
]

export const TYPE: Array<{
  name: string
  role: string
  variable: string
  family: string
  sample: string
  size: number
}> = [
  {
    name: 'Cormorant Garamond',
    role: 'Display, headings, italic accents',
    variable: '--font-cormorant',
    family: 'var(--font-cormorant), Georgia, serif',
    sample: 'In the name of God, Most Gracious, Most Merciful.',
    size: 40,
  },
  {
    name: 'Source Serif 4',
    role: 'Body copy, paragraphs, reading',
    variable: '--font-source-serif',
    family: 'var(--font-source-serif), Georgia, serif',
    sample: 'Praise be to God, Lord of the universe, Most Gracious, Most Merciful.',
    size: 18,
  },
  {
    name: 'JetBrains Mono',
    role: 'References, tokens, data labels, utility metadata',
    variable: '--font-jetbrains',
    family: 'var(--font-jetbrains), ui-monospace, monospace',
    sample: '1:1 · 114 chapters · --ed-accent',
    size: 14,
  },
  {
    name: 'Amiri',
    role: 'Arabic Quranic text',
    variable: '--font-amiri',
    family: 'var(--font-amiri), "Scheherazade New", serif',
    sample: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ',
    size: 32,
  },
  {
    name: 'Glacial Indifference',
    role: 'UI eyebrow, uppercase metadata, sectional chrome',
    variable: '--font-glacial',
    family: 'var(--font-glacial), sans-serif',
    sample: 'CHAPTER · VERSE · TRANSLATION',
    size: 12,
  },
]

export const VOICE: BrandCard[] = [
  { title: 'Scholarly', body: 'Precise, sourced, footnoted. Never speculative.' },
  { title: 'Reverent', body: 'Quiet, deliberate. The verses are the focus.' },
  { title: 'Plain', body: 'No jargon. A 12-year-old can read every page.' },
  { title: 'Timeless', body: 'No trends. No novelty styling or disposable visual slang.' },
]

export const DOS = [
  'Use --ed-* tokens for public-site editorial surfaces.',
  'Pair Cormorant displays with Source Serif body copy.',
  'Keep dividers and hairlines at exactly 1px.',
  'Let Arabic breathe with generous line-height and generous horizontal room.',
  'Use visible keyboard focus, not hover-only affordances.',
  'Verify public pages in all three palettes and both light and dark modes.',
]

export const DONTS = [
  'Hardcode product colors into ordinary page components.',
  'Round editorial surfaces heavily by default.',
  'Decorate empty space without structural purpose.',
  'Rely on color alone to communicate active, invalid, or disabled state.',
  'Ship icon-only actions without accessible labels.',
  'Recolor or distort the logo mark.',
]

export const RESPONSIVE_RULES: BrandRule[] = [
  {
    label: 'Breakpoint model',
    body: 'Current implementation uses Tailwind tier prefixes (`sm`, `md`, `lg`). I could not find a separate custom breakpoint scale in the repo, so this documents current usage rather than a dedicated token file.',
  },
  {
    label: 'Containers',
    body: 'Primary site sections use a 1240px max width with horizontal padding patterns such as `px-5 sm:px-10` or `px-4 sm:px-6 md:px-10`.',
  },
  {
    label: 'Grid collapse',
    body: 'Marketing sections typically collapse from 2–3 columns to one column at `md` or below. Side rails become top borders on mobile rather than staying side-by-side.',
  },
  {
    label: 'Type scaling',
    body: 'Hero and section headings use `clamp(...)` instead of fixed desktop sizes so large editorial type remains legible on narrow screens.',
  },
  {
    label: 'Touch targets',
    body: 'Interactive mobile controls commonly land around 34–44px high, with search and location inputs often using `h-11`.',
  },
]

export const INTERACTION_STATES: BrandCard[] = [
  {
    title: 'Hover',
    body: 'Favor subtle movement: borders darken, cards lift a few pixels, links deepen in tone, and CTAs widen their internal gap before changing fills.',
  },
  {
    title: 'Focus Visible',
    body: 'Keyboard focus must remain explicit. Shared UI primitives use visible rings, and editorial one-offs should provide an equivalent outline or ring against `--ed-bg`.',
  },
  {
    title: 'Active / Current',
    body: 'Current location is usually signaled by an accent rail, text-weight change, or a restrained tinted background instead of a loud solid fill.',
  },
  {
    title: 'Disabled / Busy',
    body: 'Disabled elements lower opacity and suppress pointer events. Busy states should keep layout stable and communicate progress with motion or live text, not only color.',
  },
]

export const FORM_RULES: BrandRule[] = [
  {
    label: 'Base primitives',
    body: 'Application forms use shared `ui` primitives (`Input`, `Textarea`, `Checkbox`, `Button`, `Field*`) with validation and focus-visible states already built in.',
  },
  {
    label: 'Field structure',
    body: 'Use explicit labels, optional descriptions, and inline error text. `FieldError` is the pattern for validation feedback and should remain adjacent to the control it describes.',
  },
  {
    label: 'Search surfaces',
    body: 'Search and picker inputs often appear on softened surfaces with understated borders, roomy internal padding, and accent-colored focus borders.',
  },
  {
    label: 'Error handling',
    body: 'Invalid state should change both border treatment and announced error text. Never encode errors by red color alone.',
  },
  {
    label: 'Editorial vs app UI',
    body: 'Public-site editorial buttons use `.ed-*` classes. Dashboard-like or Radix-based interactions may use shared app primitives, but palette tokens still govern the colors.',
  },
]

export const NAVIGATION_RULES: BrandRule[] = [
  {
    label: 'Header behavior',
    body: 'Desktop navigation lives at `lg` and above. Below that, the site collapses to an animated mobile menu with grouped rails and nested links.',
  },
  {
    label: 'Brand anchor',
    body: 'The site brand is always a functional home link. The mark and wordmark animate lightly unless reduced motion is requested.',
  },
  {
    label: 'Wayfinding',
    body: 'Current-page states rely on typography, accent rails, and restrained fills instead of heavy badges. Secondary navigation should preserve this quiet hierarchy.',
  },
  {
    label: 'Footer role',
    body: 'The footer is not ornamental. It repeats core IA, support pathways, and community links in the same editorial palette language as the rest of the site.',
  },
]

export const CONTENT_PATTERNS: BrandRule[] = [
  {
    label: 'Hero blocks',
    body: 'Landing heroes are type-led, asymmetric, and often pair one large display statement with a quieter side note or verse rail.',
  },
  {
    label: 'Cards',
    body: 'Cards are usually bordered rectangles on muted or surface backgrounds. They read as editorial clippings, not glossy product tiles.',
  },
  {
    label: 'Data callouts',
    body: 'Stats, verse keys, and metadata use mono or uppercase utility type, while the explanatory copy returns to serif body text.',
  },
  {
    label: 'Tables and schedules',
    body: 'Dense data views use thin dividers, compact metadata, and strong alignment. Reserve strong accent color for live or important values only.',
  },
  {
    label: 'Article content',
    body: 'Long-form reading surfaces should preserve generous line-height, subdued chrome, and strong heading hierarchy. Decorative assets should never compete with the text column.',
  },
]

export const ACCESSIBILITY_RULES: BrandRule[] = [
  {
    label: 'Headings',
    body: 'Pages must expose a real heading hierarchy. Section chrome may be styled richly, but the underlying element should still be `h1`–`h6` as appropriate.',
  },
  {
    label: 'Focus and keyboard',
    body: 'Every interactive control must be reachable by keyboard, with a visible focus indicator. Hover-only behavior is insufficient.',
  },
  {
    label: 'Live regions',
    body: 'Rotating verses, prayer timing, and other dynamically updated content should use `aria-live="polite"` when changes matter to assistive technology.',
  },
  {
    label: 'Contrast',
    body: 'Muted text is acceptable for secondary content only. Essential labels, controls, and active states must stay readable in every palette and both modes.',
  },
  {
    label: 'Targets and labels',
    body: 'Controls need adequate touch size and text labels or accessible names. Icon-only controls require `aria-label`.',
  },
]

export const MOTION_RULES: BrandRule[] = [
  {
    label: 'Default feel',
    body: 'Motion is soft and editorial. The shared GSAP helper defaults to `power3.out` easing and about 0.6s duration, favoring fade-up and staggered reveals over flashy transforms.',
  },
  {
    label: 'Enter patterns',
    body: 'Common entrances use 20–24px vertical fade-ups, gentle scale-ins, and small stagger values around 0.1s.',
  },
  {
    label: 'Reduced motion',
    body: 'Important animated surfaces check `prefers-reduced-motion` and should degrade to immediate state changes or simplified fades.',
  },
  {
    label: 'Meaningful motion only',
    body: 'Animate hierarchy, continuity, and state change. Avoid ornamental perpetual motion except for rare ambient accents with very low visual weight.',
  },
]

export const I18N_RULES: BrandRule[] = [
  {
    label: 'Document direction',
    body: 'The root layout sets `dir` from locale. RTL locales currently include `ar`, `ac`, `fa`, and `ur`.',
  },
  {
    label: 'Script isolation',
    body: 'Arabic content should explicitly declare `dir="rtl"` and `lang="ar"` where relevant. Mixed-script UI should isolate directional runs rather than relying on luck.',
  },
  {
    label: 'Directional icons',
    body: 'Chevron-like directional icons use `.rtl-flip` so arrows mirror naturally in right-to-left contexts.',
  },
  {
    label: 'Language pairing',
    body: 'Arabic remains the most spacious script on the page. Do not crowd it with tight containers or force it into Latin line-height assumptions.',
  },
]

export const IMPLEMENTATION_RULES: BrandRule[] = [
  {
    label: 'Token layering',
    body: 'Editorial `--ed-*` aliases sit on top of standard semantic tokens such as `--background`, `--foreground`, `--primary`, and `--border`. Both layers matter because shared UI primitives often consume the base layer directly.',
  },
  {
    label: 'Public-site primitives',
    body: 'The public site uses a mix of inline editorial styling, `.ed-*` helper classes in `globals.css`, and small shared helpers like `SectionDivider`, `Hairline`, and the editorial markdown components.',
  },
  {
    label: 'Application surfaces',
    body: 'Authenticated or tool-heavy experiences lean on Radix/shadcn-style primitives. Those components are valid within the system as long as palette semantics and accessibility rules are preserved.',
  },
  {
    label: 'Source of truth',
    body: 'When written guidance and shipped UI disagree, trust the repo first, then update the brand document so it describes reality or intentionally directs a cleanup.',
  },
  {
    label: 'LLM export',
    body: 'This page ships with a Markdown export so internal tooling and language models can consume a text-first version of the design system.',
  },
]

function pushRuleSection(lines: string[], title: string, intro: string, rules: BrandRule[]) {
  lines.push(`## ${title}`, '', intro, '')
  for (const rule of rules) {
    lines.push(`- **${rule.label}:** ${rule.body}`)
  }
  lines.push('')
}

function pushCardSection(lines: string[], title: string, intro: string, cards: BrandCard[]) {
  lines.push(`## ${title}`, '', intro, '')
  for (const card of cards) {
    lines.push(`- **${card.title}:** ${card.body}`)
  }
  lines.push('')
}

export function buildBrandMarkdown(baseUrl = 'https://wikisubmission.org') {
  const lines: string[] = [
    '# WikiSubmission Brand Guidelines',
    '',
    '> Editorial, scripture-first, theme-aware guidance for the public site and adjacent app surfaces.',
    '',
    `Canonical page: ${baseUrl}/brand`,
    `Markdown export: ${baseUrl}${BRAND_MARKDOWN_PATH}`,
    '',
    '## North Star',
    '',
    '- **Scripture first:** Every visual decision serves the reading. Surfaces stay quiet so the verses can speak.',
    '- **Editorial, not corporate:** Type-led layouts, hairline rules, and generous whitespace beat dashboard-like chrome.',
    '- **Theme-honest:** The brand is the system across three palettes and two modes, not one locked colorway.',
    '',
    '## Palettes',
    '',
    'The UI follows the active palette and light/dark mode. Brand swatches remain canonical and should not be color-corrected by theme state.',
    '',
  ]

  for (const palette of PALETTES) {
    lines.push(`### ${palette.label} (${palette.key})`, '', palette.tagline, '')
    lines.push(`- Light: bg ${palette.light.bg}, fg ${palette.light.fg}, accent ${palette.light.accent}, rule ${palette.light.rule}`)
    lines.push(`- Dark: bg ${palette.dark.bg}, fg ${palette.dark.fg}, accent ${palette.dark.accent}, rule ${palette.dark.rule}`)
    lines.push('')
  }

  lines.push('## Tokens', '', 'Use semantic tokens, not palette hex values, in ordinary implementation work.', '')
  for (const token of TOKENS) {
    lines.push(`- **${token.name}:** ${token.role}. Maps to ${token.mapsTo}.`)
  }
  lines.push('')

  lines.push('## Typography', '', 'The public site combines display typography, readable serif body copy, utility monospace, Arabic text, and a narrow uppercase UI face.', '')
  for (const type of TYPE) {
    lines.push(`- **${type.name}:** ${type.role}. Variable ${type.variable}. Sample: ${type.sample}`)
  }
  lines.push('')

  pushRuleSection(lines, 'Responsive Behavior', 'These rules reflect current repository usage. I did not find a separately versioned breakpoint token file.', RESPONSIVE_RULES)
  pushCardSection(lines, 'Interaction States', 'States should communicate hierarchy and usability without becoming loud.', INTERACTION_STATES)
  pushRuleSection(lines, 'Forms and Components', 'Forms are part of the design system, not an implementation afterthought.', FORM_RULES)
  pushRuleSection(lines, 'Navigation and Wayfinding', 'Navigation chrome should remain quiet, legible, and structurally obvious.', NAVIGATION_RULES)
  pushRuleSection(lines, 'Content Patterns', 'The site mixes manifesto-like editorial layouts with practical data-heavy surfaces.', CONTENT_PATTERNS)

  lines.push('## Geometry', '', '- **Max content width:** 1240px', '- **Section padding:** roughly 20–40px horizontal and 80–120px vertical depending on breakpoint', '- **Hairlines:** 1px solid `var(--ed-rule)`', '- **Editorial corners:** preferably square to 3px radii on brand-led surfaces', '- **Rhythm:** 8, 12, 16, 24, 32, 48, 64, 96', '')

  pushRuleSection(lines, 'Accessibility', 'The design language only works when the structure remains usable.', ACCESSIBILITY_RULES)
  pushRuleSection(lines, 'Motion', 'Motion exists across the site, but it stays restrained and text-respectful.', MOTION_RULES)
  pushRuleSection(lines, 'Internationalization', 'Bilingual and bidirectional behavior are first-class requirements.', I18N_RULES)
  pushCardSection(lines, 'Voice', 'Copy should sound as serious as the subject matter.', VOICE)
  pushRuleSection(lines, 'Implementation Notes', 'This is the practical contract between design guidance and the actual codebase.', IMPLEMENTATION_RULES)

  lines.push('## Application', '', '### Do', '')
  for (const item of DOS) lines.push(`- ${item}`)
  lines.push('', "### Don't", '')
  for (const item of DONTS) lines.push(`- ${item}`)

  lines.push('', '## Closing Note', '', '"We will show them Our proofs in the horizons, and within themselves, until they realize that this is the truth." — 41:53', '')

  return lines.join('\n')
}
