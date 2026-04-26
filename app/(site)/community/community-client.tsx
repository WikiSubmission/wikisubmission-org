'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
} from 'react-simple-maps'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { F, Arrow } from '@/app/(site)/_sections/shared'

const GEO_URL = '/maps/world-110m.json'

// ─── Data ─────────────────────────────────────────────────────
// TODO: source from CMS when the schema exists.
// TODO: Translate the Community page after its planned code/data rewrite.

type Location = {
  id: string
  name: string
  city: string
  /** Free-form region name. Filter pills are derived from the values
   *  present in LOCATIONS at runtime, so adding a community with a new
   *  region (e.g. "South Asia") makes that filter pill appear automatically. */
  region: string
  country: string
  founded: string
  lat: number
  lng: number
  contact: string
  desc: string
}

/** Suggested taxonomy when adding new communities. Not enforced — `region`
 *  is a plain string and any value will be picked up by the filter pills. */
export const KNOWN_REGIONS = [
  'Western Europe',
  'Eastern Europe',
  'MENA',
  'Sub-Saharan Africa',
  'South Asia',
  'East & Southeast Asia',
  'North America',
  'Latin America',
  'Oceania',
] as const

const LOCATIONS: Location[] = [
  {
    id: 'tucson',
    name: 'Masjid Tucson',
    city: 'Tucson, Arizona',
    region: 'North America',
    country: 'USA',
    founded: '1979',
    lat: 32.22,
    lng: -110.97,
    contact: 'contact@masjidtucson.org',
    desc: 'The founding community of the movement — home of the original International Community of Submitters, where the mathematical miracle was first documented.',
  },
  {
    id: 'toronto',
    name: 'Toronto Submitters',
    city: 'Toronto, Ontario',
    region: 'North America',
    country: 'Canada',
    founded: '1992',
    lat: 43.65,
    lng: -79.38,
    contact: 'toronto@submission.org',
    desc: 'Weekly Friday congregation and monthly study circles on the Quran, conducted in English and Arabic.',
  },
  {
    id: 'london',
    name: 'London Submitters',
    city: 'London',
    region: 'Europe',
    country: 'United Kingdom',
    founded: '1998',
    lat: 51.5,
    lng: -0.12,
    contact: 'london@submitters.uk',
    desc: 'An active community running interfaith study nights and Quran-first readings. Meets weekly in central London.',
  },
  {
    id: 'frankfurt',
    name: 'Frankfurt Community',
    city: 'Frankfurt am Main',
    region: 'Europe',
    country: 'Germany',
    founded: '2001',
    lat: 50.11,
    lng: 8.68,
    contact: 'frankfurt@submission.de',
    desc: 'German & Turkish-speaking community with monthly open lectures on the Final Testament.',
  },
  {
    id: 'istanbul',
    name: 'Istanbul Submitters',
    city: 'Istanbul',
    region: 'Europe',
    country: 'Türkiye',
    founded: '1994',
    lat: 41.01,
    lng: 28.98,
    contact: 'istanbul@teslim.org',
    desc: 'A large Turkish-speaking community — weekly khutbahs, Arabic classes, and an active publishing wing.',
  },
  {
    id: 'cairo',
    name: 'Cairo Study Circle',
    city: 'Cairo',
    region: 'Middle East & Africa',
    country: 'Egypt',
    founded: '2010',
    lat: 30.04,
    lng: 31.24,
    contact: 'cairo@submission.eg',
    desc: 'A small but growing study circle focused on reading the Quran alone, without hadith.',
  },
  {
    id: 'lagos',
    name: 'Lagos Submitters',
    city: 'Lagos',
    region: 'Middle East & Africa',
    country: 'Nigeria',
    founded: '2008',
    lat: 6.52,
    lng: 3.38,
    contact: 'lagos@submission.ng',
    desc: 'West African hub — monthly gatherings, youth programs, and online Quran classes.',
  },
  {
    id: 'kl',
    name: 'Kuala Lumpur Circle',
    city: 'Kuala Lumpur',
    region: 'Asia & Oceania',
    country: 'Malaysia',
    founded: '2003',
    lat: 3.14,
    lng: 101.69,
    contact: 'kl@submission.my',
    desc: 'Malay & English study group meeting twice monthly. Active in digital outreach across Southeast Asia.',
  },
  {
    id: 'jakarta',
    name: 'Jakarta Submitters',
    city: 'Jakarta',
    region: 'Asia & Oceania',
    country: 'Indonesia',
    founded: '2006',
    lat: -6.21,
    lng: 106.85,
    contact: 'jakarta@submission.id',
    desc: 'Quran-only study community — publishes an Indonesian translation of the Final Testament.',
  },
  {
    id: 'sydney',
    name: 'Sydney Submitters',
    city: 'Sydney, NSW',
    region: 'Asia & Oceania',
    country: 'Australia',
    founded: '2012',
    lat: -33.87,
    lng: 151.21,
    contact: 'sydney@submission.au',
    desc: 'Small community hosting monthly gatherings and a weekly online khutbah broadcast.',
  },
  {
    id: 'saopaulo',
    name: 'São Paulo Submetidos',
    city: 'São Paulo',
    region: 'Latin America',
    country: 'Brazil',
    founded: '2015',
    lat: -23.55,
    lng: -46.63,
    contact: 'saopaulo@submissao.br',
    desc: 'Portuguese-speaking community — publishes study materials and runs an active WhatsApp group.',
  },
  {
    id: 'mexico',
    name: 'Mexico City Circle',
    city: 'Mexico City',
    region: 'Latin America',
    country: 'Mexico',
    founded: '2018',
    lat: 19.43,
    lng: -99.13,
    contact: 'mexico@sumision.org',
    desc: 'Spanish-speaking study group focused on translations of the Final Testament.',
  },
]

