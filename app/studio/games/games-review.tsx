'use client'

import { useState, useTransition } from 'react'
import type { ReviewPassage, ReviewStatus } from '@/lib/games-editor'
import {
  listPassagesAction,
  setStatusAction,
  seedFrequencyAction,
  loadLemmasAction,
  curateAction,
  proposedSummaryAction,
  type ProposedChapter,
} from './actions'

const STATUS_OPTIONS = ['proposed', 'approved', 'needs_refinement', 'rejected', 'all'] as const
type StatusFilter = (typeof STATUS_OPTIONS)[number]

const STATUS_LABELS: Record<string, string> = {
  proposed: 'Proposed',
  approved: 'Approved',
  needs_refinement: 'Needs refinement',
  rejected: 'Rejected',
  all: 'All',
}

export function GamesReview({
  initialPassages,
  initialError,
  initialProposedChapters,
}: {
  initialPassages: ReviewPassage[]
  initialError: string | null
  initialProposedChapters: ProposedChapter[]
}) {
  const [passages, setPassages] = useState<ReviewPassage[]>(initialPassages)
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('proposed')
  const [chapterFilter, setChapterFilter] = useState('')
  const [error, setError] = useState<string | null>(initialError)
  const [rowPending, setRowPending] = useState<number | null>(null)
  const [isFetching, startFetch] = useTransition()
  const [proposedChapters, setProposedChapters] =
    useState<ProposedChapter[]>(initialProposedChapters)

  async function refreshProposedSummary() {
    const res = await proposedSummaryAction()
    if (res.ok) setProposedChapters(res.data)
  }

  const [seedMsg, setSeedMsg] = useState<string | null>(null)
  const [lemmaMsg, setLemmaMsg] = useState<string | null>(null)
  const [maintPending, setMaintPending] = useState<'seed' | 'lemma' | null>(null)

  const [curateChapter, setCurateChapter] = useState('')
  const [curateMsg, setCurateMsg] = useState<string | null>(null)
  const [curatePending, setCuratePending] = useState(false)

  function applyFilters(status: StatusFilter, chapter: string) {
    startFetch(async () => {
      const res = await listPassagesAction({
        status: status === 'all' ? undefined : status,
        chapter: chapter.trim() || undefined,
      })
      if (res.ok) {
        setPassages(res.data)
        setError(null)
      } else {
        setError(res.error)
      }
    })
  }

  async function changeStatus(id: number, status: ReviewStatus) {
    setRowPending(id)
    const res = await setStatusAction(id, status)
    if (res.ok) {
      setError(null)
      setPassages((prev) =>
        statusFilter !== 'all' && status !== statusFilter
          ? prev.filter((p) => p.id !== id)
          : prev.map((p) => (p.id === id ? { ...p, status } : p)),
      )
      // Moving a passage out of 'proposed' changes the summary counts.
      void refreshProposedSummary()
    } else {
      setError(res.error)
    }
    setRowPending(null)
  }

  async function runSeed() {
    setMaintPending('seed')
    setSeedMsg(null)
    const res = await seedFrequencyAction()
    setSeedMsg(res.ok ? `Rebuilt frequencies for ${res.data.tokens} tokens.` : res.error)
    setMaintPending(null)
  }

  async function runLemmas() {
    setMaintPending('lemma')
    setLemmaMsg(null)
    const res = await loadLemmasAction()
    setLemmaMsg(
      res.ok
        ? res.data.lemma_rows > 0
          ? `Loaded ${res.data.lemma_rows} lemma rows.`
          : 'No lemma fixture shipped with this deploy (Hard tier still works via exact match).'
        : res.error,
    )
    setMaintPending(null)
  }

  async function runCurate() {
    const chapter = Number(curateChapter)
    setCuratePending(true)
    setCurateMsg(null)
    const res = await curateAction(chapter)
    if (res.ok) {
      const dropped = res.data.dropped > 0 ? `, ${res.data.dropped} dropped` : ''
      setCurateMsg(`Proposed ${res.data.proposed} passage(s) for chapter ${res.data.chapter}${dropped}.`)
      // Surface the freshly proposed passages: switch to that view and refetch.
      setStatusFilter('proposed')
      setChapterFilter('')
      applyFilters('proposed', '')
      void refreshProposedSummary()
    } else {
      setCurateMsg(res.error)
    }
    setCuratePending(false)
  }

  return (
    <main style={wrap}>
      <header style={{ marginBottom: 32 }}>
        <p style={kicker}>Studio · Games</p>
        <h1 style={heading}>Editorial review</h1>
        <p style={muted}>
          Approve, reject, or flag GROQ-proposed passages for the Fill-the-Blank catalog. Approved
          passages become playable immediately.
        </p>
      </header>

      <section style={curatePanel}>
        <div style={maintRow}>
          <label style={fieldLabel}>
            Curate chapter
            <input
              type="number"
              min={1}
              max={114}
              placeholder="1-114"
              value={curateChapter}
              onChange={(e) => setCurateChapter(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && curateChapter.trim()) runCurate()
              }}
              style={{ ...control, width: 90 }}
            />
          </label>
          <button
            type="button"
            onClick={runCurate}
            disabled={curatePending || !curateChapter.trim()}
            style={approveButton}
          >
            {curatePending ? 'Curating…' : 'Generate passages'}
          </button>
          {curateMsg && <span style={maintMsg}>{curateMsg}</span>}
        </div>
        <p style={maintNote}>
          Runs the GROQ model over the chapter and adds new proposed passages for review. This calls
          the model and may take a while for long chapters.
        </p>
        <div style={{ marginTop: 4 }}>
          <span style={mono}>Chapters with proposals:</span>{' '}
          {proposedChapters.length === 0 ? (
            <span style={{ ...mono, opacity: 0.7 }}>none yet</span>
          ) : (
            <span style={{ display: 'inline-flex', gap: 6, flexWrap: 'wrap', marginTop: 6 }}>
              {proposedChapters.map((pc) => (
                <button
                  key={pc.chapter}
                  type="button"
                  onClick={() => {
                    setStatusFilter('proposed')
                    setChapterFilter(String(pc.chapter))
                    applyFilters('proposed', String(pc.chapter))
                  }}
                  style={chapterChip}
                  title={`View chapter ${pc.chapter} proposals`}
                >
                  {pc.chapter} · {pc.count}
                </button>
              ))}
            </span>
          )}
        </div>
      </section>

      <section style={filterBar}>
        <label style={fieldLabel}>
          Status
          <select
            value={statusFilter}
            onChange={(e) => {
              const next = e.target.value as StatusFilter
              setStatusFilter(next)
              applyFilters(next, chapterFilter)
            }}
            style={control}
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {STATUS_LABELS[s]}
              </option>
            ))}
          </select>
        </label>
        <label style={fieldLabel}>
          Chapter
          <input
            type="number"
            min={1}
            max={114}
            placeholder="all"
            value={chapterFilter}
            onChange={(e) => setChapterFilter(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') applyFilters(statusFilter, chapterFilter)
            }}
            style={{ ...control, width: 90 }}
          />
        </label>
        <button
          type="button"
          onClick={() => applyFilters(statusFilter, chapterFilter)}
          disabled={isFetching}
          style={ghostButton}
        >
          {isFetching ? 'Loading…' : 'Apply'}
        </button>
      </section>

      {error && <p style={errorText}>{error}</p>}

      {passages.length === 0 && !error ? (
        <p style={muted}>No passages match this filter.</p>
      ) : (
        <ul style={list}>
          {passages.map((p) => (
            <PassageCard
              key={p.id}
              passage={p}
              pending={rowPending === p.id}
              onSetStatus={(status) => changeStatus(p.id, status)}
            />
          ))}
        </ul>
      )}

      <section style={maintPanel}>
        <h2 style={maintHeading}>Maintenance</h2>
        <p style={muted}>
          These replace the shell commands the editor cannot run in production. Both are safe to
          re-run.
        </p>
        <div style={maintRow}>
          <button type="button" onClick={runSeed} disabled={maintPending !== null} style={ghostButton}>
            {maintPending === 'seed' ? 'Rebuilding…' : 'Rebuild word frequencies'}
          </button>
          {seedMsg && <span style={maintMsg}>{seedMsg}</span>}
        </div>
        <div style={maintRow}>
          <button type="button" onClick={runLemmas} disabled={maintPending !== null} style={ghostButton}>
            {maintPending === 'lemma' ? 'Loading…' : 'Load lemma data'}
          </button>
          {lemmaMsg && <span style={maintMsg}>{lemmaMsg}</span>}
        </div>
        <p style={maintNote}>
          Load lemma data loads the fixture shipped with the current deploy. It does not run the
          offline spaCy step.
        </p>
      </section>
    </main>
  )
}

