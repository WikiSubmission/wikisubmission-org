'use client'

import { useState, useTransition, type CSSProperties } from 'react'
import { useRouter } from 'next/navigation'
import type { QuranRectifyReport } from '@/lib/editorial-client'
import * as s from '../../styles'
import { seedDraftShellsAction, syncRootsAction } from '../../actions'

interface RectifyPanelProps {
  versionId: number
  report: QuranRectifyReport
}

type Banner = { kind: 'ok' | 'err'; text: string }

export function RectifyPanel({ versionId, report }: RectifyPanelProps) {
  const router = useRouter()
  const [banner, setBanner] = useState<Banner | null>(null)
  const [isSyncing, startSync] = useTransition()
  const [isSeeding, startSeed] = useTransition()

  // Seed form state.
  const [chapter, setChapter] = useState('')
  const [seedRoots, setSeedRoots] = useState(false)

  function syncRoots() {
    setBanner(null)
    startSync(async () => {
      const res = await syncRootsAction()
      if (res.ok) {
        setBanner({
          kind: 'ok',
          text: res.data.inserted === 0
            ? 'Roots master already in sync. Nothing to insert.'
            : `Inserted ${res.data.inserted} new root${res.data.inserted === 1 ? '' : 's'}.`,
        })
        router.refresh()
      } else {
        setBanner({ kind: 'err', text: res.error })
      }
    })
  }

  function seed() {
    setBanner(null)
    const trimmed = chapter.trim()
    let chapterNumber: number | null = null
    if (trimmed !== '') {
      // Plain digits only — reject "1e2", "0x10", "1.5" and other coercions.
      const n = /^\d{1,3}$/.test(trimmed) ? parseInt(trimmed, 10) : NaN
      if (!Number.isInteger(n) || n < 1 || n > 114) {
        setBanner({ kind: 'err', text: 'Chapter must be a whole number from 1 to 114, or left blank for the whole version.' })
        return
      }
      chapterNumber = n
    }
    startSeed(async () => {
      const res = await seedDraftShellsAction(versionId, {
        chapter_number: chapterNumber,
        seed_roots: seedRoots,
      })
      if (res.ok) {
        setBanner({
          kind: 'ok',
          text: `Created ${res.data.word_shells_created} word shell${res.data.word_shells_created === 1 ? '' : 's'} and ${res.data.root_shells_created} root shell${res.data.root_shells_created === 1 ? '' : 's'}.`,
        })
        router.refresh()
      } else {
        setBanner({ kind: 'err', text: res.error })
      }
    })
  }

  const busy = isSyncing || isSeeding

  return (
    <div>
      <header style={{ marginBottom: 18 }}>
        <p style={s.kicker}>Rectify · version {versionId}</p>
        <h1 style={s.heading}>Integrity and coverage</h1>
        <p style={s.lede}>
          The canonical corpus is complete and shared by every version, so the only repair
          is keeping the roots master in step. Pre-seeding draft shells is optional and never
          overwrites existing edits.
        </p>
      </header>

      {banner && (
        <p id="rectify-banner" role="status" style={{ margin: '0 0 16px', fontSize: 13, color: banner.kind === 'ok' ? 'var(--ed-accent)' : '#b04444' }}>
          {banner.text}
        </p>
      )}

      <section style={{ ...s.surface, padding: '16px 18px', marginBottom: 16 }}>
        <h2 style={sectionTitle}>Corpus health</h2>
        <div style={grid}>
          <Stat label="Roots missing from master" value={report.missing_roots} warn={report.missing_roots > 0} />
          <Stat label="Orphan roots" value={report.orphan_roots} />
          <Stat label="Words missing Arabic" value={report.words_missing_arabic} warn={report.words_missing_arabic > 0} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 14 }}>
          <button type="button" style={{ ...s.button, opacity: busy ? 0.5 : 1 }} disabled={busy} onClick={syncRoots}>
            {isSyncing ? 'Syncing…' : 'Sync roots master'}
          </button>
          <span style={{ fontSize: 12, color: 'var(--ed-fg-muted)' }}>
            {report.missing_roots > 0
              ? 'New canonical roots are not yet in the master.'
              : 'Up to date with the corpus.'}
          </span>
        </div>
      </section>

      <section style={{ ...s.surface, padding: '16px 18px', marginBottom: 16 }}>
        <h2 style={sectionTitle}>Version coverage</h2>
        <div style={grid}>
          <Stat label="Words drafted" value={report.words_with_draft} suffix={` / ${report.total_words}`} />
          <Stat label="Words published" value={report.words_published} />
          <Stat label="Root meanings drafted" value={report.root_meaning_drafts} suffix={` / ${report.total_roots}`} />
          <Stat label="Root meanings published" value={report.root_meanings_published} />
        </div>
      </section>

      <section style={{ ...s.surface, padding: '16px 18px' }}>
        <h2 style={sectionTitle}>Pre-seed draft shells</h2>
        <p style={{ ...s.lede, marginTop: 0 }}>
          Creates empty draft rows so the editor shows every word and root. Existing drafts are
          left untouched. Leave the chapter blank to seed the whole version.
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 12 }}>
          <label style={s.label}>
            Chapter (optional)
            <input
              id="rectify-chapter"
              style={{ ...s.input, maxWidth: 140, marginTop: 4 }}
              inputMode="numeric"
              placeholder="1–114 or blank"
              aria-describedby={banner?.kind === 'err' ? 'rectify-banner' : undefined}
              value={chapter}
              disabled={busy}
              onChange={(e) => setChapter(e.target.value)}
            />
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--ed-fg)' }}>
            <input
              type="checkbox"
              checked={seedRoots}
              disabled={busy}
              onChange={(e) => setSeedRoots(e.target.checked)}
            />
            Also seed root meaning shells
          </label>
          <button type="button" style={{ ...s.button, opacity: busy ? 0.5 : 1 }} disabled={busy} onClick={seed}>
            {isSeeding ? 'Seeding…' : 'Seed shells'}
          </button>
        </div>
      </section>
    </div>
  )
}

interface StatProps {
  label: string
  value: number
  suffix?: string
  warn?: boolean
}

function Stat({ label, value, suffix, warn }: StatProps) {
  return (
    <div style={stat}>
      <span style={{ ...statValue, color: warn ? '#b04444' : 'var(--ed-fg)' }}>
        {value.toLocaleString()}
        {suffix && <span style={statSuffix}>{suffix}</span>}
      </span>
      <span style={statLabel}>{label}</span>
    </div>
  )
}

const sectionTitle: CSSProperties = {
  margin: '0 0 12px',
  fontFamily: 'var(--font-cormorant)',
  fontSize: 18,
  color: 'var(--ed-fg)',
}
const grid: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
  gap: 12,
}
const stat: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 2,
  padding: '10px 12px',
  border: '1px solid var(--ed-rule)',
  borderRadius: 'var(--ed-radius-sm)',
  background: 'var(--ed-bg)',
}
const statValue: CSSProperties = {
  fontFamily: 'var(--font-cormorant)',
  fontSize: 24,
}
const statSuffix: CSSProperties = {
  fontSize: 14,
  color: 'var(--ed-fg-muted)',
}
const statLabel: CSSProperties = {
  fontFamily: 'var(--font-glacial)',
  fontSize: 11,
  letterSpacing: '0.03em',
  color: 'var(--ed-fg-muted)',
}
