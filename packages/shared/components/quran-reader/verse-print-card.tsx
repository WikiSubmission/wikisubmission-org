import type { components } from '@/src/api/types.gen'

type VerseData = components['schemas']['VerseData']
type WordData = components['schemas']['WordData']

/**
 * Colors used by the rasterized card. Resolved from the user's active theme
 * at copy time (see `resolvePrintPalette` in lib/quran-copy-image.ts) so the
 * PNG matches whatever palette (light / dark / violet / …) is on screen.
 */
export interface VersePrintPalette {
  /** Card surface. */
  bg: string
  fg: string
  muted: string
  subtle: string
  primary: string
  border: string
  /** Soft primary wash (pill + word chips). */
  tint: string
  /** Stronger primary wash (search-highlight marks). */
  tintStrong: string
  divider: string
}

/** Fallback — mirrors the default light theme in styles/globals.css. */
export const LIGHT_PRINT_PALETTE: VersePrintPalette = {
  bg: '#FBF8F1',
  fg: '#1A1715',
  muted: 'rgba(26, 23, 21, 0.65)',
  subtle: 'rgba(26, 23, 21, 0.5)',
  primary: '#6B3410',
  border: 'rgba(107, 52, 16, 0.18)',
  tint: 'rgba(107, 52, 16, 0.07)',
  tintStrong: 'rgba(107, 52, 16, 0.18)',
  divider: 'rgba(26, 23, 21, 0.08)',
}

export type PrintKind = 'full' | 'wbw'

export interface VersePrintPrefs {
  primaryCode: string
  secondaryCode?: string
  includeText: boolean
  includeArabic: boolean
  includeTransliteration: boolean
  includeFootnotes: boolean
}

export interface VersePrintCardProps {
  verses: VerseData[]
  kind: PrintKind
  prefs: VersePrintPrefs
  /** Theme colors; defaults to the light palette. */
  palette?: VersePrintPalette
  /** Raw `<b>...</b>` snippet; marks match words with a soft background. */
  searchHighlight?: string
  /** Text shown in the footer (defaults to 'wikisubmission.org'). */
  footerLabel?: string
}

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/**
 * Splits a translation string into segments with a `highlight` flag. Uses the
 * `<b>...</b>` snippet if close to full length, otherwise extracts bolded
 * words and marks them inline in the full text.
 */
function highlightSegments(
  fullText: string,
  snippet: string
): Array<{ text: string; highlight: boolean }> {
  const stripped = snippet.replace(/<\/?b>/g, '')
  const source =
    stripped.length >= fullText.length * 0.9 ? snippet : null

  if (source) {
    const result: Array<{ text: string; highlight: boolean }> = []
    const regex = /<b>(.*?)<\/b>/gi
    let lastIndex = 0
    let m: RegExpExecArray | null
    while ((m = regex.exec(source)) !== null) {
      if (m.index > lastIndex) {
        result.push({ text: source.slice(lastIndex, m.index), highlight: false })
      }
      result.push({ text: m[1], highlight: true })
      lastIndex = m.index + m[0].length
    }
    if (lastIndex < source.length) {
      result.push({ text: source.slice(lastIndex), highlight: false })
    }
    return result
  }

  const bolded = [...snippet.matchAll(/<b>(.*?)<\/b>/g)].map((m) => m[1])
  if (bolded.length === 0) return [{ text: fullText, highlight: false }]
  const pattern = new RegExp(`(${bolded.map(escapeRegExp).join('|')})`, 'gi')
  const parts = fullText.split(pattern)
  return parts.map((text) => ({
    text,
    highlight: bolded.some((b) => b.toLowerCase() === text.toLowerCase()),
  }))
}

function HighlightedText({
  text,
  searchHighlight,
  palette,
}: {
  text: string
  searchHighlight?: string
  palette: VersePrintPalette
}) {
  if (!searchHighlight) return <>{text}</>
  const segs = highlightSegments(text, searchHighlight)
  return (
    <>
      {segs.map((s, i) =>
        s.highlight ? (
          <mark
            key={i}
            style={{
              backgroundColor: palette.tintStrong,
              color: palette.primary,
              padding: '0 2px',
              borderRadius: '3px',
              fontWeight: 600,
            }}
          >
            {s.text}
          </mark>
        ) : (
          <span key={i}>{s.text}</span>
        )
      )}
    </>
  )
}

