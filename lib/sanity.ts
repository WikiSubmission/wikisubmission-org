import { createClient } from '@sanity/client'

export const sanityClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET ?? 'production',
  apiVersion: '2024-01-01',
  useCdn: true,
})

/** Build a Sanity image URL from a raw image asset object */
export function urlFor(source: { asset?: { _ref?: string; url?: string } } | null | undefined): string {
  if (!source) return ''
  // If the asset already has a resolved URL (e.g. from a GROQ projection), use it directly
  if (source.asset?.url) return source.asset.url
  // Otherwise derive from the _ref format: image-{id}-{dimensions}-{format}
  const ref = source.asset?._ref ?? ''
  const [, id, dimensions, format] = ref.split('-')
  if (!id) return ''
  const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
  const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET ?? 'production'
  return `https://cdn.sanity.io/images/${projectId}/${dataset}/${id}-${dimensions}.${format}`
}