type ExtraSocial = {
  /** Short visible label, e.g. "Twitter", "Mirror" */
  label: string
  /** Absolute URL */
  url: string
}

type SocialCard = {
  id: string
  name: string
  platform: string
  sub: string
  /** One-line summary shown on the collapsed row */
  desc: string
  /** Long-form bio shown when the row is expanded. Plain text, 2–4 sentences. */
  bio: string
  /** Optional list of additional channels for this community. */
  socials?: ExtraSocial[]
  color: string
  url: string
  icon: React.ReactNode
}

// MOCK: shape mirrors the future API payload. Replace with a fetch when the
// backend endpoint is live. `bio` and `socials` are placeholders to be edited.
const SOCIAL_COMMUNITIES: SocialCard[] = [
  {
    id: 'discord-main',
    name: 'Submitters Discord',
    platform: 'Discord',
    sub: 'discord.gg/submitters',
    desc: 'Main gathering place — verse-by-verse study, daily reminders, multilingual rooms.',
    bio: 'Founded in 2019, the Submitters Discord is the largest active server for the global Submission community. Channels are organized by language (English, Arabic, Turkish, French, Spanish, Indonesian) and by topic — verse studies, the mathematical miracle of 19, prayer-time reminders, and an open Q&A room moderated by long-time submitters. Voice rooms host weekly Quran reading circles and informal hangouts.',
    socials: [
      { label: 'X / Twitter', url: '#' },
      { label: 'YouTube', url: '#' },
    ],
    color: '#5865F2',
    url: '#',
    icon: <IconDiscord />,
  },
  {
    id: 'discord-turkish',
    name: 'Teslim Turkish Discord',
    platform: 'Discord',
    sub: 'discord.gg/teslim',
    desc: 'Turkish-language server — khutbahs, Quran recitation, and weekly Q&A.',
    bio: 'Run by submitters based in Istanbul and Ankara, this server caters to Turkish speakers in Türkiye and across the diaspora. Weekly khutbahs are streamed live, with archived recordings posted in the announcements channel. The server also runs an Arabic-recitation tutoring program for members new to reading the Final Testament in the original language.',
    socials: [
      { label: 'YouTube', url: '#' },
    ],
    color: '#5865F2',
    url: '#',
    icon: <IconDiscord />,
  },
  {
    id: 'fb-main',
    name: 'Submission · Facebook Group',
    platform: 'Facebook',
    sub: 'facebook.com/groups/submitters',
    desc: 'Long-running public group — questions, verse-of-the-day threads, world-wide readings.',
    bio: 'One of the oldest online gathering points for submitters, established in 2008. The group is moderated 24/7 by volunteers across multiple time zones. Most posts are in English, but threads frequently spawn in Arabic, French, and Spanish. Pinned topics include weekly verse studies and explanatory threads on the mathematical miracle.',
    color: '#1877F2',
    url: '#',
    icon: <IconFacebook />,
  },
  {
    id: 'fb-spanish',
    name: 'Sumisión a Dios · Grupo FB',
    platform: 'Facebook',
    sub: 'facebook.com/groups/sumision',
    desc: 'Spanish-language Facebook group — translations, commentary, live study rooms.',
    bio: 'A Spanish-language hub primarily active across Latin America and Spain. Features include a verse-of-the-day post in Spanish, member-led translations of articles from Masjid Tucson, and monthly live audio rooms hosted via Facebook Live where members read and discuss the Final Testament together.',
    color: '#1877F2',
    url: '#',
    icon: <IconFacebook />,
  },
  {
    id: 'reddit',
    name: 'r/Submitters',
    platform: 'Reddit',
    sub: 'reddit.com/r/submitters',
    desc: 'Open discussion forum — Q&A, comparative readings, weekly miracle-of-19 threads.',
    bio: 'A small but active Reddit community focused on long-form discussion. The subreddit hosts weekly recurring threads (Verse Tuesday, Miracle Friday) and welcomes critical questions from members of other faiths. Moderation is hands-off — posts are removed only for personal attacks or spam, not for disagreement with the community position.',
    color: '#FF4500',
    url: '#',
    icon: <IconReddit />,
  },
  {
    id: 'whatsapp',
    name: 'WhatsApp Circles',
    platform: 'WhatsApp',
    sub: 'By language & region',
    desc: 'Private regional circles — English, Arabic, Turkish, Malay, Indonesian, Spanish, Portuguese.',
    bio: 'A network of small, invite-only WhatsApp groups organized by language and geography. Each circle averages 30–80 members and is run independently by a local moderator. Most groups send a daily verse, prayer-time reminders calibrated to the local timezone, and announce in-person meetups when applicable. Request an invite via any of the public communities listed here.',
    color: '#25D366',
    url: '#',
    icon: <IconWhatsapp />,
  },
  {
    id: 'telegram',
    name: 'Submission · Telegram',
    platform: 'Telegram',
    sub: 't.me/submitters',
    desc: 'Verse-of-the-day broadcasts, audio recitations, dedicated Arabic learners channel.',
    bio: 'A broadcast-style Telegram channel with a sister discussion group. The main channel posts verses, audio recitations from Al-Husary and Al-Minshawi, and announcements for online events. The discussion group is open to all and is one of the most active venues for comparative scripture conversations between submitters, traditional Muslims, and curious newcomers.',
    socials: [
      { label: 'YouTube', url: '#' },
    ],
    color: '#0088CC',
    url: '#',
    icon: <IconTelegram />,
  },
]

type ContentChannel = {
  id: string
  name: string
  kind: 'Blog' | 'YouTube' | 'Podcast' | 'Newsletter'
  author: string
  url: string
  /** One-line summary shown on the collapsed card */
  desc: string
  /** Long-form bio shown when the card is expanded. Plain text, 2–4 sentences. */
  bio: string
  /** Optional list of additional channels for this contributor. */
  socials?: ExtraSocial[]
}

