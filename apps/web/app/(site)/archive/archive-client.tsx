'use client'

import { useState, useEffect, useCallback, useMemo, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import {
  SearchIcon,
  AlertCircleIcon,
  PlayIcon,
  NewspaperIcon,
  ArrowUpRight,
  InfoIcon,
  ChevronDownIcon,
  XIcon,
  BookOpen,
  Download,
} from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ws } from '@/lib/wikisubmission-sdk'
import { highlightMarkdown } from '@/lib/highlight-markdown'
import Image from 'next/image'
import Link from 'next/link'
import type { Database } from 'wikisubmission-sdk'
import { useTranslations } from 'next-intl'
import { cn } from '@/lib/utils'
import { F } from '@/app/(site)/_sections/shared'

type MediaRow = Database['public']['Tables']['ws_media']['Row']
type NewsletterRow = Database['public']['Tables']['ws_newsletters']['Row']

// Default seed query for featured content when user hasn't searched.
const FEATURED_QUERY = 'God'

type Tab = 'media' | 'newsletters' | 'books'
type AuthorFilter = 'all' | 'rashad' | 'other'

interface ArchiveBookItem {
  id: string
  title: string
  author: string
  authorType: 'rashad' | 'other'
  year?: string
  categoryLabel: string
  description: string
  coverImg?: string
  themeColor?: string
  tags: string[]
  links: { label: string; url: string }[]
}

