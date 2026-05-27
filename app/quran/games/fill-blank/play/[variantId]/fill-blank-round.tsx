'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
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
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const startedAt = useRef<number>(0)

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

  async function submit() {
    if (!variant || submitting) return
    setSubmitting(true)
    setSubmitError(null)
    try {
      const { data } = await meApi.games.submitVariant({
        variant_id: variant.variant_id,
        guesses: variant.blanks.map((b) => ({ index: b.index, value: (guesses[b.index] ?? '').trim() })),
        // The backend exposes no hint content yet, so no hints can be consumed client-side.
        hints_used: 0,
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
            {renderVerse(v.text, blanksByIndex, guesses, (index, value) =>
              setGuesses((prev) => ({ ...prev, [index]: value })),
            )}
          </p>
        ))}
      </div>

      <div style={{ marginTop: 32, display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
        <button type="button" onClick={submit} disabled={submitting} style={primaryButton}>
          {submitting ? t('submitting') : t('submitRound')}
        </button>
        <span style={monoLabel}>{t('progress', { filled: filledCount, total: totalBlanks })}</span>
      </div>
      {submitError && <p style={{ marginTop: 12, color: 'var(--ed-accent, #b91c1c)' }}>{submitError}</p>}
    </div>
  )
}

function renderVerse(
  text: string,
  blanks: Map<number, GameBlank>,
  guesses: Record<number, string>,
  onChange: (index: number, value: string) => void,
): React.ReactNode[] {
  const nodes: React.ReactNode[] = []
  let lastIndex = 0
  let match: RegExpExecArray | null
  BLANK_TOKEN.lastIndex = 0
  let key = 0
  while ((match = BLANK_TOKEN.exec(text)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(<span key={`t${key}`}>{text.slice(lastIndex, match.index)}</span>)
    }
    const index = Number(match[1])
    const blank = blanks.get(index)
    nodes.push(
      <BlankInput
        key={`b${index}`}
        blank={blank}
        index={index}
        value={guesses[index] ?? ''}
        onChange={(value) => onChange(index, value)}
      />,
    )
    lastIndex = match.index + match[0].length
    key += 1
  }
  if (lastIndex < text.length) {
    nodes.push(<span key={`t${key}`}>{text.slice(lastIndex)}</span>)
  }
  return nodes
}

function BlankInput({
  blank,
  index,
  value,
  onChange,
}: {
  blank: GameBlank | undefined
  index: number
  value: string
  onChange: (value: string) => void
}) {
  const t = useTranslations('games')

  if (blank?.options && blank.options.length > 0) {
    return (
      <select
        aria-label={t('optionsLabel')}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{ ...blankBase, paddingRight: 24 }}
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

  return (
    <input
      type="text"
      autoComplete="off"
      spellCheck={false}
      aria-label={`${t('blankPlaceholder')} ${index + 1}`}
      placeholder={t('blankPlaceholder')}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      size={Math.max(8, value.length + 1)}
      style={blankBase}
    />
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
