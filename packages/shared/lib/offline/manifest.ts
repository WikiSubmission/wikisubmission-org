import { z } from 'zod'
import type { BundleDescriptor, Manifest } from './types'

// The wire format is snake_case (emitted by the ws-backend bundle builder). We
// validate it at the boundary and transform to the camelCased BundleDescriptor.
const bundleSchema = z
  .object({
    id: z.string().min(1),
    scripture: z.string().min(1),
    lang: z.string().min(1),
    url: z.string().url(),
    bytes: z.number().int().positive(),
    sha256: z.string().regex(/^[0-9a-f]{64}$/, 'sha256 must be 64 lowercase hex chars'),
    data_version: z.number().int().nonnegative(),
    schema_version: z.number().int().positive(),
    normalization_version: z.number().int().positive(),
    fts_tokenizer: z.string().min(1),
  })
  .transform(
    (b): BundleDescriptor => ({
      id: b.id,
      scripture: b.scripture,
      lang: b.lang,
      url: b.url,
      bytes: b.bytes,
      sha256: b.sha256,
      dataVersion: b.data_version,
      schemaVersion: b.schema_version,
      normalizationVersion: b.normalization_version,
      ftsTokenizer: b.fts_tokenizer,
    }),
  )

const manifestSchema = z.object({ bundles: z.array(bundleSchema) })

/** Validate and normalize an untrusted manifest payload. Throws on malformed input. */
export function parseManifest(input: unknown): Manifest {
  return manifestSchema.parse(input)
}

/** Fetch and validate the manifest. The manifest is short-TTL; bundle URLs are
 * immutable, so we bypass the HTTP cache for the manifest itself. */
export async function fetchManifest(url: string, signal?: AbortSignal): Promise<Manifest> {
  const res = await fetch(url, { signal, cache: 'no-store' })
  if (!res.ok) {
    throw new Error(`manifest fetch failed: ${res.status} ${res.statusText}`)
  }
  return parseManifest(await res.json())
}
