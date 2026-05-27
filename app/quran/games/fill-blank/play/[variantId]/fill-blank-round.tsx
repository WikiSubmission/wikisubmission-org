'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { meApi, type GameVariant, type GameBlank } from '@/src/api/me-client'
import { readVariant, stashVariant, stashResult, parseVariantId } from '@/lib/games-session'

const BLANK_TOKEN = /__BLANK_(\d+)__/g

type LoadState =
  | { status: 'loading' }
  | { status: 'error' }
  | { status: 'ready'; variant: GameVariant }

export function FillBlankRound({ variantId }: { variantId: string }) {
  const t = useTranslations('games')
  const router = useRouter()

  const [load, setLoad] = useState<LoadState>({ status: 'loading' })
  const [guesses, setGuesses] = useState<Record<number, string>>({})
  // Per-blank instant feedback. Reflects whether the current guess is correct,
  // checked server-side without ever exposing the answer. The correct answer is
  // only revealed on the result page after final submit.
  const [feedback, setFeedback] = useState<Record<number, 'correct' | 'wrong'>>({})
  // Per-blank count of hints revealed (0..3 — first letter, length, first two).
  const [hintsRevealed, setHintsRevealed] = useState<Record<number, number>>({})
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const startedAt = useRef<number>(0)
  // DOM refs for each blank, keyed by index, so Enter can advance focus.
  const inputRefs = useRef<Map<number, HTMLInputElement | HTMLSelectElement>>(new Map())

  useEffect(() => {
    let active = true
    // Resolve the variant: prefer the stash, else resume from the deterministic
    // slug (cold open via shared link / refresh after the stash was evicted).
    const resolve = async (): Promise<GameVariant | null> => {
      const cached = readVariant(variantId)
      if (cached) {
        startedAt.current = Date.now()
        return cached
      }
      const parsed = parseVariantId(variantId)
      if (!parsed) return null
      const { data } = await meApi.games.startVariant({ ...parsed, variant_id: variantId })
      stashVariant(data)
      startedAt.current = Date.now()
      return data
    }
    resolve()
      .then((variant) => {
        if (active) setLoad(variant ? { status: 'ready', variant } : { status: 'error' })
      })
      .catch(() => {
        if (active) setLoad({ status: 'error' })
      })
    return () => {
      active = false
    }
  }, [variantId])

  const variant = load.status === 'ready' ? load.variant : null
  const totalBlanks = variant?.blanks.length ?? 0
  const filledCount = useMemo(
    () => (variant ? variant.blanks.filter((b) => (guesses[b.index] ?? '').trim() !== '').length : 0),
    [variant, guesses],
  )
  const hintsUsed = useMemo(
    () => Object.values(hintsRevealed).reduce((sum, n) => sum + n, 0),
    [hintsRevealed],
  )

  const revealHint = useCallback((index: number, max: number) => {
    setHintsRevealed((prev) => ({ ...prev, [index]: Math.min((prev[index] ?? 0) + 1, max) }))
  }, [])

  // Update a guess and invalidate any prior feedback for that blank until it is
  // re-checked, so a stale green/red marker never lingers while editing.
  function setGuess(index: number, value: string) {
    setGuesses((prev) => ({ ...prev, [index]: value }))
    setFeedback((prev) => {
      if (!(index in prev)) return prev
      const next = { ...prev }
      delete next[index]
      return next
    })
  }

  // Check one blank for instant feedback. Advisory only; never reveals answers.
  async function checkOne(index: number) {
    if (!variant) return
    const value = (guesses[index] ?? '').trim()
    if (value === '') {
      setFeedback((prev) => {
        if (!(index in prev)) return prev
        const next = { ...prev }
        delete next[index]
        return next
      })
      return
    }
    try {
      const { correct } = await meApi.games.checkBlank({
        variant_id: variant.variant_id,
        index,
        guess: value,
      })
      setFeedback((prev) => ({ ...prev, [index]: correct ? 'correct' : 'wrong' }))
    } catch {
      // Swallow — feedback is advisory; final submit is authoritative.
    }
  }

  const registerRef = useCallback((index: number, el: HTMLInputElement | HTMLSelectElement | null) => {
    if (el) inputRefs.current.set(index, el)
    else inputRefs.current.delete(index)
  }, [])

  // Enter moves to the next blank; on the last blank it submits the round.
  function advanceFrom(index: number) {
    if (!variant) return
    const order = variant.blanks.map((b) => b.index)
    const pos = order.indexOf(index)
    for (let i = pos + 1; i < order.length; i += 1) {
      const el = inputRefs.current.get(order[i])
      if (el) {
        el.focus()
        return
      }
    }
    submit()
  }

  async function submit() {
    if (!variant || submitting) return
    setSubmitting(true)
    setSubmitError(null)
    try {
      const { data } = await meApi.games.submitVariant({
        variant_id: variant.variant_id,
        guesses: variant.blanks.map((b) => ({ index: b.index, value: (guesses[b.index] ?? '').trim() })),
        hints_used: hintsUsed,
        elapsed_ms: Math.max(0, Date.now() - startedAt.current),
      })
      stashResult(data)
      router.push(`/quran/games/fill-blank/result/${encodeURIComponent(data.attempt_id)}`)
    } catch (err) {
      setSubmitError(err instanceof Error && err.message.startsWith('429') ? t('rateLimited') : t('submitError'))
      setSubmitting(false)
    }
  }

  if (load.status === 'loading') {
    return <p style={{ color: 'var(--ed-fg-muted)' }}>{t('loadingRound')}</p>
  }
  if (load.status === 'error' || !variant) {
    return (
      <div>
        <p style={{ color: 'var(--ed-fg-muted)' }}>{t('roundError')}</p>
        <button type="button" onClick={() => router.push('/quran/games/fill-blank')} style={ghostButton}>
          {t('startRound')}
        </button>
      </div>
    )
  }

  const blanksByIndex = new Map(variant.blanks.map((b) => [b.index, b]))

  return (
    <div>
      <div style={{ ...monoLabel, display: 'flex', gap: 12, alignItems: 'center' }}>
        <span>
          {t('referenceLabel')}: {variant.passage.label}
        </span>
        {variant.replay && <span style={replayBadge}>{t('replayBadge')}</span>}
      </div>

      <div style={{ marginTop: 24, display: 'grid', gap: 18 }}>
        {variant.rendered_verses.map((v) => (
          <p key={v.verse_key} style={verseStyle}>
            <span style={verseKeyStyle}>{v.verse_key}</span>{' '}
            {renderVerse({
              text: v.text,
              blanks: blanksByIndex,
              guesses,
              feedback,
              hintsRevealed,
              onChange: setGuess,
              onCheck: checkOne,
              onEnter: advanceFrom,
              onReveal: revealHint,
              registerRef,
            })}
          </p>
        ))}
      </div>

      <div style={{ marginTop: 32, display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
        <button type="button" onClick={submit} disabled={submitting} style={primaryButton}>
          {submitting ? t('submitting') : t('submitRound')}
        </button>
        <span style={monoLabel}>{t('progress', { filled: filledCount, total: totalBlanks })}</span>
        {hintsUsed > 0 && <span style={monoLabel}>{t('hintsUsed', { count: hintsUsed })}</span>}
      </div>
      {submitError && <p style={{ marginTop: 12, color: 'var(--ed-accent, #b91c1c)' }}>{submitError}</p>}
    </div>
  )
}

type BlankFeedback = 'correct' | 'wrong'

interface RenderContext {
  text: string
  blanks: Map<number, GameBlank>
  guesses: Record<number, string>
  feedback: Record<number, BlankFeedback>
  hintsRevealed: Record<number, number>
  onChange: (index: number, value: string) => void
  onCheck: (index: number) => void
  onEnter: (index: number) => void
  onReveal: (index: number, max: number) => void
  registerRef: (index: number, el: HTMLInputElement | HTMLSelectElement | null) => void
}

function renderVerse(ctx: RenderContext): React.ReactNode[] {
  const nodes: React.ReactNode[] = []
  let lastIndex = 0
  let match: RegExpExecArray | null
  BLANK_TOKEN.lastIndex = 0
  let key = 0
  while ((match = BLANK_TOKEN.exec(ctx.text)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(<span key={`t${key}`}>{ctx.text.slice(lastIndex, match.index)}</span>)
    }
    const index = Number(match[1])
    const blank = ctx.blanks.get(index)
    nodes.push(
      <BlankInput
        key={`b${index}`}
        blank={blank}
        index={index}
        value={ctx.guesses[index] ?? ''}
        feedback={ctx.feedback[index]}
        revealed={ctx.hintsRevealed[index] ?? 0}
        onChange={(value) => ctx.onChange(index, value)}
        onCheck={() => ctx.onCheck(index)}
        onEnter={() => ctx.onEnter(index)}
        onReveal={() => ctx.onReveal(index, MAX_HINTS_PER_BLANK)}
        registerRef={(el) => ctx.registerRef(index, el)}
      />,
    )
    lastIndex = match.index + match[0].length
    key += 1
  }
  if (lastIndex < ctx.text.length) {
    nodes.push(<span key={`t${key}`}>{ctx.text.slice(lastIndex)}</span>)
  }
  return nodes
}

// first letter → length → first two letters
const MAX_HINTS_PER_BLANK = 3

function BlankInput({
  blank,
  index,
  value,
  feedback,
  revealed,
  onChange,
  onCheck,
  onEnter,
  onReveal,
  registerRef,
}: {
  blank: GameBlank | undefined
  index: number
  value: string
  feedback: BlankFeedback | undefined
  revealed: number
  onChange: (value: string) => void
  onCheck: () => void
  onEnter: () => void
  onReveal: () => void
  registerRef: (el: HTMLInputElement | HTMLSelectElement | null) => void
}) {
  const t = useTranslations('games')
  const feedbackStyle = feedback === 'correct' ? correctStyle : feedback === 'wrong' ? wrongStyle : null

  if (blank?.options && blank.options.length > 0) {
    return (
      <select
        ref={registerRef}
        aria-label={t('optionsLabel')}
        value={value}
        onChange={(e) => {
          onChange(e.target.value)
          if (e.target.value) onCheck()
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault()
            onEnter()
          }
        }}
        style={{ ...blankBase, ...feedbackStyle, paddingRight: 24 }}
      >
        <option value="">—</option>
        {blank.options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    )
  }

  const hint = blank?.hint
  return (
    <span style={{ display: 'inline-flex', alignItems: 'baseline', gap: 4 }}>
      <input
        ref={registerRef}
        type="text"
        autoComplete="off"
        spellCheck={false}
        aria-label={`${t('blankPlaceholder')} ${index + 1}`}
        placeholder={t('blankPlaceholder')}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onCheck}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault()
            onCheck()
            onEnter()
          }
        }}
        size={Math.max(8, value.length + 1)}
        style={{ ...blankBase, ...feedbackStyle }}
      />
      {hint && (
        <>
          {revealed > 0 && (
            <span style={hintCaption}>
              {(revealed >= 3 ? hint.first_two : hint.first_letter) + '…'}
              {revealed >= 2 && ` · ${t('hintLength', { count: hint.length })}`}
            </span>
          )}
          {revealed < MAX_HINTS_PER_BLANK && (
            <button type="button" onClick={onReveal} style={hintButton} title={t('hint')}>
              {t('hint')}
            </button>
          )}
        </>
      )}
    </span>
  )
}

