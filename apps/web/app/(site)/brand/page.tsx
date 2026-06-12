import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { buildPageMetadata } from '@/constants/metadata'
import { SectionDivider, F } from '@/app/(site)/_sections/shared'
import {
  ACCESSIBILITY_RULES,
  BRAND_MARKDOWN_PATH,
  CONTENT_PATTERNS,
  DONTS,
  DOS,
  FORM_RULES,
  I18N_RULES,
  IMPLEMENTATION_RULES,
  INTERACTION_STATES,
  MOTION_RULES,
  NAVIGATION_RULES,
  PALETTES,
  RESPONSIVE_RULES,
  TOKENS,
  TYPE,
  VOICE,
  type BrandCard,
  type BrandRule,
  type ModeSwatches,
  type PaletteDoc,
} from '@/app/(site)/brand/content'

export const metadata = buildPageMetadata({
  title: 'Brand · WikiSubmission',
  description:
    'WikiSubmission brand guidelines — palettes, typography, responsive rules, accessibility, motion, components, and voice.',
  url: '/brand',
})

const SECTION_PADDING = 'py-20 sm:py-28'
const CONTAINER = 'max-w-[1240px] mx-auto px-5 sm:px-10'

export default function BrandPage() {
  return (
    <main style={{ backgroundColor: 'var(--ed-bg)', color: 'var(--ed-fg)' }}>
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
            maxWidth: '62ch',
          }}
        >
          WikiSubmission ships under three palettes and two modes. This document defines the
          system that keeps those themes coherent across reading surfaces, navigation, forms,
          motion, accessibility, and voice.
        </p>
        <div className="flex flex-wrap items-center gap-4 mt-8">
          <a href={BRAND_MARKDOWN_PATH} download className="ed-btn-ghost" style={{ fontFamily: F.serif }}>
            Download Markdown
          </a>
          <span
            style={{
              fontFamily: F.mono,
              fontSize: 11.5,
              color: 'var(--ed-fg-muted)',
            }}
          >
            LLM-friendly export of this page’s design guidance.
          </span>
        </div>
      </section>

      <Hairline />

      <section className={`${CONTAINER} ${SECTION_PADDING}`}>
        <SectionDivider id="north-star" num="§ I" title="North star" sub="Why this exists" />
        <CardGrid
          cards={[
            {
              title: 'Scripture first',
              body: 'Every visual decision serves the reading. Surfaces stay quiet so the verses can speak.',
            },
            {
              title: 'Editorial, not corporate',
              body: 'Type-led layouts, hairline rules, and generous whitespace beat dashboard chrome and startup gloss.',
            },
            {
              title: 'Theme-honest',
              body: 'Three palettes, two modes. The brand is the system across states, not a single preferred screenshot.',
            },
          ]}
          columns="md:grid-cols-3"
        />
      </section>

      <Hairline />

      <section className={`${CONTAINER} ${SECTION_PADDING}`}>
        <SectionDivider id="palettes" num="§ II" title="Palettes" sub="Three documented" />
        <SectionLead>
          This page follows your active palette. Switch themes in the header to see the chrome adapt.
          The swatches below stay canonical and should not be rewritten by the active theme.
        </SectionLead>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {PALETTES.map((p) => (
            <PaletteCard key={p.key} palette={p} />
          ))}
        </div>
      </section>

      <Hairline />

      <section className={`${CONTAINER} ${SECTION_PADDING}`}>
        <SectionDivider id="tokens" num="§ III" title="Tokens" sub="The semantic API" />
        <SectionLead>
          Always reference semantic tokens before reaching for raw palette values. The token layer is
          what keeps a single component legible in every palette × mode combination.
        </SectionLead>
        <div style={{ border: '1px solid var(--ed-rule)', borderRadius: 3, overflow: 'hidden' }}>
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
                <code style={{ fontFamily: F.mono, fontSize: 12.5, color: 'var(--ed-fg)' }}>
                  {tok.name}
                </code>
              </div>
              <div style={{ fontFamily: F.serif, fontSize: 14, color: 'var(--ed-fg-muted)' }}>
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

      <section className={`${CONTAINER} ${SECTION_PADDING}`}>
        <SectionDivider id="typography" num="§ IV" title="Typography" sub="Five families" />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
          {TYPE.map((t) => (
            <div
              key={t.name}
              className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-6 md:gap-12"
              style={{ paddingBottom: 32, borderBottom: '1px solid var(--ed-rule)' }}
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
                <code style={{ fontFamily: F.mono, fontSize: 11, color: 'var(--ed-accent)' }}>
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

      <section className={`${CONTAINER} ${SECTION_PADDING}`}>
        <SectionDivider id="logo" num="§ V" title="Logo" sub="Mark variants" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <LogoCard
            src="/brand-assets/logo-transparent.png"
            label="Transparent"
            note="Default. Any background. Preferred in ordinary product usage."
            bg="var(--ed-bg-alt)"
          />
          <LogoCard
            src="/brand-assets/logo-black.png"
            label="Black"
            note="Light backgrounds only. Use when transparency harms legibility."
            bg="#FBF8F1"
          />
          <LogoCard
            src="/brand-assets/logo-white.png"
            label="White"
            note="Dark backgrounds only. Avoid adding outer glow or stroke rescue effects."
            bg="#14110E"
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-10" style={{ paddingTop: 28, borderTop: '1px solid var(--ed-rule)' }}>
          <Rule heading="Clear space" body="Reserve at least 30% of the mark's height as padding on all sides. Never let other content encroach." />
          <Rule heading="Don't" body="Recolor, distort, rotate, or apply effects. Use the provided variants only." />
        </div>
      </section>

      <Hairline />

      <section className={`${CONTAINER} ${SECTION_PADDING}`}>
        <SectionDivider id="responsive" num="§ VI" title="Responsive" sub="Current layout contract" />
        <SectionLead>
          These rules describe current implementation patterns in the repo. I did not find a separate,
          versioned breakpoint token file, so this section records the actual responsive behavior in use.
        </SectionLead>
        <SpecTable rows={RESPONSIVE_RULES} />
      </section>

      <Hairline />

      <section className={`${CONTAINER} ${SECTION_PADDING}`}>
        <SectionDivider id="interaction" num="§ VII" title="Interaction" sub="State behavior" />
        <CardGrid cards={INTERACTION_STATES} columns="md:grid-cols-2 xl:grid-cols-4" />
      </section>

      <Hairline />

      <section className={`${CONTAINER} ${SECTION_PADDING}`}>
        <SectionDivider id="components" num="§ VIII" title="Components" sub="Editorial and forms" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ComponentCard label=".ed-link">
            <Link href="/introduction" className="ed-link" style={{ fontFamily: F.serif, fontSize: 16 }}>
              Read the introduction →
            </Link>
          </ComponentCard>
          <ComponentCard label=".ed-cta">
            <Link href="/quran" className="ed-cta" style={{ fontFamily: F.serif, fontSize: 14 }}>
              Begin reading <span aria-hidden="true">→</span>
            </Link>
          </ComponentCard>
          <ComponentCard label=".ed-btn-primary">
            <button type="button" className="ed-btn-primary" style={{ fontFamily: F.serif }}>
              Open the Quran
            </button>
          </ComponentCard>
          <ComponentCard label=".ed-btn-ghost">
            <button type="button" className="ed-btn-ghost" style={{ fontFamily: F.serif }}>
              Learn more
            </button>
          </ComponentCard>
        </div>
        <div style={{ marginTop: 40 }}>
          <SpecTable rows={FORM_RULES} />
        </div>
      </section>

      <Hairline />

      <section className={`${CONTAINER} ${SECTION_PADDING}`}>
        <SectionDivider id="navigation" num="§ IX" title="Navigation" sub="Wayfinding and chrome" />
        <SpecTable rows={NAVIGATION_RULES} />
      </section>

      <Hairline />

      <section className={`${CONTAINER} ${SECTION_PADDING}`}>
        <SectionDivider id="content" num="§ X" title="Content patterns" sub="Editorial structures" />
        <SpecTable rows={CONTENT_PATTERNS} />
      </section>

      <Hairline />

      <section className={`${CONTAINER} ${SECTION_PADDING}`}>
        <SectionDivider id="geometry" num="§ XI" title="Geometry" sub="Numbers, fixed" />
        <SpecTable
          rows={[
            { label: 'Max content width', body: '1240px' },
            { label: 'Section padding', body: '20–40px horizontal · 80–120px vertical' },
            { label: 'Editorial radii', body: '0–3px on brand-led surfaces; squares remain the default visual language.' },
            { label: 'Hairlines', body: '1px solid var(--ed-rule)' },
            { label: 'Vertical rhythm', body: '8 · 12 · 16 · 24 · 32 · 48 · 64 · 96' },
          ]}
        />
      </section>

      <Hairline />

      <section className={`${CONTAINER} ${SECTION_PADDING}`}>
        <SectionDivider id="accessibility" num="§ XII" title="Accessibility" sub="Non-negotiable" />
        <SpecTable rows={ACCESSIBILITY_RULES} />
      </section>

      <Hairline />

      <section className={`${CONTAINER} ${SECTION_PADDING}`}>
        <SectionDivider id="motion" num="§ XIII" title="Motion" sub="GSAP, restrained" />
        <SectionLead>
          Motion exists across the site, but the codebase already points toward a quiet default: fade-up
          entrances, small stagger values, and checks for reduced-motion on more immersive interactions.
        </SectionLead>
        <SpecTable rows={MOTION_RULES} />
      </section>

      <Hairline />

      <section className={`${CONTAINER} ${SECTION_PADDING}`}>
        <SectionDivider id="i18n" num="§ XIV" title="Internationalization" sub="LTR, RTL, Arabic" />
        <SpecTable rows={I18N_RULES} />
      </section>

      <Hairline />

      <section className={`${CONTAINER} ${SECTION_PADDING}`}>
        <SectionDivider id="voice" num="§ XV" title="Voice" sub="How we sound" />
        <CardGrid cards={VOICE} columns="md:grid-cols-2 lg:grid-cols-4" />
      </section>

      <Hairline />

      <section className={`${CONTAINER} ${SECTION_PADDING}`}>
        <SectionDivider id="implementation" num="§ XVI" title="Implementation" sub="Source of truth" />
        <SpecTable rows={IMPLEMENTATION_RULES} />
      </section>

      <Hairline />

      <section className={`${CONTAINER} ${SECTION_PADDING}`}>
        <SectionDivider id="application" num="§ XVII" title="Application" sub="Do · Don't" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <ApplicationList heading="Do" tone="positive" items={DOS} />
          <ApplicationList heading="Don't" tone="negative" items={DONTS} />
        </div>
      </section>

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
            We will show them Our proofs in the horizons, and within themselves, until they realize
            that this is the truth.
          </span>
        </div>
      </section>
    </main>
  )
}

function SectionLead({ children }: { children: React.ReactNode }) {
  return (
    <p
      style={{
        fontFamily: F.serif,
        fontSize: 15,
        lineHeight: 1.65,
        color: 'var(--ed-fg-muted)',
        marginBottom: 36,
        maxWidth: '68ch',
      }}
    >
      {children}
    </p>
  )
}

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

function CardGrid({ cards, columns }: { cards: BrandCard[]; columns: string }) {
  return (
    <div className={`grid grid-cols-1 gap-6 ${columns}`}>
      {cards.map((card) => (
        <div
          key={card.title}
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
            {card.title}
          </div>
          <p style={{ fontFamily: F.serif, fontSize: 14, lineHeight: 1.6, color: 'var(--ed-fg-muted)' }}>
            {card.body}
          </p>
        </div>
      ))}
    </div>
  )
}

function SpecTable({ rows }: { rows: BrandRule[] }) {
  return (
    <div style={{ border: '1px solid var(--ed-rule)', borderRadius: 3, overflow: 'hidden' }}>
      {rows.map((row, i) => (
        <div
          key={row.label}
          className="grid grid-cols-1 sm:grid-cols-[240px_1fr]"
          style={{
            gap: 16,
            padding: '16px 18px',
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
              alignSelf: 'start',
            }}
          >
            {row.label}
          </div>
          <div style={{ fontFamily: F.serif, fontSize: 14, lineHeight: 1.65, color: 'var(--ed-fg-muted)' }}>
            {row.body}
          </div>
        </div>
      ))}
    </div>
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
        <div style={{ fontFamily: F.serif, fontSize: 13, color: 'var(--ed-fg-muted)', lineHeight: 1.5 }}>
          {palette.tagline}
        </div>
      </div>
      <PaletteModeRow label="Light" mode={palette.light} />
      <PaletteModeRow label="Dark" mode={palette.dark} />
    </div>
  )
}

function PaletteModeRow({ label, mode }: { label: string; mode: ModeSwatches }) {
  const SWATCHES: Array<[keyof ModeSwatches, string]> = [
    ['bg', 'bg'],
    ['fg', 'fg'],
    ['accent', 'accent'],
    ['rule', 'rule'],
  ]

  return (
    <div style={{ borderTop: '1px solid var(--ed-rule)', backgroundColor: mode.bg, padding: '18px 20px' }}>
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
            <div style={{ fontFamily: F.mono, fontSize: 10.5, color: mode.fg, marginTop: 1 }}>{mode[k]}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

function LogoCard({ src, label, note, bg }: { src: string; label: string; note: string; bg: string }) {
  return (
    <div style={{ border: '1px solid var(--ed-rule)', borderRadius: 3, overflow: 'hidden' }}>
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
        <Image src={src} alt={`WikiSubmission logo — ${label}`} width={88} height={88} style={{ height: 'auto', width: 88 }} />
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
        <div style={{ fontFamily: F.serif, fontSize: 13, color: 'var(--ed-fg-muted)', lineHeight: 1.5 }}>{note}</div>
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
      <p style={{ fontFamily: F.serif, fontSize: 14, lineHeight: 1.6, color: 'var(--ed-fg-muted)' }}>{body}</p>
    </div>
  )
}

function ComponentCard({ children, label }: { children: React.ReactNode; label: string }) {
  return (
    <div style={{ border: '1px solid var(--ed-rule)', borderRadius: 3, overflow: 'hidden' }}>
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

function ApplicationList({ heading, items, tone }: { heading: string; items: string[]; tone: 'positive' | 'negative' }) {
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
          marginBottom: 18,
        }}
      >
        {heading}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {items.map((item) => (
          <div key={item} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
            <span
              aria-hidden="true"
              style={{
                fontFamily: F.mono,
                fontSize: 14,
                color: accent,
                lineHeight: 1.5,
                flexShrink: 0,
              }}
            >
              {symbol}
            </span>
            <span style={{ fontFamily: F.serif, fontSize: 15, lineHeight: 1.65, color: 'var(--ed-fg-muted)' }}>
              {item}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
