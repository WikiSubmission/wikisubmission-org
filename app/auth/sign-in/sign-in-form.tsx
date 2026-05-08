'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import Image from 'next/image'
import Link from 'next/link'
import { FcGoogle } from 'react-icons/fc'
import { FaApple } from 'react-icons/fa'
import { Mail, Loader2 } from 'lucide-react'

export function SignInForm() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState<'google' | 'apple' | 'email' | null>(null)
  const [error, setError] = useState<string | null>(null)

  const callbackUrl =
    typeof window !== 'undefined'
      ? (new URLSearchParams(window.location.search).get('next') ?? '/')
      : '/'

  async function handleGoogle() {
    setLoading('google')
    await signIn('google', { callbackUrl })
  }

  async function handleApple() {
    setLoading('apple')
    await signIn('apple', { callbackUrl })
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

        <div className="w-full bg-card border border-border rounded-xl shadow-xl p-8 flex flex-col gap-4">
          <h1 className="text-xl font-semibold text-center text-foreground">
            Sign in
          </h1>

          <button
            onClick={handleGoogle}
            disabled={loading !== null}
            className="flex items-center justify-center gap-3 w-full px-4 py-2.5 rounded-lg border border-border bg-background hover:bg-muted transition-colors text-sm font-medium text-foreground disabled:opacity-50"
          >
            {loading === 'google' ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <FcGoogle className="w-4 h-4" />
            )}
            Continue with Google
          </button>

          <button
            onClick={handleApple}
            disabled={loading !== null}
            className="flex items-center justify-center gap-3 w-full px-4 py-2.5 rounded-lg border border-border bg-background hover:bg-muted transition-colors text-sm font-medium text-foreground disabled:opacity-50"
          >
            {loading === 'apple' ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <FaApple className="w-4 h-4" />
            )}
            Continue with Apple
          </button>

          <div className="flex items-center gap-2 text-muted-foreground text-xs">
            <span className="flex-1 h-px bg-border" />
            or
            <span className="flex-1 h-px bg-border" />
          </div>

          <form onSubmit={handleEmail} className="flex flex-col gap-3">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email address"
              required
              disabled={loading !== null}
              className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
            />
            {error && (
              <p className="text-destructive text-xs">{error}</p>
            )}
            <button
              type="submit"
              disabled={loading !== null || !email.trim()}
              className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {loading === 'email' ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Mail className="w-4 h-4" />
              )}
              Continue with Email
            </button>
          </form>
        </div>
      </div>
    </main>
  )
}
