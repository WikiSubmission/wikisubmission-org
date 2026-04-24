import { buildPageMetadata } from '@/constants/metadata'
import React from 'react'
import Image from 'next/image'

export const metadata = buildPageMetadata({
  title: 'Brand Guidelines · WikiSubmission',
  description:
    'The visual covenant — WikiSubmission brand guidelines covering palette, typography, logo, and motifs.',
  url: '/brand',
})

const F = {
  display: 'var(--font-cormorant), Georgia, serif',
  mono: 'var(--font-jetbrains), ui-monospace, monospace',
  serif: 'var(--font-source-serif), Georgia, serif',
  arabic: 'var(--font-amiri), serif',
}

/* Brand page is always dark (Bitumen bg) — scholarly document */
const D = {
  bg: '#14110E',
  bgAlt: '#0F0D0B',
  surface: '#1C1815',
  fg: '#EEE4D0',
  fgMuted: '#8A8075',
  rule: '#2A241E',
  accent: '#D4A373',
  accentSoft: '#3A2A1C',
}

function SectionHead({
  num,
  title,
  tag,
}: {
  num: string
  title: string
  tag: string
}) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '80px auto 1fr auto',
        alignItems: 'baseline',
        gap: 24,
        marginBottom: 48,
      }}
    >
      <span
        style={{
          fontFamily: F.display,
          fontStyle: 'italic',
          fontSize: 14,
          color: D.accent,
          letterSpacing: '0.12em',
        }}
      >
        § {num}
      </span>
      <span
        style={{
          fontFamily: F.display,
          fontSize: 28,
          fontWeight: 500,
          letterSpacing: '-0.02em',
          color: D.fg,
        }}
      >
        {title}
      </span>
      <div style={{ height: 1, backgroundColor: D.rule }} />
      <span
        style={{
          fontFamily: F.mono,
          fontSize: 10,
          textTransform: 'uppercase',
          letterSpacing: '0.2em',
          color: D.fgMuted,
        }}
      >
        {tag}
      </span>
    </div>
  )
}

function PaletteCard({
  hex,
  token,
  name,
  bg,
}: {
  hex: string
  token: string
  name: string
  bg?: string
}) {
  return (
    <div
      style={{
        border: '1px solid',
        borderColor: D.rule,
        borderRadius: 3,
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          height: 140,
          backgroundColor: hex,
          border: bg ? `1px solid ${D.rule}` : undefined,
        }}
      />
      <div
        style={{
          padding: '14px 16px',
          backgroundColor: D.surface,
          display: 'flex',
          flexDirection: 'column',
          gap: 4,
        }}
      >
        <div
          style={{
            fontFamily: F.mono,
            fontSize: 12,
            color: D.fg,
            letterSpacing: '0.06em',
          }}
        >
          {hex}
        </div>
        <div
          style={{
            fontFamily: F.mono,
            fontSize: 10,
            color: D.accent,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
          }}
        >
          {token}
        </div>
        <div
          style={{
            fontFamily: F.serif,
            fontSize: 13,
            color: D.fgMuted,
          }}
        >
          {name}
        </div>
      </div>
    </div>
  )
}

function TypeSpecimen({
  family,
  use,
  sample,
  weight,
}: {
  family: string
  use: string
  sample: string
  weight: string
}) {
  return (
    <div
      style={{
        border: '1px solid',
        borderColor: D.rule,
        borderRadius: 3,
        overflow: 'hidden',
        backgroundColor: D.surface,
      }}
    >
      <div
        style={{
          padding: '20px 28px',
          borderBottom: `1px solid ${D.rule}`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'baseline',
        }}
      >
        <div
          style={{
            fontFamily: F.mono,
            fontSize: 11,
            color: D.fg,
            letterSpacing: '0.08em',
          }}
        >
          {family}
        </div>
        <div
          style={{
            fontFamily: F.mono,
            fontSize: 10,
            color: D.accent,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
          }}
        >
          {use}
        </div>
      </div>
      <div
        style={{
          padding: '40px 28px',
          fontSize: 'clamp(36px, 5vw, 64px)',
          lineHeight: 1.1,
          color: D.fg,
          fontFamily: family.includes('Cormorant')
            ? F.display
            : family.includes('JetBrains')
            ? F.mono
            : family.includes('Amiri')
            ? F.arabic
            : F.serif,
          letterSpacing: '-0.02em',
        }}
      >
        {sample}
      </div>
      <div
        style={{
          padding: '12px 28px',
          borderTop: `1px solid ${D.rule}`,
          fontFamily: F.mono,
          fontSize: 10,
          color: D.fgMuted,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
        }}
      >
        {weight}
      </div>
    </div>
  )
}