// MOCK: shape mirrors the future API payload. Replace with a fetch when the
// backend endpoint is live. `bio` and `socials` are placeholders to be edited.
const CONTENT_CHANNELS: ContentChannel[] = [
  {
    id: 'submission-yt',
    kind: 'YouTube',
    name: 'Submission',
    author: 'Masjid Tucson',
    url: '#',
    desc: 'Full archive of khutbahs, lectures, and miracle explainers — subtitled in six languages.',
    bio: "The official Masjid Tucson YouTube channel — the canonical archive of khutbahs, lectures, and explainers from the founding community of the movement. Includes Dr. Rashad Khalifa's original 1980s lectures, contemporary khutbahs from Friday services, and a long-running playlist on the mathematical miracle of 19.",
    socials: [
      { label: 'Website', url: '#' },
    ],
  },
  {
    id: 'reflections-blog',
    kind: 'Blog',
    name: 'Reflections on the Final Testament',
    author: 'Samar K.',
    url: '#',
    desc: 'Weekly essays on a single verse — historical context, linguistic notes, practical application.',
    bio: 'A long-running personal blog by Samar K., a submitter based in Toronto. Each post takes a single verse and works through it slowly — historical context, linguistic notes drawn from the Arabic, and practical reflections on what the verse asks of the reader. Posts publish every Sunday.',
    socials: [
      { label: 'RSS', url: '#' },
      { label: 'X / Twitter', url: '#' },
    ],
  },
  {
    id: 'teslim-podcast',
    kind: 'Podcast',
    name: 'Teslim Radio',
    author: 'Istanbul Circle',
    url: '#',
    desc: 'Turkish-language podcast reading the Final Testament cover-to-cover, one sura per episode.',
    bio: 'Produced by the Istanbul Submitters circle, Teslim Radio is a long-form podcast reading the Final Testament cover-to-cover in Turkish, one sura per episode. Each episode pairs the recitation with brief commentary from a rotating group of community contributors. Available on Spotify, Apple Podcasts, and direct RSS.',
    socials: [
      { label: 'Spotify', url: '#' },
      { label: 'Apple Podcasts', url: '#' },
    ],
  },
  {
    id: 'miracle-newsletter',
    kind: 'Newsletter',
    name: 'Over It Is Nineteen',
    author: 'Faisal M.',
    url: '#',
    desc: 'Monthly newsletter on the mathematical structure of the Quran — no technical background required.',
    bio: 'A monthly Substack newsletter by Faisal M. that explores the mathematical structure of the Quran in plain language. Each issue picks one numerical pattern and works through the verses involved without assuming a mathematical background. Past issues have covered the 19-letter Bismillah, the 114-chapter structure, and the frequency of divine names.',
    socials: [
      { label: 'Substack', url: '#' },
    ],
  },
]

function PinIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
    >
      <path d="M12 22s7-6.2 7-12a7 7 0 1 0-14 0c0 5.8 7 12 7 12Z" />
      <circle cx="12" cy="10" r="2.4" fill="currentColor" />
    </svg>
  )
}

function IconDiscord() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.3 4.4A19.8 19.8 0 0 0 15.4 3l-.2.4a18 18 0 0 0-5.3 0L9.6 3a19.8 19.8 0 0 0-4.9 1.4C1.5 9.1.6 13.7 1 18.2a19.9 19.9 0 0 0 6 3l.5-.7a13.6 13.6 0 0 1-2.3-1.1l.6-.4a14 14 0 0 0 12.4 0l.6.4a13.6 13.6 0 0 1-2.3 1.1l.5.7a19.9 19.9 0 0 0 6-3c.5-5.2-.9-9.7-2.6-13.8ZM8.4 15.5c-1.2 0-2.2-1.1-2.2-2.4s1-2.4 2.2-2.4 2.2 1.1 2.2 2.4-1 2.4-2.2 2.4Zm7.2 0c-1.2 0-2.2-1.1-2.2-2.4s1-2.4 2.2-2.4 2.2 1.1 2.2 2.4-1 2.4-2.2 2.4Z" />
    </svg>
  )
}
function IconFacebook() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
      <path d="M24 12A12 12 0 1 0 10.1 23.9v-8.4H7v-3.5h3.1V9.4c0-3 1.8-4.7 4.6-4.7 1.3 0 2.7.2 2.7.2v3h-1.5c-1.5 0-2 .9-2 1.9v2.3h3.4l-.6 3.5h-2.8v8.4A12 12 0 0 0 24 12Z" />
    </svg>
  )
}
function IconReddit() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
      <path d="M24 12.1a2.6 2.6 0 0 0-2.6-2.6 2.6 2.6 0 0 0-1.8.8 12.7 12.7 0 0 0-6.8-2.2L14 2.4l4.6 1a1.9 1.9 0 1 0 .2-1.2l-5.2-1.1-1.4 6.5A12.7 12.7 0 0 0 5.4 9.9a2.6 2.6 0 0 0-3.6 3.7 5 5 0 0 0-.3 1.8c0 3.8 4.5 6.9 10 6.9s10-3.1 10-6.9a5 5 0 0 0-.3-1.8A2.6 2.6 0 0 0 24 12Zm-18 2a1.7 1.7 0 1 1 3.4 0 1.7 1.7 0 0 1-3.4 0Zm9.6 4.7a6.3 6.3 0 0 1-3.6 1 6.3 6.3 0 0 1-3.6-1 .4.4 0 0 1 .5-.6 5.5 5.5 0 0 0 3.1.8 5.5 5.5 0 0 0 3.1-.8.4.4 0 0 1 .5.6Zm-.3-3a1.7 1.7 0 1 1 1.7-1.7 1.7 1.7 0 0 1-1.7 1.7Z" />
    </svg>
  )
}
function IconWhatsapp() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.5 3.5A11.8 11.8 0 0 0 12.1 0 12 12 0 0 0 .7 17.6L0 24l6.6-.7A12 12 0 0 0 12.1 24c6.6 0 12-5.4 12-12 0-3.2-1.3-6.2-3.6-8.5ZM12.1 21.8h-.1a10 10 0 0 1-5.1-1.4l-.4-.2-3.9.4.4-3.8-.3-.4A10 10 0 0 1 22 12a10 10 0 0 1-10 9.8Zm5.5-7.4c-.3-.2-1.8-.9-2-.9-.3-.1-.5-.2-.7.1-.2.3-.8.9-1 1.1-.2.2-.4.2-.7.1-.3-.1-1.3-.5-2.4-1.5-.9-.8-1.5-1.8-1.7-2.1-.2-.3 0-.5.1-.6l.5-.5.3-.5c.1-.2 0-.4 0-.5s-.7-1.7-1-2.3c-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.4s1 2.8 1.2 3c.1.2 2 3.1 4.9 4.3 1.9.9 2.6.9 3.6.8.6-.1 1.8-.7 2-1.4.3-.7.3-1.3.2-1.4-.1-.1-.3-.2-.6-.3Z" />
    </svg>
  )
}
function IconTelegram() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
      <path d="M22 2 2 10.5l6.5 2.3L18 5.5l-7.7 8.3.4 6 4-3.8 4.7 3.4L22 2Z" />
    </svg>
  )
}