const ARCHIVE_BOOKS: ArchiveBookItem[] = [
  // ─── 01: Dr. Rashad Khalifa Authored Works ──────────────────────────────
  {
    id: 'quran-the-final-testament',
    title: 'Quran: The Final Testament',
    author: 'Dr. Rashad Khalifa, Ph.D.',
    authorType: 'rashad',
    year: '1989',
    categoryLabel: 'Authorized Translation',
    description:
      'The authorized English translation of the Quran with extensive explanatory footnotes, subject index, and all 38 research appendices by God’s Messenger of the Covenant.',
    coverImg: '/images/books/quran-the-final-testament/quran-front.webp',
    themeColor: '#0a1e3f',
    tags: ['Scripture', 'Authorized Translation', '38 Appendices', 'Arabic Text'],
    links: [
      { label: 'Full English Edition (PDF)', url: 'https://library.wikisubmission.org/file/quran-the-final-testament' },
      { label: 'All 38 Appendices', url: 'https://library.wikisubmission.org/file/quran-the-final-testament-appendices' },
      { label: 'Turkish Translation', url: 'https://library.wikisubmission.org/file/quran-the-final-testament-turkish' },
      { label: 'French Translation', url: 'https://library.wikisubmission.org/file/quran-the-final-testament-french' },
    ],
  },
  {
    id: 'visual-presentation',
    title: 'Visual Presentation of the Miracle',
    author: 'Dr. Rashad Khalifa, Ph.D.',
    authorType: 'rashad',
    year: '1982',
    categoryLabel: 'Mathematical Proof',
    description:
      'A landmark publication presenting the physical, verifiable mathematical evidence proving the divine authorship and miraculous preservation of the Quran through Code 19 with extensive charts and facsimiles.',
    coverImg: '/images/books/quran-visual-presentation/qvp-front.webp',
    themeColor: '#0a235c',
    tags: ['Miracle of 19', 'Charts & Visual Proof', 'Initial Letters'],
    links: [
      { label: 'Download PDF', url: 'https://library.wikisubmission.org/file/visual-presentation-of-the-miracle' },
    ],
  },
  {
    id: 'quran-hadith-islam',
    title: 'Quran, Hadith, and Islam',
    author: 'Dr. Rashad Khalifa, Ph.D.',
    authorType: 'rashad',
    year: '1982',
    categoryLabel: 'Theological Treatise',
    description:
      'A comprehensive theological treatise establishing the absolute authority of the Quran as the sole, fully detailed source of religious law, contrasting divine scripture with invented traditions.',
    coverImg: '/images/books/quran-hadith-and-islam/qhi-front.webp',
    themeColor: '#3c1216',
    tags: ['Sole Source of Law', 'Scripture Analysis', 'Pure Monotheism'],
    links: [
      { label: 'Original Edition (PDF)', url: 'https://library.wikisubmission.org/file/quran-hadith-and-islam-original' },
      { label: 'Standard PDF', url: 'https://library.wikisubmission.org/file/quran-hadith-and-islam' },
    ],
  },
  {
    id: 'computer-speaks',
    title: "The Computer Speaks: God's Message to The World",
    author: 'Dr. Rashad Khalifa, Ph.D.',
    authorType: 'rashad',
    year: '1981',
    categoryLabel: 'Computer Research',
    description:
      'The seminal monograph documenting the computerized analysis of the Quranic initial letters and the revelation of the interlocking numerical code.',
    coverImg: '/images/books/the-computer-speaks/tcs-front.webp',
    themeColor: '#122543',
    tags: ['Computer Study', 'Initial Letters', 'Quranic Counts'],
    links: [
      { label: 'Download PDF', url: 'https://library.wikisubmission.org/file/the-computer-speaks' },
    ],
  },
  {
    id: 'miracle-of-quran-alphabets',
    title: 'The Miracle of the Quran: Significance of the Mysterious Alphabets',
    author: 'Dr. Rashad Khalifa, Ph.D.',
    authorType: 'rashad',
    year: '1973',
    categoryLabel: 'Seminal Discovery',
    description:
      'Dr. Khalifa’s historic 1973 publication presenting the earliest computerized discoveries on the significance and mathematical role of the mysterious Quranic initials (Muqatta’at).',
    coverImg: '/images/books/covers/miracle-of-quran-alphabets.webp',
    themeColor: '#1e3a8a',
    tags: ['First 19 Discovery', 'Mysterious Alphabets', 'Muqatta’at'],
    links: [
      { label: 'Download PDF', url: 'https://library.wikisubmission.org/file/miracle-of-the-quran-significance-of-the-mysterious-alphabets' },
    ],
  },
  {
    id: 'perpetual-miracle',
    title: 'Quran: The Perpetual Miracle of Muhammad',
    author: 'Dr. Rashad Khalifa, Ph.D.',
    authorType: 'rashad',
    year: '1976',
    categoryLabel: 'Historical Monograph',
    description:
      'Landmark 1976 monograph detailing the mathematical architecture and physical proofs proving the Quran as the perpetual, physical miracle of Islam.',
    coverImg: '/images/books/covers/perpetual-miracle.webp',
    themeColor: '#065f46',
    tags: ['Perpetual Miracle', 'Physical Proof', 'Historical Record'],
    links: [
      { label: 'Download PDF', url: 'https://library.wikisubmission.org/file/the-perpetual-miracle-of-muhammad' },
    ],
  },
  {
    id: 'english-meanings-of-the-quran',
    title: 'The English Meanings of the Quran',
    author: 'Dr. Rashad Khalifa, Ph.D.',
    authorType: 'rashad',
    year: '1981',
    categoryLabel: 'English Translation',
    description:
      'Historic earlier volume containing Dr. Rashad Khalifa’s English translation and contextual meanings of the Holy Quranic revelation.',
    coverImg: '/images/books/covers/english-meanings-of-the-quran.webp',
    themeColor: '#78350f',
    tags: ['Early Translation', 'Verse Commentary', 'Monotheism'],
    links: [
      { label: 'Download PDF', url: 'https://library.wikisubmission.org/file/english-meanings-of-the-quran' },
    ],
  },
  {
    id: 'salat-booklet',
    title: 'The Contact Prayers (Salat): Instructions Booklet',
    author: 'Dr. Rashad Khalifa, Ph.D.',
    authorType: 'rashad',
    year: '1988',
    categoryLabel: 'Worship Guidelines',
    description:
      'Complete procedural booklet detailing the step-by-step performance of the five daily Contact Prayers (Salat) in accordance with Quranic decrees.',
    coverImg: '/images/books/covers/salat-booklet.webp',
    themeColor: '#1e293b',
    tags: ['Contact Prayers', 'Five Daily Prayers', 'Worship Guidelines'],
    links: [
      { label: 'Download Booklet', url: 'https://library.wikisubmission.org/file/salat-the-contact-prayers' },
    ],
  },
  {
    id: 'eternity-screenplay',
    title: 'Eternity: A Screenplay',
    author: 'Dr. Rashad Khalifa, Ph.D.',
    authorType: 'rashad',
    year: '1986',
    categoryLabel: 'Dramatic Screenplay',
    description:
      'An original dramatic screenplay depicting the grand creation, the celestial feud in heaven, earthly redemption, and the cosmic journey toward eternity.',
    coverImg: '/images/books/covers/eternity-screenplay.webp',
    themeColor: '#581c87',
    tags: ['Screenplay', 'Cosmic History', 'Creation & Eternity'],
    links: [
      { label: 'Download Screenplay (PDF)', url: 'https://library.wikisubmission.org/file/eternity-screenplay' },
    ],
  },
  {
    id: 'islam-vol-1-no-1',
    title: 'ISLAM: The Message of Peace (Vol. 1, No. 1)',
    author: 'Dr. Rashad Khalifa, Ph.D. (Editor)',
    authorType: 'rashad',
    year: 'April 1974',
    categoryLabel: 'Historical Journal',
    coverImg: '/images/books/covers/islam-volume-1-number-1-april-1974.webp',
    themeColor: '#1e293b',
    description:
      'Inaugural issue of the Tucson community journal published by Dr. Khalifa, featuring foundational articles on the purpose of creation, monotheism, and early discoveries.',
    tags: ['Community Journal', 'Founding Years', 'Tucson Masjid'],
    links: [
      { label: 'Download Issue (PDF)', url: 'https://library.wikisubmission.org/file/islam-vol-1-no-1' },
    ],
  },
  {
    id: 'islam-vol-1-no-2',
    title: 'ISLAM: The Message of Peace (Vol. 1, No. 2)',
    author: 'Dr. Rashad Khalifa, Ph.D. (Editor)',
    authorType: 'rashad',
    year: 'July 1974',
    categoryLabel: 'Historical Journal',
    coverImg: '/images/books/covers/islam-volume-1-number-2-july-1974.webp',
    themeColor: '#1e293b',
    description:
      'Second issue of the historic journal exploring Quranic scientific insights, religious freedom in Islam, and the physical preservation of scripture.',
    tags: ['Community Journal', 'Scripture Study', 'Early Publications'],
    links: [
      { label: 'Download Issue (PDF)', url: 'https://library.wikisubmission.org/file/islam-vol-1-no-2' },
    ],
  },
  {
    id: 'islam-vol-1-no-3-4',
    title: 'ISLAM: The Message of Peace (Vol. 1, No. 3 & 4)',
    author: 'Dr. Rashad Khalifa, Ph.D. (Editor)',
    authorType: 'rashad',
    year: 'January 1975',
    categoryLabel: 'Historical Journal',
    coverImg: '/images/books/covers/islam-volume-1-number-3-4-january-1975.webp',
    themeColor: '#1e293b',
    description:
      'Double issue presenting the universal brotherhood of believers, the Quranic definition of peace, and detailed mathematical research notes.',
    tags: ['Community Journal', 'Double Issue', 'Historical Archive'],
    links: [
      { label: 'Download Issue (PDF)', url: 'https://library.wikisubmission.org/file/islam-vol-1-no-3-4' },
    ],
  },

  // ─── 02: Other Authors & Community Research ─────────────────────────────
  {
    id: 'beyond-probability-1',
    title: "Beyond Probability: God's Message in Mathematics (Series I)",
    author: 'Abdullah Arik',
    authorType: 'other',
    year: '1995',
    categoryLabel: 'Statistical Monograph',
    description:
      'Comprehensive study on the probability mechanics and statistical impossibility of human authorship in the numerical composition of the Quran.',
    themeColor: '#1e293b',
    tags: ['Probability Theory', 'Mathematical Confirmation', 'Statistics'],
    links: [
      { label: 'Download PDF', url: 'https://library.wikisubmission.org/file/beyond-probability' },
    ],
  },
  {
    id: 'beyond-probability-2',
    title: "Beyond Probability: God's Message in Mathematics (Series II)",
    author: 'Abdullah Arik',
    authorType: 'other',
    year: '1998',
    categoryLabel: 'Statistical Monograph',
    description:
      'The second volume of the Beyond Probability series exploring further structural dimensions and parameters of the 19-based system.',
    themeColor: '#1e293b',
    tags: ['Probability Theory', 'Quranic Structure', 'Advanced Proofs'],
    links: [
      { label: 'Download PDF', url: 'https://library.wikisubmission.org/file/beyond-probability-series-2' },
    ],
  },
  {
    id: 'math-miracle',
    title: 'The Math Miracle: Intended or Coincidence?',
    author: 'Mike J.',
    authorType: 'other',
    year: '1992',
    categoryLabel: 'Research Essay',
    description:
      'An accessible, step-by-step introduction and rigorous mathematical evaluation examining whether the Quranic numerical patterns could occur by coincidence.',
    themeColor: '#1e293b',
    tags: ['Introductory Proof', 'Combinatorics', 'Coincidence Analysis'],
    links: [
      { label: 'Download PDF', url: 'https://library.wikisubmission.org/file/math-miracle-intended-or-coincidence' },
    ],
  },
  {
    id: 'nineteen-signature',
    title: "Nineteen: God's Signature in Nature and Scripture",
    author: 'Edip Yuksel',
    authorType: 'other',
    year: '2011',
    categoryLabel: 'Comparative Study',
    description:
      'An investigative work exploring the mathematical signature of nineteen across natural laws, biblical scripture, and the Quranic text.',
    themeColor: '#1e293b',
    tags: ['Comparative Religion', 'Nature & Mathematics', 'Code 19'],
    links: [
      { label: 'Download PDF', url: 'https://library.wikisubmission.org/file/nineteen-gods-signature-in-nature-and-scripture' },
    ],
  },
  {
    id: 'ultimate-miracle',
    title: 'Al-Quran: The Ultimate Miracle',
    author: 'Ahmed Deedat',
    authorType: 'other',
    year: '1979',
    categoryLabel: 'Historical Booklet',
    description:
      'Early historic publication presenting the initial discoveries of Dr. Rashad Khalifa’s research on the mathematical miracle to international audiences.',
    themeColor: '#1e293b',
    tags: ['Early Discoveries', 'Comparative Analysis', 'Historical Record'],
    links: [
      { label: 'Download PDF', url: 'https://library.wikisubmission.org/file/ultimate-miracle-of-the-quran' },
    ],
  },
]