function PassageCard({
  passage,
  pending,
  onSetStatus,
}: {
  passage: ReviewPassage
  pending: boolean
  onSetStatus: (status: ReviewStatus) => void
}) {
  const range =
    passage.chapter_start === passage.chapter_end
      ? `${passage.chapter_start}:${passage.verse_start}-${passage.verse_end}`
      : `${passage.chapter_start}:${passage.verse_start} – ${passage.chapter_end}:${passage.verse_end}`

  return (
    <li style={card}>
      <div style={cardTop}>
        <div>
          <span style={verseRange}>{range}</span>
          <span style={statusBadge(passage.status)}>{STATUS_LABELS[passage.status] ?? passage.status}</span>
        </div>
        <span style={mono}>#{passage.id}</span>
      </div>

      <p style={label}>{passage.label}</p>

      {passage.themes.length > 0 && (
        <div style={themeRow}>
          {passage.themes.map((theme) => (
            <span key={theme} style={themeChip}>
              {theme}
            </span>
          ))}
        </div>
      )}

      {passage.rationale && <p style={rationale}>{passage.rationale}</p>}

      <div style={metaRow}>
        {passage.llm_difficulty && (
          <span style={mono}>difficulty: {passage.llm_difficulty}</span>
        )}
        {passage.llm_blank_hint != null && (
          <span style={mono}>suggested blanks: {passage.llm_blank_hint}</span>
        )}
        <span style={mono}>source: {passage.source}</span>
      </div>

      <div style={actions}>
        <button
          type="button"
          onClick={() => onSetStatus('approved')}
          disabled={pending || passage.status === 'approved'}
          style={approveButton}
        >
          Approve
        </button>
        <button
          type="button"
          onClick={() => onSetStatus('needs_refinement')}
          disabled={pending || passage.status === 'needs_refinement'}
          style={ghostButton}
        >
          Needs refinement
        </button>
        <button
          type="button"
          onClick={() => onSetStatus('rejected')}
          disabled={pending || passage.status === 'rejected'}
          style={rejectButton}
        >
          Reject
        </button>
        {pending && <span style={mono}>saving…</span>}
      </div>
    </li>
  )
}

