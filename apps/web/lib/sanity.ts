import { createClient } from '@sanity/client'

const PROJECT_ID  = process.env.SANITY_PROJECT_ID  ?? process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? 'buildtime'
const DATASET     = process.env.SANITY_DATASET     ?? process.env.NEXT_PUBLIC_SANITY_DATASET ?? 'production'
const API_VERSION = '2024-01-01'
const PREVIEW_TOKEN = process.env.SANITY_API_READ_TOKEN

// Server Components / Route Handlers: direct API, no CDN edge
export const sanityServer = createClient({
  projectId:  PROJECT_ID,
  dataset:    DATASET,
  apiVersion: API_VERSION,
  useCdn: false,
})

// Browser / client usage: CDN-cached reads
export const sanityClient = createClient({
  projectId:  PROJECT_ID,
  dataset:    DATASET,
  apiVersion: API_VERSION,
  useCdn: true,
})

// Draft preview reads require a private token and must bypass the CDN.
export const sanityPreviewServer = PREVIEW_TOKEN
  ? createClient({
      projectId: PROJECT_ID,
      dataset: DATASET,
      apiVersion: API_VERSION,
      useCdn: false,
      token: PREVIEW_TOKEN,
      perspective: 'drafts',
    })
  : null

/** Build a Sanity image URL from a raw image asset object */
export function urlFor(source: { asset?: { _ref?: string; url?: string } } | null | undefined): string {
  if (!source) return ''
  if (source.asset?.url) return source.asset.url
  const ref = source.asset?._ref ?? ''
  const [, id, dimensions, format] = ref.split('-')
  if (!id) return ''
  return `https://cdn.sanity.io/images/${PROJECT_ID}/${DATASET}/${id}-${dimensions}.${format}`
}