export default function ArchiveClient() {
  const t = useTranslations('archive')
  const heroTitlePrefix = t('heroTitlePrefix')

  return (
    <div
      style={{ backgroundColor: 'var(--ed-bg)', color: 'var(--ed-fg)' }}
      className="min-h-screen"
    >
      {/* Hero Section */}
      <section className="border-b border-border/40 bg-gradient-to-b from-muted/30 via-muted/10 to-background">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 md:px-10 pt-14 pb-12 sm:pt-20 sm:pb-16">
          <div className="flex items-center gap-2 text-[11px] font-mono tracking-widest text-primary uppercase mb-4">
            <span>HISTORICAL CORPUS</span>
            <span>·</span>
            <span>WIKISUBMISSION</span>
          </div>

          <h1
            style={{
              fontFamily: F.display,
              fontSize: 'clamp(44px, 8vw, 84px)',
              fontWeight: 400,
              lineHeight: 0.98,
              letterSpacing: '-0.035em',
            }}
            className="text-foreground"
          >
            {heroTitlePrefix ? `${heroTitlePrefix} ` : ''}
            <span className="italic text-muted-foreground font-light">
              {t('heroTitleAccent')}
            </span>
          </h1>

          <p
            style={{
              fontFamily: F.serif,
              fontSize: 'clamp(15px, 3.6vw, 17px)',
              lineHeight: 1.65,
            }}
            className="text-muted-foreground max-w-[64ch] mt-6 leading-relaxed"
          >
            {t('heroDescription')}
          </p>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 md:px-10 py-10 sm:py-14">
        <Suspense
          fallback={
            <div className="text-center opacity-20 py-16">
              <PlayIcon className="size-8 mx-auto animate-spin" />
            </div>
          }
        >
          <ArchiveContent />
        </Suspense>
      </div>
    </div>
  )
}