// ── styles ──────────────────────────────────────────────────────────────────

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

const mono: React.CSSProperties = {
  fontFamily: 'var(--font-jetbrains), ui-monospace, monospace',
  fontSize: 11,
  letterSpacing: '0.06em',
  color: 'var(--ed-fg-muted)',
}

const curatePanel: React.CSSProperties = {
  border: '1px solid var(--ed-rule)',
  borderRadius: 4,
  padding: '16px 20px',
  marginBottom: 28,
  background: 'var(--ed-surface)',
  display: 'grid',
  gap: 8,
}

const chapterChip: React.CSSProperties = {
  fontFamily: 'var(--font-jetbrains), ui-monospace, monospace',
  fontSize: 11,
  letterSpacing: '0.04em',
  padding: '3px 9px',
  borderRadius: 2,
  border: '1px solid var(--ed-rule)',
  background: 'transparent',
  color: 'var(--ed-fg)',
  cursor: 'pointer',
}

const filterBar: React.CSSProperties = {
  display: 'flex',
  gap: 16,
  alignItems: 'flex-end',
  flexWrap: 'wrap',
  marginBottom: 24,
}

const fieldLabel: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 6,
  fontFamily: 'var(--font-jetbrains), ui-monospace, monospace',
  fontSize: 11,
  letterSpacing: '0.12em',
  textTransform: 'uppercase',
  color: 'var(--ed-fg-muted)',
}

const control: React.CSSProperties = {
  padding: '8px 10px',
  borderRadius: 2,
  border: '1px solid var(--ed-rule)',
  background: 'var(--ed-surface)',
  color: 'var(--ed-fg)',
  fontSize: 14,
}

