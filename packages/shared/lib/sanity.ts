import { createClient } from '@sanity/client'

// Client-safe Sanity access shared by web (browser reads) and the mobile static
// export. Server-only clients (direct API + draft preview) stay in the web app
// at apps/web/lib/sanity.ts where the private token lives.
const PROJECT_ID = process.env.SANITY_PROJECT_ID ?? process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? 'buildtime'
const DATASET = process.env.SANITY_DATASET ?? process.env.NEXT_PUBLIC_SANITY_DATASET ?? 'production'
const API_VERSION = '2024-01-01'

// CDN-cached reads — safe in the browser and in a static export. The timeout
// bounds the request so callers' loading states always resolve to an error
// instead of spinning forever on an unreachable host.
export const sanityClient = createClient({
  projectId: PROJECT_ID,
  dataset: DATASET,
  apiVersion: API_VERSION,
  useCdn: true,
  timeout: 15_000,
})

/** Build a Sanity image URL from a raw image asset object. */
export function urlFor(source: { asset?: { _ref?: string; url?: string } } | null | undefined): string {
  if (!source) return ''
  if (source.asset?.url) return source.asset.url
  const ref = source.asset?._ref ?? ''
  const [, id, dimensions, format] = ref.split('-')
  if (!id) return ''
  return `https://cdn.sanity.io/images/${PROJECT_ID}/${DATASET}/${id}-${dimensions}.${format}`
}
