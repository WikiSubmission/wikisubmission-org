'use client'

import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useMobileAuth } from '@/components/mobile-auth-context'

interface MobileSignInGateProps {
  /** Heading shown above the sign-in options. */
  title: string
  /** Supporting copy explaining why signing in helps. */
  description: string
}

type Step = 'options' | 'code'

/** Minimum wait between one-time-code emails. The backend rate-limits too;
 *  this keeps eager tapping from burning through that budget. */
const RESEND_COOLDOWN_MS = 45_000

/**
 * Signed-out gate shared by the Profile and Games layouts. Offers Google, the
 * email one-time-code flow, and — on iOS only — Sign in with Apple. Apple is
 * hidden on Android (Play Store build) via appleSignInAvailable.
 */
export function MobileSignInGate({ title, description }: MobileSignInGateProps) {
  const {
    appleSignInAvailable,
    signInWithGoogle,
    signInWithApple,
    requestEmailCode,
    verifyEmailCode,
  } = useMobileAuth()

  const [busy, setBusy] = useState(false)
  const [step, setStep] = useState<Step>('options')
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [cooldownUntil, setCooldownUntil] = useState(0)
  const [now, setNow] = useState(() => Date.now())

  // Tick once a second while a cooldown is active so the button label counts down.
  useEffect(() => {
    if (cooldownUntil <= Date.now()) return
    const timer = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(timer)
  }, [cooldownUntil])

  const cooldownLeft = Math.max(0, Math.ceil((cooldownUntil - now) / 1000))

  async function run(action: () => Promise<void>) {
    setBusy(true)
    try {
      await action()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Something went wrong')
    } finally {
      setBusy(false)
    }
  }

  async function onSendCode() {
    const trimmed = email.trim()
    if (!trimmed) {
      toast.error('Enter your email')
      return
    }
    if (cooldownLeft > 0) {
      toast.error(`Wait ${cooldownLeft}s before requesting another code`)
      return
    }
    await run(async () => {
      await requestEmailCode(trimmed)
      setCooldownUntil(Date.now() + RESEND_COOLDOWN_MS)
      setNow(Date.now())
      setStep('code')
      toast.success('We sent a code to your email')
    })
  }

  async function onVerify() {
    const trimmed = code.trim()
    if (trimmed.length !== 6) {
      toast.error('Enter the 6-digit code')
      return
    }
    await run(() => verifyEmailCode(trimmed))
  }

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
      <div className="space-y-1">
        <h2 className="font-display text-xl">{title}</h2>
        <p className="text-muted-foreground text-sm">{description}</p>
      </div>

      {step === 'options' ? (
        <>
          <Button className="w-full" disabled={busy} onClick={() => run(signInWithGoogle)}>
            Continue with Google
          </Button>

          {appleSignInAvailable ? (
            <Button
              className="w-full"
              variant="outline"
              disabled={busy}
              onClick={() => run(signInWithApple)}
            >
              Continue with Apple
            </Button>
          ) : null}

          <div className="my-1 flex w-full items-center gap-3">
            <span className="bg-border h-px flex-1" />
            <span className="text-muted-foreground text-xs">or</span>
            <span className="bg-border h-px flex-1" />
          </div>

          <Input
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={email}
            disabled={busy}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') void onSendCode()
            }}
          />
          <Button
            className="w-full"
            variant="outline"
            disabled={busy}
            onClick={() => void onSendCode()}
          >
            Continue with email
          </Button>
        </>
      ) : (
        <>
          <p className="text-muted-foreground text-sm">
            Enter the 6-digit code sent to{' '}
            <span className="text-foreground font-medium">{email.trim()}</span>.
          </p>
          <Input
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            placeholder="123456"
            className="text-center tracking-[0.5em]"
            value={code}
            disabled={busy}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
            onKeyDown={(e) => {
              if (e.key === 'Enter') void onVerify()
            }}
          />
          <Button className="w-full" disabled={busy} onClick={() => void onVerify()}>
            Verify and sign in
          </Button>
          <div className="flex w-full items-center justify-between text-xs">
            <button
              type="button"
              className="text-muted-foreground hover:text-foreground"
              disabled={busy}
              onClick={() => {
                setStep('options')
                setCode('')
              }}
            >
              Use a different method
            </button>
            <button
              type="button"
              className="text-muted-foreground hover:text-foreground disabled:opacity-50"
              disabled={busy || cooldownLeft > 0}
              onClick={() => void onSendCode()}
            >
              {cooldownLeft > 0 ? `Resend code (${cooldownLeft}s)` : 'Resend code'}
            </button>
          </div>
        </>
      )}
    </div>
  )
}