function ArchiveContent() {
  const t = useTranslations('search')
  const tArchive = useTranslations('archive')
  const tCommon = useTranslations('common')
  const searchParams = useSearchParams()
  const router = useRouter()
  const initialQuery = searchParams.get('q') || ''
  const initialTab = (searchParams.get('type') as Tab) || 'media'

  const [searchQuery, setSearchQuery] = useState(initialQuery)
  const [activeTab, setActiveTab] = useState<Tab>(initialTab)
  const [mediaResults, setMediaResults] = useState<MediaRow[] | null>(null)
  const [newsletterResults, setNewsletterResults] = useState<
    NewsletterRow[] | null
  >(null)
  const [performedQuery, setPerformedQuery] = useState(initialQuery)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isFeatured, setIsFeatured] = useState(!initialQuery)
  const [selectedCategories, setSelectedCategories] = useState<string[]>([
    'programs',
    'sermons',
    'audios',
  ])
  const [selectedAuthorFilter, setSelectedAuthorFilter] = useState<AuthorFilter>('all')

  const performSearch = useCallback(
    async (q: string, featured = false) => {
      const query = q.trim() || FEATURED_QUERY
      setLoading(true)
      setError(null)
      try {
        const [mediaResponse, newsletterResponse] = await Promise.all([
          ws.Media.query(query, { highlight: !featured }),
          ws.Newsletters.query(query, { highlight: !featured }),
        ])
        setMediaResults(
          mediaResponse?.data ||
            (Array.isArray(mediaResponse) ? mediaResponse : [])
        )
        setNewsletterResults(
          newsletterResponse?.data ||
            (Array.isArray(newsletterResponse) ? newsletterResponse : [])
        )
        setPerformedQuery(featured ? '' : q)
        setIsFeatured(featured)
      } catch (err) {
        setError(err instanceof Error ? err.message : tCommon('error'))
        setMediaResults(null)
        setNewsletterResults(null)
      } finally {
        setLoading(false)
      }
    },
    [tCommon]
  )

  // Initial load
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSearchQuery(initialQuery)
    performSearch(initialQuery, !initialQuery)
  }, [initialQuery, performSearch])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = searchQuery.trim()
    const params = new URLSearchParams(searchParams.toString())
    if (trimmed) params.set('q', trimmed)
    else params.delete('q')
    router.push(`/archive${params.size ? `?${params.toString()}` : ''}`)
  }

  const handleClearSearch = () => {
    setSearchQuery('')
    const params = new URLSearchParams(searchParams.toString())
    params.delete('q')
    router.push(`/archive${params.size ? `?${params.toString()}` : ''}`)
  }

  const handleTabChange = (value: Tab) => {
    setActiveTab(value)
    const params = new URLSearchParams(searchParams.toString())
    params.set('type', value)
    router.push(`/archive?${params.toString()}`, { scroll: false })
  }

  const mCount = mediaResults?.length ?? 0
  const nCount = newsletterResults?.length ?? 0
  const bCount = ARCHIVE_BOOKS.length

  // Filtered books based on search & author filter
  const filteredBooks = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    return ARCHIVE_BOOKS.filter((book) => {
      // Author filter
      if (selectedAuthorFilter !== 'all' && book.authorType !== selectedAuthorFilter) {
        return false
      }
      // Search query filter
      if (!q) return true
      return (
        book.title.toLowerCase().includes(q) ||
        book.author.toLowerCase().includes(q) ||
        book.description.toLowerCase().includes(q) ||
        book.categoryLabel.toLowerCase().includes(q) ||
        book.tags.some((t) => t.toLowerCase().includes(q))
      )
    })
  }, [searchQuery, selectedAuthorFilter])

  // Split into Rashad Khalifa & Other Authors for grouped view
  const rashadBooks = useMemo(
    () => filteredBooks.filter((b) => b.authorType === 'rashad'),
    [filteredBooks]
  )
  const otherBooks = useMemo(
    () => filteredBooks.filter((b) => b.authorType === 'other'),
    [filteredBooks]
  )

  // Group media by youtube_id
  const mediaGroups = useMemo(() => {
    if (!mediaResults) return []
    const groups: Record<string, MediaRow[]> = {}
    mediaResults.forEach((item) => {
      const id = item.youtube_id
      if (!groups[id]) groups[id] = []
      groups[id].push(item)
    })
    return Object.entries(groups)
  }, [mediaResults])

  // Group newsletters by year+month
  const newsletterGroups = useMemo(() => {
    if (!newsletterResults) return []
    const groups: Record<string, NewsletterRow[]> = {}
    newsletterResults.forEach((item) => {
      const id = `${item.year}_${item.month}`
      if (!groups[id]) groups[id] = []
      groups[id].push(item)
    })
    return Object.entries(groups)
  }, [newsletterResults])

  const placeholderText =
    activeTab === 'media'
      ? tArchive('placeholderMedia')
      : activeTab === 'newsletters'
        ? tArchive('placeholderNewsletters')
        : 'Search books, research, publications…'

  return (
    <div className="space-y-8">
      {/* Minimalist Controls Section: Segmented Filter Buttons (3 Tabs) + Clean Search */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        {/* Segmented Filter Buttons: Media, Newsletters, Books */}
        <div
          role="tablist"
          className="inline-flex p-1.5 rounded-2xl border border-border/50 bg-muted/20 backdrop-blur-sm gap-1.5 overflow-x-auto no-scrollbar"
        >
          {/* 01: Media */}
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'media'}
            onClick={() => handleTabChange('media')}
            className={cn(
              'flex items-center gap-3 px-4 sm:px-5 py-2.5 rounded-xl text-left transition-all duration-200 cursor-pointer shrink-0',
              activeTab === 'media'
                ? 'bg-card text-foreground shadow-xs border border-border/60'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/40 border border-transparent'
            )}
          >
            <div className="flex flex-col">
              <span
                style={{ fontFamily: F.display }}
                className="text-base font-medium leading-none tracking-tight"
              >
                {tArchive('tabMediaLabel')}
              </span>
              <span className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground mt-0.5">
                {tArchive('tabMediaSub')}
              </span>
            </div>
            <span
              className={cn(
                'ml-1 font-mono text-[10px] px-2 py-0.5 rounded-md border transition-colors',
                activeTab === 'media'
                  ? 'bg-primary/10 text-primary border-primary/20'
                  : 'bg-muted/30 text-muted-foreground border-border/30'
              )}
            >
              {mCount}
            </span>
          </button>

          {/* 02: Newsletters */}
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'newsletters'}
            onClick={() => handleTabChange('newsletters')}
            className={cn(
              'flex items-center gap-3 px-4 sm:px-5 py-2.5 rounded-xl text-left transition-all duration-200 cursor-pointer shrink-0',
              activeTab === 'newsletters'
                ? 'bg-card text-foreground shadow-xs border border-border/60'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/40 border border-transparent'
            )}
          >
            <div className="flex flex-col">
              <span
                style={{ fontFamily: F.display }}
                className="text-base font-medium leading-none tracking-tight"
              >
                {tArchive('tabNewslettersLabel')}
              </span>
              <span className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground mt-0.5">
                {tArchive('tabNewslettersSub')}
              </span>
            </div>
            <span
              className={cn(
                'ml-1 font-mono text-[10px] px-2 py-0.5 rounded-md border transition-colors',
                activeTab === 'newsletters'
                  ? 'bg-primary/10 text-primary border-primary/20'
                  : 'bg-muted/30 text-muted-foreground border-border/30'
              )}
            >
              {nCount}
            </span>
          </button>

          {/* 03: Books */}
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'books'}
            onClick={() => handleTabChange('books')}
            className={cn(
              'flex items-center gap-3 px-4 sm:px-5 py-2.5 rounded-xl text-left transition-all duration-200 cursor-pointer shrink-0',
              activeTab === 'books'
                ? 'bg-card text-foreground shadow-xs border border-border/60'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/40 border border-transparent'
            )}
          >
            <div className="flex flex-col">
              <span
                style={{ fontFamily: F.display }}
                className="text-base font-medium leading-none tracking-tight"
              >
                Books
              </span>
              <span className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground mt-0.5">
                Publications &amp; Research
              </span>
            </div>
            <span
              className={cn(
                'ml-1 font-mono text-[10px] px-2 py-0.5 rounded-md border transition-colors',
                activeTab === 'books'
                  ? 'bg-primary/10 text-primary border-primary/20'
                  : 'bg-muted/30 text-muted-foreground border-border/30'
              )}
            >
              {bCount}
            </span>
          </button>
        </div>

        {/* Minimalist Search Bar */}
        <form
          onSubmit={handleSearch}
          className="relative flex-1 lg:max-w-md flex items-center rounded-2xl border border-border/50 bg-card/60 backdrop-blur-sm px-4 py-1.5 focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/15 transition-all shadow-2xs"
        >
          <SearchIcon className="size-4 shrink-0 text-muted-foreground" />
          <input
            type="search"
            placeholder={placeholderText}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ fontFamily: F.serif }}
            className="flex-1 h-10 px-3 border-none outline-none bg-transparent text-sm text-foreground placeholder:text-muted-foreground/60"
          />

          {searchQuery && (
            <button
              type="button"
              onClick={handleClearSearch}
              aria-label="Clear search"
              className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors mr-1 cursor-pointer"
            >
              <XIcon className="size-3.5" />
            </button>
          )}

          <kbd
            style={{ fontFamily: F.mono }}
            className="hidden sm:inline-flex items-center text-[10px] text-muted-foreground tracking-widest px-2 py-0.5 rounded-md border border-border/50 bg-muted/30"
          >
            ENTER
          </kbd>
        </form>
      </div>

      {/* Sub-bar: Category Filter Chips & Author Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
        {activeTab === 'media' && mediaResults && (
          <MinimalistCategoryFilters
            results={mediaResults}
            selectedCategories={selectedCategories}
            setSelectedCategories={setSelectedCategories}
          />
        )}

        {/* Books Author Filters */}
        {activeTab === 'books' && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-[10px] tracking-wider text-muted-foreground uppercase mr-1">
              AUTHORS:
            </span>
            {[
              { id: 'all', label: `All Books (${ARCHIVE_BOOKS.length})` },
              {
                id: 'rashad',
                label: `Dr. Rashad Khalifa (${ARCHIVE_BOOKS.filter((b) => b.authorType === 'rashad').length})`,
              },
              {
                id: 'other',
                label: `Other Authors (${ARCHIVE_BOOKS.filter((b) => b.authorType === 'other').length})`,
              },
            ].map((c) => {
              const isSelected = selectedAuthorFilter === c.id
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setSelectedAuthorFilter(c.id as AuthorFilter)}
                  className={cn(
                    'px-3.5 py-1.5 rounded-full text-xs font-mono transition-all cursor-pointer border',
                    isSelected
                      ? 'bg-primary/10 text-primary border-primary/30 font-semibold shadow-2xs'
                      : 'bg-muted/20 text-muted-foreground border-border/40 hover:text-foreground hover:border-border/70'
                  )}
                >
                  <span>{c.label}</span>
                </button>
              )
            })}
          </div>
        )}

        {isFeatured && activeTab !== 'books' ? (
          <div className="inline-flex items-center gap-1.5 text-[11px] font-mono tracking-wider text-muted-foreground uppercase ml-auto">
            <span>{tArchive('featuredLabel')}</span>
          </div>
        ) : (
          performedQuery && (
            <div className="text-xs font-mono text-muted-foreground ml-auto">
              Results for &ldquo;<span className="text-foreground">{performedQuery}</span>&rdquo;
            </div>
          )
        )}
      </div>

      {/* Results / Feedback */}
      {loading && activeTab !== 'books' && <ArchiveLoadingSkeleton />}

      {error && activeTab !== 'books' && (
        <div className="flex items-center gap-2 py-10 justify-center text-rose-500">
          <AlertCircleIcon className="size-4" />
          <span style={{ fontFamily: F.mono }} className="text-xs">{error}</span>
        </div>
      )}

      {/* TAB 1: MEDIA */}
      {activeTab === 'media' && !loading && !error && mediaResults && (
        mediaGroups.length === 0 ? (
          <EmptyState
            label={t('noResults', { query: performedQuery })}
            help={t('noResultsHelp')}
          />
        ) : (
          <div
            className="grid gap-6"
            style={{
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            }}
          >
            {mediaGroups
              .filter(([, items]) => {
                const first = items[0]
                const category = first.category?.toLowerCase() || 'programs'
                return selectedCategories.includes(category)
              })
              .map(([youtubeId, items]) => (
                <MediaCardGrid key={youtubeId} items={items} />
              ))}
          </div>
        )
      )}

      {/* TAB 2: NEWSLETTERS */}
      {activeTab === 'newsletters' && !loading && !error && newsletterResults && (
        newsletterGroups.length === 0 ? (
          <EmptyState
            label={t('noResults', { query: performedQuery })}
            help={t('noResultsHelp')}
          />
        ) : (
          <div
            className="grid gap-6"
            style={{
              gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
            }}
          >
            {newsletterGroups.map(([key, items]) => (
              <NewsletterCardGrid key={key} items={items} />
            ))}
          </div>
        )
      )}

      {/* TAB 3: BOOKS (Separated by Author Group) */}
      {activeTab === 'books' && (
        filteredBooks.length === 0 ? (
          <EmptyState
            label={t('noResults', { query: searchQuery })}
            help="Try searching by title, author name, or topic."
          />
        ) : (
          <div className="space-y-12">
            {/* Group 1: Dr. Rashad Khalifa Authored */}
            {(selectedAuthorFilter === 'all' || selectedAuthorFilter === 'rashad') &&
              rashadBooks.length > 0 && (
                <section className="space-y-6">
                  <div className="flex items-center gap-3">
                    <div>
                      <p className="text-[10px] font-mono tracking-widest text-primary uppercase font-bold">
                        FOUNDATIONAL CORPUS
                      </p>
                      <h2
                        style={{ fontFamily: F.display }}
                        className="text-2xl sm:text-3xl font-normal text-foreground leading-none mt-0.5"
                      >
                        Authored by Dr. Rashad Khalifa, Ph.D.
                      </h2>
                    </div>
                    <div className="h-px flex-1 bg-border/40 ml-4 hidden sm:block" />
                    <span className="font-mono text-xs text-muted-foreground shrink-0">
                      {rashadBooks.length} {rashadBooks.length === 1 ? 'Work' : 'Works'}
                    </span>
                  </div>

                  <div
                    className="grid gap-6"
                    style={{
                      gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                    }}
                  >
                    {rashadBooks.map((book) => (
                      <BookCardGrid key={book.id} book={book} />
                    ))}
                  </div>
                </section>
              )}

            {/* Group 2: Other Authors & Community Research */}
            {(selectedAuthorFilter === 'all' || selectedAuthorFilter === 'other') &&
              otherBooks.length > 0 && (
                <section className="space-y-6 pt-4">
                  <div className="flex items-center gap-3">
                    <div>
                      <p className="text-[10px] font-mono tracking-widest text-primary uppercase font-bold">
                        RESEARCH &amp; STUDIES
                      </p>
                      <h2
                        style={{ fontFamily: F.display }}
                        className="text-2xl sm:text-3xl font-normal text-foreground leading-none mt-0.5"
                      >
                        Other Authors &amp; Research
                      </h2>
                    </div>
                    <div className="h-px flex-1 bg-border/40 ml-4 hidden sm:block" />
                    <span className="font-mono text-xs text-muted-foreground shrink-0">
                      {otherBooks.length} {otherBooks.length === 1 ? 'Work' : 'Works'}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {otherBooks.map((book) => (
                      <ResearchBookCard key={book.id} book={book} />
                    ))}
                  </div>
                </section>
              )}
          </div>
        )
      )}

      {/* Legal / Archival Disclaimer */}
      <div className="pt-12 mt-6 border-t border-border/40 text-center">
        <p
          style={{ fontFamily: F.serif }}
          className="text-xs text-muted-foreground inline-flex items-center gap-1.5 opacity-80"
        >
          <InfoIcon className="size-3.5 text-primary shrink-0" />
          <span>{t('disclaimer')}</span>
        </p>
      </div>
    </div>
  )
}