function VerseKeyPill({
  vk,
  palette,
}: {
  vk: string
  palette: VersePrintPalette
}) {
  return (
    <span
      style={{
        display: 'inline-block',
        padding: '3px 11px',
        borderRadius: '9999px',
        background: palette.tint,
        color: palette.primary,
        fontWeight: 600,
        fontSize: '12.5px',
        letterSpacing: '0.03em',
        lineHeight: 1.4,
      }}
    >
      {vk}
    </span>
  )
}

function FullVerseBody({
  verse,
  prefs,
  palette,
  searchHighlight,
}: {
  verse: VerseData
  prefs: VersePrintPrefs
  palette: VersePrintPalette
  searchHighlight?: string
}) {
  const tr = verse.tr?.[prefs.primaryCode] ?? verse.tr?.['en']
  const arTr = verse.tr?.['ar']
  const secondary = prefs.secondaryCode ? verse.tr?.[prefs.secondaryCode] : undefined

  return (
    <>
      {prefs.includeText && tr?.tx && (
        <p
          style={{
            fontSize: '17px',
            lineHeight: 1.7,
            color: palette.fg,
            margin: '0 0 16px 0',
            fontWeight: 500,
          }}
        >
          <HighlightedText
            text={tr.tx}
            searchHighlight={searchHighlight}
            palette={palette}
          />
        </p>
      )}

      {prefs.includeArabic && arTr?.tx && (
        <p
          dir="rtl"
          className="font-arabic"
          style={{
            fontSize: '26px',
            lineHeight: 1.9,
            color: palette.fg,
            textAlign: 'right',
            margin: '0 0 16px 0',
          }}
        >
          {arTr.tx}
        </p>
      )}

      {secondary?.tx && (
        <p
          style={{
            fontSize: '14px',
            lineHeight: 1.6,
            color: palette.muted,
            fontStyle: 'italic',
            margin: '0 0 14px 0',
          }}
        >
          {secondary.tx}
        </p>
      )}

      {prefs.includeFootnotes && tr?.f && (
        <p
          style={{
            fontSize: '12.5px',
            lineHeight: 1.55,
            color: palette.subtle,
            fontStyle: 'italic',
            margin: 0,
            paddingLeft: '12px',
            borderLeft: `2px solid ${palette.tintStrong}`,
          }}
        >
          {tr.f}
        </p>
      )}
    </>
  )
}

function WordByWordBody({
  verse,
  prefs,
  palette,
  searchHighlight,
}: {
  verse: VerseData
  prefs: VersePrintPrefs
  palette: VersePrintPalette
  searchHighlight?: string
}) {
  const tr = verse.tr?.[prefs.primaryCode] ?? verse.tr?.['en']
  const words = verse.w ?? []
  const sorted = [...words].sort((a, b) => (a.wi ?? 0) - (b.wi ?? 0))
  const anySegment =
    prefs.includeArabic || prefs.includeTransliteration || prefs.includeText

  return (
    <>
      {prefs.includeText && tr?.tx && (
        <p
          style={{
            fontSize: '15.5px',
            lineHeight: 1.65,
            color: palette.fg,
            margin: '0 0 20px 0',
            fontWeight: 500,
          }}
        >
          <HighlightedText
            text={tr.tx}
            searchHighlight={searchHighlight}
            palette={palette}
          />
        </p>
      )}

      {sorted.length > 0 ? (
        <div
          dir="rtl"
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'flex-end',
            gap: '8px 10px',
            margin: 0,
          }}
        >
          {sorted.map((w: WordData) => {
            const tx = w.tx as Record<string, string> | undefined
            const arabic = tx?.['ar']
            const translit = tx?.['tl']
            const english = tx?.['en']
            return (
              <div
                key={w.wi ?? 0}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '7px 10px',
                  borderRadius: '10px',
                  background: palette.tint,
                  minWidth: '64px',
                }}
              >
                {prefs.includeArabic && arabic && (
                  <span
                    className="font-arabic"
                    style={{
                      fontSize: '23px',
                      lineHeight: 1.4,
                      color: palette.fg,
                    }}
                  >
                    {arabic}
                  </span>
                )}
                {(prefs.includeTransliteration && translit) ||
                (prefs.includeText && english) ? (
                  <div
                    dir="ltr"
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '2px',
                    }}
                  >
                    {prefs.includeTransliteration && translit && (
                      <span
                        style={{
                          fontSize: '10.5px',
                          fontStyle: 'italic',
                          color: palette.muted,
                          lineHeight: 1.3,
                        }}
                      >
                        {translit}
                      </span>
                    )}
                    {prefs.includeText && english && (
                      <span
                        style={{
                          fontSize: '12px',
                          fontWeight: 600,
                          color: palette.fg,
                          lineHeight: 1.3,
                          textAlign: 'center',
                          maxWidth: '92px',
                          wordBreak: 'break-word',
                        }}
                      >
                        {english}
                      </span>
                    )}
                  </div>
                ) : null}
              </div>
            )
          })}
          {/* anySegment fallback: if all toggles are off and we still rendered
              cells, show nothing extra. If no segments visible at all, show
              Arabic-only as a visual safety net. */}
          {!anySegment &&
            sorted.map((w: WordData) => {
              const arabic = (w.tx as Record<string, string> | undefined)?.['ar']
              if (!arabic) return null
              return (
                <span
                  key={`fb-${w.wi ?? 0}`}
                  className="font-arabic"
                  style={{ fontSize: '23px', color: palette.fg }}
                >
                  {arabic}
                </span>
              )
            })}
        </div>
      ) : (
        prefs.includeArabic &&
        verse.tr?.['ar']?.tx && (
          <p
            dir="rtl"
            className="font-arabic"
            style={{
              fontSize: '26px',
              lineHeight: 1.9,
              color: palette.fg,
              textAlign: 'right',
              margin: 0,
            }}
          >
            {verse.tr['ar'].tx}
          </p>
        )
      )}
    </>
  )
}

