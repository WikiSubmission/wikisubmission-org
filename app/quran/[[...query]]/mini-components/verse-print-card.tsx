import type { components } from '@/src/api/types.gen'

type VerseData = components['schemas']['VerseData']
type WordData = components['schemas']['WordData']

/**
 * Inline palette (light mode only) so the rasterized PNG is consistent
 * regardless of the user's theme. Values mirror the `light` theme vars in
 * `app/globals.css`.
 */
const COLORS = {
  bg: '#F6F2EA',
  fg: '#1A1715',
  muted: 'rgba(26, 23, 21, 0.65)',
  subtle: 'rgba(26, 23, 21, 0.5)',
  primary: '#6B3410',
  primaryFg: '#F6F2EA',
  primaryTint: 'rgba(107, 52, 16, 0.08)',
  primaryTintStrong: 'rgba(107, 52, 16, 0.18)',
  border: 'rgba(107, 52, 16, 0.18)',
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
}: {
  text: string
  searchHighlight?: string
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
              backgroundColor: COLORS.primaryTintStrong,
              color: COLORS.primary,
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

function VerseKeyPill({ vk }: { vk: string }) {
  return (
    <span
      style={{
        display: 'inline-block',
        padding: '4px 12px',
        borderRadius: '9999px',
        background: COLORS.primaryTint,
        color: COLORS.primary,
        fontWeight: 700,
        fontSize: '14px',
        letterSpacing: '0.02em',
        lineHeight: 1.3,
      }}
    >
      {vk}
    </span>
  )
}

function FullVerseBody({
  verse,
  prefs,
  searchHighlight,
}: {
  verse: VerseData
  prefs: VersePrintPrefs
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
            fontSize: '18px',
            lineHeight: 1.65,
            color: COLORS.fg,
            margin: '0 0 20px 0',
            fontWeight: 500,
          }}
        >
          <HighlightedText text={tr.tx} searchHighlight={searchHighlight} />
        </p>
      )}

      {prefs.includeArabic && arTr?.tx && (
        <p
          dir="rtl"
          className="font-arabic"
          style={{
            fontSize: '26px',
            lineHeight: 1.9,
            color: COLORS.fg,
            textAlign: 'right',
            margin: '0 0 20px 0',
          }}
        >
          {arTr.tx}
        </p>
      )}

      {secondary?.tx && (
        <p
          style={{
            fontSize: '15px',
            lineHeight: 1.6,
            color: COLORS.muted,
            fontStyle: 'italic',
            margin: '0 0 16px 0',
          }}
        >
          {secondary.tx}
        </p>
      )}

      {prefs.includeFootnotes && tr?.f && (
        <p
          style={{
            fontSize: '13px',
            lineHeight: 1.55,
            color: COLORS.subtle,
            fontStyle: 'italic',
            margin: 0,
            paddingLeft: '12px',
            borderLeft: `2px solid ${COLORS.divider}`,
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
  searchHighlight,
}: {
  verse: VerseData
  prefs: VersePrintPrefs
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
            fontSize: '16px',
            lineHeight: 1.6,
            color: COLORS.fg,
            margin: '0 0 24px 0',
            fontWeight: 500,
          }}
        >
          <HighlightedText text={tr.tx} searchHighlight={searchHighlight} />
        </p>
      )}

      {sorted.length > 0 ? (
        <div
          dir="rtl"
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'flex-end',
            gap: '10px 14px',
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
                  padding: '8px 10px',
                  border: `1px solid ${COLORS.border}`,
                  borderRadius: '12px',
                  background: COLORS.primaryTint,
                  minWidth: '70px',
                }}
              >
                {prefs.includeArabic && arabic && (
                  <span
                    className="font-arabic"
                    style={{
                      fontSize: '22px',
                      lineHeight: 1.4,
                      color: COLORS.fg,
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
                      gap: '1px',
                    }}
                  >
                    {prefs.includeTransliteration && translit && (
                      <span
                        style={{
                          fontSize: '11px',
                          fontStyle: 'italic',
                          color: COLORS.muted,
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
                          fontWeight: 500,
                          color: COLORS.fg,
                          lineHeight: 1.3,
                          textAlign: 'center',
                          maxWidth: '90px',
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
                  style={{ fontSize: '22px', color: COLORS.fg }}
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
              color: COLORS.fg,
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

/**
 * Off-screen render target for "Copy as image". Fixed 680px wide, cream
 * background, cream-and-brown palette. Hardcodes the light theme so the PNG
 * is consistent regardless of the user's current theme.
 */
export function VersePrintCard({
  verses,
  kind,
  prefs,
  searchHighlight,
  footerLabel = 'wikisubmission.org',
}: VersePrintCardProps) {
  return (
    <div
      data-verse-print-card
      style={{
        width: '680px',
        background: COLORS.bg,
        color: COLORS.fg,
        border: `1px solid ${COLORS.border}`,
        borderRadius: '24px',
        boxShadow: '0 20px 40px -20px rgba(0,0,0,0.25)',
        overflow: 'hidden',
        fontFamily:
          "ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        colorScheme: 'light',
      }}
    >
      <div style={{ padding: '32px 40px 20px 40px' }}>
        {verses.map((verse, i) => (
          <div
            key={verse.vk ?? i}
            style={{
              paddingBottom: i === verses.length - 1 ? 0 : '20px',
              marginBottom: i === verses.length - 1 ? 0 : '20px',
              borderBottom:
                i === verses.length - 1
                  ? 'none'
                  : `1px solid ${COLORS.divider}`,
            }}
          >
            <div style={{ marginBottom: '16px' }}>
              <VerseKeyPill vk={verse.vk ?? ''} />
            </div>
            {kind === 'full' ? (
              <FullVerseBody
                verse={verse}
                prefs={prefs}
                searchHighlight={i === 0 ? searchHighlight : undefined}
              />
            ) : (
              <WordByWordBody
                verse={verse}
                prefs={prefs}
                searchHighlight={i === 0 ? searchHighlight : undefined}
              />
            )}
          </div>
        ))}
      </div>

      <div
        style={{
          padding: '14px 40px',
          borderTop: `1px solid ${COLORS.divider}`,
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'center',
        }}
      >
        <span
          style={{
            fontSize: '11px',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: COLORS.muted,
            fontWeight: 600,
          }}
        >
          {footerLabel}
        </span>
      </div>
    </div>
  )
}
