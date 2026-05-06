import React from 'react'
import Image from 'next/image'
import { buildPageMetadata } from '@/constants/metadata'
import { SectionDivider, F } from '@/app/(site)/_sections/shared'

export const metadata = buildPageMetadata({
  title: 'Brand · WikiSubmission',
  description:
    'WikiSubmission brand guidelines — palettes, typography, tokens, components, and voice.',
  url: '/brand',
})

/* ------------------------------------------------------------------ */
/* Palette documentation — three palettes × two modes.
   These are intentionally hardcoded here: brand swatches must show
   their canonical hex values regardless of the user's active theme. */
/* ------------------------------------------------------------------ */

interface ModeSwatches {
  bg: string
  fg: string
  accent: string
  rule: string
}

interface PaletteDoc {
  key: 'ink' | 'violet' | 'mono'
  label: string
  tagline: string
  light: ModeSwatches
  dark: ModeSwatches
}

const PALETTES: PaletteDoc[] = [
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

/* ------------------------------------------------------------------ */
/* Semantic token documentation. These flow through the active palette.  */
/* ------------------------------------------------------------------ */

const TOKENS: Array<{ name: string; role: string; mapsTo: string }> = [
  { name: '--ed-bg', role: 'Page background', mapsTo: '--background' },
  { name: '--ed-fg', role: 'Primary text', mapsTo: '--foreground' },
  { name: '--ed-fg-muted', role: 'Secondary text, captions', mapsTo: '--muted-foreground' },
  { name: '--ed-accent', role: 'Highlights, links, key motifs', mapsTo: '--primary' },
  { name: '--ed-accent-soft', role: 'Tinted accent surface', mapsTo: '--accent' },
  { name: '--ed-rule', role: 'Hairline borders, dividers', mapsTo: '--border' },
  { name: '--ed-bg-alt', role: 'Muted surface (cards, callouts)', mapsTo: '--muted' },
  { name: '--ed-surface', role: 'Card surface (elevated)', mapsTo: '--card' },
]

/* ------------------------------------------------------------------ */
/* Typography specimens                                                */
/* ------------------------------------------------------------------ */

const TYPE: Array<{
  name: string
  role: string
  variable: string
  family: string
  sample: string
  size: number
  italic?: boolean
}> = [
  {
    name: 'Cormorant Garamond',
    role: 'Display, headings, italic accents',
    variable: '--font-cormorant',
    family: F.display,
    sample: 'In the name of God, Most Gracious, Most Merciful.',
    size: 40,
  },
  {
    name: 'Source Serif 4',
    role: 'Body copy, paragraphs, reading',
    variable: '--font-source-serif',
    family: F.serif,
    sample: 'Praise be to God, Lord of the universe, Most Gracious, Most Merciful.',
    size: 18,
  },
  {
    name: 'JetBrains Mono',
    role: 'References, verse keys, tokens, code',
    variable: '--font-jetbrains',
    family: F.mono,
    sample: '1:1  ·  Sura 112:1–4  ·  --ed-accent',
    size: 14,
  },
  {
    name: 'Amiri',
    role: 'Arabic Quranic text',
    variable: '--font-amiri',
    family: F.arabic,
    sample: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ',
    size: 32,
  },
  {
    name: 'Glacial Indifference',
    role: 'UI eyebrow, uppercase metadata',
    variable: '--font-glacial',
    family: F.glacial,
    sample: 'CHAPTER · VERSE · TRANSLATION',
    size: 12,
  },
]

/* ------------------------------------------------------------------ */
/* Voice                                                                */
/* ------------------------------------------------------------------ */

const VOICE = [
  { word: 'Scholarly', body: 'Precise, sourced, footnoted. Never speculative.' },
  { word: 'Reverent', body: 'Quiet, deliberate. The verses are the focus.' },
  { word: 'Plain', body: 'No jargon. A 12-year-old can read every page.' },
  { word: 'Timeless', body: 'No trends. No dates in the design language.' },
]

/* ------------------------------------------------------------------ */
/* Application — Do / Don't                                             */
/* ------------------------------------------------------------------ */

const DOS = [
  'Use --ed-* tokens for every color reference.',
  'Pair Cormorant displays with Source Serif body.',
  'Keep hairlines at exactly 1px, never thicker.',
  'Let Arabic breathe — generous line-height (1.7+).',
  'Use the section-number motif (§ I, § II) for chaptering.',
  'Test every page in all three palettes, both modes.',
]

const DONTS = [
  'Hardcode hex values in components.',
  'Round corners beyond 3px — squares are the language.',
  'Decorate empty space — silence is part of the layout.',
  'Mix more than two type families on a single screen.',
  'Use icon-only buttons without aria labels.',
  'Recolor or distort the logo mark.',
]

/* ------------------------------------------------------------------ */
/* Page                                                                 */
/* ------------------------------------------------------------------ */

const SECTION_PADDING = 'py-20 sm:py-28'
const CONTAINER = 'max-w-[1240px] mx-auto px-5 sm:px-10'

export default function BrandPage() {
  return (
    <main style={{ backgroundColor: 'var(--ed-bg)', color: 'var(--ed-fg)' }}>
      {/* ---------- Masthead ---------- */}
      <section className={`${CONTAINER} ${SECTION_PADDING}`}>
        <div
          style={{
            fontFamily: F.glacial,
            fontSize: 11,
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            color: 'var(--ed-accent)',
            fontWeight: 600,
            marginBottom: 24,
          }}
        >
          WikiSubmission · Brand Guidelines
        </div>
        <h1
          style={{
            fontFamily: F.display,
            fontSize: 'clamp(56px, 10vw, 96px)',
            lineHeight: 0.95,
            letterSpacing: '-0.03em',
            fontWeight: 500,
            color: 'var(--ed-fg)',
            marginBottom: 24,
          }}
        >
          The visual <em style={{ fontStyle: 'italic', color: 'var(--ed-accent)' }}>covenant</em>
        </h1>
        <p
          style={{
            fontFamily: F.serif,
            fontSize: 19,
            lineHeight: 1.6,
            color: 'var(--ed-fg-muted)',
            maxWidth: '60ch',
          }}
        >
          WikiSubmission ships under three palettes and two modes. This document
          defines the system that holds them together — the tokens, typography,
          motifs, and voice that read the same in every theme.
        </p>
      </section>

      <Hairline />

      {/* ---------- § I — North Star ---------- */}
      <section className={`${CONTAINER} ${SECTION_PADDING}`}>
        <SectionDivider num="§ I" title="North star" sub="Why this exists" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {[
            {
              title: 'Scripture first',
              body: 'Every visual decision serves the reading. Surfaces stay quiet so the verses can speak.',
            },
            {
              title: 'Editorial, not corporate',
              body: 'Type-led layouts, hairline rules, generous whitespace. We borrow from broadsheets, not dashboards.',
            },
            {
              title: 'Theme-honest',
              body: 'Three palettes, two modes. The brand is the system, not a single colorway.',
            },
          ].map((card) => (
            <div key={card.title}>
              <div
                style={{
                  fontFamily: F.display,
                  fontSize: 24,
                  fontWeight: 500,
                  letterSpacing: '-0.015em',
                  color: 'var(--ed-fg)',
                  marginBottom: 12,
                }}
              >
                {card.title}
              </div>
              <p
                style={{
                  fontFamily: F.serif,
                  fontSize: 15,
                  lineHeight: 1.65,
                  color: 'var(--ed-fg-muted)',
                }}
              >
                {card.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      <Hairline />

      {/* ---------- § II — Palettes ---------- */}
      <section className={`${CONTAINER} ${SECTION_PADDING}`}>
        <SectionDivider num="§ II" title="Palettes" sub="Three documented" />
        <p
          style={{
            fontFamily: F.serif,
            fontSize: 15,
            lineHeight: 1.65,
            color: 'var(--ed-fg-muted)',
            marginBottom: 48,
            maxWidth: '64ch',
          }}
        >
          This page follows your active palette — switch via the theme control
          in the header to see the chrome adapt. The swatches below always show
          all three palettes at their canonical hex values.
        </p>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {PALETTES.map((p) => (
            <PaletteCard key={p.key} palette={p} />
          ))}
        </div>
      </section>

      <Hairline />

      {/* ---------- § III — Tokens ---------- */}
      <section className={`${CONTAINER} ${SECTION_PADDING}`}>
        <SectionDivider num="§ III" title="Tokens" sub="The semantic API" />
        <p
          style={{
            fontFamily: F.serif,
            fontSize: 15,
            lineHeight: 1.65,
            color: 'var(--ed-fg-muted)',
            marginBottom: 36,
            maxWidth: '64ch',
          }}
        >
          Always reference these tokens — never the underlying palette hex.
          The token layer absorbs theme switching so a single component reads
          correctly in every palette × mode.
        </p>
        <div
          style={{
            border: '1px solid var(--ed-rule)',
            borderRadius: 3,
            overflow: 'hidden',
          }}
        >
          {TOKENS.map((tok, i) => (
            <div
              key={tok.name}
              className="grid grid-cols-[auto_1fr_auto] sm:grid-cols-[200px_1fr_220px]"
              style={{
                alignItems: 'center',
                gap: 16,
                padding: '14px 18px',
                borderTop: i === 0 ? 'none' : '1px solid var(--ed-rule)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span
                  aria-hidden="true"
                  style={{
                    width: 18,
                    height: 18,
                    backgroundColor: `var(${tok.name})`,
                    border: '1px solid var(--ed-rule)',
                    borderRadius: 2,
                    flexShrink: 0,
                  }}
                />
                <code
                  style={{
                    fontFamily: F.mono,
                    fontSize: 12.5,
                    color: 'var(--ed-fg)',
                  }}
                >
                  {tok.name}
                </code>
              </div>
              <div
                style={{
                  fontFamily: F.serif,
                  fontSize: 14,
                  color: 'var(--ed-fg-muted)',
                }}
              >
                {tok.role}
              </div>
              <code
                className="hidden sm:block"
                style={{
                  fontFamily: F.mono,
                  fontSize: 11,
                  color: 'var(--ed-fg-muted)',
                  textAlign: 'right',
                }}
              >
                → {tok.mapsTo}
              </code>
            </div>
          ))}
        </div>
      </section>

      <Hairline />

      {/* ---------- § IV — Typography ---------- */}
      <section className={`${CONTAINER} ${SECTION_PADDING}`}>
        <SectionDivider num="§ IV" title="Typography" sub="Five families" />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
          {TYPE.map((t) => (
            <div
              key={t.name}
              className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-6 md:gap-12"
              style={{
                paddingBottom: 32,
                borderBottom: '1px solid var(--ed-rule)',
              }}
            >
              <div>
                <div
                  style={{
                    fontFamily: F.display,
                    fontSize: 22,
                    fontWeight: 500,
                    letterSpacing: '-0.015em',
                    color: 'var(--ed-fg)',
                    marginBottom: 6,
                  }}
                >
                  {t.name}
                </div>
                <div
                  style={{
                    fontFamily: F.serif,
                    fontSize: 13,
                    color: 'var(--ed-fg-muted)',
                    marginBottom: 10,
                    lineHeight: 1.5,
                  }}
                >
                  {t.role}
                </div>
                <code
                  style={{
                    fontFamily: F.mono,
                    fontSize: 11,
                    color: 'var(--ed-accent)',
                  }}
                >
                  var({t.variable})
                </code>
              </div>
              <div
                dir={t.variable === '--font-amiri' ? 'rtl' : 'ltr'}
                style={{
                  fontFamily: t.family,
                  fontSize: t.size,
                  lineHeight: 1.4,
                  color: 'var(--ed-fg)',
                  letterSpacing: t.size > 24 ? '-0.01em' : 0,
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                {t.sample}
              </div>
            </div>
          ))}
        </div>
      </section>

      <Hairline />

      {/* ---------- § V — Logo ---------- */}
      <section className={`${CONTAINER} ${SECTION_PADDING}`}>
        <SectionDivider num="§ V" title="Logo" sub="Mark variants" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <LogoCard
            src="/brand-assets/logo-transparent.png"
            label="Transparent"
            note="Default. Any background."
            bg="var(--ed-bg-alt)"
          />
          <LogoCard
            src="/brand-assets/logo-black.png"
            label="Black"
            note="Light backgrounds only."
            bg="#FBF8F1"
          />
          <LogoCard
            src="/brand-assets/logo-white.png"
            label="White"
            note="Dark backgrounds only."
            bg="#14110E"
          />
        </div>
        <div
          className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-10"
          style={{
            paddingTop: 28,
            borderTop: '1px solid var(--ed-rule)',
          }}
        >
          <Rule
            heading="Clear space"
            body="Reserve at least 30% of the mark's height as padding on all sides. Never let other content encroach."
          />
          <Rule
            heading="Don't"
            body="Recolor, distort, rotate, or apply effects. Use the provided variants only."
          />
        </div>
      </section>

      <Hairline />

      {/* ---------- § VI — Components ---------- */}
      <section className={`${CONTAINER} ${SECTION_PADDING}`}>
        <SectionDivider num="§ VI" title="Components" sub="Editorial primitives" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ComponentCard label=".ed-link">
            <a href="#" className="ed-link" style={{ fontFamily: F.serif, fontSize: 16 }}>
              Read the introduction →
            </a>
          </ComponentCard>
          <ComponentCard label=".ed-cta">
            <a href="#" className="ed-cta" style={{ fontFamily: F.serif, fontSize: 14 }}>
              Begin reading <span aria-hidden="true">→</span>
            </a>
          </ComponentCard>
          <ComponentCard label=".ed-btn-primary">
            <span className="ed-btn-primary" style={{ fontFamily: F.serif }}>
              Open the Quran
            </span>
          </ComponentCard>
          <ComponentCard label=".ed-btn-ghost">
            <span className="ed-btn-ghost" style={{ fontFamily: F.serif }}>
              Learn more
            </span>
          </ComponentCard>
        </div>
      </section>

      <Hairline />

      {/* ---------- § VII — Geometry ---------- */}
      <section className={`${CONTAINER} ${SECTION_PADDING}`}>
        <SectionDivider num="§ VII" title="Geometry" sub="Numbers, fixed" />
        <div
          style={{
            border: '1px solid var(--ed-rule)',
            borderRadius: 3,
            overflow: 'hidden',
          }}
        >
          {[
            ['Max content width', '1240px'],
            ['Section padding', '20–40px horizontal · 80–120px vertical'],
            ['Border radius', '0–3px (squares preferred · buttons 2px · cards 3px)'],
            ['Hairlines', '1px solid var(--ed-rule)'],
            ['Vertical rhythm', '8 · 12 · 16 · 24 · 32 · 48 · 64 · 96'],
          ].map(([k, v], i) => (
            <div
              key={k}
              className="grid grid-cols-1 sm:grid-cols-[260px_1fr]"
              style={{
                gap: 16,
                padding: '14px 18px',
                borderTop: i === 0 ? 'none' : '1px solid var(--ed-rule)',
              }}
            >
              <div
                style={{
                  fontFamily: F.glacial,
                  fontSize: 11,
                  letterSpacing: '0.16em',
                  textTransform: 'uppercase',
                  color: 'var(--ed-accent)',
                  fontWeight: 600,
                  alignSelf: 'center',
                }}
              >
                {k}
              </div>
              <div
                style={{
                  fontFamily: F.mono,
                  fontSize: 13,
                  color: 'var(--ed-fg)',
                }}
              >
                {v}
              </div>
            </div>
          ))}
        </div>
      </section>

      <Hairline />

      {/* ---------- § VIII — Voice ---------- */}
      <section className={`${CONTAINER} ${SECTION_PADDING}`}>
        <SectionDivider num="§ VIII" title="Voice" sub="How we sound" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {VOICE.map((v) => (
            <div
              key={v.word}
              style={{
                padding: '24px 22px',
                border: '1px solid var(--ed-rule)',
                borderRadius: 3,
                backgroundColor: 'var(--ed-bg-alt)',
              }}
            >
              <div
                style={{
                  fontFamily: F.display,
                  fontSize: 28,
                  fontWeight: 500,
                  letterSpacing: '-0.02em',
                  color: 'var(--ed-fg)',
                  marginBottom: 8,
                }}
              >
                {v.word}
              </div>
              <p
                style={{
                  fontFamily: F.serif,
                  fontSize: 14,
                  lineHeight: 1.6,
                  color: 'var(--ed-fg-muted)',
                }}
              >
                {v.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      <Hairline />

      {/* ---------- § IX — Application ---------- */}
      <section className={`${CONTAINER} ${SECTION_PADDING}`}>
        <SectionDivider num="§ IX" title="Application" sub="Do · Don't" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <ApplicationList
            heading="Do"
            tone="positive"
            items={DOS}
          />
          <ApplicationList
            heading="Don't"
            tone="negative"
            items={DONTS}
          />
        </div>
      </section>

      {/* ---------- Closing verse ---------- */}
      <section className={`${CONTAINER}`} style={{ paddingTop: 64, paddingBottom: 96 }}>
        <div
          style={{
            paddingTop: 28,
            paddingBottom: 28,
            borderTop: '1px solid var(--ed-rule)',
            borderBottom: '1px solid var(--ed-rule)',
            display: 'flex',
            gap: 20,
            alignItems: 'baseline',
          }}
        >
          <span
            style={{
              fontFamily: F.glacial,
              fontSize: 11,
              letterSpacing: '0.12em',
              color: 'var(--ed-accent)',
              flexShrink: 0,
              paddingTop: 2,
            }}
          >
            41:53
          </span>
          <span
            style={{
              fontFamily: F.display,
              fontStyle: 'italic',
              fontSize: 17,
              lineHeight: 1.55,
              color: 'var(--ed-fg-muted)',
            }}
          >
            We will show them Our proofs in the horizons, and within themselves,
            until they realize that this is the truth.
          </span>
        </div>
      </section>
    </main>
  )
}

/* ============================================================ */
/* Small composables                                              */
/* ============================================================ */

function Hairline() {
  return (
    <div
      aria-hidden="true"
      style={{
        height: 1,
        backgroundColor: 'var(--ed-rule)',
        maxWidth: 1240,
        margin: '0 auto',
      }}
    />
  )
}

function PaletteCard({ palette }: { palette: PaletteDoc }) {
  return (
    <div
      style={{
        border: '1px solid var(--ed-rule)',
        borderRadius: 3,
        overflow: 'hidden',
        backgroundColor: 'var(--ed-bg-alt)',
      }}
    >
      <div style={{ padding: '18px 20px' }}>
        <div
          style={{
            fontFamily: F.glacial,
            fontSize: 10.5,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: 'var(--ed-accent)',
            fontWeight: 600,
            marginBottom: 6,
          }}
        >
          {palette.key}
        </div>
        <div
          style={{
            fontFamily: F.display,
            fontSize: 22,
            fontWeight: 500,
            letterSpacing: '-0.015em',
            color: 'var(--ed-fg)',
            marginBottom: 4,
          }}
        >
          {palette.label}
        </div>
        <div
          style={{
            fontFamily: F.serif,
            fontSize: 13,
            color: 'var(--ed-fg-muted)',
            lineHeight: 1.5,
          }}
        >
          {palette.tagline}
        </div>
      </div>
      <PaletteModeRow label="Light" mode={palette.light} />
      <PaletteModeRow label="Dark" mode={palette.dark} isLast />
    </div>
  )
}

function PaletteModeRow({
  label,
  mode,
  isLast,
}: {
  label: string
  mode: ModeSwatches
  isLast?: boolean
}) {
  const SWATCHES: Array<[keyof ModeSwatches, string]> = [
    ['bg', 'bg'],
    ['fg', 'fg'],
    ['accent', 'accent'],
    ['rule', 'rule'],
  ]
  return (
    <div
      style={{
        borderTop: '1px solid var(--ed-rule)',
        borderBottom: isLast ? 'none' : 'none',
        backgroundColor: mode.bg,
        padding: '18px 20px',
      }}
    >
      <div
        style={{
          fontFamily: F.glacial,
          fontSize: 10,
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          color: mode.fg,
          opacity: 0.6,
          fontWeight: 600,
          marginBottom: 12,
        }}
      >
        {label}
      </div>
      <div className="grid grid-cols-4 gap-2">
        {SWATCHES.map(([k, lbl]) => (
          <div key={k}>
            <div
              aria-hidden="true"
              style={{
                width: '100%',
                aspectRatio: '1 / 1',
                backgroundColor: mode[k],
                border: `1px solid ${mode.rule}`,
                borderRadius: 2,
                marginBottom: 6,
              }}
            />
            <div
              style={{
                fontFamily: F.glacial,
                fontSize: 9,
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                color: mode.fg,
                opacity: 0.6,
                fontWeight: 600,
              }}
            >
              {lbl}
            </div>
            <div
              style={{
                fontFamily: F.mono,
                fontSize: 10.5,
                color: mode.fg,
                marginTop: 1,
              }}
            >
              {mode[k]}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function LogoCard({
  src,
  label,
  note,
  bg,
}: {
  src: string
  label: string
  note: string
  bg: string
}) {
  return (
    <div
      style={{
        border: '1px solid var(--ed-rule)',
        borderRadius: 3,
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          backgroundColor: bg,
          padding: 40,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 180,
        }}
      >
        <Image
          src={src}
          alt={`WikiSubmission logo — ${label}`}
          width={88}
          height={88}
          style={{ height: 'auto', width: 88 }}
        />
      </div>
      <div style={{ padding: '14px 18px', backgroundColor: 'var(--ed-bg-alt)' }}>
        <div
          style={{
            fontFamily: F.glacial,
            fontSize: 11,
            letterSpacing: '0.16em',
            textTransform: 'uppercase',
            color: 'var(--ed-accent)',
            fontWeight: 600,
            marginBottom: 4,
          }}
        >
          {label}
        </div>
        <div
          style={{
            fontFamily: F.serif,
            fontSize: 13,
            color: 'var(--ed-fg-muted)',
            lineHeight: 1.5,
          }}
        >
          {note}
        </div>
      </div>
    </div>
  )
}

function Rule({ heading, body }: { heading: string; body: string }) {
  return (
    <div>
      <div
        style={{
          fontFamily: F.glacial,
          fontSize: 11,
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          color: 'var(--ed-accent)',
          fontWeight: 600,
          marginBottom: 8,
        }}
      >
        {heading}
      </div>
      <p
        style={{
          fontFamily: F.serif,
          fontSize: 14,
          lineHeight: 1.6,
          color: 'var(--ed-fg-muted)',
        }}
      >
        {body}
      </p>
    </div>
  )
}

function ComponentCard({
  children,
  label,
}: {
  children: React.ReactNode
  label: string
}) {
  return (
    <div
      style={{
        border: '1px solid var(--ed-rule)',
        borderRadius: 3,
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          padding: 36,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 120,
          backgroundColor: 'var(--ed-bg-alt)',
        }}
      >
        {children}
      </div>
      <div
        style={{
          padding: '12px 16px',
          borderTop: '1px solid var(--ed-rule)',
          fontFamily: F.mono,
          fontSize: 11.5,
          color: 'var(--ed-fg-muted)',
        }}
      >
        {label}
      </div>
    </div>
  )
}

function ApplicationList({
  heading,
  items,
  tone,
}: {
  heading: string
  items: string[]
  tone: 'positive' | 'negative'
}) {
  const accent = tone === 'positive' ? 'var(--ed-accent)' : 'var(--ed-fg-muted)'
  const symbol = tone === 'positive' ? '✓' : '×'
  return (
    <div>
      <div
        style={{
          fontFamily: F.display,
          fontSize: 28,
          fontWeight: 500,
          letterSpacing: '-0.02em',
          color: 'var(--ed-fg)',
          marginBottom: 20,
          paddingBottom: 12,
          borderBottom: '1px solid var(--ed-rule)',
        }}
      >
        {heading}
      </div>
      <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 14 }}>
        {items.map((item) => (
          <li
            key={item}
            style={{
              display: 'grid',
              gridTemplateColumns: '20px 1fr',
              gap: 12,
              alignItems: 'baseline',
            }}
          >
            <span
              aria-hidden="true"
              style={{
                fontFamily: F.mono,
                fontSize: 14,
                color: accent,
                fontWeight: 600,
              }}
            >
              {symbol}
            </span>
            <span
              style={{
                fontFamily: F.serif,
                fontSize: 14.5,
                lineHeight: 1.55,
                color: 'var(--ed-fg-muted)',
              }}
            >
              {item}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
