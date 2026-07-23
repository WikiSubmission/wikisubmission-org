'use client'

import { useState, useRef, useEffect } from 'react'
import { signIn } from 'next-auth/react'
import Image from 'next/image'
import Link from 'next/link'
import { Loader2 } from 'lucide-react'

export function VerifyForm() {
  const [code, setCode] = useState(['', '', '', '', '', ''])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])
  const [activeIndex, setActiveIndex] = useState(0)

  const email =
    typeof window !== 'undefined'
      ? (new URLSearchParams(window.location.search).get('email') ?? '')
      : ''
  const callbackUrl = (() => {
    if (typeof window === 'undefined') return '/'
    const raw = new URLSearchParams(window.location.search).get('next') ?? '/'
    // Only allow relative paths — reject protocol-relative and external URLs
    return raw.startsWith('/') && !raw.startsWith('//') ? raw : '/'
  })()

  useEffect(() => {
    inputRefs.current[0]?.focus()
  }, [])

  function handleChange(index: number, value: string) {
    if (!/^\d?$/.test(value)) return
    const next = [...code]
    next[index] = value
    setCode(next)
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
      setActiveIndex(index + 1)
    }
    if (next.every((d) => d !== '')) {
      void submitCode(next.join(''))
    }
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent) {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
      setActiveIndex(index - 1)
    }
  }

  function handlePaste(e: React.ClipboardEvent) {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (pasted.length === 6) {
      e.preventDefault()
      const next = pasted.split('')
      setCode(next)
      void submitCode(pasted)
    }
  }

  async function submitCode(fullCode: string) {
    setLoading(true)
    setError(null)
    const result = await signIn('credentials', {
      email,
      code: fullCode,
      redirect: false,
    })
    if (result?.ok) {
      window.location.assign(callbackUrl)
    } else {
      setError('Invalid or expired code. Please try again.')
      setCode(['', '', '', '', '', ''])
      setActiveIndex(0)
      setLoading(false)
      inputRefs.current[0]?.focus()
    }
  }

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
          <span className="auth-eyebrow">Check your email</span>
          <h1>
            <em>A six-digit</em> code awaits
          </h1>
          <p>
            We sent it to <strong className="text-[var(--ed-fg)]">{email}</strong>.
            Enter it below to continue.
          </p>
        </div>

        <div className="otp-row" onPaste={handlePaste}>
          {code.map((digit, i) => (
            <input
              key={i}
              ref={(el) => {
                inputRefs.current[i] = el
              }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              onFocus={() => setActiveIndex(i)}
              disabled={loading}
              autoComplete={i === 0 ? 'one-time-code' : 'off'}
              className={`otp-box${activeIndex === i ? ' active' : ''}${digit ? ' filled' : ''}`}
              aria-label={`Digit ${i + 1}`}
            />
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center">
            <Loader2 className="w-5 h-5 animate-spin text-[var(--ed-fg-muted)]" aria-hidden />
          </div>
        ) : null}

        {error ? (
          <p className="text-[var(--ed-accent)] text-[13px] text-center font-[var(--font-source-serif)]">
            {error}
          </p>
        ) : null}

        <p className="otp-resend">
          Didn&apos;t receive it?{' '}
          <Link href={`/auth/sign-in${email ? `?email=${encodeURIComponent(email)}` : ''}`}>
            Resend or use a different method
          </Link>
          .
        </p>
      </div>
    </main>
  )
}