/** "Quran 2:255" or "Quran 2:1 – 2:5" for the footer. */
function verseRangeLabel(verses: VerseData[]): string {
  const first = verses[0]?.vk
  const last = verses[verses.length - 1]?.vk
  if (!first) return ''
  return !last || last === first ? `Quran ${first}` : `Quran ${first} – ${last}`
}

/**
 * Off-screen render target for "Copy as image". Fixed 680px wide, themed with
 * the palette resolved from the user's active theme at copy time.
 */
export function VersePrintCard({
  verses,
  kind,
  prefs,
  palette = LIGHT_PRINT_PALETTE,
  searchHighlight,
  footerLabel = 'wikisubmission.org',
}: VersePrintCardProps) {
  return (
    <div
      data-verse-print-card
      style={{
        width: '680px',
        background: palette.bg,
        color: palette.fg,
        border: `1px solid ${palette.border}`,
        borderRadius: '20px',
        boxShadow: '0 24px 48px -24px rgba(0, 0, 0, 0.35)',
        overflow: 'hidden',
        fontFamily:
          "ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      }}
    >
      <div style={{ padding: '28px 36px 18px 36px' }}>
        {verses.map((verse, i) => (
          <div
            key={verse.vk ?? i}
            style={{
              paddingBottom: i === verses.length - 1 ? 0 : '18px',
              marginBottom: i === verses.length - 1 ? 0 : '18px',
              borderBottom:
                i === verses.length - 1
                  ? 'none'
                  : `1px solid ${palette.divider}`,
            }}
          >
            <div style={{ marginBottom: '14px' }}>
              <VerseKeyPill vk={verse.vk ?? ''} palette={palette} />
            </div>
            {kind === 'full' ? (
              <FullVerseBody
                verse={verse}
                prefs={prefs}
                palette={palette}
                searchHighlight={i === 0 ? searchHighlight : undefined}
              />
            ) : (
              <WordByWordBody
                verse={verse}
                prefs={prefs}
                palette={palette}
                searchHighlight={i === 0 ? searchHighlight : undefined}
              />
            )}
          </div>
        ))}
      </div>

      <div
        style={{
          padding: '12px 36px',
          borderTop: `1px solid ${palette.divider}`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <span
          style={{
            fontSize: '11px',
            letterSpacing: '0.04em',
            color: palette.subtle,
            fontWeight: 500,
          }}
        >
          {verseRangeLabel(verses)}
        </span>
        <span
          style={{
            fontSize: '10.5px',
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: palette.muted,
            fontWeight: 600,
          }}
        >
          {footerLabel}
        </span>
      </div>
    </div>
  )
}
