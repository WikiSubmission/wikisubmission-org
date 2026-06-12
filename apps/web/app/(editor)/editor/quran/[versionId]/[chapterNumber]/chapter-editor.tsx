'use client'

import { useState, useTransition, type CSSProperties } from 'react'
import type { QuranChapterEditor, QuranPublishRequest, QuranVerseDraft } from '@/lib/editorial-client'
import * as s from '../../styles'
import {
  decidePublishAction,
  saveChapterTitleAction,
  saveVerseDraftAction,
  submitPublishAction,
} from '../../actions'

interface ChapterEditorProps {
  versionId: number
  chapterNumber: number
  initial: QuranChapterEditor
  canApprove: boolean
}

type FieldState = { subtitle: string; content: string; footer: string }

function fieldsOf(v: QuranVerseDraft): FieldState {
  const src = v.draft ?? {}
  return {
    subtitle: src.subtitle ?? '',
    content: src.content ?? '',
    footer: src.footer ?? '',
  }
}

function toNullable(value: string): string | null {
  const trimmed = value.trim()
  return trimmed === '' ? null : value
}

export function ChapterEditor({ versionId, chapterNumber, initial, canApprove }: ChapterEditorProps) {
  const readOnly = !initial.can_write
  const [pending, setPending] = useState<QuranPublishRequest | null>(initial.pending_request ?? null)
  const [title, setTitle] = useState(initial.title_draft ?? '')
  const [banner, setBanner] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null)
  const [isPending, startTransition] = useTransition()

  function flash(kind: 'ok' | 'err', text: string) {
    setBanner({ kind, text })
  }

  function saveTitle() {
    startTransition(async () => {
      const res = await saveChapterTitleAction(versionId, chapterNumber, toNullable(title))
      flash(res.ok ? 'ok' : 'err', res.ok ? 'Chapter title saved.' : res.error)
    })
  }

  function submitForPublish() {
    startTransition(async () => {
      const res = await submitPublishAction(versionId, chapterNumber, null)
      if (res.ok) {
        setPending(res.data)
        flash('ok', 'Submitted for publishing. Awaiting approval.')
      } else {
        flash('err', res.error)
      }
    })
  }

  function decide(decision: 'approve' | 'reject' | 'cancel') {
    if (!pending) return
    startTransition(async () => {
      const res = await decidePublishAction(pending.id, decision, null)
      if (res.ok) {
        setPending(res.data.status === 'pending' ? res.data : null)
        flash('ok', `Request ${decision === 'approve' ? 'approved and published' : decision + 'ed'}.`)
      } else {
        flash('err', res.error)
      }
    })
  }

  return (
    <div>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 16, marginBottom: 18 }}>
        <div>
          <p style={s.kicker}>Chapter {initial.chapter_number} · version {versionId}</p>
          <h1 style={s.heading}>{title || `Chapter ${initial.chapter_number}`}</h1>
          <p style={s.lede}>{initial.verse_count} verses{readOnly ? ' · read only' : ''}</p>
        </div>
        {!readOnly && (
          <button
            type="button"
            style={{ ...s.button, opacity: pending ? 0.5 : 1 }}
            disabled={isPending || pending !== null}
            onClick={submitForPublish}
          >
            {pending ? 'Pending approval' : 'Submit for publishing'}
          </button>
        )}
      </header>

      {pending && (
        <div style={{ ...s.surface, padding: '12px 16px', marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 13, color: 'var(--ed-fg-muted)' }}>
            <span style={{ ...s.pillBase(), ...s.statusPill.pending, marginRight: 8 }}>pending</span>
            Submitted for publishing (request #{pending.id}).
          </span>
          {canApprove && (
            <span style={{ display: 'flex', gap: 8 }}>
              <button type="button" style={s.button} disabled={isPending} onClick={() => decide('approve')}>
                Approve & publish
              </button>
              <button type="button" style={s.buttonGhost} disabled={isPending} onClick={() => decide('reject')}>
                Reject
              </button>
            </span>
          )}
        </div>
      )}

      {banner && (
        <p
          role="status"
          style={{
            margin: '0 0 16px',
            fontSize: 13,
            color: banner.kind === 'ok' ? 'var(--ed-accent)' : '#b04444',
          }}
        >
          {banner.text}
        </p>
      )}

      <div style={{ ...s.surface, padding: '14px 16px', marginBottom: 18 }}>
        <label style={s.label} htmlFor="chapter-title">Chapter title</label>
        <div style={{ display: 'flex', gap: 10 }}>
          <input
            id="chapter-title"
            style={s.input}
            value={title}
            disabled={readOnly || isPending}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Optional chapter title"
          />
          {!readOnly && (
            <button type="button" style={s.buttonGhost} disabled={isPending} onClick={saveTitle}>
              Save
            </button>
          )}
        </div>
        {initial.title_published != null && initial.title_published !== title && (
          <p style={{ margin: '8px 0 0', fontSize: 12, color: 'var(--ed-fg-muted)' }}>
            Published: {initial.title_published}
          </p>
        )}
      </div>

      <ol style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
        {initial.verses.map((v) => (
          <VerseRow
            key={v.verse_number}
            versionId={versionId}
            chapterNumber={chapterNumber}
            verse={v}
            readOnly={readOnly}
            disabled={isPending}
          />
        ))}
      </ol>
    </div>
  )
}

