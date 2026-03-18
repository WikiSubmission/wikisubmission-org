'use client'

import { Button } from '@/components/ui/button'
import { About } from '@/constants/about'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { useTranslations } from 'next-intl'

export default function Page() {
  const router = useRouter()
  const t = useTranslations('common')
  const tNav = useTranslations('nav')

  return (
    <div>
      <main className="flex flex-col min-h-screen items-center justify-center space-y-8">
        <div className="flex gap-4">
          <Link href="/">
            <Image
              src="/brand-assets/logo-transparent.png"
              alt="WikiSubmission Logo"
              width={72}
              height={72}
              className="rounded-full"
            />
          </Link>
        </div>
        <p className="w-xs text-center">{t('notFound')}</p>
        <div className="flex gap-4 w-xs">
          <Button
            variant="default"
            onClick={() => router.back()}
            className="cursor-pointer"
          >
            {t('returnToPrevious')}
          </Button>
          <a href={`mailto:${About.email}`}>
            <Button variant="outline" className="cursor-pointer">
              {tNav('contact')}
            </Button>
          </a>
        </div>
      </main>
    </div>
  )
}
