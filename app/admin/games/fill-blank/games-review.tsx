'use client'

import { useRef, useState, useTransition } from 'react'
import { ThemedSelect } from '@/components/ui/themed-select'
import type { ReviewPassage, ReviewStatus } from '@/lib/games-editor'
import {
  listPassagesAction,
  setStatusAction,
  bulkSetStatusAction,
  seedFrequencyAction,
  loadLemmasAction,
  curateAction,
  proposedSummaryAction,
  type ProposedChapter,
} from './actions'

// Curation runs one verse window per request; pause between windows to respect
// Groq's per-minute token budget, and back off the same amount on a rate limit.
const INTER_WINDOW_PAUSE_MS = 60_000
const RATE_LIMIT_BACKOFF_MS = 60_000

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
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set())
  const [bulkPending, setBulkPending] = useState<ReviewStatus | null>(null)
  const [bulkMsg, setBulkMsg] = useState<string | null>(null)

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
  const cancelCurateRef = useRef(false)

  function applyFilters(status: StatusFilter, chapter: string) {
    startFetch(async () => {
      const res = await listPassagesAction({
        status: status === 'all' ? undefined : status,
        chapter: chapter.trim() || undefined,
      })
      if (res.ok) {
        setPassages(res.data)
        setError(null)
        // Clear selection on every refetch — IDs may no longer be visible and
        // keeping ghost selections would mislead the bulk counter.
        setSelectedIds(new Set())
        setBulkMsg(null)
      } else {
        setError(res.error)
      }
    })
  }

  function toggleSelected(id: number) {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function selectAllVisible() {
    setSelectedIds(new Set(passages.map((p) => p.id)))
  }

  function clearSelection() {
    setSelectedIds(new Set())
  }

  async function runBulk(status: ReviewStatus) {
    if (bulkPending || selectedIds.size === 0) return
    const ids = [...selectedIds]
    setBulkPending(status)
    setBulkMsg(`Updating ${ids.length}…`)
    try {
      const res = await bulkSetStatusAction(ids, status)
      if (!res.ok) {
        setBulkMsg(res.error)
        return
      }
      const { updated, failed } = res.data
      const failedIds = new Set(failed.map((f) => f.id))
      setPassages((prev) =>
        statusFilter !== 'all' && status !== statusFilter
          ? prev.filter((p) => failedIds.has(p.id) || !selectedIds.has(p.id))
          : prev.map((p) =>
              selectedIds.has(p.id) && !failedIds.has(p.id) ? { ...p, status } : p,
            ),
      )
      setSelectedIds(failedIds)
      if (failed.length > 0) {
        setBulkMsg(`Updated ${updated}. ${failed.length} failed — selection kept.`)
      } else {
        setBulkMsg(`Updated ${updated} passage(s) to ${STATUS_LABELS[status] ?? status}.`)
      }
      void refreshProposedSummary()
    } finally {
      setBulkPending(null)
    }
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

  // Sleep that surfaces a live countdown and resolves early when cancelled.
  function pause(ms: number, label: string): Promise<void> {
    return new Promise((resolve) => {
      let remaining = Math.ceil(ms / 1000)
      setCurateMsg(`${label} ${remaining}s…`)
      const id = setInterval(() => {
        remaining -= 1
        if (cancelCurateRef.current || remaining <= 0) {
          clearInterval(id)
          resolve()
          return
        }
        setCurateMsg(`${label} ${remaining}s…`)
      }, 1000)
    })
  }

  // Curate a chapter one verse window at a time, reporting progress between
  // windows. Long chapters span several windows paced under the token budget;
  // the run is resumable, so Stop (or a closed tab) loses nothing.
  async function runCurate() {
    if (curatePending) return
    const chapter = Number(curateChapter)
    if (!Number.isInteger(chapter) || chapter < 1 || chapter > 114) {
      setCurateMsg('Enter a chapter between 1 and 114.')
      return
    }

    setCuratePending(true)
    cancelCurateRef.current = false
    setStatusFilter('proposed')
    setChapterFilter(String(chapter))

    let proposedTotal = 0
    let afterVerse = 0
    try {
      for (;;) {
        if (cancelCurateRef.current) {
          setCurateMsg(`Stopped. ${proposedTotal} passage(s) proposed for chapter ${chapter} so far.`)
          break
        }

        const res = await curateAction(chapter, afterVerse)
        if (!res.ok) {
          if (res.rateLimited) {
            await pause(RATE_LIMIT_BACKOFF_MS, `Chapter ${chapter}: Groq rate limit, retrying in`)
            continue // same cursor; the window was not consumed
          }
          setCurateMsg(res.error)
          break
        }

        proposedTotal += res.data.proposed
        afterVerse = res.data.next_verse
        const total = res.data.verses_total
        // Show passages as they land.
        applyFilters('proposed', String(chapter))
        void refreshProposedSummary()

        if (res.data.done) {
          setCurateMsg(
            proposedTotal > 0
              ? `Done. Proposed ${proposedTotal} passage(s) for chapter ${chapter}.`
              : `Chapter ${chapter} has no remaining verses to curate.`,
          )
          break
        }

        const pct = total > 0 ? Math.round((afterVerse / total) * 100) : 0
        await pause(
          INTER_WINDOW_PAUSE_MS,
          `Chapter ${chapter}: ${proposedTotal} proposed, verse ${afterVerse}/${total} (${pct}%) — next window in`,
        )
      }
    } finally {
      cancelCurateRef.current = false
      setCuratePending(false)
      void refreshProposedSummary()
    }
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
          {curatePending && (
            <button
              type="button"
              onClick={() => {
                cancelCurateRef.current = true
              }}
              style={ghostButton}
            >
              Stop
            </button>
          )}
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
          <ThemedSelect
            value={statusFilter}
            onChange={(value) => {
              const next = value as StatusFilter
              setStatusFilter(next)
              applyFilters(next, chapterFilter)
            }}
            options={STATUS_OPTIONS.map((s) => ({ value: s, label: STATUS_LABELS[s] }))}
          />
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

      {passages.length > 0 && (
        <section style={bulkBar}>
          <div style={maintRow}>
            <span style={mono}>
              {selectedIds.size > 0
                ? `${selectedIds.size} of ${passages.length} selected`
                : `${passages.length} visible`}
            </span>
            <button
              type="button"
              onClick={selectedIds.size === passages.length ? clearSelection : selectAllVisible}
              disabled={bulkPending !== null}
              style={ghostButton}
            >
              {selectedIds.size === passages.length ? 'Clear selection' : 'Select all visible'}
            </button>
            <button
              type="button"
              onClick={() => runBulk('approved')}
              disabled={bulkPending !== null || selectedIds.size === 0}
              style={approveButton}
            >
              {bulkPending === 'approved' ? 'Approving…' : 'Approve selected'}
            </button>
            <button
              type="button"
              onClick={() => runBulk('needs_refinement')}
              disabled={bulkPending !== null || selectedIds.size === 0}
              style={ghostButton}
            >
              {bulkPending === 'needs_refinement' ? 'Flagging…' : 'Needs refinement'}
            </button>
            <button
              type="button"
              onClick={() => runBulk('rejected')}
              disabled={bulkPending !== null || selectedIds.size === 0}
              style={rejectButton}
            >
              {bulkPending === 'rejected' ? 'Rejecting…' : 'Reject selected'}
            </button>
            {bulkMsg && <span style={maintMsg}>{bulkMsg}</span>}
          </div>
        </section>
      )}

      {passages.length === 0 && !error ? (
        <p style={muted}>No passages match this filter.</p>
      ) : (
        <ul style={list}>
          {passages.map((p) => (
            <PassageCard
              key={p.id}
              passage={p}
              pending={rowPending === p.id || (bulkPending !== null && selectedIds.has(p.id))}
              selected={selectedIds.has(p.id)}
              onToggleSelected={() => toggleSelected(p.id)}
              onSetStatus={(status) => changeStatus(p.id, status)}
            />
          ))}
        </ul>
      )}

      <section style={maintPanel}>
        <h2 style={maintHeading}>Maintenance</h2>
        <p style={muted}>
          Both buttons are safe to click any time. Read the notes under each so you know when it
          actually changes something.
        </p>

        <div style={maintBlock}>
          <div style={maintRow}>
            <button type="button" onClick={runSeed} disabled={maintPending !== null} style={ghostButton}>
              {maintPending === 'seed' ? 'Rebuilding…' : 'Rebuild word frequencies'}
            </button>
            {seedMsg && <span style={maintMsg}>{seedMsg}</span>}
          </div>
          <p style={maintNote}>
            <strong style={maintLabel}>What this does.</strong> Counts how often each word appears
            in the English (Rashad Khalifa) translation and stores the totals. The game uses those
            totals to decide whether a word is Easy, Medium, or Hard when it picks blanks.
          </p>
          <p style={maintNote}>
            <strong style={maintLabel}>When to run it.</strong> Once, after the site is first set
            up (already done). Run again only if the translation text itself is corrected, or when
            a new language is added. It is not affected by curating, approving, or rejecting
            passages — those never change word counts.
          </p>
          <p style={maintNote}>
            <strong style={maintLabel}>If you forget after a translation change.</strong> Difficulty
            tiers go stale: common words may show up as Hard, rare words as Easy, and any newly
            introduced words simply never appear as blanks. The game still runs, but its sense of
            difficulty drifts away from the actual text. Clicking the button at any later point
            fixes it instantly.
          </p>
          <p style={maintNote}>
            <strong style={maintLabel}>Cost.</strong> A few seconds of database work. No external
            calls, no money spent, no risk to existing passages. The operation replaces the table
            atomically — players in the middle of a round are unaffected.
          </p>
        </div>

        <div style={maintBlock}>
          <div style={maintRow}>
            <button type="button" onClick={runLemmas} disabled={maintPending !== null} style={ghostButton}>
              {maintPending === 'lemma' ? 'Loading…' : 'Load lemma data'}
            </button>
            {lemmaMsg && <span style={maintMsg}>{lemmaMsg}</span>}
          </div>
          <p style={maintNote}>
            <strong style={maintLabel}>What this does.</strong> Teaches the game which words share
            the same root form — for example, that <em>worshipped</em>, <em>worshipping</em>, and
            <em>{' '}worships</em> all come from <em>worship</em>. Hard rounds use this to accept a
            close conjugation when a player types one.
          </p>
          <p style={maintNote}>
            <strong style={maintLabel}>What it does NOT do.</strong> It does not analyze the text
            here and now. It only loads a prepared list of word-pairs that was generated offline
            and shipped inside the current deploy. The analysis itself happens on a developer
            machine, not on the live server.
          </p>
          <p style={maintNote}>
            <strong style={maintLabel}>When the prepared list needs refreshing.</strong> Only when
            the translation text changes, when a new language is added, or when a developer
            decides to use a better word-analysis tool. Curation work never requires it. Until a
            fresh list ships, Hard rounds simply fall back to exact matches — the game stays fully
            playable, just stricter.
          </p>
          <p style={maintNote}>
            <strong style={maintLabel}>If you forget after a translation change.</strong> Players
            on Hard would need to type the exact word from the verse; a perfectly reasonable
            conjugation would be marked wrong. Nothing breaks, but Hard feels unfair until the
            list is refreshed and reloaded.
          </p>
          <p style={maintNote}>
            <strong style={maintLabel}>How a developer refreshes the list.</strong> In the
            backend repo (<code style={inlineCode}>ws-backend</code>), they run
            {' '}<code style={inlineCode}>just games-refresh-lemmas &lt;target&gt; &lt;lang&gt;</code>{' '}
            — for example <code style={inlineCode}>just games-refresh-lemmas hetzner en</code> for
            English on the Hetzner database, or
            {' '}<code style={inlineCode}>just games-refresh-lemmas hetzner ar</code> once Arabic
            ships. The command bootstraps everything on first use, then writes
            {' '}<code style={inlineCode}>db/seeds/games_lemma_&lt;lang&gt;.sql</code>. They commit
            the file, push, wait for the redeploy, and you finish the job by clicking Load lemma
            data here.
          </p>
        </div>
      </section>
    </main>
  )
}

function PassageCard({
  passage,
  pending,
  selected,
  onToggleSelected,
  onSetStatus,
}: {
  passage: ReviewPassage
  pending: boolean
  selected: boolean
  onToggleSelected: () => void
  onSetStatus: (status: ReviewStatus) => void
}) {
  const range =
    passage.chapter_start === passage.chapter_end
      ? `${passage.chapter_start}:${passage.verse_start}-${passage.verse_end}`
      : `${passage.chapter_start}:${passage.verse_start} – ${passage.chapter_end}:${passage.verse_end}`

  return (
    <li style={selected ? { ...card, ...cardSelected } : card}>
      <div style={cardTop}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <input
            type="checkbox"
            checked={selected}
            onChange={onToggleSelected}
            disabled={pending}
            aria-label={`Select passage ${passage.id}`}
            style={checkbox}
          />
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

const cardSelected: React.CSSProperties = {
  borderColor: 'var(--ed-fg)',
  boxShadow: 'inset 0 0 0 1px var(--ed-fg)',
}

const checkbox: React.CSSProperties = {
  width: 16,
  height: 16,
  accentColor: 'var(--ed-fg)',
  cursor: 'pointer',
}

const bulkBar: React.CSSProperties = {
  border: '1px solid var(--ed-rule)',
  borderRadius: 4,
  padding: '12px 16px',
  marginBottom: 16,
  background: 'var(--ed-surface)',
  position: 'sticky',
  top: 0,
  zIndex: 2,
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
  marginTop: 6,
  lineHeight: 1.6,
}

const maintLabel: React.CSSProperties = {
  fontFamily: 'var(--font-jetbrains), ui-monospace, monospace',
  fontSize: 11,
  letterSpacing: '0.06em',
  textTransform: 'uppercase',
  color: 'var(--ed-fg)',
  marginRight: 6,
}

const maintBlock: React.CSSProperties = {
  marginTop: 20,
  paddingTop: 16,
  borderTop: '1px solid var(--ed-rule)',
}

const inlineCode: React.CSSProperties = {
  fontFamily: 'var(--font-jetbrains), ui-monospace, monospace',
  fontSize: 12,
  background: 'var(--ed-surface-alt, rgba(0,0,0,0.04))',
  padding: '1px 5px',
  borderRadius: 2,
}