interface VerseRowProps {
  versionId: number
  chapterNumber: number
  verse: QuranVerseDraft
  readOnly: boolean
  disabled: boolean
}

function VerseRow({ versionId, chapterNumber, verse, readOnly, disabled }: VerseRowProps) {
  const [fields, setFields] = useState<FieldState>(fieldsOf(verse))
  const [status, setStatus] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null)
  const [saving, startSaving] = useTransition()

  function save() {
    startSaving(async () => {
      const res = await saveVerseDraftAction(versionId, chapterNumber, verse.verse_number, {
        subtitle: toNullable(fields.subtitle),
        content: toNullable(fields.content),
        footer: toNullable(fields.footer),
      })
      setStatus(res.ok ? { kind: 'ok', text: 'Saved' } : { kind: 'err', text: res.error })
    })
  }

  const ref = verse.reference
  return (
    <li style={{ ...s.surface, padding: '14px 16px' }}>
      <div style={verseHead}>
        <span style={verseNum}>
          {chapterNumber}:{verse.verse_number}
        </span>
        {status && (
          <span style={{ fontSize: 12, color: status.kind === 'ok' ? 'var(--ed-accent)' : '#b04444' }}>
            {status.text}
          </span>
        )}
      </div>

      {ref && (ref.content || ref.subtitle || ref.footer) && (
        <div style={referenceBox}>
          <span style={s.mutedTag}>Reference</span>
          {ref.subtitle && <p style={refLine}>{ref.subtitle}</p>}
          {ref.content && <p style={{ ...refLine, color: 'var(--ed-fg)' }}>{ref.content}</p>}
          {ref.footer && <p style={refLine}>{ref.footer}</p>}
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div>
          <label style={s.label}>Subtitle</label>
          <input
            style={s.input}
            value={fields.subtitle}
            disabled={readOnly || disabled || saving}
            onChange={(e) => setFields((f) => ({ ...f, subtitle: e.target.value }))}
          />
        </div>
        <div>
          <label style={s.label}>Content</label>
          <textarea
            style={{ ...s.input, minHeight: 72 }}
            value={fields.content}
            disabled={readOnly || disabled || saving}
            onChange={(e) => setFields((f) => ({ ...f, content: e.target.value }))}
          />
        </div>
        <div>
          <label style={s.label}>Footnote</label>
          <textarea
            style={{ ...s.input, minHeight: 48 }}
            value={fields.footer}
            disabled={readOnly || disabled || saving}
            onChange={(e) => setFields((f) => ({ ...f, footer: e.target.value }))}
          />
        </div>
      </div>

      {!readOnly && (
        <div style={{ marginTop: 10, display: 'flex', justifyContent: 'flex-end' }}>
          <button type="button" style={s.buttonGhost} disabled={disabled || saving} onClick={save}>
            {saving ? 'Saving…' : 'Save verse'}
          </button>
        </div>
      )}
    </li>
  )
}

const verseHead: CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: 10,
}
const verseNum: CSSProperties = {
  fontFamily: 'var(--font-glacial)',
  fontSize: 12,
  letterSpacing: '0.06em',
  color: 'var(--ed-accent)',
}
const referenceBox: CSSProperties = {
  padding: '8px 10px',
  marginBottom: 10,
  border: '1px dashed var(--ed-rule)',
  borderRadius: 'var(--ed-radius-sm)',
  background: 'var(--ed-bg)',
}
const refLine: CSSProperties = {
  margin: '4px 0 0',
  fontSize: 13,
  lineHeight: 1.5,
  color: 'var(--ed-fg-muted)',
}