// ─── World map ──────────────────────────────────────────────────
// Realistic geography via react-simple-maps + world-atlas TopoJSON
// (public/maps/world-110m.json). All fills/strokes use --ed-* tokens so
// the map respects every palette (ink / violet / mono) and theme.

function WorldMap({
  locations,
  selectedId,
  hoveredId,
  onSelect,
  onHover,
}: {
  locations: Location[]
  selectedId: string
  hoveredId: string | null
  onSelect: (id: string) => void
  onHover: (id: string | null) => void
}) {
  return (
    <ComposableMap
      projection="geoEqualEarth"
      projectionConfig={{ scale: 165 }}
      width={900}
      height={450}
      style={{ width: '100%', height: 'auto' }}
      role="img"
      aria-label="Map of submitter communities"
    >
      <Geographies geography={GEO_URL}>
        {({ geographies }) =>
          geographies.map((geo) => (
            <Geography
              key={geo.rsmKey}
              geography={geo}
              style={{
                default: {
                  fill: 'var(--ed-surface)',
                  stroke: 'var(--ed-rule)',
                  strokeWidth: 0.5,
                  outline: 'none',
                },
                hover: {
                  fill: 'var(--ed-rule)',
                  stroke: 'var(--ed-rule)',
                  strokeWidth: 0.5,
                  outline: 'none',
                },
                pressed: {
                  fill: 'var(--ed-rule)',
                  outline: 'none',
                },
              }}
            />
          ))
        }
      </Geographies>

      {locations.map((loc) => {
        const isActive = loc.id === selectedId
        const isHovered = loc.id === hoveredId
        const radius = isActive ? 4.5 : isHovered ? 3.5 : 2.8
        return (
          <Marker
            key={loc.id}
            coordinates={[loc.lng, loc.lat]}
            onClick={() => onSelect(loc.id)}
            onMouseEnter={() => onHover(loc.id)}
            onMouseLeave={() => onHover(null)}
            style={{
              default: { cursor: 'pointer' },
              hover: { cursor: 'pointer' },
              pressed: { cursor: 'pointer' },
            }}
          >
            {isActive && (
              <circle
                r={11}
                fill="none"
                stroke="var(--ed-accent)"
                strokeWidth={1.8}
                opacity={0.9}
              />
            )}
            <circle r={radius + 1.5} fill="var(--ed-bg)" opacity={0.9} />
            <circle
              r={radius}
              fill="var(--ed-accent)"
              stroke="var(--ed-surface)"
              strokeWidth={1}
              style={{ transition: 'r 200ms ease' }}
            />
            {(isActive || isHovered) && (
              <text
                y={-12}
                textAnchor="middle"
                fontFamily="var(--font-jetbrains), monospace"
                fontSize={8}
                letterSpacing="0.1em"
                fill="var(--ed-fg)"
                style={{ textTransform: 'uppercase', pointerEvents: 'none' }}
              >
                {loc.city}
              </text>
            )}
          </Marker>
        )
      })}
    </ComposableMap>
  )
}

// ─── Notes (localStorage) ──────────────────────────────────────

const NOTES_PREFIX = 'ws-community-notes:'

function useLocationNote(id: string) {
  const [note, setNote] = useState('')

  useEffect(() => {
    try {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setNote(window.localStorage.getItem(NOTES_PREFIX + id) ?? '')
    } catch {
      setNote('')
    }
  }, [id])

  const persist = useCallback(
    (value: string) => {
      setNote(value)
      try {
        if (value) window.localStorage.setItem(NOTES_PREFIX + id, value)
        else window.localStorage.removeItem(NOTES_PREFIX + id)
      } catch {
        // storage unavailable — ignore
      }
    },
    [id]
  )

  return [note, persist] as const
}

function getAllNotes(): Record<string, string> {
  if (typeof window === 'undefined') return {}
  const out: Record<string, string> = {}
  try {
    for (let i = 0; i < window.localStorage.length; i++) {
      const key = window.localStorage.key(i)
      if (!key || !key.startsWith(NOTES_PREFIX)) continue
      const id = key.slice(NOTES_PREFIX.length)
      const v = window.localStorage.getItem(key)
      if (v) out[id] = v
    }
  } catch {
    // ignore
  }
  return out
}