const list: React.CSSProperties = {
  listStyle: 'none',
  padding: 0,
  margin: 0,
  display: 'grid',
  gap: 16,
}

const card: React.CSSProperties = {
  border: '1px solid var(--ed-rule)',
  borderRadius: 4,
  padding: 20,
  background: 'var(--ed-surface)',
}

const cardTop: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: 12,
}

const verseRange: React.CSSProperties = {
  fontFamily: 'var(--font-jetbrains), ui-monospace, monospace',
  fontSize: 13,
  color: 'var(--ed-fg)',
  marginRight: 10,
}

const label: React.CSSProperties = {
  fontFamily: 'var(--font-cormorant), Georgia, serif',
  fontSize: 22,
  color: 'var(--ed-fg)',
  margin: '12px 0 8px',
}

const themeRow: React.CSSProperties = {
  display: 'flex',
  gap: 6,
  flexWrap: 'wrap',
  marginBottom: 10,
}

const themeChip: React.CSSProperties = {
  fontFamily: 'var(--font-jetbrains), ui-monospace, monospace',
  fontSize: 10,
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  padding: '3px 8px',
  borderRadius: 2,
  border: '1px solid var(--ed-rule)',
  color: 'var(--ed-fg-muted)',
}

const rationale: React.CSSProperties = {
  color: 'var(--ed-fg-muted)',
  lineHeight: 1.55,
  fontSize: 14,
  margin: '0 0 12px',
}

const metaRow: React.CSSProperties = {
  display: 'flex',
  gap: 16,
  flexWrap: 'wrap',
  marginBottom: 16,
}

const actions: React.CSSProperties = {
  display: 'flex',
  gap: 10,
  alignItems: 'center',
  flexWrap: 'wrap',
}

const baseButton: React.CSSProperties = {
  padding: '8px 16px',
  borderRadius: 2,
  fontSize: 13,
  fontWeight: 500,
  cursor: 'pointer',
}

const ghostButton: React.CSSProperties = {
  ...baseButton,
  border: '1px solid var(--ed-rule)',
  background: 'transparent',
  color: 'var(--ed-fg)',
}

const approveButton: React.CSSProperties = {
  ...baseButton,
  border: '1px solid var(--ed-fg)',
  background: 'var(--ed-fg)',
  color: 'var(--ed-bg)',
}

const rejectButton: React.CSSProperties = {
  ...baseButton,
  border: '1px solid var(--ed-accent, #b91c1c)',
  background: 'transparent',
  color: 'var(--ed-accent, #b91c1c)',
}

function statusBadge(status: string): React.CSSProperties {
  return {
    fontFamily: 'var(--font-jetbrains), ui-monospace, monospace',
    fontSize: 10,
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    padding: '2px 8px',
    borderRadius: 2,
    border: '1px solid var(--ed-rule)',
    color: status === 'approved' ? 'var(--ed-fg)' : 'var(--ed-fg-muted)',
    background: status === 'approved' ? 'color-mix(in srgb, var(--ed-fg) 10%, transparent)' : 'transparent',
  }
}

const errorText: React.CSSProperties = {
  color: 'var(--ed-accent, #b91c1c)',
  marginBottom: 16,
}

const maintPanel: React.CSSProperties = {
  marginTop: 48,
  paddingTop: 24,
  borderTop: '1px solid var(--ed-rule)',
  display: 'grid',
  gap: 12,
}

const maintHeading: React.CSSProperties = {
  fontFamily: 'var(--font-cormorant), Georgia, serif',
  fontSize: 24,
  color: 'var(--ed-fg)',
  margin: 0,
}

const maintRow: React.CSSProperties = {
  display: 'flex',
  gap: 12,
  alignItems: 'center',
  flexWrap: 'wrap',
}

const maintMsg: React.CSSProperties = {
  fontFamily: 'var(--font-jetbrains), ui-monospace, monospace',
  fontSize: 12,
  color: 'var(--ed-fg-muted)',
}

const maintNote: React.CSSProperties = {
  ...muted,
  fontSize: 13,
  fontStyle: 'italic',
}
