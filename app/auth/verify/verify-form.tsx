'use client'

import { useState, useRef, useEffect } from 'react'
import { signIn } from 'next-auth/react'
import Image from 'next/image'
import Link from 'next/link'
import { Loader2, ArrowLeft } from 'lucide-react'

export function VerifyForm() {
  const [code, setCode] = useState(['', '', '', '', '', ''])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  const email =
    typeof window !== 'undefined'
      ? (new URLSearchParams(window.location.search).get('email') ?? '')
      : ''
  const callbackUrl =
    typeof window !== 'undefined'
      ? (new URLSearchParams(window.location.search).get('next') ?? '/')
      : '/'

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
    }
    if (next.every((d) => d !== '')) {
      void submitCode(next.join(''))
    }
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent) {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
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
      setLoading(false)
      inputRefs.current[0]?.focus()
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="flex flex-col items-center gap-8 w-full max-w-sm">
        <Link
          href="/"
          className="flex flex-col items-center gap-2 hover:opacity-80 transition-opacity"
        >
          <Image
            src="/brand-assets/logo-transparent.png"
            alt="WikiSubmission"
            width={56}
            height={56}
            className="rounded-full shadow-lg"
          />
        </Link>

        <div className="w-full bg-card border border-border rounded-xl shadow-xl p-8 flex flex-col gap-6">
          <div className="flex flex-col gap-1">
            <h1 className="text-xl font-semibold text-foreground">
              Check your email
            </h1>
            <p className="text-sm text-muted-foreground">
              Enter the 6-digit code sent to{' '}
              <span className="font-medium text-foreground">{email}</span>
            </p>
          </div>

          <div
            className="flex gap-2 justify-center"
            onPaste={handlePaste}
          >
            {code.map((digit, i) => (
              <input
                key={i}
                ref={(el) => { inputRefs.current[i] = el }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                disabled={loading}
                className="w-11 h-13 text-center text-xl font-semibold rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
              />
            ))}
          </div>

          {loading && (
            <div className="flex justify-center">
              <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
            </div>
          )}

          {error && (
            <p className="text-destructive text-sm text-center">{error}</p>
          )}

          <Link
            href="/auth/sign-in"
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mx-auto"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Use a different method
          </Link>
        </div>
      </div>
    </main>
  )
}