// ─── Main page ─────────────────────────────────────────────────

export default function CommunityClient() {
  const [selectedId, setSelectedId] = useState<string>(LOCATIONS[0].id)
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const [region, setRegion] = useState<string>('All')
  const [notes, setNotes] = useState<Record<string, string>>({})
  const [openSocialId, setOpenSocialId] = useState<string | null>(null)
  const [openChannelId, setOpenChannelId] = useState<string | null>(null)

  // Region pills are derived from the data so adding a community in a new
  // region (e.g. "South Asia") automatically adds a filter pill for it.
  const regionOptions = useMemo(
    () =>
      ['All', ...Array.from(new Set(LOCATIONS.map((l) => l.region))).sort()],
    []
  )

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setNotes(getAllNotes())
  }, [])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return LOCATIONS.filter((l) => {
      if (region !== 'All' && l.region !== region) return false
      if (!q) return true
      return (
        l.name.toLowerCase().includes(q) ||
        l.city.toLowerCase().includes(q) ||
        l.country.toLowerCase().includes(q) ||
        l.region.toLowerCase().includes(q) ||
        (notes[l.id] ?? '').toLowerCase().includes(q)
      )
    })
  }, [query, region, notes])

  const selected = useMemo(
    () => LOCATIONS.find((l) => l.id === selectedId) ?? LOCATIONS[0],
    [selectedId]
  )

  const [note, setNote] = useLocationNote(selected.id)

  const onNoteChange = (value: string) => {
    setNote(value)
    setNotes((prev) => ({ ...prev, [selected.id]: value }))
  }

  return (
    <div style={{ backgroundColor: 'var(--ed-bg)', color: 'var(--ed-fg)' }}>
      {/* Hero */}
      <section
        className="px-4 sm:px-6 md:px-10"
        style={{
          maxWidth: 1240,
          margin: '0 auto',
          paddingTop: 'clamp(56px, 10vw, 96px)',
          paddingBottom: 'clamp(32px, 6vw, 64px)',
        }}
      >
        <h1
          style={{
            fontFamily: F.display,
            fontSize: 'clamp(48px, 10vw, 96px)',
            fontWeight: 400,
            lineHeight: 0.95,
            letterSpacing: '-0.035em',
            color: 'var(--ed-fg)',
          }}
        >
          One faith,{' '}
          <span style={{ fontStyle: 'italic', color: 'var(--ed-fg-muted)' }}>
            many places.
          </span>
        </h1>
        <p
          style={{
            fontFamily: F.serif,
            fontSize: 'clamp(15px, 3.6vw, 17px)',
            lineHeight: 1.65,
            color: 'var(--ed-fg-muted)',
            maxWidth: '60ch',
            marginTop: 24,
          }}
        >
          Submitters are spread across every continent — small circles and
          established communities, all devoted to God alone. Find a community
          near you, or connect with one online.
        </p>
      </section>

      {/* I. Communities (map + directory) */}
      <section
        className="px-4 sm:px-6 md:px-10"
        style={{
          maxWidth: 1240,
          margin: '0 auto',
          paddingTop: 'clamp(32px, 6vw, 56px)',
          paddingBottom: 'clamp(32px, 6vw, 56px)',
        }}
      >
        <SectionHead num="I" title="Communities" sub={`${LOCATIONS.length} locations`} />

        <div className="grid grid-cols-1 lg:grid-cols-[400px_1fr]" style={{ gap: 20 }}>
          {/* Directory */}
          <div
            style={{
              border: '1px solid var(--ed-rule)',
              borderRadius: 3,
              backgroundColor: 'var(--ed-surface)',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              maxHeight: 640,
            }}
          >
            <div
              style={{
                padding: '16px 18px',
                borderBottom: '1px solid var(--ed-rule)',
                display: 'flex',
                flexDirection: 'column',
                gap: 10,
              }}
            >
              <span
                style={{
                  fontFamily: F.mono,
                  fontSize: 10,
                  letterSpacing: '0.18em',
                  textTransform: 'uppercase',
                  color: 'var(--ed-fg-muted)',
                }}
              >
                Directory
              </span>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '8px 12px',
                  border: '1px solid var(--ed-rule)',
                  borderRadius: 2,
                  backgroundColor: 'var(--ed-bg)',
                }}
              >
                <svg
                  width="13"
                  height="13"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  style={{ color: 'var(--ed-fg-muted)' }}
                >
                  <circle cx="11" cy="11" r="7" />
                  <path d="m21 21-4.3-4.3" />
                </svg>
                <input
                  type="text"
                  placeholder="Search city, country, region…"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  style={{
                    flex: 1,
                    border: 'none',
                    outline: 'none',
                    background: 'transparent',
                    fontFamily: F.serif,
                    fontSize: 13,
                    color: 'var(--ed-fg)',
                  }}
                />
              </div>
            </div>

            <div style={{ overflowY: 'auto', flex: 1 }}>
              {filtered.length === 0 && (
                <div
                  style={{
                    padding: 32,
                    textAlign: 'center',
                    color: 'var(--ed-fg-muted)',
                    fontStyle: 'italic',
                    fontFamily: F.serif,
                    fontSize: 13,
                  }}
                >
                  No communities match — try another search.
                </div>
              )}
              {filtered.map((loc) => {
                const active = loc.id === selectedId
                const locNote = notes[loc.id]
                return (
                  <button
                    key={loc.id}
                    type="button"
                    onClick={() => setSelectedId(loc.id)}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '24px 1fr',
                      gap: 12,
                      width: '100%',
                      textAlign: 'left',
                      padding: '14px 18px',
                      background: active
                        ? 'color-mix(in oklab, var(--ed-accent), transparent 92%)'
                        : 'transparent',
                      border: 'none',
                      borderBottom: '1px solid var(--ed-rule)',
                      cursor: 'pointer',
                      transition: 'background 120ms',
                    }}
                  >
                    <span
                      style={{
                        color: active ? 'var(--ed-accent)' : 'var(--ed-fg-muted)',
                        display: 'flex',
                        alignItems: 'flex-start',
                        paddingTop: 2,
                      }}
                    >
                      <PinIcon />
                    </span>
                    <span style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                      <span
                        style={{
                          fontFamily: F.display,
                          fontSize: 16,
                          fontWeight: 500,
                          letterSpacing: '-0.01em',
                          color: active ? 'var(--ed-fg)' : 'var(--ed-fg)',
                        }}
                      >
                        {loc.name}
                      </span>
                      <span
                        style={{
                          fontFamily: F.mono,
                          fontSize: 10,
                          letterSpacing: '0.14em',
                          textTransform: 'uppercase',
                          color: 'var(--ed-fg-muted)',
                        }}
                      >
                        {loc.city} · {loc.country}
                      </span>
                      {locNote && (
                        <span
                          style={{
                            fontFamily: F.serif,
                            fontSize: 12,
                            lineHeight: 1.5,
                            color: 'var(--ed-fg-muted)',
                            marginTop: 4,
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                            fontStyle: 'italic',
                          }}
                        >
                          {locNote}
                        </span>
                      )}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Map + detail */}
          <div
            style={{
              border: '1px solid var(--ed-rule)',
              borderRadius: 3,
              backgroundColor: 'var(--ed-surface)',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                padding: '14px 18px',
                borderBottom: '1px solid var(--ed-rule)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 12,
                flexWrap: 'wrap',
              }}
            >
              <span
                style={{
                  fontFamily: F.mono,
                  fontSize: 10,
                  letterSpacing: '0.18em',
                  textTransform: 'uppercase',
                  color: 'var(--ed-fg-muted)',
                }}
              >
                Atlas · {LOCATIONS.length} communities
              </span>
              <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                {regionOptions.map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRegion(r)}
                    style={{
                      fontFamily: F.mono,
                      fontSize: 10,
                      letterSpacing: '0.14em',
                      textTransform: 'uppercase',
                      padding: '4px 10px',
                      border: '1px solid var(--ed-rule)',
                      borderRadius: 2,
                      background: region === r ? 'var(--ed-fg)' : 'transparent',
                      color:
                        region === r ? 'var(--ed-bg)' : 'var(--ed-fg-muted)',
                      cursor: 'pointer',
                    }}
                  >
                    {r === 'All' ? 'All' : r.split(' ')[0]}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ padding: '20px 18px' }}>
              <WorldMap
                locations={filtered}
                selectedId={selectedId}
                hoveredId={hoveredId}
                onSelect={setSelectedId}
                onHover={setHoveredId}
              />
            </div>

            <div
              style={{
                padding: '20px 24px 24px',
                borderTop: '1px solid var(--ed-rule)',
                backgroundColor: 'var(--ed-bg)',
                display: 'flex',
                flexDirection: 'column',
                gap: 14,
              }}
            >
              <span
                style={{
                  fontFamily: F.mono,
                  fontSize: 10,
                  letterSpacing: '0.18em',
                  textTransform: 'uppercase',
                  color: 'var(--ed-accent)',
                }}
              >
                {selected.region} · est. {selected.founded}
              </span>
              <div
                style={{
                  fontFamily: F.display,
                  fontSize: 'clamp(22px, 4vw, 28px)',
                  fontWeight: 500,
                  letterSpacing: '-0.015em',
                  color: 'var(--ed-fg)',
                }}
              >
                {selected.name}
              </div>
              <p
                style={{
                  fontFamily: F.serif,
                  fontSize: 14,
                  lineHeight: 1.6,
                  color: 'var(--ed-fg-muted)',
                  margin: 0,
                }}
              >
                {selected.desc}
              </p>
              <dl
                style={{
                  display: 'grid',
                  gridTemplateColumns: '120px 1fr',
                  rowGap: 8,
                  fontFamily: F.mono,
                  fontSize: 11.5,
                  margin: 0,
                }}
              >
                <dt
                  style={{
                    letterSpacing: '0.14em',
                    textTransform: 'uppercase',
                    color: 'var(--ed-fg-muted)',
                  }}
                >
                  Location
                </dt>
                <dd style={{ color: 'var(--ed-fg)', margin: 0 }}>
                  {selected.city}, {selected.country}
                </dd>
                <dt
                  style={{
                    letterSpacing: '0.14em',
                    textTransform: 'uppercase',
                    color: 'var(--ed-fg-muted)',
                  }}
                >
                  Contact
                </dt>
                <dd style={{ color: 'var(--ed-fg)', margin: 0 }}>
                  {selected.contact}
                </dd>
              </dl>

              {/* Notes */}
              <div style={{ marginTop: 4 }}>
                <label
                  htmlFor={`note-${selected.id}`}
                  style={{
                    display: 'block',
                    fontFamily: F.mono,
                    fontSize: 10,
                    letterSpacing: '0.18em',
                    textTransform: 'uppercase',
                    color: 'var(--ed-fg-muted)',
                    marginBottom: 6,
                  }}
                >
                  Your notes — saved locally
                </label>
                <textarea
                  id={`note-${selected.id}`}
                  value={note}
                  onChange={(e) => onNoteChange(e.target.value)}
                  rows={3}
                  placeholder="Contact person, meeting time, observations…"
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid var(--ed-rule)',
                    borderRadius: 2,
                    background: 'var(--ed-surface)',
                    color: 'var(--ed-fg)',
                    fontFamily: F.serif,
                    fontSize: 13,
                    lineHeight: 1.55,
                    resize: 'vertical',
                    outline: 'none',
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 4 }}>
                <Link href="#" className="ed-btn-primary" style={{ fontFamily: F.serif, padding: '10px 18px' }}>
                  Visit community
                  <Arrow />
                </Link>
                <Link href="#" className="ed-btn-ghost" style={{ fontFamily: F.serif, padding: '10px 18px' }}>
                  Directions
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* II. Social communities */}
      <section
        className="px-4 sm:px-6 md:px-10"
        style={{
          maxWidth: 1240,
          margin: '0 auto',
          paddingTop: 'clamp(32px, 6vw, 56px)',
          paddingBottom: 'clamp(32px, 6vw, 56px)',
        }}
      >
        <SectionHead
          num="II"
          title="Social communities"
          sub={`${SOCIAL_COMMUNITIES.length} channels · all free to join`}
        />

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {SOCIAL_COMMUNITIES.map((c) => {
            const isOpen = openSocialId === c.id
            return (
              <Collapsible
                key={c.id}
                open={isOpen}
                onOpenChange={(o) => setOpenSocialId(o ? c.id : null)}
              >
                <div
                  className="ed-card community-row"
                  style={{ backgroundColor: 'var(--ed-surface)' }}
                >
                  <CollapsibleTrigger asChild>
                    <button
                      type="button"
                      aria-label={`${isOpen ? 'Collapse' : 'Expand'} ${c.name}`}
                      style={{
                        all: 'unset',
                        cursor: 'pointer',
                        width: '100%',
                        boxSizing: 'border-box',
                        padding: 'clamp(18px, 4vw, 24px)',
                        display: 'grid',
                        gridTemplateColumns: '56px 1fr auto',
                        alignItems: 'center',
                        gap: 'clamp(14px, 3vw, 24px)',
                      }}
                    >
                      <span
                        style={{
                          width: 48,
                          height: 48,
                          borderRadius: 6,
                          background: c.color,
                          color: '#fff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxShadow: '0 4px 14px -6px rgba(0,0,0,0.25)',
                        }}
                      >
                        {c.icon}
                      </span>
                      <div className="min-w-0 flex flex-col gap-1.5">
                        <div className="flex items-baseline gap-3 flex-wrap">
                          <span
                            style={{
                              fontFamily: F.display,
                              fontSize: 'clamp(18px, 3.4vw, 22px)',
                              fontWeight: 500,
                              letterSpacing: '-0.015em',
                              color: 'var(--ed-fg)',
                            }}
                          >
                            {c.name}
                          </span>
                          <span
                            style={{
                              fontFamily: F.mono,
                              fontSize: 10,
                              letterSpacing: '0.16em',
                              textTransform: 'uppercase',
                              color: 'var(--ed-accent)',
                            }}
                          >
                            {c.platform}
                          </span>
                        </div>
                        <span
                          style={{
                            fontFamily: F.mono,
                            fontSize: 11,
                            color: 'var(--ed-fg-muted)',
                          }}
                        >
                          {c.sub}
                        </span>
                        <p
                          style={{
                            fontFamily: F.serif,
                            fontSize: 13.5,
                            lineHeight: 1.6,
                            color: 'var(--ed-fg-muted)',
                            margin: '4px 0 0',
                            maxWidth: '70ch',
                          }}
                        >
                          {c.desc}
                        </p>
                      </div>
                      <Chevron open={isOpen} />
                    </button>
                  </CollapsibleTrigger>

                  <CollapsibleContent className="community-collapse">
                    <div
                      style={{
                        padding: '0 clamp(18px, 4vw, 24px) clamp(18px, 4vw, 24px) clamp(18px, 4vw, 24px)',
                        marginLeft: 'calc(56px + clamp(14px, 3vw, 24px))',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 16,
                        borderTop: '1px dashed var(--ed-rule)',
                        paddingTop: 16,
                      }}
                    >
                      <p
                        style={{
                          fontFamily: F.serif,
                          fontSize: 14.5,
                          lineHeight: 1.7,
                          color: 'var(--ed-fg)',
                          margin: 0,
                          maxWidth: '70ch',
                        }}
                      >
                        {c.bio}
                      </p>

                      <div
                        className="flex items-center gap-4 flex-wrap"
                        style={{ marginTop: 4 }}
                      >
                        <Link
                          href={c.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="ed-cta"
                          style={{ fontSize: 12, whiteSpace: 'nowrap' }}
                        >
                          Join {c.platform} <Arrow />
                        </Link>
                        {c.socials && c.socials.length > 0 && (
                          <span
                            style={{
                              fontFamily: F.mono,
                              fontSize: 10,
                              letterSpacing: '0.16em',
                              textTransform: 'uppercase',
                              color: 'var(--ed-fg-muted)',
                            }}
                          >
                            Also on
                          </span>
                        )}
                        {c.socials?.map((s) => (
                          <Link
                            key={s.url + s.label}
                            href={s.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              fontFamily: F.mono,
                              fontSize: 11,
                              letterSpacing: '0.12em',
                              textTransform: 'uppercase',
                              color: 'var(--ed-fg-muted)',
                              textDecoration: 'underline',
                              textUnderlineOffset: 3,
                            }}
                          >
                            {s.label}
                          </Link>
                        ))}
                      </div>
                    </div>
                  </CollapsibleContent>
                </div>
              </Collapsible>
            )
          })}
        </div>
      </section>

      {/* III. Content channels */}
      <section
        className="px-4 sm:px-6 md:px-10"
        style={{
          maxWidth: 1240,
          margin: '0 auto',
          paddingTop: 'clamp(32px, 6vw, 56px)',
          paddingBottom: 'clamp(56px, 8vw, 96px)',
        }}
      >
        <SectionHead
          num="III"
          title="Content channels"
          sub="Blogs, podcasts, and YouTube by individual submitters"
        />

        <div
          className="grid grid-cols-1 md:grid-cols-2"
          style={{ gap: 16 }}
        >
          {CONTENT_CHANNELS.map((c) => {
            const isOpen = openChannelId === c.id
            return (
              <Collapsible
                key={c.id}
                open={isOpen}
                onOpenChange={(o) => setOpenChannelId(o ? c.id : null)}
              >
                <div
                  className="ed-card community-row"
                  style={{
                    backgroundColor: 'var(--ed-surface)',
                    height: '100%',
                  }}
                >
                  <CollapsibleTrigger asChild>
                    <button
                      type="button"
                      aria-label={`${isOpen ? 'Collapse' : 'Expand'} ${c.name}`}
                      style={{
                        all: 'unset',
                        cursor: 'pointer',
                        width: '100%',
                        boxSizing: 'border-box',
                        padding: 'clamp(20px, 4vw, 28px)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 12,
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <span
                          style={{
                            fontFamily: F.mono,
                            fontSize: 10,
                            letterSpacing: '0.18em',
                            textTransform: 'uppercase',
                            color: 'var(--ed-accent)',
                          }}
                        >
                          {c.kind}
                        </span>
                        <div className="flex items-center gap-3">
                          <span
                            style={{
                              fontFamily: F.mono,
                              fontSize: 10,
                              letterSpacing: '0.14em',
                              textTransform: 'uppercase',
                              color: 'var(--ed-fg-muted)',
                            }}
                          >
                            by {c.author}
                          </span>
                          <Chevron open={isOpen} />
                        </div>
                      </div>
                      <div
                        style={{
                          fontFamily: F.display,
                          fontSize: 22,
                          fontWeight: 500,
                          letterSpacing: '-0.015em',
                          color: 'var(--ed-fg)',
                          lineHeight: 1.2,
                          textAlign: 'left',
                        }}
                      >
                        {c.name}
                      </div>
                      <p
                        style={{
                          fontFamily: F.serif,
                          fontSize: 14,
                          lineHeight: 1.6,
                          color: 'var(--ed-fg-muted)',
                          margin: 0,
                          flex: 1,
                        }}
                      >
                        {c.desc}
                      </p>
                    </button>
                  </CollapsibleTrigger>

                  <CollapsibleContent className="community-collapse">
                    <div
                      style={{
                        padding:
                          '0 clamp(20px, 4vw, 28px) clamp(20px, 4vw, 28px) clamp(20px, 4vw, 28px)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 14,
                        borderTop: '1px dashed var(--ed-rule)',
                        paddingTop: 14,
                      }}
                    >
                      <p
                        style={{
                          fontFamily: F.serif,
                          fontSize: 14.5,
                          lineHeight: 1.7,
                          color: 'var(--ed-fg)',
                          margin: 0,
                          maxWidth: '70ch',
                        }}
                      >
                        {c.bio}
                      </p>
                      <div
                        className="flex items-center gap-4 flex-wrap"
                        style={{ marginTop: 4 }}
                      >
                        <Link
                          href={c.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="ed-cta"
                          style={{ fontSize: 13 }}
                        >
                          Visit {c.kind.toLowerCase()} <Arrow />
                        </Link>
                        {c.socials && c.socials.length > 0 && (
                          <span
                            style={{
                              fontFamily: F.mono,
                              fontSize: 10,
                              letterSpacing: '0.16em',
                              textTransform: 'uppercase',
                              color: 'var(--ed-fg-muted)',
                            }}
                          >
                            Also on
                          </span>
                        )}
                        {c.socials?.map((s) => (
                          <Link
                            key={s.url + s.label}
                            href={s.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              fontFamily: F.mono,
                              fontSize: 11,
                              letterSpacing: '0.12em',
                              textTransform: 'uppercase',
                              color: 'var(--ed-fg-muted)',
                              textDecoration: 'underline',
                              textUnderlineOffset: 3,
                            }}
                          >
                            {s.label}
                          </Link>
                        ))}
                      </div>
                    </div>
                  </CollapsibleContent>
                </div>
              </Collapsible>
            )
          })}
        </div>
      </section>
    </div>
  )
}

