'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import Image from 'next/image'
import Link from 'next/link'
import { FcGoogle } from 'react-icons/fc'
import { FaApple, FaDiscord } from 'react-icons/fa'
import { Mail, Loader2 } from 'lucide-react'

type Loading = 'google' | 'apple' | 'discord' | 'email' | null

export function SignInForm() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState<Loading>(null)
  const [error, setError] = useState<string | null>(null)

  const callbackUrl = (() => {
    if (typeof window === 'undefined') return '/'
    const raw = new URLSearchParams(window.location.search).get('next') ?? '/'
    return raw.startsWith('/') && !raw.startsWith('//') ? raw : '/'
  })()

  async function handleProvider(provider: 'google' | 'apple' | 'discord') {
    setLoading(provider)
    await signIn(provider, { callbackUrl })
  }

  async function handleEmail(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim()) return
    setLoading('email')
    setError(null)

    const res = await fetch('/api/auth/send-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.trim() }),
    })

    if (!res.ok) {
      setError('Failed to send code. Please try again.')
      setLoading(null)
      return
    }

    window.location.href = `/auth/verify?email=${encodeURIComponent(email.trim())}&next=${encodeURIComponent(callbackUrl)}`
  }

  const disabled = loading !== null

  return (
    <main className="auth-shell">
      <div className="auth-card">
        <div className="auth-mast">
          <Link href="/" aria-label="WikiSubmission home">
            <Image
              src="/brand-assets/logo-transparent.png"
              alt="WikiSubmission"
              width={36}
              height={36}
              priority
            />
          </Link>
          <span className="auth-eyebrow">Sign in</span>
          <h1>
            Return to the <em>commentary</em>
          </h1>
          <p>
            Bookmark verses, write notes in the margin, and keep a streak across
            the scripture.
          </p>
        </div>

        <form onSubmit={handleEmail} className="flex flex-col gap-3">
          <label className="auth-eyebrow" htmlFor="auth-email">
            Email
          </label>
          <input
            id="auth-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
            disabled={disabled}
            autoComplete="email"
            className="auth-input"
          />
          {error ? (
            <p className="text-[var(--ed-accent)] text-[12px] font-[var(--font-source-serif)]">
              {error}
            </p>
          ) : null}
          <button type="submit" disabled={disabled || !email.trim()} className="auth-primary">
            {loading === 'email' ? (
              <Loader2 className="w-4 h-4 animate-spin" aria-hidden />
            ) : (
              <Mail className="w-4 h-4" aria-hidden />
            )}
            Send sign-in code
          </button>
        </form>

        <div className="auth-divider">or continue with</div>

        <div className="auth-providers">
          <button
            type="button"
            onClick={() => handleProvider('google')}
            disabled={disabled}
            className="auth-provider"
          >
            <span className="glyph">
              {loading === 'google' ? (
                <Loader2 className="w-4 h-4 animate-spin" aria-hidden />
              ) : (
                <FcGoogle className="w-4 h-4" aria-hidden />
              )}
            </span>
            Google
            <span className="arrow">→</span>
          </button>

          <button
            type="button"
            onClick={() => handleProvider('apple')}
            disabled={disabled}
            className="auth-provider"
          >
            <span className="glyph">
              {loading === 'apple' ? (
                <Loader2 className="w-4 h-4 animate-spin" aria-hidden />
              ) : (
                <FaApple className="w-4 h-4" aria-hidden />
              )}
            </span>
            Apple
            <span className="arrow">→</span>
          </button>

          <button
            type="button"
            onClick={() => handleProvider('discord')}
            disabled={disabled}
            className="auth-provider"
          >
            <span className="glyph">
              {loading === 'discord' ? (
                <Loader2 className="w-4 h-4 animate-spin" aria-hidden />
              ) : (
                <FaDiscord className="w-4 h-4" aria-hidden style={{ color: '#5865F2' }} />
              )}
            </span>
            Discord
            <span className="arrow">→</span>
          </button>
        </div>

        <p className="auth-foot">
          We will never email you anything other than what you ask for.{' '}
          <Link href="/legal/privacy">Read the privacy note</Link>.
        </p>
      </div>
    </main>
  )
}