const monoLabel: React.CSSProperties = {
  fontFamily: 'var(--font-jetbrains), ui-monospace, monospace',
  fontSize: 11,
  letterSpacing: '0.16em',
  textTransform: 'uppercase',
  color: 'var(--ed-fg-muted)',
}

const replayBadge: React.CSSProperties = {
  ...monoLabel,
  color: 'var(--ed-bg)',
  background: 'var(--ed-fg-muted)',
  padding: '2px 8px',
  borderRadius: 2,
}

const verseStyle: React.CSSProperties = {
  fontFamily: 'var(--font-cormorant), Georgia, serif',
  fontSize: 'clamp(20px, 3vw, 26px)',
  lineHeight: 1.7,
  margin: 0,
}

const verseKeyStyle: React.CSSProperties = {
  fontFamily: 'var(--font-jetbrains), ui-monospace, monospace',
  fontSize: 12,
  color: 'var(--ed-fg-muted)',
  marginRight: 4,
}

const blankBase: React.CSSProperties = {
  display: 'inline-block',
  margin: '0 2px',
  padding: '0 6px',
  borderRadius: 2,
  border: 'none',
  borderBottom: '2px solid var(--ed-accent, var(--ed-fg))',
  background: 'color-mix(in srgb, var(--ed-accent, #888) 10%, transparent)',
  color: 'var(--ed-fg)',
  font: 'inherit',
  fontSize: '0.85em',
}