function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden
      style={{
        flexShrink: 0,
        color: 'var(--ed-fg-muted)',
        transform: open ? 'rotate(180deg)' : 'none',
        transition: 'transform 220ms ease',
      }}
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  )
}

function SectionHead({
  num,
  title,
  sub,
}: {
  num: string
  title: string
  sub: string
}) {
  return (
    <div
      className="grid-cols-1 gap-y-3 sm:grid-cols-[auto_auto_1fr_auto] sm:gap-x-5 sm:gap-y-0"
      style={{
        display: 'grid',
        alignItems: 'baseline',
        marginBottom: 40,
      }}
    >
      <span
        style={{
          fontFamily: F.display,
          fontSize: 14,
          fontStyle: 'italic',
          color: 'var(--ed-accent)',
          letterSpacing: '0.1em',
        }}
      >
        § {num}
      </span>
      <span
        style={{
          fontFamily: F.display,
          fontSize: 'clamp(26px, 5vw, 32px)',
          fontWeight: 500,
          letterSpacing: '-0.02em',
          color: 'var(--ed-fg)',
        }}
      >
        {title}
      </span>
      <div
        className="hidden sm:block"
        style={{ height: 1, backgroundColor: 'var(--ed-rule)' }}
      />
      <span
        style={{
          fontFamily: F.mono,
          fontSize: 11,
          textTransform: 'uppercase',
          letterSpacing: '0.18em',
          color: 'var(--ed-fg-muted)',
        }}
      >
        {sub}
      </span>
    </div>
  )
}
