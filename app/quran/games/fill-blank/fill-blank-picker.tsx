'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { meApi, type GameDifficulty, type GameRoundSize, type GameLanguage } from '@/src/api/me-client'
import { stashVariant } from '@/lib/games-session'

const DIFFICULTIES: GameDifficulty[] = ['adaptive', 'easy', 'medium', 'hard', 'professional']
const SIZES: GameRoundSize[] = ['adaptive', 'short', 'medium', 'long']

type LangEntry = { code: GameLanguage; name: string; dir: 'ltr' | 'rtl' }
const LANGUAGES: LangEntry[] = [
  { code: 'en', name: 'English',        dir: 'ltr' },
  { code: 'ar', name: 'Arabic',         dir: 'rtl' },
  { code: 'ac', name: 'Arabic Clean',   dir: 'rtl' },
  { code: 'fr', name: 'French',         dir: 'ltr' },
  { code: 'de', name: 'German',         dir: 'ltr' },
  { code: 'es', name: 'Spanish',        dir: 'ltr' },
  { code: 'fa', name: 'Persian',        dir: 'rtl' },
  { code: 'ur', name: 'Urdu',           dir: 'rtl' },
  { code: 'tr', name: 'Turkish',        dir: 'ltr' },
  { code: 'id', name: 'Bahasa',         dir: 'ltr' },
  { code: 'tl', name: 'Transliterated', dir: 'ltr' },
  { code: 'ru', name: 'Russian',        dir: 'ltr' },
  { code: 'bn', name: 'Bengali',        dir: 'ltr' },
  { code: 'ta', name: 'Tamil',          dir: 'ltr' },
  { code: 'sv', name: 'Swedish',        dir: 'ltr' },
]

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

  const [language, setLanguage] = useState<GameLanguage>('en')
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
      <Field label={t('pickerLanguageLabel')}>
        <div style={optionGrid}>
          {LANGUAGES.map((l) => (
            <Choice
              key={l.code}
              selected={language === l.code}
              onClick={() => setLanguage(l.code)}
              title={l.name}
              hint={l.dir === 'rtl' ? '← right to left' : ''}
              dir={l.dir}
            />
          ))}
        </div>
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
  dir,
}: {
  selected: boolean
  onClick: () => void
  title: string
  hint: string
  dir?: 'ltr' | 'rtl'
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
      <div style={{ fontWeight: 500, fontSize: 15 }} dir={dir}>{title}</div>
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
