import { buildPageMetadata } from '@/constants/metadata'
import { wsApiServer } from '@/src/api/server-client'
import CommunityClient, {
  type Location,
  type SocialCard,
} from './community-client'
import {
  countryName,
  platformIcon,
  platformSub,
  PLATFORM_COLORS,
  PLATFORM_LABELS,
  regionFromCountry,
  type ApiCommunity,
  type Platform,
} from './community-helpers'

export const metadata = buildPageMetadata({
  title: 'Community | WikiSubmission',
  description:
    'Submitter communities worldwide — find an in-person group, an online circle, or a submitter-run publication.',
  url: '/community',
})

// Sanity-backed; the backend invalidates its own cache via webhook. Refresh
// the SSR copy hourly so changes propagate without a redeploy.
export const revalidate = 3600

function toLocation(c: ApiCommunity): Location | null {
  if (!c.geo?.lat || !c.geo?.lng) return null
  return {
    id: c._id,
    name: c.name,
    city: c.city ?? '',
    region: regionFromCountry(c.country),
    country: countryName(c.country),
    lat: c.geo.lat,
    lng: c.geo.lng,
    contact: c.contactEmail ?? c.contactPhone ?? '',
    desc: c.description ?? '',
    schedule: c.meetingSchedule,
    address: c.address,
  }
}

function toSocialCard(c: ApiCommunity): SocialCard {
  const platform: Platform = c.platform ?? 'other'
  return {
    id: c._id,
    name: c.name,
    platform: PLATFORM_LABELS[platform],
    sub: platformSub(c),
    desc: c.description ?? '',
    bio: c.description ?? '',
    color: PLATFORM_COLORS[platform],
    url: c.url ?? '#',
    icon: platformIcon(platform),
  }
}

export default async function CommunityPage() {
  const { data, error } = await wsApiServer.GET('/communities', {})

  const communities: ApiCommunity[] = error || !data ? [] : data
  const active = communities.filter((c) => c.isActive)

  const physical = active
    .filter((c) => c.kind === 'physical')
    .map(toLocation)
    .filter((x): x is Location => x !== null)

  const social = active.filter((c) => c.kind === 'online').map(toSocialCard)

  return <CommunityClient physical={physical} social={social} />
}
