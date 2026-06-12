'use client'

import { useRef, useState, useTransition, type CSSProperties } from 'react'
import type { QuranRootSummary } from '@/lib/editorial-client'
import * as s from '../../styles'
import { publishRootMeaningsAction, saveRootMeaningAction } from '../../actions'

interface RootsEditorProps {
  versionId: number
  canWrite: boolean
  canApprove: boolean
  roots: QuranRootSummary[]
}

function toNullable(value: string): string | null {
  return value.trim() === '' ? null : value
}

export function RootsEditor({ versionId, canWrite, canApprove, roots }: RootsEditorProps) {
  const [banner, setBanner] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null)
  const [isPublishing, startPublishing] = useTransition()

  function publish() {
    startPublishing(async () => {
      const res = await publishRootMeaningsAction(versionId, null)
      if (res.ok) {
        setBanner({ kind: 'ok', text: `Published ${res.data.published} root meaning${res.data.published === 1 ? '' : 's'}.` })
      } else {
        setBanner({ kind: 'err', text: res.error })
      }
    })
  }

  return (
    <div>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 16, marginBottom: 18 }}>
        <div>
          <p style={s.kicker}>Root Book · version {versionId}</p>
          <h1 style={s.heading}>Root meanings</h1>
          <p style={s.lede}>
            A meaning applies to every word sharing the root, across all chapters in this version. Edits save automatically.
          </p>
        </div>
        {canApprove && (
          <button type="button" style={{ ...s.button, opacity: isPublishing ? 0.5 : 1 }} disabled={isPublishing} onClick={publish}>
            {isPublishing ? 'Publishing…' : 'Publish all drafts'}
          </button>
        )}
      </header>

      {banner && (
        <p role="status" style={{ margin: '0 0 16px', fontSize: 13, color: banner.kind === 'ok' ? 'var(--ed-accent)' : '#b04444' }}>
          {banner.text}
        </p>
      )}

      {roots.length === 0 ? (
        <p style={s.lede}>No roots match.</p>
      ) : (
        <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
          {roots.map((r) => (
            <RootRow key={r.root_id} versionId={versionId} root={r} readOnly={!canWrite} />
          ))}
        </ul>
      )}
    </div>
  )
}

interface RootRowProps {
  versionId: number
  root: QuranRootSummary
  readOnly: boolean
}

function RootRow({ versionId, root, readOnly }: RootRowProps) {
  const [meaning, setMeaning] = useState(root.meaning_draft ?? '')
  const [status, setStatus] = useState<{ kind: 'saving' | 'ok' | 'err'; text: string } | null>(null)
  const [draftStatus, setDraftStatus] = useState(root.draft_status ?? null)
  const saved = useRef(root.meaning_draft ?? '')
  const latest = useRef(meaning)
  latest.current = meaning
  const inFlight = useRef(false)
  // Published value only changes via the version-wide publish action, which
  // revalidates the page; within this row it is read-only.
  const published = root.meaning_published ?? null

  // Serialized save: coalesces rapid blurs into a single trailing request so the
  // persisted meaning converges to the latest input (no out-of-order race).
  async function flush() {
    if (readOnly || inFlight.current) return
    const cur = latest.current
    if (cur === saved.current) return
    inFlight.current = true
    setStatus({ kind: 'saving', text: 'Saving…' })
    const res = await saveRootMeaningAction(versionId, root.root_id, toNullable(cur))
    inFlight.current = false
    if (res.ok) {
      saved.current = cur
      setDraftStatus(res.data.draft_status ?? 'draft')
      setStatus({ kind: 'ok', text: 'Saved' })
      if (latest.current !== saved.current) void flush()
    } else {
      setStatus({ kind: 'err', text: res.error })
    }
  }

  return (
    <li style={{ ...s.surface, padding: '12px 16px' }}>
      <div style={head}>
        <span style={letters} dir="rtl">{root.letters}</span>
        <span style={occ}>{root.occurrences} occurrence{root.occurrences === 1 ? '' : 's'}</span>
        {draftStatus === 'published' && published === meaning ? (
          <span style={{ ...s.pillBase(), ...s.statusPill.approved }}>published</span>
        ) : (meaning !== '' || draftStatus) ? (
          <span style={{ ...s.pillBase(), ...s.statusPill.pending }}>draft</span>
        ) : null}
        {status && (
          <span style={{ marginLeft: 'auto', fontSize: 11, color: status.kind === 'err' ? '#b04444' : 'var(--ed-fg-muted)' }}>
            {status.text}
          </span>
        )}
      </div>
      {root.reference_meaning && (
        <p style={refLine}>Reference: {root.reference_meaning}</p>
      )}
      <input
        style={s.input}
        aria-label={`Meaning for root ${root.letters}`}
        placeholder="meaning in this version"
        value={meaning}
        disabled={readOnly}
        onChange={(e) => setMeaning(e.target.value)}
        onBlur={() => void flush()}
      />
      {published != null && published !== meaning && (
        <p style={refLine}>Published: {published}</p>
      )}
    </li>
  )
}

const head: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 12,
  marginBottom: 8,
}
const letters: CSSProperties = {
  fontSize: 18,
  color: 'var(--ed-fg)',
}
const occ: CSSProperties = {
  fontFamily: 'var(--font-glacial)',
  fontSize: 11,
  color: 'var(--ed-fg-muted)',
}
const refLine: CSSProperties = {
  margin: '0 0 8px',
  fontSize: 12,
  color: 'var(--ed-fg-muted)',
}