function MinimalistCategoryFilters({
  results,
  selectedCategories,
  setSelectedCategories,
}: {
  results: MediaRow[]
  selectedCategories: string[]
  setSelectedCategories: (cats: string[]) => void
}) {
  const t = useTranslations('archive')
  const categories = ['programs', 'sermons', 'audios']
  const labels: Record<string, string> = {
    programs: t('categoryPrograms'),
    sermons: t('categorySermons'),
    audios: t('categoryAudios'),
  }

  const hasCategorySupport = categories.some(
    (cat) =>
      results.filter((item) => item.category?.toLowerCase() === cat).length > 0
  )
  if (!hasCategorySupport) return null

  const toggleCategory = (cat: string) => {
    if (selectedCategories.includes(cat)) {
      if (selectedCategories.length > 1) {
        setSelectedCategories(selectedCategories.filter((c) => c !== cat))
      }
    } else {
      setSelectedCategories([...selectedCategories, cat])
    }
  }

  const selectAll = () => {
    setSelectedCategories(['programs', 'sermons', 'audios'])
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="font-mono text-[10px] tracking-wider text-muted-foreground uppercase mr-1">
        FILTERS:
      </span>

      <button
        type="button"
        onClick={selectAll}
        className={cn(
          'px-3 py-1 rounded-full text-xs font-mono transition-all cursor-pointer border',
          selectedCategories.length === 3
            ? 'bg-primary/10 text-primary border-primary/30 font-medium'
            : 'bg-muted/20 text-muted-foreground border-border/40 hover:text-foreground'
        )}
      >
        All
      </button>

      {categories.map((cat) => {
        const count = results.filter(
          (item) => item.category?.toLowerCase() === cat
        ).length
        if (count === 0) return null
        const isSelected = selectedCategories.includes(cat)

        return (
          <button
            key={cat}
            type="button"
            onClick={() => toggleCategory(cat)}
            className={cn(
              'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono transition-all cursor-pointer border',
              isSelected
                ? 'bg-primary/10 text-primary border-primary/30 font-medium'
                : 'bg-muted/20 text-muted-foreground border-border/40 hover:text-foreground'
            )}
          >
            <span>{labels[cat] ?? cat}</span>
            <span className="text-[10px] opacity-70">({count})</span>
          </button>
        )
      })}
    </div>
  )
}

