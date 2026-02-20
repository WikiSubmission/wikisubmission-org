import { stripe } from '@/lib/stripe'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { ChevronLeft, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default async function ManageDonationPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>
}) {
  const { email } = await searchParams

  if (email) {
    // Try to find customer by email
    const customers = await stripe().customers.list({
      email: email.trim().toLowerCase(),
      limit: 1,
    })

    if (customers.data.length > 0) {
      const customerId = customers.data[0].id

      try {
        // Create billing portal session
        const session = await stripe().billingPortal.sessions.create({
          customer: customerId,
          return_url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://wikisubmission.org'}/donate`,
        })

        if (session.url) {
          redirect(session.url)
        }
      } catch (error) {
        console.error('Error creating billing portal session:', error)
      }
    }

    // If no customer found or error occurred, show the form with an error message
    return (
      <main className="flex flex-col min-h-screen items-center justify-center text-center space-y-6 md:p-24 p-8">
        <Link href="/">
          <Image
            src="/brand-assets/logo-transparent.png"
            alt="WikiSubmission Logo"
            width={72}
            height={72}
            className="rounded-full"
          />
        </Link>

        <div className="max-w-md w-full space-y-6">
          <div className="space-y-2">
            <h1 className="text-3xl font-semibold">No Account Found</h1>
            <p className="text-muted-foreground">
              We couldn&apos;t find an active subscription for{' '}
              <span className="font-medium text-foreground">{email}</span>.
            </p>
          </div>

          <form action="/donate/manage" className="space-y-4">
            <div className="flex flex-col gap-2">
              <Input
                type="email"
                name="email"
                placeholder="Enter your email address"
                defaultValue={email}
                required
                className="text-center"
              />
              <Button type="submit" className="w-full">
                <Search className="mr-2 size-4" />
                Try Another Email
              </Button>
            </div>
          </form>
        </div>

        <div className="flex flex-col gap-4">
          <Link
            href="/donate"
            className="text-violet-600 hover:underline font-medium"
          >
            Return to Donation Page
          </Link>

          <Link
            href="/"
            className="flex items-center justify-center gap-2 text-muted-foreground hover:text-violet-600"
          >
            <ChevronLeft className="size-4" />
            <p className="text-sm">Back to Home</p>
          </Link>
        </div>
      </main>
    )
  }

  // Initial state: Show email entry form
  return (
    <main className="flex flex-col min-h-screen items-center justify-center text-center space-y-6 md:p-24 p-8">
      <Link href="/">
        <Image
          src="/brand-assets/logo-transparent.png"
          alt="WikiSubmission Logo"
          width={72}
          height={72}
          className="rounded-full"
        />
      </Link>

      <div className="max-w-md w-full space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold">Manage Contribution</h1>
          <p className="text-muted-foreground">
            Enter the email address you used for your monthly contribution to
            receive a secure management link.
          </p>
        </div>

        <form action="/donate/manage" className="space-y-4">
          <div className="flex flex-col gap-2">
            <Input
              type="email"
              name="email"
              placeholder="email@example.com"
              required
              className="text-center"
            />
            <Button type="submit" className="w-full">
              Continue to Billing Portal
            </Button>
          </div>
        </form>
      </div>

      <div className="flex flex-col gap-4 pt-4">
        <Link
          href="/donate"
          className="text-muted-foreground hover:text-violet-600 flex items-center justify-center gap-2"
        >
          <ChevronLeft className="size-4" />
          <p className="text-sm">Back to Donate</p>
        </Link>
      </div>
    </main>
  )
}