const correctStyle: React.CSSProperties = {
  borderBottomColor: '#15803d',
  background: 'rgba(21, 128, 61, 0.12)',
  color: '#15803d',
}

const wrongStyle: React.CSSProperties = {
  borderBottomColor: '#b91c1c',
  background: 'rgba(185, 28, 28, 0.12)',
  color: '#b91c1c',
}

const hintCaption: React.CSSProperties = {
  fontFamily: 'var(--font-jetbrains), ui-monospace, monospace',
  fontSize: '0.55em',
  letterSpacing: '0.06em',
  color: 'var(--ed-fg-muted)',
  whiteSpace: 'nowrap',
}

const hintButton: React.CSSProperties = {
  fontFamily: 'var(--font-jetbrains), ui-monospace, monospace',
  fontSize: '0.5em',
  letterSpacing: '0.12em',
  textTransform: 'uppercase',
  padding: '2px 6px',
  borderRadius: 2,
  border: '1px solid var(--ed-rule)',
  background: 'transparent',
  color: 'var(--ed-fg-muted)',
  cursor: 'pointer',
}

const primaryButton: React.CSSProperties = {
  padding: '12px 28px',
  borderRadius: 2,
  border: '1px solid var(--ed-fg)',
  background: 'var(--ed-fg)',
  color: 'var(--ed-bg)',
  fontSize: 15,
  fontWeight: 500,
  cursor: 'pointer',
}

const ghostButton: React.CSSProperties = {
  marginTop: 16,
  padding: '10px 22px',
  borderRadius: 2,
  border: '1px solid var(--ed-rule)',
  background: 'var(--ed-surface)',
  color: 'var(--ed-fg)',
  fontSize: 14,
  cursor: 'pointer',
}
