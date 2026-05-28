'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'
import { readResult } from '@/lib/games-session'
import { encodeSharePayload } from '@/lib/games-share'
import type { GameSubmitResult } from '@/src/api/me-client'

export function FillBlankResult({ attemptId }: { attemptId: string }) {
  const t = useTranslations('games')
  const [result, setResult] = useState<GameSubmitResult | null | undefined>(undefined)

  useEffect(() => {
    // Defer the sessionStorage read off the synchronous effect body so the first
    // (server + hydration) render stays in the neutral `undefined` state.
    let active = true
    Promise.resolve().then(() => {
      if (active) setResult(readResult(attemptId))
    })
    return () => {
      active = false
    }
  }, [attemptId])

  if (result === undefined) {
    return <p style={{ color: 'var(--ed-fg-muted)' }}>{t('loadingRound')}</p>
  }

  if (result === null) {
    return (
      <div>
        <p style={{ color: 'var(--ed-fg-muted)' }}>{t('resultExpired')}</p>
        <div style={{ marginTop: 20, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <Link href="/quran/games/fill-blank" style={primaryLink}>
            {t('playAgain')}
          </Link>
          <Link href="/quran/games/leaderboard" style={ghostLink}>
            {t('leaderboardLink')}
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div
        style={{
          display: 'flex',
          alignItems: 'baseline',
          gap: 16,
          flexWrap: 'wrap',
          paddingBottom: 20,
          borderBottom: '1px solid var(--ed-rule)',
        }}
      >
        <div>
          <div style={monoLabel}>{t('scoreLabel')}</div>
          <div
            style={{
              fontFamily: 'var(--font-cormorant), Georgia, serif',
              fontSize: 'clamp(48px, 9vw, 80px)',
              lineHeight: 1,
              color: 'var(--ed-accent)',
            }}
          >
            {result.score}
          </div>
        </div>
        <div style={{ color: 'var(--ed-fg-muted)', fontSize: 15 }}>
          {t('correctOf', { correct: result.correct_count, total: result.total_count })}
        </div>
      </div>

      <div style={{ display: 'flex', gap: 28, marginTop: 16, ...monoLabel }}>
        <span>
          {t('difficultyMultiplierLabel')}: ×{result.difficulty_multiplier}
        </span>
        <span>
          {t('hintPenaltyLabel')}: −{result.hint_penalty}
        </span>
      </div>

      <ul style={{ listStyle: 'none', padding: 0, margin: '28px 0 0', display: 'grid', gap: 8 }}>
        {result.per_blank.map((b) => (
          <li
            key={b.index}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '10px 14px',
              border: '1px solid var(--ed-rule)',
              borderRadius: 2,
            }}
          >
            <span aria-hidden style={{ fontSize: 16, color: b.correct ? '#15803d' : '#b91c1c' }}>
              {b.correct ? '✓' : '✕'}
            </span>
            <span style={{ ...monoLabel, minWidth: 56 }}>#{b.index + 1}</span>
            <span style={{ fontSize: 15 }}>
              {b.correct ? (
                <strong>{b.accepted_answer}</strong>
              ) : (
                <span style={{ color: 'var(--ed-fg-muted)', fontStyle: 'italic' }}>
                  {t('replayToReveal')}
                </span>
              )}
            </span>
          </li>
        ))}
      </ul>

      <div style={{ marginTop: 32, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <Link href="/quran/games/fill-blank" style={primaryLink}>
          {t('playAgain')}
        </Link>
        <Link href="/quran/games/leaderboard" style={ghostLink}>
          {t('leaderboardLink')}
        </Link>
        <button type="button" onClick={() => shareResult(result, t)} style={ghostLink}>
          {t('share')}
        </button>
      </div>
    </div>
  )
}

type T = ReturnType<typeof useTranslations<'games'>>

async function shareResult(result: GameSubmitResult, t: T): Promise<void> {
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

  // Web Share API on mobile gives a native sheet; everywhere else, copy.
  if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
    try {
      await navigator.share({ title: t('shareTitle'), text: shareText, url })
      return
    } catch (err) {
      // User cancellation is silent; an actual failure falls through to copy.
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

const monoLabel: React.CSSProperties = {
  fontFamily: 'var(--font-jetbrains), ui-monospace, monospace',
  fontSize: 11,
  letterSpacing: '0.16em',
  textTransform: 'uppercase',
  color: 'var(--ed-fg-muted)',
}

const primaryLink: React.CSSProperties = {
  padding: '12px 28px',
  borderRadius: 2,
  border: '1px solid var(--ed-fg)',
  background: 'var(--ed-fg)',
  color: 'var(--ed-bg)',
  fontSize: 15,
  fontWeight: 500,
  textDecoration: 'none',
}

const ghostLink: React.CSSProperties = {
  padding: '12px 28px',
  borderRadius: 2,
  border: '1px solid var(--ed-rule)',
  background: 'var(--ed-surface)',
  color: 'var(--ed-fg)',
  fontSize: 15,
  textDecoration: 'none',
}