function MediaCardGrid({ items }: { items: MediaRow[] }) {
  const t = useTranslations('archive')
  const first = items[0]
  const category = first.category?.toLowerCase()
  const categoryLabel =
    category === 'programs'
      ? t('categoryPrograms')
      : category === 'sermons'
        ? t('categorySermons')
        : category === 'audios'
          ? t('categoryAudios')
          : first.category || t('categoryVideo')
  const kind = categoryLabel.toUpperCase()
  const timestamp = first.start_timestamp

  return (
    <div className="rounded-2xl border border-border/50 bg-card/40 hover:bg-card/75 hover:border-border/80 transition-all duration-300 overflow-hidden flex flex-col justify-between shadow-2xs group">
      {/* Thumbnail */}
      <Link
        href={`https://www.youtube.com/watch?v=${first.youtube_id}&t=${first.youtube_timestamp}`}
        target="_blank"
        rel="noopener noreferrer"
        className="block relative"
      >
        <MediaThumbnail item={first} kind={kind} timestamp={timestamp} />
      </Link>

      {/* Body */}
      <div className="p-5 flex flex-col gap-2.5 flex-1 justify-between">
        <Link
          href={`https://www.youtube.com/watch?v=${first.youtube_id}&t=${first.youtube_timestamp}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col gap-2 group-hover:text-primary transition-colors"
        >
          <div className="font-mono text-[10px] tracking-wider uppercase text-primary font-semibold">
            {categoryLabel}
          </div>

          <h3
            style={{
              fontFamily: F.display,
              fontSize: '18px',
              fontWeight: 500,
              lineHeight: 1.25,
            }}
            className="text-foreground line-clamp-2"
          >
            {first.title}
          </h3>

          {first.transcript && (
            <p
              style={{
                fontFamily: F.serif,
                fontSize: '13.5px',
                lineHeight: 1.55,
              }}
              className="text-muted-foreground line-clamp-2 mt-0.5"
            >
              {highlightMarkdown(first.transcript)}
            </p>
          )}
        </Link>

        {items.length > 1 && (
          <div className="pt-2 border-t border-border/30">
            <MatchingSegments items={items} />
          </div>
        )}
      </div>
    </div>
  )
}

function MediaThumbnail({
  item,
  kind,
  timestamp,
}: {
  item: MediaRow
  kind: string
  timestamp: string | null
}) {
  return (
    <div className="relative aspect-video overflow-hidden bg-muted/40">
      <Image
        src={`https://img.youtube.com/vi/${item.youtube_id}/mqdefault.jpg`}
        alt={item.title}
        fill
        sizes="(max-width: 768px) 100vw, 33vw"
        className="object-cover transition-transform duration-500 group-hover:scale-105"
      />

      <span className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-md font-mono text-[9px] tracking-wider uppercase bg-black/70 text-white backdrop-blur-xs">
        {kind}
      </span>

      {timestamp && (
        <span className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded-md font-mono text-[10px] tracking-wider bg-black/75 text-white backdrop-blur-xs">
          {timestamp}
        </span>
      )}

      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 backdrop-blur-2xs">
        <span className="w-11 h-11 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg transition-transform group-hover:scale-110">
          <PlayIcon className="size-5 fill-current ml-0.5" />
        </span>
      </div>
    </div>
  )
}

function MatchingSegments({ items }: { items: MediaRow[] }) {
  const t = useTranslations('archive')
  const [expanded, setExpanded] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const count = items.length
  const inlineLabel = t('matchingSegments', { count })
  const dialogLabel = t('viewAllSegments', { count })

  return (
    <>
      <div className="flex items-center justify-between text-xs">
        <button
          type="button"
          onClick={() => {
            if (count > 3) setDialogOpen(true)
            else setExpanded((prev) => !prev)
          }}
          className="inline-flex items-center gap-1.5 font-mono text-[10.5px] text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
        >
          <span>{count > 3 ? dialogLabel : inlineLabel}</span>
          <ChevronDownIcon
            className={cn(
              'size-3 transition-transform',
              expanded && count <= 3 && 'rotate-180'
            )}
          />
        </button>
      </div>

      {expanded && count <= 3 && (
        <div className="mt-3 space-y-2 pt-2 border-t border-border/30">
          {items.map((item, idx) => (
            <SegmentRow key={idx} item={item} />
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle
              style={{ fontFamily: F.display }}
              className="text-xl"
            >
              {items[0].title}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 mt-4">
            {items.map((item, idx) => (
              <SegmentRow key={idx} item={item} />
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

function SegmentRow({ item }: { item: MediaRow }) {
  return (
    <Link
      href={`https://www.youtube.com/watch?v=${item.youtube_id}&t=${item.youtube_timestamp}`}
      target="_blank"
      rel="noopener noreferrer"
      className="block p-2.5 rounded-xl border border-border/40 bg-muted/20 hover:bg-muted/40 transition-colors group/segment"
    >
      <div className="flex items-center justify-between text-[11px] font-mono text-muted-foreground mb-1">
        {item.start_timestamp && (
          <span className="text-primary font-semibold">{item.start_timestamp}</span>
        )}
        <PlayIcon className="size-3 opacity-0 group-hover/segment:opacity-100 transition-opacity" />
      </div>
      {item.transcript && (
        <p
          style={{ fontFamily: F.serif }}
          className="text-xs text-muted-foreground line-clamp-3 leading-relaxed"
        >
          {highlightMarkdown(item.transcript)}
        </p>
      )}
    </Link>
  )
}

function NewsletterCardGrid({ items }: { items: NewsletterRow[] }) {
  const t = useTranslations('archive')
  const first = items[0]
  const month = first.month ? String(first.month) : ''

  return (
    <Link
      href={`https://library.wikisubmission.org/file/sp/${first.year}_${first.month}`}
      target="_blank"
      rel="noopener noreferrer"
      className="rounded-2xl border border-border/50 bg-card/40 hover:bg-card/75 hover:border-border/80 transition-all duration-300 overflow-hidden flex flex-col justify-between shadow-2xs group"
    >
      {/* Paper Visual */}
      <div className="aspect-[4/3] bg-muted/30 border-b border-border/40 p-6 flex flex-col justify-between relative overflow-hidden">
        <div className="text-center space-y-1">
          <div
            style={{ fontFamily: F.display }}
            className="text-xs uppercase tracking-widest text-muted-foreground italic font-medium"
          >
            {t('newsletterMasthead')}
          </div>
          <div className="h-px w-16 mx-auto bg-primary/40" />
          <div className="font-mono text-[10px] tracking-wider uppercase text-primary font-bold">
            {month} · {first.year}
          </div>
        </div>

        <div className="space-y-1.5 opacity-40">
          {[88, 75, 82, 68, 80].map((w, k) => (
            <div
              key={k}
              className="h-1 rounded-full bg-foreground/30"
              style={{ width: `${w}%` }}
            />
          ))}
        </div>
      </div>

      {/* Card Body */}
      <div className="p-5 flex flex-col gap-2.5 flex-1 justify-between">
        <div className="space-y-1.5">
          <div className="font-mono text-[10px] tracking-wider uppercase text-primary flex items-center gap-1.5 font-semibold">
            <NewspaperIcon className="size-3" />
            <span>{t('newsletterLabel')}</span>
          </div>

          <h3
            style={{
              fontFamily: F.display,
              fontSize: '18px',
              fontWeight: 500,
              lineHeight: 1.25,
            }}
            className="text-foreground capitalize group-hover:text-primary transition-colors"
          >
            {month} {first.year}
          </h3>

          {first.content && (
            <p
              style={{
                fontFamily: F.serif,
                fontSize: '13.5px',
                lineHeight: 1.55,
              }}
              className="text-muted-foreground line-clamp-2 mt-0.5"
            >
              {highlightMarkdown(first.content)}
            </p>
          )}
        </div>

        <div className="pt-3 border-t border-border/30 flex items-center gap-1 font-mono text-[11px] uppercase tracking-wider text-primary font-medium group-hover:translate-x-0.5 transition-transform">
          <span>{t('readIssue')}</span>
          <ArrowUpRight className="size-3.5" />
        </div>
      </div>
    </Link>
  )
}

function BookCardGrid({ book }: { book: ArchiveBookItem }) {
  return (
    <div className="rounded-2xl border border-border/50 bg-card/40 hover:bg-card/75 hover:border-border/80 transition-all duration-300 overflow-hidden flex flex-col justify-between shadow-2xs group">
      {/* Top Banner / Cover Area */}
      <div className="p-5 sm:p-6 border-b border-border/40 bg-gradient-to-br from-muted/40 via-muted/20 to-transparent flex gap-4 sm:gap-5 items-start">
        {book.coverImg ? (
          <div className="relative w-20 sm:w-24 h-28 sm:h-32 rounded-lg overflow-hidden border border-border/60 shadow-md shrink-0 bg-background group-hover:scale-102 transition-transform">
            <Image
              src={book.coverImg}
              alt={book.title}
              fill
              sizes="96px"
              className="object-cover"
            />
          </div>
        ) : (
          <div className="w-20 sm:w-24 h-28 sm:h-32 rounded-lg border border-primary/30 bg-primary/5 flex flex-col justify-between p-2.5 shrink-0 shadow-sm">
            <span className="font-mono text-[8px] uppercase tracking-wider text-primary">MONOGRAPH</span>
            <BookOpen className="w-5 h-5 text-primary/70 mx-auto" />
            <span className="font-mono text-[8px] text-muted-foreground text-center">{book.year}</span>
          </div>
        )}

        <div className="flex flex-col justify-between flex-1 min-w-0">
          <div>
            <div className="flex items-center justify-between gap-2 mb-1">
              <span className="font-mono text-[9.5px] uppercase tracking-widest text-primary font-semibold truncate">
                {book.categoryLabel}
              </span>
              {book.year && (
                <span className="font-mono text-[10px] text-muted-foreground shrink-0">{book.year}</span>
              )}
            </div>

            <h3
              style={{
                fontFamily: F.display,
                fontSize: '19px',
                fontWeight: 500,
                lineHeight: 1.2,
              }}
              className="text-foreground line-clamp-2 group-hover:text-primary transition-colors"
            >
              {book.title}
            </h3>

            <p className="font-mono text-[11px] text-muted-foreground mt-1 truncate">
              {book.author}
            </p>
          </div>
        </div>
      </div>

      {/* Description & Tags */}
      <div className="p-5 flex flex-col gap-4 flex-1 justify-between">
        <p
          style={{ fontFamily: F.serif }}
          className="text-sm text-muted-foreground line-clamp-3 leading-relaxed"
        >
          {book.description}
        </p>

        <div className="flex flex-wrap gap-1.5">
          {book.tags.map((tag, idx) => (
            <span
              key={idx}
              className="px-2.5 py-0.5 rounded-md font-mono text-[10px] bg-muted/30 border border-border/30 text-muted-foreground"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Download & Read Links */}
        <div className="pt-3 border-t border-border/30 flex flex-col gap-2">
          {book.links.map((link, idx) => (
            <a
              key={idx}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-between px-3.5 py-2 rounded-xl border border-border/40 bg-card hover:bg-primary/5 hover:border-primary/50 text-xs text-foreground font-medium transition-all group/link"
            >
              <span className="flex items-center gap-2">
                <Download className="size-3 text-muted-foreground group-hover/link:text-primary transition-colors" />
                <span>{link.label}</span>
              </span>
              <ArrowUpRight className="size-3 text-muted-foreground group-hover/link:text-primary group-hover/link:translate-x-0.5 transition-all" />
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}

function ResearchBookCard({ book }: { book: ArchiveBookItem }) {
  return (
    <div className="rounded-xl border border-border/40 bg-card/30 hover:bg-card/60 hover:border-border/70 transition-all duration-200 p-4 sm:p-5 flex flex-col justify-between shadow-2xs group">
      <div>
        <div className="flex items-center justify-between gap-2 mb-2">
          <span className="font-mono text-[9.5px] uppercase tracking-widest text-primary/90 font-semibold truncate">
            {book.categoryLabel}
          </span>
          {book.year && (
            <span className="font-mono text-[10.5px] text-muted-foreground/70 shrink-0">
              {book.year}
            </span>
          )}
        </div>

        <h3
          style={{ fontFamily: F.display }}
          className="text-base font-medium leading-snug text-foreground group-hover:text-primary transition-colors line-clamp-2"
        >
          {book.title}
        </h3>

        <p className="font-mono text-[11px] text-muted-foreground mt-1 truncate">
          {book.author}
        </p>

        <p
          style={{ fontFamily: F.serif }}
          className="text-xs text-muted-foreground/80 line-clamp-2 leading-relaxed mt-2.5"
        >
          {book.description}
        </p>
      </div>

      <div className="mt-4 pt-3 border-t border-border/30 flex flex-col gap-2">
        <div className="flex flex-wrap gap-1">
          {book.tags.slice(0, 3).map((tag, idx) => (
            <span
              key={idx}
              className="px-2 py-0.5 rounded font-mono text-[9.5px] bg-muted/20 border border-border/30 text-muted-foreground/80 truncate max-w-[150px]"
            >
              {tag}
            </span>
          ))}
        </div>

        {book.links.map((link, idx) => (
          <a
            key={idx}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-between px-3 py-1.5 rounded-lg border border-border/40 bg-card/60 hover:bg-primary/5 hover:border-primary/40 text-[11px] font-mono text-foreground font-medium transition-all group/link mt-1"
          >
            <span className="flex items-center gap-1.5 truncate">
              <Download className="size-3 text-muted-foreground group-hover/link:text-primary transition-colors shrink-0" />
              <span className="truncate">{link.label}</span>
            </span>
            <ArrowUpRight className="size-3 text-muted-foreground group-hover/link:text-primary group-hover/link:translate-x-0.5 transition-all shrink-0 ml-1" />
          </a>
        ))}
      </div>
    </div>
  )
}

function EmptyState({ label, help }: { label: string; help: string }) {
  return (
    <div className="text-center py-20 text-muted-foreground">
      <SearchIcon className="size-10 mx-auto mb-4 opacity-25" />
      <p
        style={{ fontFamily: F.display }}
        className="text-xl font-medium text-foreground tracking-tight"
      >
        {label}
      </p>
      <p
        style={{ fontFamily: F.serif }}
        className="mt-1.5 text-sm text-muted-foreground/80 max-w-sm mx-auto"
      >
        {help}
      </p>
    </div>
  )
}

function ArchiveLoadingSkeleton() {
  return (
    <div
      className="grid gap-6 animate-pulse"
      style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}
    >
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div
          key={i}
          className="rounded-2xl border border-border/40 bg-card/40 overflow-hidden"
        >
          <Skeleton className="aspect-video w-full rounded-none" />
          <div className="p-5 space-y-2.5">
            <Skeleton className="h-3 w-1/4 rounded" />
            <Skeleton className="h-5 w-4/5 rounded" />
            <Skeleton className="h-3.5 w-full rounded" />
          </div>
        </div>
      ))}
    </div>
  )
}
