'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import {
  frequencyStatsAction,
  lemmaStatsAction,
  seedFrequencyAction,
  loadLemmasAction,
} from './actions'
import type { LanguageStat } from '@/lib/games-admin-client'

// hasFixture mirrors which db/seeds/games_lemma_<code>.sql files are shipped.
// Requires a dedicated spaCy model — ar/ac/fa/ur/tr/id/tl/bn/ta have none yet.
const ALL_LANGUAGES: { code: string; name: string; hasFixture: boolean }[] = [
  { code: 'en', name: 'English',        hasFixture: true  },
  { code: 'ar', name: 'Arabic',         hasFixture: false },
  { code: 'ac', name: 'Arabic Clean',   hasFixture: false },
  { code: 'fr', name: 'French',         hasFixture: true  },
  { code: 'de', name: 'German',         hasFixture: true  },
  { code: 'es', name: 'Spanish',        hasFixture: true  },
  { code: 'fa', name: 'Persian',        hasFixture: false },
  { code: 'ur', name: 'Urdu',           hasFixture: false },
  { code: 'tr', name: 'Turkish',        hasFixture: false },
  { code: 'id', name: 'Bahasa',         hasFixture: false },
  { code: 'tl', name: 'Transliterated', hasFixture: false },
  { code: 'ru', name: 'Russian',        hasFixture: true  },
  { code: 'bn', name: 'Bengali',        hasFixture: false },
  { code: 'ta', name: 'Tamil',          hasFixture: false },
  { code: 'sv', name: 'Swedish',        hasFixture: true  },
]

