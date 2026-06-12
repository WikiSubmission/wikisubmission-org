'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useLocale, useTranslations } from 'next-intl'
import { meApi, type GameDifficulty, type GameRoundSize, type GameLanguage } from '@/src/api/me-client'
import { stashVariant } from '@/lib/games-session'

const DIFFICULTIES: GameDifficulty[] = ['adaptive', 'easy', 'medium', 'hard', 'professional']
const SIZES: GameRoundSize[] = ['adaptive', 'short', 'medium', 'long']

// UI locales that don't map directly to a game language fall back to 'en'.
function toGameLanguage(locale: string): GameLanguage {
  const supported: GameLanguage[] = ['en','ar','ac','fa','ur','fr','de','es','sv','tr','id','tl','ru','bn','ta']
  return (supported as string[]).includes(locale) ? (locale as GameLanguage) : 'en'
}

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
  const language = toGameLanguage(useLocale())

  const [difficulty, setDifficulty] = useState<GameDifficulty>('adaptive')
  const [size, setSize] = useState<GameRoundSize>('adaptive')
  const [starting, setStarting] = useState(false)
  const [startFailed, setStartFailed] = useState(false)

  async function start() {
    if (starting) return
    setStarting(true)
    setStartFailed(false)
    try {
      const { data } = await meApi.games.startVariant({ language, difficulty, size })
      stashVariant(data)
      router.push(`/quran/games/fill-blank/play/${encodeURIComponent(data.variant_id)}`)
    } catch {
      setStartFailed(true)
      setStarting(false)
    }
  }

  return (
    <div style={{ marginTop: 32, display: 'grid', gap: 28 }}>
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
        <button type="button" onClick={start} disabled={starting} style={primaryButton}>
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
      {hint && <div style={{ fontSize: 12, marginTop: 2, opacity: 0.7 }}>{hint}</div>}
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
