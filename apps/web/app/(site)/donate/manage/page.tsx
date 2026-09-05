import React from 'react'
import { stripe } from '@/lib/stripe'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, Search, ArrowRight, ShieldCheck, Mail } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { F } from '@/app/(site)/_sections/shared'

export default async function ManageDonationPage({
  searchParams,
}: {
  searchParams?: Promise<{ email?: string | string[] | undefined }>
}) {
  let redirectUrl: string | null = null
  let lookupAttempted = false
  let emailValue = ''

  if (searchParams) {
    const resolvedParams = await searchParams
    const rawEmail = resolvedParams?.email
    if (typeof rawEmail === 'string' && rawEmail.trim().length > 0) {
      emailValue = rawEmail.trim()
      lookupAttempted = true

      try {
        if (process.env.STRIPE_SECRET_KEY) {
          const customers = await stripe().customers.list({
            email: emailValue.toLowerCase(),
            limit: 1,
          })

          if (customers.data.length > 0) {
            const customerId = customers.data[0].id
            const session = await stripe().billingPortal.sessions.create({
              customer: customerId,
              return_url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://wikisubmission.org'}/donate`,
            })

            if (session.url) {
              redirectUrl = session.url
            }
          }
        }
      } catch (err) {
        console.error('Error in Stripe billing portal session creation:', err)
      }
    }
  }

  if (redirectUrl) {
    redirect(redirectUrl)
  }

  if (lookupAttempted) {
    return (
      <div
        className="min-h-[85vh] flex items-center justify-center px-4 py-16"
        style={{ backgroundColor: 'var(--ed-bg)', color: 'var(--ed-fg)' }}
      >
        <div
          className="max-w-lg w-full rounded-2xl border p-8 sm:p-10 shadow-lg text-center space-y-6"
          style={{
            borderColor: 'var(--ed-rule)',
            backgroundColor: 'var(--ed-surface)',
          }}
        >
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto border"
            style={{
              borderColor: 'var(--ed-rule)',
              backgroundColor: 'var(--ed-bg)',
              color: 'var(--ed-accent)',
            }}
          >
            <Mail size={22} />
          </div>

          <div className="space-y-2">
            <h1
              className="text-3xl font-medium tracking-tight"
              style={{ fontFamily: F.display }}
            >
              No Subscription Found
            </h1>
            <p
              className="text-sm leading-relaxed text-[var(--ed-fg-muted)]"
              style={{ fontFamily: F.serif }}
            >
              We couldn&apos;t locate an active recurring contribution under{' '}
              <span className="font-semibold text-[var(--ed-fg)] underline">
                {emailValue}
              </span>
              . If you used a different email address during checkout, please try again below.
            </p>
          </div>

          <form action="/donate/manage" className="space-y-4">
            <div className="space-y-3">
              <Input
                type="email"
                name="email"
                placeholder="Enter your email address"
                defaultValue={emailValue}
                required
                className="text-center h-12 rounded-xl border-[var(--ed-rule)] bg-[var(--ed-bg)]"
              />
              <button
                type="submit"
                className="w-full h-12 rounded-xl font-semibold text-sm inline-flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm"
                style={{
                  backgroundColor: 'var(--ed-accent)',
                  color: 'var(--ed-bg)',
                  fontFamily: F.serif,
                }}
              >
                <Search size={16} />
                <span>Search With Another Email</span>
              </button>
            </div>
          </form>

          <div className="pt-4 border-t flex items-center justify-between gap-4 text-xs" style={{ borderColor: 'var(--ed-rule)' }}>
            <Link
              href="/donate"
              className="inline-flex items-center gap-1 text-[var(--ed-fg-muted)] hover:text-[var(--ed-fg)] transition-colors"
            >
              <ChevronLeft size={14} />
              <span>Back to Donate</span>
            </Link>

            <a
              href="mailto:contact@wikisubmission.org"
              className="text-[var(--ed-accent)] hover:underline"
            >
              Need help? Contact support
            </a>
          </div>
        </div>
      </div>
    )
  }

  // Initial state: Show email entry form
  return (
    <div
      className="min-h-[85vh] flex items-center justify-center px-4 py-16"
      style={{ backgroundColor: 'var(--ed-bg)', color: 'var(--ed-fg)' }}
    >
      <div
        className="max-w-lg w-full rounded-2xl border p-8 sm:p-10 shadow-lg text-center space-y-6"
        style={{
          borderColor: 'var(--ed-rule)',
          backgroundColor: 'var(--ed-surface)',
        }}
      >
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto border"
          style={{
            borderColor: 'var(--ed-rule)',
            backgroundColor: 'var(--ed-bg)',
            color: 'var(--ed-accent)',
          }}
        >
          <ShieldCheck size={24} />
        </div>

        <div className="space-y-2">
          <div
            className="text-[11px] font-bold uppercase tracking-widest text-[var(--ed-accent)]"
            style={{ fontFamily: F.glacial }}
          >
            Self-Service Donor Portal
          </div>
          <h1
            className="text-3xl sm:text-4xl font-medium tracking-tight"
            style={{ fontFamily: F.display }}
          >
            Manage Contribution
          </h1>
          <p
            className="text-sm leading-relaxed text-[var(--ed-fg-muted)]"
            style={{ fontFamily: F.serif }}
          >
            Enter the email address you used for your recurring monthly contribution to receive a secure link to your Stripe billing portal.
          </p>
        </div>

        <form action="/donate/manage" className="space-y-4">
          <div className="space-y-3">
            <Input
              type="email"
              name="email"
              placeholder="name@example.com"
              required
              className="text-center h-12 rounded-xl border-[var(--ed-rule)] bg-[var(--ed-bg)]"
            />
            <button
              type="submit"
              className="w-full h-12 rounded-xl font-semibold text-sm inline-flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm"
              style={{
                backgroundColor: 'var(--ed-accent)',
                color: 'var(--ed-bg)',
                fontFamily: F.serif,
              }}
            >
              <span>Continue to Billing Portal</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </form>

        <div className="pt-4 border-t flex items-center justify-between gap-4 text-xs" style={{ borderColor: 'var(--ed-rule)' }}>
          <Link
            href="/donate"
            className="inline-flex items-center gap-1 text-[var(--ed-fg-muted)] hover:text-[var(--ed-fg)] transition-colors"
          >
            <ChevronLeft size={14} />
            <span>Back to Donate</span>
          </Link>

          <span className="text-[var(--ed-fg-muted)] font-mono text-[11px]">
            Powered by Stripe Billing
          </span>
        </div>
      </div>
    </div>
  )
}