function Principle({
  num,
  title,
  body,
}: {
  num: string
  title: string
  body: string
}) {
  return (
    <div
      style={{
        paddingTop: 20,
        borderTop: `2px solid ${D.accent}`,
      }}
    >
      <div
        style={{
          fontFamily: F.mono,
          fontSize: 10,
          color: D.accent,
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          marginBottom: 12,
        }}
      >
        {num}
      </div>
      <div
        style={{
          fontFamily: F.display,
          fontSize: 22,
          fontWeight: 500,
          color: D.fg,
          marginBottom: 12,
          lineHeight: 1.15,
        }}
      >
        {title}
      </div>
      <p
        style={{
          fontFamily: F.serif,
          fontSize: 14,
          color: D.fgMuted,
          lineHeight: 1.65,
        }}
      >
        {body}
      </p>
    </div>
  )
}

export default function BrandPage() {
  return (
    <div
      style={{
        backgroundColor: D.bg,
        color: D.fg,
        minHeight: '100vh',
      }}
    >
      <div
        style={{
          maxWidth: 1180,
          margin: '0 auto',
          padding: '80px 40px 160px',
        }}
      >
        {/* ── Masthead ── */}
        <div
          style={{
            paddingBottom: 56,
            borderBottom: `1px solid ${D.rule}`,
            marginBottom: 80,
          }}
        >
          <h1
            style={{
              fontFamily: F.display,
              fontSize: 'clamp(64px, 8vw, 120px)',
              lineHeight: 0.92,
              letterSpacing: '-0.035em',
              fontWeight: 400,
              color: D.fg,
            }}
          >
            The{' '}
            <em style={{ fontStyle: 'italic', color: D.fgMuted }}>visual</em>
            <br />
            covenant.
          </h1>
        </div>

        {/* ── § I · Principles ── */}
        <div style={{ marginBottom: 120 }}>
          <SectionHead num="I" title="Principles" tag="Foundation" />
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: 32,
            }}
            className="max-md:grid-cols-1"
          >
            <Principle
              num="01"
              title="Scripture first"
              body="Every design decision serves the text. Typography, spacing, and colour exist to make the words easier to read and remember — never to impress."
            />
            <Principle
              num="02"
              title="Ink on parchment"
              body="We borrow from the tradition of illuminated manuscripts: warm, unhurried, tactile. The aesthetic communicates age and authority without artifice."
            />
            <Principle
              num="03"
              title="No intermediary"
              body="The design removes barriers between the reader and the source. No dark patterns, no paywalls, no signup walls. The brand reflects the mission."
            />
          </div>
        </div>

        {/* ── § II · Voice ── */}
        <div style={{ marginBottom: 120 }}>
          <SectionHead num="II" title="Voice" tag="Editorial tone" />
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 40,
            }}
            className="max-md:grid-cols-1"
          >
            {[
              {
                head: 'Scholarly, not academic',
                body: 'We write with precision and cite our sources, but we never write to exclude. A first-time reader and a graduate student should both feel welcomed.',
              },
              {
                head: 'Reverent, not dogmatic',
                body: 'The tone reflects awe before the text, not enforcement of a creed. We present the Quran and invite the reader to draw their own conclusions.',
              },
              {
                head: 'Plain, not plain-spoken',
                body: "We choose words that are exact, not simple. Clarity is a form of respect. We don't condescend or over-explain, but we also don't obscure.",
              },
              {
                head: 'Timeless, not trendy',
                body: 'Copy written today should read without embarrassment in ten years. Avoid idioms, slang, or references that date quickly.',
              },
            ].map((v) => (
              <div key={v.head}>
                <div
                  style={{
                    fontFamily: F.display,
                    fontSize: 20,
                    fontWeight: 500,
                    color: D.fg,
                    marginBottom: 10,
                  }}
                >
                  {v.head}
                </div>
                <p
                  style={{
                    fontFamily: F.serif,
                    fontSize: 14,
                    color: D.fgMuted,
                    lineHeight: 1.65,
                  }}
                >
                  {v.body}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* ── § III · Logo ── */}
        <div style={{ marginBottom: 120 }}>
          <SectionHead num="III" title="Logo" tag="Mark & wordmark" />
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: 16,
            }}
            className="max-md:grid-cols-1"
          >
            {[
              { label: 'i.', rule: 'Primary mark — logo-transparent.png on any background', bg: D.surface, src: '/brand-assets/logo-transparent.png' },
              { label: 'ii.', rule: 'On sienna or coloured ground', bg: '#6B3410', src: '/brand-assets/logo-transparent.png' },
              { label: 'iii.', rule: 'On deep dark ground', bg: '#14110E', src: '/brand-assets/logo-transparent.png' },
              { label: 'iv.', rule: 'Minimum clear space: ½ mark height on all sides', bg: D.surface, src: null },
              { label: 'v.', rule: 'Minimum size: 24px height for digital, 8mm for print', bg: D.surface, src: null },
              { label: 'vi.', rule: 'Never distort, recolour, or add effects to the mark', bg: D.surface, src: null },
            ].map((item) => (
              <div
                key={item.label}
                style={{
                  backgroundColor: item.bg,
                  border: `1px solid ${D.rule}`,
                  borderRadius: 3,
                  padding: 32,
                  minHeight: 180,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}
              >
                <span
                  style={{
                    fontFamily: F.display,
                    fontStyle: 'italic',
                    fontSize: 16,
                    color: D.accent,
                  }}
                >
                  {item.label}
                </span>
                {item.src && (
                  <div style={{ display: 'flex', justifyContent: 'center', padding: '16px 0' }}>
                    <Image src={item.src} alt="" width={72} height={72} style={{ objectFit: 'contain' }} />
                  </div>
                )}
                <p
                  style={{
                    fontFamily: F.mono,
                    fontSize: 11,
                    letterSpacing: '0.12em',
                    color: item.bg === D.surface ? D.fgMuted : item.bg === '#F6F2EA' ? '#6A6158' : '#8A8075',
                    lineHeight: 1.6,
                  }}
                >
                  {item.rule}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* ── § IV · Palette ── */}
        <div style={{ marginBottom: 120 }}>
          <SectionHead num="IV" title="Palette" tag="Colour system" />

          <div
            style={{
              fontFamily: F.mono,
              fontSize: 11,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: D.accent,
              marginBottom: 20,
            }}
          >
            Light mode — Ink on Parchment
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: 16,
              marginBottom: 48,
            }}
            className="max-md:grid-cols-2 max-sm:grid-cols-1"
          >
            <PaletteCard hex="#F6F2EA" token="--ed-bg" name="Parchment · Page background" bg="#D9CFB9" />
            <PaletteCard hex="#FBF8F1" token="--ed-surface" name="Vellum · Card surface" bg="#D9CFB9" />
            <PaletteCard hex="#1A1715" token="--ed-fg" name="Ink · Foreground text" />
            <PaletteCard hex="#6B3410" token="--ed-accent" name="Sienna · Accent & links" />
            <PaletteCard hex="#EFE8D9" token="--ed-bg-alt" name="Parchment alt · Banded sections" />
            <PaletteCard hex="#6A6158" token="--ed-fg-muted" name="Ash · Muted / metadata" />
            <PaletteCard hex="#D9CFB9" token="--ed-rule" name="Hairline · Borders" />
            <PaletteCard hex="#ECD9C5" token="--ed-accent-soft" name="Sienna 10% · Highlight bg" />
          </div>

          <div
            style={{
              fontFamily: F.mono,
              fontSize: 11,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: D.accent,
              marginBottom: 20,
            }}
          >
            Dark mode — Night Scholar
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: 16,
            }}
            className="max-md:grid-cols-2 max-sm:grid-cols-1"
          >
            <PaletteCard hex="#14110E" token="--ed-bg" name="Bitumen · Page background" bg="#2A241E" />
            <PaletteCard hex="#1C1815" token="--ed-surface" name="Surface · Card bg" />
            <PaletteCard hex="#EEE4D0" token="--ed-fg" name="Linen · Foreground text" />
            <PaletteCard hex="#D4A373" token="--ed-accent" name="Brass · Accent" />
            <PaletteCard hex="#0F0D0B" token="--ed-bg-alt" name="Alt bg · Banded sections" />
            <PaletteCard hex="#8A8075" token="--ed-fg-muted" name="Muted text" />
            <PaletteCard hex="#2A241E" token="--ed-rule" name="Ash · Borders" />
            <PaletteCard hex="#3A2A1C" token="--ed-accent-soft" name="Brass soft · Highlight bg" />
          </div>
        </div>

        {/* ── § V · Typography ── */}
        <div style={{ marginBottom: 120 }}>
          <SectionHead num="V" title="Typography" tag="Type system" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <TypeSpecimen
              family="Cormorant Garamond"
              use="Display / headings"
              sample="The Final Testament"
              weight="400 · 500 · 600 — regular & italic"
            />
            <TypeSpecimen
              family="Source Serif 4"
              use="Body / lede / captions"
              sample="Wisdom for all nations."
              weight="300 · 400 · 600 · 700 — regular & italic"
            />
            <TypeSpecimen
              family="JetBrains Mono"
              use="Kickers / metadata / references"
              sample="OVER IT IS NINETEEN"
              weight="400 · 500"
            />
            <TypeSpecimen
              family="Amiri"
              use="Arabic scripture"
              sample="بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ"
              weight="400 · 700"
            />
          </div>
        </div>

        {/* ── § VI · Layout ── */}
        <div style={{ marginBottom: 120 }}>
          <SectionHead num="VI" title="Layout" tag="Grid & spacing" />
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 40,
            }}
            className="max-md:grid-cols-1"
          >
            {[
              { label: 'Max content width', value: '1240px' },
              { label: 'Horizontal padding', value: '40px desktop · 24px mobile' },
              { label: 'Section rhythm (spacious)', value: '120px' },
              { label: 'Section rhythm (compact)', value: '72px' },
              { label: 'Card radius', value: '3px' },
              { label: 'Button radius', value: '2px' },
              { label: 'Hairline', value: '1px solid var(--ed-rule)' },
              { label: 'Emphasis rule', value: '2px solid var(--ed-accent)' },
            ].map((item) => (
              <div
                key={item.label}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'baseline',
                  padding: '14px 0',
                  borderBottom: `1px solid ${D.rule}`,
                }}
              >
                <span
                  style={{
                    fontFamily: F.serif,
                    fontSize: 14,
                    color: D.fgMuted,
                  }}
                >
                  {item.label}
                </span>
                <span
                  style={{
                    fontFamily: F.mono,
                    fontSize: 12,
                    color: D.fg,
                    letterSpacing: '0.06em',
                  }}
                >
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* ── § VII · Motifs ── */}
        <div style={{ marginBottom: 120 }}>
          <SectionHead num="VII" title="Motifs" tag="Visual language" />
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: 24,
            }}
            className="max-md:grid-cols-1"
          >
            {/* Nineteen */}
            <div
              style={{
                backgroundColor: D.surface,
                border: `1px solid ${D.rule}`,
                borderRadius: 3,
                padding: 40,
                display: 'flex',
                flexDirection: 'column',
                gap: 16,
              }}
            >
              <div
                style={{
                  fontFamily: F.display,
                  fontStyle: 'italic',
                  fontSize: 96,
                  color: D.accent,
                  lineHeight: 0.9,
                  letterSpacing: '-0.04em',
                }}
              >
                19
              </div>
              <div>
                <div
                  style={{
                    fontFamily: F.display,
                    fontSize: 18,
                    fontWeight: 500,
                    color: D.fg,
                    marginBottom: 8,
                  }}
                >
                  Nineteen
                </div>
                <p
                  style={{
                    fontFamily: F.serif,
                    fontSize: 13,
                    color: D.fgMuted,
                    lineHeight: 1.6,
                  }}
                >
                  The italic numeral in large display serif. Use sparingly —
                  in miracle sections and mathematical proofs only.
                </p>
              </div>
            </div>

            {/* Hairlines */}
            <div
              style={{
                backgroundColor: D.surface,
                border: `1px solid ${D.rule}`,
                borderRadius: 3,
                padding: 40,
                display: 'flex',
                flexDirection: 'column',
                gap: 16,
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                {[false, true].map((dashed, i) => (
                  <div
                    key={i}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                    }}
                  >
                    <div
                      style={{
                        flex: 1,
                        height: 1,
                        background: dashed
                          ? `repeating-linear-gradient(to right, ${D.rule} 0, ${D.rule} 6px, transparent 6px, transparent 12px)`
                          : D.rule,
                      }}
                    />
                    {dashed && (
                      <div
                        style={{
                          width: 5,
                          height: 5,
                          borderRadius: '50%',
                          backgroundColor: D.accent,
                        }}
                      />
                    )}
                    {dashed && (
                      <div
                        style={{
                          flex: 1,
                          height: 1,
                          background: `repeating-linear-gradient(to right, ${D.rule} 0, ${D.rule} 6px, transparent 6px, transparent 12px)`,
                        }}
                      />
                    )}
                  </div>
                ))}
              </div>
              <div>
                <div
                  style={{
                    fontFamily: F.display,
                    fontSize: 18,
                    fontWeight: 500,
                    color: D.fg,
                    marginBottom: 8,
                  }}
                >
                  Hairlines
                </div>
                <p
                  style={{
                    fontFamily: F.serif,
                    fontSize: 13,
                    color: D.fgMuted,
                    lineHeight: 1.6,
                  }}
                >
                  Simple 1px horizontal rules — solid or dashed with a center
                  accent dot. Used as section dividers throughout.
                </p>
              </div>
            </div>

            {/* Quranic brackets */}
            <div
              style={{
                backgroundColor: D.surface,
                border: `1px solid ${D.rule}`,
                borderRadius: 3,
                padding: 40,
                display: 'flex',
                flexDirection: 'column',
                gap: 16,
              }}
            >
              <div
                style={{
                  fontFamily: F.arabic,
                  fontSize: 64,
                  color: D.accent,
                  lineHeight: 1,
                }}
                dir="rtl"
              >
                ﴿ ﴾
              </div>
              <div>
                <div
                  style={{
                    fontFamily: F.display,
                    fontSize: 18,
                    fontWeight: 500,
                    color: D.fg,
                    marginBottom: 8,
                  }}
                >
                  Quranic brackets
                </div>
                <p
                  style={{
                    fontFamily: F.serif,
                    fontSize: 13,
                    color: D.fgMuted,
                    lineHeight: 1.6,
                  }}
                >
                  ﴿ ﴾ in Amiri, accent colour. Used to bracket displayed
                  Quranic verses. Never used decoratively.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ── § VIII · Application ── */}
        <div style={{ marginBottom: 40 }}>
          <SectionHead num="VIII" title="Application" tag="Do & don't" />
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 40,
            }}
            className="max-md:grid-cols-1"
          >
            <div>
              <div
                style={{
                  fontFamily: F.mono,
                  fontSize: 10,
                  letterSpacing: '0.18em',
                  textTransform: 'uppercase',
                  color: '#5A9A6A',
                  marginBottom: 20,
                }}
              >
                Do
              </div>
              {[
                'Use Cormorant Garamond for all display headings',
                'Use hairlines and editorial spacing to let content breathe',
                'Keep the Parchment / Ink palette as the default light mode',
                'Use the 19 motif only in miracle-related contexts',
                'Right-align all Arabic text (dir="rtl")',
                'Link the wordmark to the homepage in every context',
              ].map((item) => (
                <div
                  key={item}
                  style={{
                    display: 'flex',
                    gap: 12,
                    padding: '10px 0',
                    borderBottom: `1px solid ${D.rule}`,
                  }}
                >
                  <span style={{ color: '#5A9A6A', flexShrink: 0 }}>✓</span>
                  <span
                    style={{
                      fontFamily: F.serif,
                      fontSize: 14,
                      color: D.fgMuted,
                      lineHeight: 1.5,
                    }}
                  >
                    {item}
                  </span>
                </div>
              ))}
            </div>
            <div>
              <div
                style={{
                  fontFamily: F.mono,
                  fontSize: 10,
                  letterSpacing: '0.18em',
                  textTransform: 'uppercase',
                  color: '#C0504A',
                  marginBottom: 20,
                }}
              >
                Don&apos;t
              </div>
              {[
                'Use rounded corners larger than 3px on editorial elements',
                'Mix the editorial palette with Violet / primary system colours',
                'Add drop-shadows heavier than 0 12px 40px rgba(26,23,21,0.06)',
                'Use the 19 motif as general decoration',
                'Rasterize or stretch the logo mark',
                'Use purple / violet primary on the homepage or brand page',
              ].map((item) => (
                <div
                  key={item}
                  style={{
                    display: 'flex',
                    gap: 12,
                    padding: '10px 0',
                    borderBottom: `1px solid ${D.rule}`,
                  }}
                >
                  <span style={{ color: '#C0504A', flexShrink: 0 }}>✕</span>
                  <span
                    style={{
                      fontFamily: F.serif,
                      fontSize: 14,
                      color: D.fgMuted,
                      lineHeight: 1.5,
                    }}
                  >
                    {item}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
