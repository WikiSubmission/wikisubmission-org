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

// 1. Data Structure for easier management
const SERVICES = [
  {
    title: 'Final Testament',
    desc: 'Read on the Web',
    href: '/quran',
    icon: '/brand-assets/logo-transparent.png',
    isImage: true,
  },
  {
    title: 'The Bible',
    desc: 'Coming Soon',
    href: '/bible',
    icon: '/brand-assets/logo-transparent.png',
    isImage: true,
    disabled: true,
  },
  {
    title: 'Music',
    desc: 'Glorification and melodies',
    href: '/music',
    icon: <Music2Icon className="size-6" />,
  },
  {
    title: 'Prayer Times',
    desc: 'Accurate daily timings',
    href: '/prayer-times',
    icon: <HeartIcon className="size-6" />,
  },
  {
    title: 'Ramadan',
    desc: 'Fasting schedule',
    href: '/ramadan',
    icon: <MoonIcon className="size-6" />,
  },
  {
    title: 'Search',
    desc: 'Media, scripture, etc',
    href: '/search',
    icon: <SearchIcon className="size-6" />,
  },
]

const TOOLS = [
  {
    title: 'iOS App',
    desc: 'iPhone, iPad and Mac',
    href: 'https://apps.apple.com/app/id6444260632',
    icon: <FaApple className="size-6" />,
  },
  {
    title: 'Downloads',
    desc: 'Free resources & PDFs',
    href: '/downloads',
    icon: <DownloadIcon className="size-6" />,
  },
  {
    title: 'Discord Bot',
    desc: 'Add to your server',
    href: 'https://discord.com/...',
    icon: <FaDiscord className="size-6" />,
  },
]

export default function Home() {
  return (
    <main className="flex flex-col h-screen max-w-5xl mx-auto md:p-10 p-4 space-y-12">
      {/* Header  */}
      <header className="flex justify-between items-center w-full">
        <div className="flex items-center gap-3">
          <Image
            src="/brand-assets/logo-transparent.png"
            alt="Logo"
            width={48}
            height={48}
            className="rounded-full"
          />
          <h1 className="text-2xl font-bold tracking-tight">WikiSubmission</h1>
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
          Platforms & Tools
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
        <div className="max-w-2xl text-center text-sm text-muted-foreground space-y-4">
          <p>
            WikiSubmission is a faith-based 501(c)(3) nonprofit organization...
            <Link
              href="https://library.wikisubmission.org/file/quran-the-final-testament"
              className="underline ml-1"
            >
              Learn more
            </Link>
          </p>
        </div>

        <div className="flex flex-col md:flex-row justify-between w-full items-center gap-6 text-xs text-muted-foreground">
          <div className="flex gap-4">
            <Link
              href="/contact"
              className="hover:text-violet-600 flex items-center gap-1"
            >
              <FaEnvelope /> Contact
            </Link>
            <Link
              href="/donate"
              className="hover:text-violet-600 flex items-center gap-1"
            >
              <FaHeart /> Donate
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
            <Link href="/legal/terms-of-use">Terms</Link>
            <Link href="/legal/privacy-policy">Privacy</Link>
          </div>
        </div>

        <p className="font-mono tracking-widest text-[10px] opacity-50 uppercase cursor-pointer">
          WIKISUBMISSION.ORG
        </p>
      </footer>
    </main>
  )
}
