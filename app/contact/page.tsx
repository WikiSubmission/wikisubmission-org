import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemTitle,
} from '@/components/ui/item'
import { About } from '@/constants/about'
import {
  ChevronRight,
  Mail,
  Github,
  MessageSquare,
  ChevronLeft,
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { getTranslations } from 'next-intl/server'

export default async function ContactPage() {
  const t = await getTranslations('contact')
  const tCommon = await getTranslations('common')

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
        <h1 className="text-3xl font-semibold">{t('heading')}</h1>
      </section>

      <section className="max-w-sm text-center text-sm text-muted-foreground">
        <p>{t('description')}</p>
      </section>

      <hr className="w-xs" />

      <section className="max-w-sm flex flex-col gap-4">
        <Item asChild variant="outline">
          <a href={`mailto:${About.email}`}>
            <ItemContent>
              <ItemTitle>{t('email')}</ItemTitle>
              <ItemDescription>{t('emailDesc')}</ItemDescription>
            </ItemContent>
            <ItemActions>
              <Mail className="size-4" />
              <ChevronRight className="size-4" />
            </ItemActions>
          </a>
        </Item>

        <Item asChild variant="outline">
          <Link
            href={About.social.github}
            target="_blank"
            rel="noopener noreferrer"
          >
            <ItemContent>
              <ItemTitle>{t('github')}</ItemTitle>
              <ItemDescription>{t('githubDesc')}</ItemDescription>
            </ItemContent>
            <ItemActions>
              <Github className="size-4" />
              <ChevronRight className="size-4" />
            </ItemActions>
          </Link>
        </Item>

        <Item asChild variant="outline">
          <Link
            href={About.social.discord}
            target="_blank"
            rel="noopener noreferrer"
          >
            <ItemContent>
              <ItemTitle>{t('discord')}</ItemTitle>
              <ItemDescription>{t('discordDesc')}</ItemDescription>
            </ItemContent>
            <ItemActions>
              <MessageSquare className="size-4" />
              <ChevronRight className="size-4" />
            </ItemActions>
          </Link>
        </Item>
      </section>

      <section>
        <Link
          href="/"
          className="flex items-center gap-2 text-muted-foreground hover:text-violet-600"
        >
          <ChevronLeft className="size-4" />
          <p className="text-sm">{tCommon('backToHome')}</p>
        </Link>
      </section>
    </main>
  )
}
