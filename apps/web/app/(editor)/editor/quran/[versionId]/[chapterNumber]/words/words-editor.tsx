'use client'

import { useRef, useState, type CSSProperties } from 'react'
import type { QuranChapterWords, QuranWord } from '@/lib/editorial-client'
import * as s from '../../../styles'
import { saveWordDraftAction } from '../../../actions'

interface WordsEditorProps {
  versionId: number
  chapterNumber: number
  initial: QuranChapterWords
}

function toNullable(value: string): string | null {
  return value.trim() === '' ? null : value
}

export function WordsEditor({ versionId, chapterNumber, initial }: WordsEditorProps) {
  const readOnly = !initial.can_write
  return (
    <div>
      <header style={{ marginBottom: 18 }}>
        <p style={s.kicker}>Chapter {initial.chapter_number} · version {versionId}</p>
        <h1 style={s.heading}>Word by word</h1>
        <p style={s.lede}>
          {readOnly
            ? 'You have read-only access to this version. Changes cannot be saved.'
            : 'Per-word text saves automatically when you leave a field. Root meanings are edited in the Root Book.'}
        </p>
      </header>

      <ol style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 14 }}>
        {initial.verses.map((v) => (
          <li key={v.verse_number} style={{ ...s.surface, padding: '14px 16px' }}>
            <p style={verseNum}>
              {chapterNumber}:{v.verse_number}
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {v.words.map((w) => (
                <WordRow
                  key={w.word_id ?? w.word_index}
                  versionId={versionId}
                  chapterNumber={chapterNumber}
                  word={w}
                  readOnly={readOnly}
                />
              ))}
            </div>
          </li>
        ))}
      </ol>
    </div>
  )
}

interface WordRowProps {
  versionId: number
  chapterNumber: number
  word: QuranWord
  readOnly: boolean
}

function WordRow({ versionId, chapterNumber, word, readOnly }: WordRowProps) {
  const wordId = word.word_id
  const [wordText, setWordText] = useState(word.draft?.word ?? '')
  const [meaning, setMeaning] = useState(word.draft?.meaning ?? '')
  const [status, setStatus] = useState<{ kind: 'saving' | 'ok' | 'err'; text: string } | null>(null)
  const saved = useRef({ word: word.draft?.word ?? '', meaning: word.draft?.meaning ?? '' })
  // latest holds the freshest field values for the serialized flush, so a save
  // always submits the most recent input even if it started from a stale render.
  const latest = useRef({ word: wordText, meaning })
  latest.current = { word: wordText, meaning }
  const inFlight = useRef(false)

  // flush serializes saves for this word: while one request is in flight, later
  // blurs are coalesced and a single trailing save runs on completion, so the
  // persisted value always converges to the latest input (no out-of-order race).
  async function flush() {
    if (readOnly || wordId == null || inFlight.current) return
    const cur = latest.current
    if (cur.word === saved.current.word && cur.meaning === saved.current.meaning) return
    inFlight.current = true
    setStatus({ kind: 'saving', text: 'Saving…' })
    const res = await saveWordDraftAction(versionId, chapterNumber, wordId, {
      word: toNullable(cur.word),
      meaning: toNullable(cur.meaning),
    })
    inFlight.current = false
    if (res.ok) {
      saved.current = cur
      setStatus({ kind: 'ok', text: 'Saved' })
      const now = latest.current
      if (now.word !== saved.current.word || now.meaning !== saved.current.meaning) {
        void flush()
      }
    } else {
      setStatus({ kind: 'err', text: res.error })
    }
  }

  const rootMeaning = word.root_meaning ?? word.root_meaning_published
  return (
    <div style={wordRow}>
      <div style={canonical}>
        <span style={wIndex}>{word.word_index}</span>
        {word.arabic && <span style={arabic} dir="rtl">{word.arabic}</span>}
        {word.root && (
          <span style={rootChip} dir="rtl" title={rootMeaning ?? undefined}>
            √ {word.root}
          </span>
        )}
        {word.reference?.word && <span style={refWord}>ref: {word.reference.word}</span>}
        {status && (
          <span style={{ marginLeft: 'auto', fontSize: 11, color: status.kind === 'err' ? '#b04444' : 'var(--ed-fg-muted)' }}>
            {status.text}
          </span>
        )}
      </div>
      <div style={fieldGrid}>
        <input
          style={s.input}
          aria-label={`Word ${word.word_index} text`}
          placeholder="word / transliteration"
          value={wordText}
          disabled={readOnly}
          onChange={(e) => setWordText(e.target.value)}
          onBlur={() => void flush()}
        />
        <input
          style={s.input}
          aria-label={`Word ${word.word_index} meaning`}
          placeholder="meaning (optional)"
          value={meaning}
          disabled={readOnly}
          onChange={(e) => setMeaning(e.target.value)}
          onBlur={() => void flush()}
        />
      </div>
      {rootMeaning && (
        <p style={rootMeaningLine}>
          Root meaning: {rootMeaning}
        </p>
      )}
    </div>
  )
}

const verseNum: CSSProperties = {
  margin: '0 0 10px',
  fontFamily: 'var(--font-glacial)',
  fontSize: 12,
  letterSpacing: '0.06em',
  color: 'var(--ed-accent)',
}
const wordRow: CSSProperties = {
  padding: '8px 10px',
  border: '1px solid var(--ed-rule)',
  borderRadius: 'var(--ed-radius-sm)',
  background: 'var(--ed-bg)',
}
const canonical: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 10,
  marginBottom: 6,
}
const wIndex: CSSProperties = {
  fontFamily: 'var(--font-glacial)',
  fontSize: 11,
  color: 'var(--ed-fg-muted)',
  minWidth: 18,
}
const arabic: CSSProperties = {
  fontSize: 20,
  color: 'var(--ed-fg)',
}
const rootChip: CSSProperties = {
  fontSize: 13,
  color: 'var(--ed-fg-muted)',
}
const refWord: CSSProperties = {
  fontSize: 12,
  color: 'var(--ed-fg-muted)',
  fontStyle: 'italic',
}
const fieldGrid: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: 8,
}
const rootMeaningLine: CSSProperties = {
  margin: '6px 0 0',
  fontSize: 12,
  color: 'var(--ed-fg-muted)',
}
