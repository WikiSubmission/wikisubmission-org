'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ThemedSelect } from '@/components/ui/themed-select'
import {
  meApi,
  type GameVariant,
  type GameBlank,
  type GameSubmitResult,
  type GamePerBlankResult,
} from '@/src/api/me-client'
import { readVariant, stashVariant, parseVariantId } from '@/lib/games-session'
import { encodeSharePayload } from '@/lib/games-share'

const BLANK_TOKEN = /__BLANK_(\d+)__/g
const MAX_BLANK_ATTEMPTS = 3

const pulseKeyframes = `
@keyframes blank-checking-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.35; }
}
.blank-checking-bars { animation: blank-checking-pulse 700ms ease-in-out infinite; }
`

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
  // Remaining attempts per blank. Only tracked for non-easy difficulties.
  // Undefined for easy (no limit). 0 = locked.
  const [attemptsRemaining, setAttemptsRemaining] = useState<Record<number, number>>({})
  // All wrong guesses per blank, in order of submission — shown in result table.
  const [wrongAttempts, setWrongAttempts] = useState<Record<number, string[]>>({})
  // True while the checkBlank API call is in-flight for that blank index.
  const [checking, setChecking] = useState<Record<number, boolean>>({})
  // Tracks the last guess value that was sent to checkBlank per blank, so we
  // don't consume an attempt when the same wrong guess is re-checked on blur.
  const lastCheckedRef = useRef<Record<number, string>>({})
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [quitting, setQuitting] = useState(false)
  // Round result is held in-place and shown inline + as a dialog. The verse
  // text becomes a review pane (correct guesses in green, wrong guesses with
  // the accepted answer revealed in red).
  const [result, setResult] = useState<GameSubmitResult | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [restarting, setRestarting] = useState(false)
  const startedAt = useRef<number>(0)
  // DOM refs for each blank, keyed by index, so Enter can advance focus.
  const inputRefs = useRef<Map<number, HTMLInputElement | HTMLButtonElement>>(new Map())
  // Mirrors feedback/attemptsRemaining/guesses so that advanceFrom, invoked
  // after an awaited checkOne, can read post-check values before React
  // re-renders and refreshes the closed-over state variables.
  const stateRef = useRef<{
    feedback: Record<number, 'correct' | 'wrong'>
    attemptsRemaining: Record<number, number>
    guesses: Record<number, string>
  }>({ feedback: {}, attemptsRemaining: {}, guesses: {} })
  // Keep stateRef in sync on every render so stable callbacks always have
  // the latest values without stale closure issues.
  stateRef.current = { feedback, attemptsRemaining, guesses }

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
        if (!active) return
        if (variant) {
          setLoad({ status: 'ready', variant })
          if (variant.difficulty !== 'easy') {
            const init: Record<number, number> = {}
            for (const b of variant.blanks) init[b.index] = MAX_BLANK_ATTEMPTS
            setAttemptsRemaining(init)
          }
        } else {
          setLoad({ status: 'error' })
        }
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
    // Don't consume an attempt for the same guess value re-checked on blur.
    if (lastCheckedRef.current[index] === value) return
    lastCheckedRef.current[index] = value
    setChecking((prev) => ({ ...prev, [index]: true }))
    try {
      const res = await meApi.games.checkBlank({
        variant_id: variant.variant_id,
        session_id: variant.session_id,
        index,
        guess: value,
      })
      // Update stateRef synchronously so advanceFrom (awaiting this promise)
      // can read the fresh result before React re-renders.
      stateRef.current = {
        ...stateRef.current,
        feedback: { ...stateRef.current.feedback, [index]: res.correct ? 'correct' : 'wrong' },
        ...((!res.correct && res.attempts_remaining !== undefined) ? {
          attemptsRemaining: { ...stateRef.current.attemptsRemaining, [index]: res.attempts_remaining },
        } : {}),
      }
      setFeedback((prev) => ({ ...prev, [index]: res.correct ? 'correct' : 'wrong' }))
      if (!res.correct) {
        setWrongAttempts((prev) => ({ ...prev, [index]: [...(prev[index] ?? []), value] }))
      }
      if (!res.correct && res.attempts_remaining !== undefined) {
        setAttemptsRemaining((prev) => ({ ...prev, [index]: res.attempts_remaining! }))
      }
    } catch {
      // Swallow — feedback is advisory; final submit is authoritative.
    } finally {
      setChecking((prev) => {
        const next = { ...prev }
        delete next[index]
        return next
      })
    }
  }

  const registerRef = useCallback((index: number, el: HTMLInputElement | HTMLButtonElement | null) => {
    if (el) inputRefs.current.set(index, el)
    else inputRefs.current.delete(index)
  }, [])

  // Returns true when a blank is finished: already correct or all attempts gone.
  // Uses stateRef so it's always fresh even when called after an awaited check.
  function isDone(bi: number): boolean {
    const { feedback: fb, attemptsRemaining: ar } = stateRef.current
    return fb[bi] === 'correct' || ar[bi] === 0
  }

  // Enter advances to the next blank that still needs work. When on the last
  // active blank, guards against submitting if the current answer is wrong but
  // attempts remain. Also prevents submitting with unfilled gaps.
  function advanceFrom(index: number) {
    if (!variant) return
    // Read post-check state from the ref — updated synchronously inside
    // checkOne before the setState calls, so this is always fresh.
    const { feedback: fb, attemptsRemaining: ar, guesses: g } = stateRef.current
    // If the just-checked blank is wrong and still has attempts left, keep
    // focus here regardless of position in the round.
    if (fb[index] === 'wrong' && ar[index] !== undefined && ar[index] > 0) {
      return
    }
    const order = variant.blanks.map((b) => b.index)
    const pos = order.indexOf(index)
    // Move to the next non-done blank in text order.
    for (let i = pos + 1; i < order.length; i += 1) {
      const bi = order[i]
      if (!isDone(bi)) {
        const el = inputRefs.current.get(bi)
        if (el) {
          el.focus()
          return
        }
      }
    }
    // Only submit when every blank is done (correct or all attempts exhausted).
    // Any non-done blank — whether empty or wrong with attempts remaining —
    // gets focus instead.
    const firstNeedsWork = order.find((bi) => !isDone(bi))
    if (firstNeedsWork !== undefined) {
      const el = inputRefs.current.get(firstNeedsWork)
      if (el) {
        el.focus()
        return
      }
    }
    submit()
  }

  async function submit() {
    if (!variant || submitting || result) return
    setSubmitting(true)
    setSubmitError(null)
    try {
      const { data } = await meApi.games.submitVariant({
        variant_id: variant.variant_id,
        session_id: variant.session_id,
        guesses: variant.blanks.map((b) => ({ index: b.index, value: (guesses[b.index] ?? '').trim() })),
        hints_used: hintsUsed,
        elapsed_ms: Math.max(0, Date.now() - startedAt.current),
      })
      setResult(data)
      setDialogOpen(true)
      // Drop focus off any input so the review styling is what the player sees.
      if (typeof document !== 'undefined' && document.activeElement instanceof HTMLElement) {
        document.activeElement.blur()
      }
    } catch (err) {
      setSubmitError(err instanceof Error && err.message.startsWith('429') ? t('rateLimited') : t('submitError'))
    } finally {
      setSubmitting(false)
    }
  }

  // Start a new round with the same resolved difficulty and size.
  async function startAgain() {
    if (!variant || restarting) return
    setRestarting(true)
    try {
      const { data } = await meApi.games.startVariant({
        language: 'en',
        difficulty: variant.difficulty,
        size: variant.size,
      })
      stashVariant(data)
      router.push(`/quran/games/fill-blank/play/${encodeURIComponent(data.variant_id)}`)
    } catch {
      setRestarting(false)
    }
  }

  async function shareResult() {
    if (!result) return
    const token = encodeSharePayload({
      score: result.score,
      correct: result.correct_count,
      total: result.total_count,
      difficulty: result.difficulty_multiplier,
    })
    const url = `${window.location.origin}/share/games/fill-blank/${token}`
    const shareText = t('shareText', {
      score: result.score,
      correct: result.correct_count,
      total: result.total_count,
    })
    if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
      try {
        await navigator.share({ title: t('shareTitle'), text: shareText, url })
        return
      } catch (err) {
        if ((err as DOMException)?.name === 'AbortError') return
      }
    }
    try {
      await navigator.clipboard.writeText(url)
      toast.success(t('shareCopied'))
    } catch {
      toast.error(t('shareFailed'))
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
  const resultByIndex = result
    ? new Map(result.per_blank.map((r) => [r.index, r]))
    : null
  const isEasy = variant.difficulty === 'easy'

  return (
    <div>
      <style>{pulseKeyframes}</style>
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
              attemptsRemaining,
              checking,
              resultByIndex,
              onChange: setGuess,
              onCheck: checkOne,
              onEnter: advanceFrom,
              onReveal: revealHint,
              registerRef,
            })}
          </p>
        ))}
      </div>

      {result ? (
        <div style={{ marginTop: 32, display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <button type="button" onClick={() => setDialogOpen(true)} style={primaryButton}>
            {t('viewResult')}
          </button>
          <span style={monoLabel}>
            {t('correctOf', { correct: result.correct_count, total: result.total_count })}
          </span>
        </div>
      ) : (
        <div style={{ marginTop: 32, display: 'grid', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
            <button type="button" onClick={submit} disabled={submitting} style={primaryButton}>
              {submitting ? t('submitting') : t('submitRound')}
            </button>
            <span style={monoLabel}>{t('progress', { filled: filledCount, total: totalBlanks })}</span>
            {hintsUsed > 0 && <span style={monoLabel}>{t('hintsUsed', { count: hintsUsed })}</span>}
            <button type="button" onClick={() => setQuitting(true)} style={quitButton}>
              {t('quitRound')}
            </button>
          </div>
          {quitting && (
            <div style={quitConfirm}>
              <span style={{ fontSize: 14, color: 'var(--ed-fg)' }}>{t('quitConfirm')}</span>
              <Link href="/quran/games/fill-blank" style={quitConfirmYes}>
                {t('quitConfirmYes')}
              </Link>
              <button type="button" onClick={() => setQuitting(false)} style={quitConfirmNo}>
                {t('quitConfirmNo')}
              </button>
            </div>
          )}
        </div>
      )}
      {submitError && <p style={{ marginTop: 12, color: 'var(--ed-accent, #b91c1c)' }}>{submitError}</p>}

      {result && (
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t('resultTitle')}</DialogTitle>
              <DialogDescription>
                {t('correctOf', { correct: result.correct_count, total: result.total_count })}
              </DialogDescription>
            </DialogHeader>
            <div
              style={{
                display: 'flex',
                alignItems: 'baseline',
                gap: 16,
                flexWrap: 'wrap',
                paddingBottom: 12,
                borderBottom: '1px solid var(--ed-rule)',
              }}
            >
              <div>
                <div style={monoLabel}>{t('scoreLabel')}</div>
                <div
                  style={{
                    fontFamily: 'var(--font-cormorant), Georgia, serif',
                    fontSize: 'clamp(40px, 7vw, 64px)',
                    lineHeight: 1,
                    color: 'var(--ed-accent)',
                  }}
                >
                  {result.score}
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4, ...monoLabel }}>
                <span>
                  {t('difficultyMultiplierLabel')}: ×{result.difficulty_multiplier}
                </span>
                <span>
                  {t('hintPenaltyLabel')}: −{result.hint_penalty}
                </span>
                {result.wrong_penalty > 0 && (
                  <span>
                    {t('wrongPenaltyLabel')}: −{result.wrong_penalty}
                  </span>
                )}
              </div>
            </div>
            {result.per_blank.length > 0 && (() => {
              // Base pts per correct blank = total earned before multiplier effects
              // divided by correct count. Derived from: score = base*mult*band - hints - wrongs
              const basePerBlank = result.correct_count > 0
                ? Math.round((result.score + result.hint_penalty + result.wrong_penalty) / result.correct_count)
                : 0
              return (
                <div style={{ overflowX: 'auto', marginTop: 8 }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                    <thead>
                      <tr>
                        <th style={resultTh}>#</th>
                        <th style={resultTh}>{t('attemptsCol')}</th>
                        <th style={resultTh}>{t('acceptedAnswer')}</th>
                        <th style={resultTh}>{t('scoreCol')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.per_blank.map((r) => {
                        const wrongs = wrongAttempts[r.index] ?? []
                        const wc = wrongs.length
                        const penalty = !isEasy ? (wc * (wc + 1)) / 2 * 10 : 0
                        const net = r.correct ? basePerBlank - penalty : -penalty
                        return (
                          <tr
                            key={r.index}
                            style={{
                              borderTop: '1px solid var(--ed-rule)',
                              background: r.correct ? 'rgba(21,128,61,0.05)' : 'rgba(185,28,28,0.05)',
                            }}
                          >
                            <td style={{ ...resultTd, color: 'var(--ed-fg-muted)', width: 32 }}>
                              {r.index + 1}
                            </td>
                            <td style={resultTd}>
                              <span style={{ display: 'inline-flex', flexWrap: 'wrap', gap: 4, alignItems: 'center' }}>
                                {wrongs.map((w, i) => (
                                  <span
                                    key={i}
                                    style={{
                                      color: '#b91c1c',
                                      textDecoration: 'line-through',
                                      textDecorationColor: '#b91c1c',
                                    }}
                                  >
                                    {w}
                                  </span>
                                ))}
                                {r.correct && (
                                  <span style={{ color: '#15803d', fontWeight: 600 }}>
                                    {(guesses[r.index] ?? '').trim() || r.accepted_answer}
                                  </span>
                                )}
                                {!r.correct && wrongs.length === 0 && (
                                  <span style={{ color: 'var(--ed-fg-muted)' }}>—</span>
                                )}
                              </span>
                            </td>
                            <td style={{ ...resultTd, color: '#15803d', fontWeight: 600 }}>
                              {r.accepted_answer ?? ''}
                            </td>
                            <td style={{
                              ...resultTd,
                              color: net > 0 ? '#15803d' : net < 0 ? '#b91c1c' : 'var(--ed-fg-muted)',
                              fontWeight: net !== 0 ? 600 : 400,
                            }}>
                              {net > 0 ? `+${net}` : net < 0 ? `−${Math.abs(net)}` : '—'}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )
            })()}
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 4, alignItems: 'center' }}>
              <div style={{ display: 'inline-flex' }}>
                <button
                  type="button"
                  onClick={startAgain}
                  disabled={restarting}
                  style={splitButtonMain}
                >
                  {restarting ? t('starting') : t('playAgain')}
                </button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button type="button" style={splitButtonArrow} aria-label={t('playAgainOptions')}>
                      ▾
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link href="/quran/games/fill-blank" style={{ textDecoration: 'none', color: 'inherit' }}>
                        {t('playAgainChange')}
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <Link href="/quran/games/leaderboard" style={ghostLink}>
                {t('leaderboardLink')}
              </Link>
              <button type="button" onClick={shareResult} style={ghostLink}>
                {t('share')}
              </button>
            </div>
          </DialogContent>
        </Dialog>
      )}
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
  attemptsRemaining: Record<number, number>
  checking: Record<number, boolean>
  resultByIndex: Map<number, GamePerBlankResult> | null
  onChange: (index: number, value: string) => void
  onCheck: (index: number) => Promise<void>
  onEnter: (index: number) => void
  onReveal: (index: number, max: number) => void
  registerRef: (index: number, el: HTMLInputElement | HTMLButtonElement | null) => void
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
    const blankResult = ctx.resultByIndex?.get(index) ?? null
    nodes.push(
      blankResult ? (
        <BlankReview
          key={`b${index}`}
          guess={ctx.guesses[index] ?? ''}
          result={blankResult}
        />
      ) : (
        <BlankInput
          key={`b${index}`}
          blank={blank}
          index={index}
          value={ctx.guesses[index] ?? ''}
          feedback={ctx.feedback[index]}
          revealed={ctx.hintsRevealed[index] ?? 0}
          attemptsRemaining={ctx.attemptsRemaining[index]}
          checking={ctx.checking[index] ?? false}
          onChange={(value) => ctx.onChange(index, value)}
          onCheck={() => ctx.onCheck(index)}
          onEnter={() => ctx.onEnter(index)}
          onReveal={() => ctx.onReveal(index, MAX_HINTS_PER_BLANK)}
          registerRef={(el) => ctx.registerRef(index, el)}
        />
      ),
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

// Read-only review pill shown in place of an input after the round is
// submitted. Correct guesses turn green; wrong guesses show the player's
// answer struck through alongside the accepted word in red.
function BlankReview({
  guess,
  result,
}: {
  guess: string
  result: GamePerBlankResult
}) {
  if (result.correct) {
    return <span style={reviewCorrect}>{result.accepted_answer}</span>
  }
  const trimmed = guess.trim()
  return (
    <span style={reviewWrong}>
      {trimmed && <span style={reviewWrongGuess}>{trimmed}</span>}
      <span style={reviewWrongAnswer}>{result.accepted_answer}</span>
    </span>
  )
}

function BlankInput({
  blank,
  index,
  value,
  feedback,
  revealed,
  attemptsRemaining,
  checking,
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
  attemptsRemaining: number | undefined
  checking: boolean
  onChange: (value: string) => void
  onCheck: () => Promise<void>
  onEnter: () => void
  onReveal: () => void
  registerRef: (el: HTMLInputElement | HTMLButtonElement | null) => void
}) {
  const t = useTranslations('games')
  const locked = attemptsRemaining === 0
  const correct = feedback === 'correct'
  // Disable input when locked (no attempts left) or already correct.
  const disabled = locked || correct
  const feedbackStyle = locked
    ? lockedStyle
    : correct
      ? correctStyle
      : feedback === 'wrong'
        ? wrongStyle
        : null

  const healthBars =
    attemptsRemaining !== undefined ? (
      <span
        className={checking ? 'blank-checking-bars' : undefined}
        style={healthBarRow}
      >
        {Array.from({ length: MAX_BLANK_ATTEMPTS }, (_, i) => (
          <span
            key={i}
            style={{
              ...healthBar,
              background:
                i < attemptsRemaining
                  ? feedback === 'correct'
                    ? '#15803d'
                    : 'var(--ed-fg-muted)'
                  : locked
                    ? 'rgba(185,28,28,0.35)'
                    : 'var(--ed-rule)',
            }}
          />
        ))}
      </span>
    ) : null

  if (blank?.options && blank.options.length > 0) {
    return (
      <span style={{ display: 'inline-block', minWidth: 120 }}>
        <ThemedSelect
          triggerRef={registerRef}
          value={value}
          onChange={(next) => {
            onChange(next)
            if (next) onCheck()
          }}
          aria-label={t('optionsLabel')}
          options={[
            { value: '', label: '—' },
            ...(blank.options ?? []).map((opt) => ({ value: opt, label: opt })),
          ]}
        />
      </span>
    )
  }

  const hint = blank?.hint
  return (
    <span style={{ display: 'inline-flex', alignItems: 'baseline', gap: 4 }}>
      <span style={{ display: 'inline-block', position: 'relative', margin: '0 2px' }}>
        <input
          ref={registerRef as React.Ref<HTMLInputElement>}
          type="text"
          autoComplete="off"
          spellCheck={false}
          disabled={disabled}
          aria-label={locked ? t('blankLocked') : `${t('blankPlaceholder')} ${index + 1}`}
          placeholder={locked ? t('blankLocked') : t('blankPlaceholder')}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={() => void onCheck()}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              // Await the check so advanceFrom reads fresh state from stateRef.
              void onCheck().then(() => onEnter())
            }
          }}
          size={Math.max(8, value.length + 1)}
          style={{ ...blankBase, ...feedbackStyle, ...(disabled ? { cursor: 'not-allowed', opacity: correct ? 1 : 0.5 } : {}) }}
        />
        {healthBars}
      </span>
      {hint && !disabled && (
        <>
          {revealed > 0 && (
            <span style={hintCaption}>
              {(revealed >= 3 ? hint.first_two : hint.first_letter) + '…'}
              {revealed >= 2 && ` · ${t('hintLength', { count: hint.length })}`}
            </span>
          )}
          {revealed < MAX_HINTS_PER_BLANK && (
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={onReveal}
              style={hintButton}
              title={t('hint')}
            >
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

const lockedStyle: React.CSSProperties = {
  borderBottomColor: 'var(--ed-rule)',
  background: 'rgba(128,128,128,0.08)',
  color: 'var(--ed-fg-muted)',
}

const healthBarRow: React.CSSProperties = {
  position: 'absolute',
  bottom: 0,
  left: 0,
  right: 0,
  display: 'flex',
  gap: 2,
  pointerEvents: 'none',
}

const healthBar: React.CSSProperties = {
  flex: 1,
  height: 3,
  borderRadius: 1,
  transition: 'background 120ms ease',
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

const ghostLink: React.CSSProperties = {
  padding: '10px 22px',
  borderRadius: 2,
  border: '1px solid var(--ed-rule)',
  background: 'var(--ed-surface)',
  color: 'var(--ed-fg)',
  fontSize: 14,
  textDecoration: 'none',
  cursor: 'pointer',
}

const reviewCorrect: React.CSSProperties = {
  display: 'inline-block',
  margin: '0 2px',
  padding: '0 6px',
  borderRadius: 2,
  background: 'rgba(21, 128, 61, 0.15)',
  color: '#15803d',
  fontSize: '0.85em',
  fontWeight: 600,
}

const reviewWrong: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'baseline',
  gap: 4,
  margin: '0 2px',
}

const reviewWrongGuess: React.CSSProperties = {
  padding: '0 4px',
  borderRadius: 2,
  background: 'rgba(185, 28, 28, 0.10)',
  color: '#b91c1c',
  fontSize: '0.85em',
  textDecoration: 'line-through',
  textDecorationColor: '#b91c1c',
}

const reviewWrongAnswer: React.CSSProperties = {
  padding: '0 6px',
  borderRadius: 2,
  background: 'rgba(21, 128, 61, 0.15)',
  color: '#15803d',
  fontSize: '0.85em',
  fontWeight: 600,
}

const quitButton: React.CSSProperties = {
  marginLeft: 'auto',
  padding: '10px 18px',
  borderRadius: 2,
  border: '1px solid var(--ed-rule)',
  background: 'transparent',
  color: 'var(--ed-fg-muted)',
  fontSize: 13,
  cursor: 'pointer',
}

const quitConfirm: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 12,
  padding: '12px 14px',
  border: '1px solid var(--ed-rule)',
  borderRadius: 2,
  flexWrap: 'wrap',
}

const quitConfirmYes: React.CSSProperties = {
  padding: '6px 14px',
  borderRadius: 2,
  border: '1px solid var(--ed-accent, #b91c1c)',
  background: 'transparent',
  color: 'var(--ed-accent, #b91c1c)',
  fontSize: 13,
  textDecoration: 'none',
  cursor: 'pointer',
}

const quitConfirmNo: React.CSSProperties = {
  padding: '6px 14px',
  borderRadius: 2,
  border: '1px solid var(--ed-rule)',
  background: 'transparent',
  color: 'var(--ed-fg-muted)',
  fontSize: 13,
  cursor: 'pointer',
}

const resultTh: React.CSSProperties = {
  fontFamily: 'var(--font-jetbrains), ui-monospace, monospace',
  fontSize: 10,
  letterSpacing: '0.12em',
  textTransform: 'uppercase',
  color: 'var(--ed-fg-muted)',
  padding: '4px 8px 8px',
  fontWeight: 400,
  textAlign: 'left',
}

const resultTd: React.CSSProperties = {
  padding: '8px 8px',
  fontFamily: 'var(--font-cormorant), Georgia, serif',
  fontSize: 15,
}

const splitButtonMain: React.CSSProperties = {
  padding: '10px 20px',
  borderRadius: '2px 0 0 2px',
  border: '1px solid var(--ed-fg)',
  borderRight: 'none',
  background: 'var(--ed-fg)',
  color: 'var(--ed-bg)',
  fontSize: 14,
  fontWeight: 500,
  cursor: 'pointer',
}

const splitButtonArrow: React.CSSProperties = {
  padding: '10px 9px',
  borderRadius: '0 2px 2px 0',
  border: '1px solid var(--ed-fg)',
  borderLeft: '1px solid rgba(128,128,128,0.3)',
  background: 'var(--ed-fg)',
  color: 'var(--ed-bg)',
  cursor: 'pointer',
  fontSize: 11,
  lineHeight: 1,
}
