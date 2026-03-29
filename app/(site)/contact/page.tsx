import { About } from '@/constants/about'
import { Mail, Github, MessageSquare, ExternalLink, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Contact | WikiSubmission',
  description: 'Get in touch with the WikiSubmission team.',
}

export default async function ContactPage() {
  const t = await getTranslations('contact')

  const channels = [
    {
      key: 'email',
      href: `mailto:${About.email}`,
      icon: Mail,
      title: t('email'),
      description: t('emailDesc'),
      label: About.email,
      external: false,
    },
    {
      key: 'github',
      href: About.social.github,
      icon: Github,
      title: t('github'),
      description: t('githubDesc'),
      label: 'github.com/wikisubmission',
      external: true,
    },
    {
      key: 'discord',
      href: About.social.discord,
      icon: MessageSquare,
      title: t('discord'),
      description: t('discordDesc'),
      label: 'discord.gg/wikisubmission',
      external: true,
    },
  ]

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="border-b border-border/40 bg-muted/30">
        <div className="max-w-5xl mx-auto px-6 py-12">
          <span className="inline-block px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-bold mb-4">
            WikiSubmission
          </span>
          <h1 className="font-headline text-4xl md:text-5xl font-extrabold tracking-tight mb-3">
            {t('heading')}
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl">
            {t('description')}
          </p>
        </div>
      </section>

      {/* Contact channels */}
      <section className="max-w-5xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {channels.map(({ key, href, icon: Icon, title, description, label, external }) => (
            <a
              key={key}
              href={href}
              {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
              className="group flex flex-col gap-4 p-6 rounded-2xl border border-border/40 bg-muted/20 hover:bg-muted/40 hover:border-border transition-all editorial-shadow"
            >
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary group-hover:bg-primary/20 transition-colors">
                <Icon size={20} />
              </div>
              <div className="flex-1">
                <h3 className="font-headline font-bold text-base leading-snug mb-1">
                  {title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {description}
                </p>
              </div>
              <span className="flex items-center gap-1 text-xs text-primary font-semibold truncate">
                {label}
                {external ? <ExternalLink size={11} className="shrink-0" /> : <ArrowRight size={11} className="shrink-0" />}
              </span>
            </a>
          ))}
        </div>
      </section>
    </div>
  )
}
