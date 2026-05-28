'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { ThemedSelect } from '@/components/ui/themed-select'
import {
  meApi,
  type GamePassage,
  type GameDifficulty,
  type GameRoundSize,
} from '@/src/api/me-client'
import { stashVariant } from '@/lib/games-session'

const DIFFICULTIES: GameDifficulty[] = ['easy', 'medium', 'hard', 'professional']
const SIZES: GameRoundSize[] = ['short', 'medium', 'long']

const monoLabel: React.CSSProperties = {
  fontFamily: 'var(--font-jetbrains), ui-monospace, monospace',
  fontSize: 11,
  letterSpacing: '0.16em',
  textTransform: 'uppercase',
  color: 'var(--ed-fg-muted)',
}

export function FillBlankPicker() {
  const t = useTranslations('games')
  const router = useRouter()

  const [passages, setPassages] = useState<GamePassage[] | null>(null)
  const [loadFailed, setLoadFailed] = useState(false)
  const [reloadKey, setReloadKey] = useState(0)

  const [passageId, setPassageId] = useState<number | null>(null)
  const [difficulty, setDifficulty] = useState<GameDifficulty>('medium')
  const [size, setSize] = useState<GameRoundSize>('short')

  const [starting, setStarting] = useState(false)
  const [startFailed, setStartFailed] = useState(false)

  useEffect(() => {
    let active = true
    meApi.games
      .listPassages({ language: 'en' })
      .then(({ data }) => {
        if (!active) return
        setPassages(data)
        setPassageId((prev) => prev ?? data[0]?.id ?? null)
      })
      .catch(() => {
        if (active) setLoadFailed(true)
      })
    return () => {
      active = false
    }
  }, [reloadKey])

  function retry() {
    setPassages(null)
    setLoadFailed(false)
    setReloadKey((k) => k + 1)
  }

  async function start() {
    if (passageId == null || starting) return
    setStarting(true)
    setStartFailed(false)
    try {
      const { data } = await meApi.games.startVariant({
        passage_id: passageId,
        language: 'en',
        difficulty,
        size,
      })
      stashVariant(data)
      router.push(`/quran/games/fill-blank/play/${encodeURIComponent(data.variant_id)}`)
    } catch {
      setStartFailed(true)
      setStarting(false)
    }
  }

  if (loadFailed) {
    return (
      <div style={{ marginTop: 32 }}>
        <p style={{ color: 'var(--ed-fg-muted)' }}>{t('loadError')}</p>
        <button type="button" onClick={retry} style={primaryButton}>
          {t('retry')}
        </button>
      </div>
    )
  }

  if (passages === null) {
    return (
      <p style={{ marginTop: 32, color: 'var(--ed-fg-muted)' }}>{t('loadingPassages')}</p>
    )
  }

  if (passages.length === 0) {
    return <p style={{ marginTop: 32, color: 'var(--ed-fg-muted)' }}>{t('noPassages')}</p>
  }

  return (
    <div style={{ marginTop: 32, display: 'grid', gap: 28 }}>
      <Field label={t('pickerPassageLabel')}>
        <ThemedSelect
          value={String(passageId ?? '')}
          onChange={(next) => setPassageId(Number(next))}
          options={passages.map((p) => ({ value: String(p.id), label: p.label }))}
        />
      </Field>

      <Field label={t('pickerDifficultyLabel')}>
        <div style={optionGrid}>
          {DIFFICULTIES.map((d) => (
            <Choice
              key={d}
              selected={difficulty === d}
              onClick={() => setDifficulty(d)}
              title={t(`difficulty${cap(d)}` as Parameters<typeof t>[0])}
              hint={t(`difficulty${cap(d)}Hint` as Parameters<typeof t>[0])}
            />
          ))}
        </div>
      </Field>

      <Field label={t('pickerSizeLabel')}>
        <div style={optionGrid}>
          {SIZES.map((s) => (
            <Choice
              key={s}
              selected={size === s}
              onClick={() => setSize(s)}
              title={t(`size${cap(s)}` as Parameters<typeof t>[0])}
              hint={t(`size${cap(s)}Hint` as Parameters<typeof t>[0])}
            />
          ))}
        </div>
      </Field>

      <div>
        <button type="button" onClick={start} disabled={starting || passageId == null} style={primaryButton}>
          {starting ? t('starting') : t('startRound')}
        </button>
        {startFailed && (
          <p style={{ marginTop: 12, color: 'var(--ed-accent, #b91c1c)' }}>{t('startError')}</p>
        )}
      </div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'grid', gap: 10 }}>
      <span style={monoLabel}>{label}</span>
      {children}
    </div>
  )
}

function Choice({
  selected,
  onClick,
  title,
  hint,
}: {
  selected: boolean
  onClick: () => void
  title: string
  hint: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      style={{
        textAlign: 'left',
        padding: '12px 14px',
        borderRadius: 2,
        cursor: 'pointer',
        border: `1px solid ${selected ? 'var(--ed-fg)' : 'var(--ed-rule)'}`,
        background: selected ? 'var(--ed-fg)' : 'var(--ed-surface)',
        color: selected ? 'var(--ed-bg)' : 'var(--ed-fg)',
        transition: 'background 120ms ease, border-color 120ms ease, color 120ms ease',
      }}
    >
      <div style={{ fontWeight: 500, fontSize: 15 }}>{title}</div>
      <div style={{ fontSize: 12, marginTop: 2, opacity: 0.7 }}>{hint}</div>
    </button>
  )
}

function cap(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

const optionGrid: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
  gap: 10,
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