export function GamesMaintenance() {
  const [freqStats, setFreqStats] = useState<Map<string, number>>(new Map())
  const [lemmaStats, setLemmaStats] = useState<Map<string, number>>(new Map())
  const [freqLoading, setFreqLoading] = useState(true)
  const [lemmaLoading, setLemmaLoading] = useState(true)
  const [freqError, setFreqError] = useState<string | null>(null)
  const [lemmaError, setLemmaError] = useState<string | null>(null)
  const t = useTranslations('adminGames')

  // Per-language seed state: null = idle, 'seeding' = in flight, string = result message
  const [seedState, setSeedState] = useState<Map<string, string | 'seeding'>>(new Map())
  // Per-language lemma load state: null = idle, 'loading' = in flight, string = result
  const [lemmaState, setLemmaState] = useState<Map<string, string | 'loading'>>(new Map())

  useEffect(() => {
    frequencyStatsAction().then((res) => {
      setFreqLoading(false)
      if (res.ok) setFreqStats(statsToMap(res.data))
      else setFreqError(res.error)
    })
    lemmaStatsAction().then((res) => {
      setLemmaLoading(false)
      if (res.ok) setLemmaStats(statsToMap(res.data))
      else setLemmaError(res.error)
    })
  }, [])

  async function seedLanguage(code: string) {
    setSeedState((prev) => new Map(prev).set(code, 'seeding'))
    const res = await seedFrequencyAction(code)
    if (res.ok) {
      setFreqStats((prev) => new Map(prev).set(code, res.data.tokens))
      setSeedState((prev) => {
        const next = new Map(prev)
        next.set(code, `${res.data.tokens.toLocaleString()} tokens`)
        return next
      })
    } else {
      setSeedState((prev) => new Map(prev).set(code, res.error ?? 'failed'))
    }
  }

  async function runLoadLemmas(code: string) {
    setLemmaState((prev) => new Map(prev).set(code, 'loading'))
    const res = await loadLemmasAction(code)
    if (res.ok) {
      if (res.data.lemma_rows > 0) {
        setLemmaStats((prev) => new Map(prev).set(code, res.data.lemma_rows))
        setLemmaState((prev) => new Map(prev).set(code, t('rowsLoaded', { rows: res.data.lemma_rows.toLocaleString() })))
      } else {
        setLemmaState((prev) => new Map(prev).set(code, t('noFixtureInDeploy')))
      }
    } else {
      setLemmaState((prev) => new Map(prev).set(code, res.error ?? 'failed'))
    }
  }

  return (
    <main style={wrap}>
      <header style={{ marginBottom: 32 }}>
        <p style={kicker}>{t('maintenanceKicker')}</p>
        <h1 style={heading}>{t('maintenanceTitle')}</h1>
        <p style={muted}>{t('maintenanceDesc')}</p>
        <div style={{ marginTop: 12 }}>
          <Link href="/admin/games/fill-blank" style={backLink}>
            {t('editorialLink')}
          </Link>
        </div>
      </header>

      <section style={tableSection}>
        <h2 style={sectionHeading}>{t('freqSectionTitle')}</h2>
        <p style={sectionNote}>{t('freqSectionNote')}</p>
        {freqError && <p style={errorText}>{freqError}</p>}
        <table style={table}>
          <thead>
            <tr>
              <th style={th}>{t('colLanguage')}</th>
              <th style={{ ...th, textAlign: 'right' }}>{t('colTokens')}</th>
              <th style={{ ...th, textAlign: 'right' }}>{t('colAction')}</th>
            </tr>
          </thead>
          <tbody>
            {ALL_LANGUAGES.map((lang) => {
              const tokens = freqStats.get(lang.code) ?? 0
              const state = seedState.get(lang.code)
              const seeding = state === 'seeding'
              const msg = state && state !== 'seeding' ? state : null
              return (
                <tr key={lang.code} style={tr}>
                  <td style={td}>
                    <span style={langCode}>{lang.code}</span>
                    <span style={langName}>{lang.name}</span>
                  </td>
                  <td style={{ ...td, textAlign: 'right' }}>
                    {freqLoading ? (
                      <span style={dimText}>…</span>
                    ) : (
                      <span style={tokens > 0 ? {} : dimText}>
                        {tokens > 0 ? tokens.toLocaleString() : '—'}
                      </span>
                    )}
                  </td>
                  <td style={{ ...td, textAlign: 'right' }}>
                    {msg ? (
                      <span style={resultMsg}>{msg}</span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => seedLanguage(lang.code)}
                        disabled={seeding}
                        style={actionButton}
                      >
                        {seeding ? t('seeding') : tokens > 0 ? t('reseed') : t('seed')}
                      </button>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </section>

      <section style={{ ...tableSection, marginTop: 48 }}>
        <h2 style={sectionHeading}>{t('lemmaSectionTitle')}</h2>
        <p style={sectionNote}>
          Maps words to their root form so Hard rounds accept conjugations (e.g.{' '}
          <em>worshipped</em> matches <em>worship</em>). Fixtures are generated offline by a
          spaCy sidecar and committed to the backend repo. To add a language: run{' '}
          <code style={inlineCode}>just games-refresh-lemmas &lt;target&gt; &lt;lang&gt;</code>,
          commit <code style={inlineCode}>db/seeds/games_lemma_&lt;lang&gt;.sql</code>, redeploy,
          then click Load.
        </p>
        {lemmaError && <p style={errorText}>{lemmaError}</p>}
        <table style={table}>
          <thead>
            <tr>
              <th style={th}>{t('colLanguage')}</th>
              <th style={{ ...th, textAlign: 'right' }}>{t('colLemmaRows')}</th>
              <th style={{ ...th, textAlign: 'right' }}>{t('colStatus')}</th>
            </tr>
          </thead>
          <tbody>
            {ALL_LANGUAGES.map((lang) => {
              const rows = lemmaStats.get(lang.code) ?? 0
              return (
                <tr key={lang.code} style={tr}>
                  <td style={td}>
                    <span style={langCode}>{lang.code}</span>
                    <span style={langName}>{lang.name}</span>
                  </td>
                  <td style={{ ...td, textAlign: 'right' }}>
                    {lemmaLoading ? (
                      <span style={dimText}>…</span>
                    ) : (
                      <span style={rows > 0 ? {} : dimText}>
                        {rows > 0 ? rows.toLocaleString() : '—'}
                      </span>
                    )}
                  </td>
                  <td style={{ ...td, textAlign: 'right' }}>
                    {lang.hasFixture ? (
                      <div style={{ display: 'flex', gap: 10, alignItems: 'center', justifyContent: 'flex-end' }}>
                        {(() => {
                          const state = lemmaState.get(lang.code)
                          const loading = state === 'loading'
                          const msg = state && state !== 'loading' ? state : null
                          return (
                            <>
                              {msg && <span style={resultMsg}>{msg}</span>}
                              <button
                                type="button"
                                onClick={() => runLoadLemmas(lang.code)}
                                disabled={loading}
                                style={actionButton}
                              >
                                {loading ? t('loadingLemma') : rows > 0 ? t('reload') : t('load')}
                              </button>
                            </>
                          )
                        })()}
                      </div>
                    ) : (
                      <span style={dimText}>{t('noFixture')}</span>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </section>
    </main>
  )
}

function statsToMap(stats: LanguageStat[]): Map<string, number> {
  return new Map(stats.map((s) => [s.language, s.count]))
}

// ── styles ───────────────────────────────────────────────────────────────────

const wrap: React.CSSProperties = {
  maxWidth: 820,
  margin: '0 auto',
  padding: '48px 24px 96px',
}

const kicker: React.CSSProperties = {
  fontFamily: 'var(--font-jetbrains), ui-monospace, monospace',
  fontSize: 11,
  letterSpacing: '0.16em',
  textTransform: 'uppercase',
  color: 'var(--ed-fg-muted)',
  margin: 0,
}

const heading: React.CSSProperties = {
  fontFamily: 'var(--font-cormorant), Georgia, serif',
  fontSize: 'clamp(28px, 4vw, 42px)',
  margin: '8px 0 12px',
  color: 'var(--ed-fg)',
}

const muted: React.CSSProperties = {
  color: 'var(--ed-fg-muted)',
  lineHeight: 1.6,
  margin: 0,
}

const backLink: React.CSSProperties = {
  fontFamily: 'var(--font-jetbrains), ui-monospace, monospace',
  fontSize: 11,
  letterSpacing: '0.12em',
  textTransform: 'uppercase',
  color: 'var(--ed-fg-muted)',
  textDecoration: 'none',
}

const tableSection: React.CSSProperties = {
  display: 'grid',
  gap: 16,
}

const sectionHeading: React.CSSProperties = {
  fontFamily: 'var(--font-cormorant), Georgia, serif',
  fontSize: 26,
  color: 'var(--ed-fg)',
  margin: 0,
}

const sectionNote: React.CSSProperties = {
  color: 'var(--ed-fg-muted)',
  fontSize: 13,
  lineHeight: 1.6,
  margin: 0,
}

const table: React.CSSProperties = {
  width: '100%',
  borderCollapse: 'collapse',
  fontSize: 13,
}

const th: React.CSSProperties = {
  fontFamily: 'var(--font-jetbrains), ui-monospace, monospace',
  fontSize: 10,
  letterSpacing: '0.12em',
  textTransform: 'uppercase',
  color: 'var(--ed-fg-muted)',
  padding: '8px 12px',
  textAlign: 'left',
  borderBottom: '1px solid var(--ed-rule)',
  fontWeight: 400,
}

const tr: React.CSSProperties = {
  borderBottom: '1px solid var(--ed-rule)',
}

const td: React.CSSProperties = {
  padding: '10px 12px',
  color: 'var(--ed-fg)',
  verticalAlign: 'middle',
}

const langCode: React.CSSProperties = {
  fontFamily: 'var(--font-jetbrains), ui-monospace, monospace',
  fontSize: 11,
  letterSpacing: '0.08em',
  color: 'var(--ed-fg-muted)',
  marginRight: 10,
}

const langName: React.CSSProperties = {
  fontSize: 13,
  color: 'var(--ed-fg)',
}

const dimText: React.CSSProperties = {
  color: 'var(--ed-fg-muted)',
  opacity: 0.6,
}

const actionButton: React.CSSProperties = {
  padding: '5px 12px',
  borderRadius: 2,
  border: '1px solid var(--ed-rule)',
  background: 'transparent',
  color: 'var(--ed-fg)',
  fontSize: 12,
  fontFamily: 'var(--font-jetbrains), ui-monospace, monospace',
  letterSpacing: '0.06em',
  cursor: 'pointer',
}

const resultMsg: React.CSSProperties = {
  fontFamily: 'var(--font-jetbrains), ui-monospace, monospace',
  fontSize: 11,
  color: 'var(--ed-fg-muted)',
}

const errorText: React.CSSProperties = {
  color: 'var(--ed-accent, #b91c1c)',
  fontSize: 13,
}

const inlineCode: React.CSSProperties = {
  fontFamily: 'var(--font-jetbrains), ui-monospace, monospace',
  fontSize: 12,
  background: 'var(--ed-surface-alt, rgba(0,0,0,0.04))',
  padding: '1px 5px',
  borderRadius: 2,
}
