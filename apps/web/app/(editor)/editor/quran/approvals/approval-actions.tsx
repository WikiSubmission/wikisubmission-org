'use client'

import { useState, useTransition } from 'react'
import * as s from '../styles'
import { decidePublishAction } from '../actions'

interface ApprovalActionsProps {
  requestId: number
}

export function ApprovalActions({ requestId }: ApprovalActionsProps) {
  const [note, setNote] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function decide(decision: 'approve' | 'reject') {
    setError(null)
    startTransition(async () => {
      const res = await decidePublishAction(requestId, decision, note.trim() || null)
      if (!res.ok) setError(res.error)
      // On success the row is revalidated away by the server action.
    })
  }

  return (
    <div style={{ marginTop: 12 }}>
      <input
        style={{ ...s.input, marginBottom: 8 }}
        value={note}
        disabled={isPending}
        placeholder="Optional review note"
        onChange={(e) => setNote(e.target.value)}
      />
      <div style={{ display: 'flex', gap: 8 }}>
        <button type="button" style={s.button} disabled={isPending} onClick={() => decide('approve')}>
          Approve &amp; publish
        </button>
        <button type="button" style={s.buttonGhost} disabled={isPending} onClick={() => decide('reject')}>
          Reject
        </button>
      </div>
      {error && <p style={{ margin: '8px 0 0', fontSize: 12, color: '#b04444' }}>{error}</p>}
    </div>
  )
}
