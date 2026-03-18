import Image from 'next/image'
import Link from 'next/link'
import fs from 'fs'
import path from 'path'
import { About } from '@/constants/about'
import { LegalMarkdown } from '@/components/legal-markdown'

export const metadata = {
  title: 'Terms of Use - WikiSubmission',
  description: 'Terms of Use for WikiSubmission',
  keywords: [
    'WikiSubmission',
    'Terms of Use',
    'WikiSubmission Terms',
    'WikiSubmission Terms of Use',
  ],
  openGraph: {
    title: 'Terms of Use - WikiSubmission',
    description: 'Terms of Use for WikiSubmission',
    url: '/legal/terms-of-use',
    images: [
      {
        url: '/brand-assets/logo-black.png',
        width: 64,
        height: 64,
        alt: 'WikiSubmission Logo',
      },
    ],
  },
}

export default function TermsOfService() {
  const content = fs.readFileSync(
    path.join(process.cwd(), 'content/legal/en/terms-of-use.md'),
    'utf8'
  )

  return (
    <main className="flex flex-col min-h-screen items-center justify-center text-center space-y-8 md:p-24 p-4">
      <Link href="/">
        <Image
          src="/brand-assets/logo-transparent.png"
          alt="WikiSubmission Logo"
          width={72}
          height={72}
          className="rounded-full"
        />
      </Link>
      <section className="max-w-sm flex gap-4 max-w-md items-center">
        <h1 className="text-3xl font-semibold">Terms of Use</h1>
      </section>

      <section className="max-w-2xl text-left space-y-4">
        <LegalMarkdown content={content} />

        <h2 className="text-lg font-semibold mb-2 mt-6">Questions &amp; Contact Information</h2>
        <p className="text-sm text-muted-foreground">
          Questions or comments about the Service may be directed to us at{' '}
          <a href={`mailto:${About.email}`} className="text-primary hover:underline">
            <strong>{About.email}</strong>
          </a>
          .
        </p>
      </section>

      <section className="max-w-md flex flex-wrap gap-2 text-sm [&>a]:text-muted-foreground [&>a]:hover:text-violet-600 [&>a]:transition-colors">
        <Link href="/">Home</Link>
      </section>
    </main>
  )
}
