import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemTitle,
} from '@/components/ui/item'
import { About } from '@/constants/about'
import {
  FaApple,
  FaDiscord,
  FaTwitter,
  FaYoutube,
  FaChevronRight,
  FaGithub,
  FaHeart,
  FaEnvelope,
} from 'react-icons/fa'
import {
  DownloadIcon,
  HeartIcon,
  Music2Icon,
  MoonIcon,
  SearchIcon,
} from 'lucide-react'
import { PageSwitcher } from '@/components/page-switcher'
import { ThemeToggle } from '@/components/toggles/theme-toggle'
import Image from 'next/image'
import Link from 'next/link'
import { getTranslations } from 'next-intl/server'

export default async function Home() {
  const t = await getTranslations('home')
  const tNav = await getTranslations('nav')

  const SERVICES = [
    {
      title: t('services.finalTestament'),
      desc: t('services.finalTestamentDesc'),
      href: '/quran',
      icon: '/brand-assets/logo-transparent.png',
      isImage: true,
    },
    {
      title: t('services.bible'),
      desc: t('services.bibleDesc'),
      href: '/bible',
      icon: '/brand-assets/logo-transparent.png',
      isImage: true,
      disabled: true,
    },
    {
      title: t('services.music'),
      desc: t('services.musicDesc'),
      href: '/music',
      icon: <Music2Icon className="size-6" />,
    },
    {
      title: t('services.prayerTimes'),
      desc: t('services.prayerTimesDesc'),
      href: '/prayer-times',
      icon: <HeartIcon className="size-6" />,
    },
    {
      title: t('services.ramadan'),
      desc: t('services.ramadanDesc'),
      href: '/ramadan',
      icon: <MoonIcon className="size-6" />,
    },
    {
      title: t('services.search'),
      desc: t('services.searchDesc'),
      href: '/search',
      icon: <SearchIcon className="size-6" />,
    },
  ]

  const TOOLS = [
    {
      title: t('tools.iosApp'),
      desc: t('tools.iosAppDesc'),
      href: 'https://apps.apple.com/app/id6444260632',
      icon: <FaApple className="size-6" />,
    },
    {
      title: t('tools.downloads'),
      desc: t('tools.downloadsDesc'),
      href: '/downloads',
      icon: <DownloadIcon className="size-6" />,
    },
    {
      title: t('tools.discordBot'),
      desc: t('tools.discordBotDesc'),
      href: 'https://discord.com/...',
      icon: <FaDiscord className="size-6" />,
    },
  ]

  return (
    <main className="flex flex-col h-screen max-w-5xl mx-auto md:p-10 p-4 space-y-12">
      {/* Header  */}
      <header className="flex justify-between items-center w-full">
        <div className="flex items-center gap-1 lg:gap-3">
          <Image
            src="/brand-assets/logo-transparent.png"
            alt="Logo"
            width={48}
            height={48}
            className="rounded-full size-6 lg:size-10"
          />
          <h1 className="text-[0.9rem] lg:text-2xl font-bold tracking-tight">
            WikiSubmission
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <PageSwitcher currentPage="home" />
          <ThemeToggle />
        </div>
      </header>

      {/* Services  */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {SERVICES.map((service) => (
          <Item
            key={service.title}
            asChild
            variant="outline"
            className={
              service.disabled ? 'opacity-50 grayscale pointer-events-none' : ''
            }
          >
            <Link href={service.href}>
              <ItemContent>
                <ItemTitle>{service.title}</ItemTitle>
                <ItemDescription>{service.desc}</ItemDescription>
              </ItemContent>
              <ItemActions>
                {service.isImage ? (
                  <Image
                    src={service.icon as string}
                    className="size-6 rounded-full"
                    alt={service.title}
                    width={24}
                    height={24}
                  />
                ) : (
                  service.icon
                )}
                <FaChevronRight className="size-4 opacity-50" />
              </ItemActions>
            </Link>
          </Item>
        ))}
      </section>

      {/* Tools  */}
      <section className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground text-center">
          {t('platformsAndTools')}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {TOOLS.map((tool) => (
            <Item
              key={tool.title}
              asChild
              variant="outline"
              className="border-none shadow-none bg-muted/30"
            >
              <Link href={tool.href}>
                <ItemContent>
                  <ItemTitle>{tool.title}</ItemTitle>
                  <ItemDescription>{tool.desc}</ItemDescription>
                </ItemContent>
                <ItemActions>{tool.icon}</ItemActions>
              </Link>
            </Item>
          ))}
        </div>
      </section>

      {/* about  */}
      <footer className="pt-10 border-t space-y-8 flex flex-col items-center">
        <div className="max-w-2xl text-center text-sm text-muted-foreground space-y-4 text-ellipsis">
          <p>
            {t('aboutText')}
            <Link
              href="https://library.wikisubmission.org/file/quran-the-final-testament"
              className="underline ml-1"
            >
              {t('learnMore')}
            </Link>
          </p>
        </div>

        <div className="flex flex-col md:flex-row justify-between w-full items-center gap-6 text-xs text-muted-foreground">
          <div className="flex gap-4">
            <Link
              href="/contact"
              className="hover:text-violet-600 flex items-center gap-1"
            >
              <FaEnvelope /> {tNav('contact')}
            </Link>
            <Link
              href="/donate"
              className="hover:text-violet-600 flex items-center gap-1"
            >
              <FaHeart /> {tNav('donate')}
            </Link>
          </div>

          <div className="flex gap-4 text-foreground/60">
            <Link href={About.social.github}>
              <FaGithub className="size-5" />
            </Link>
            <Link href={About.social.twitter}>
              <FaTwitter className="size-5" />
            </Link>
            <Link href={About.social.youtube}>
              <FaYoutube className="size-5" />
            </Link>
            <Link href={About.social.discord}>
              <FaDiscord className="size-5" />
            </Link>
          </div>

          <div className="flex gap-4">
            <Link href="/legal/terms-of-use">{t('terms')}</Link>
            <Link href="/legal/privacy-policy">{t('privacy')}</Link>
          </div>
        </div>

        <p className="font-mono tracking-widest text-[10px] opacity-50 uppercase cursor-pointer">
          {t('brandDomain')}
        </p>
      </footer>
    </main>
  )
}
