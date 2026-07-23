import { describe, it, expect } from 'vitest'
import { parseManifest } from '@/lib/offline/manifest'
import { planBundleSync, SUPPORTED_SCHEMA_VERSION } from '@/lib/offline/plan'
import { sha256Hex, verifySha256 } from '@/lib/offline/verify'
import type { BundleInfo, Manifest } from '@/lib/offline/types'

const RAW_BUNDLE = {
  id: 'quran-en',
  scripture: 'quran',
  lang: 'en',
  url: 'https://cdn.example/offline/quran-en-v3.db',
  bytes: 2744320,
  sha256: 'a'.repeat(64),
  data_version: 3,
  schema_version: 1,
  normalization_version: 1,
  fts_tokenizer: 'porter unicode61 remove_diacritics 2',
}

describe('parseManifest', () => {
  it('parses and camelCases a valid manifest', () => {
    const m = parseManifest({ bundles: [RAW_BUNDLE] })
    expect(m.bundles).toHaveLength(1)
    expect(m.bundles[0]).toMatchObject({
      id: 'quran-en',
      dataVersion: 3,
      schemaVersion: 1,
      normalizationVersion: 1,
      ftsTokenizer: 'porter unicode61 remove_diacritics 2',
    })
  })

  it('rejects a malformed sha256', () => {
    expect(() => parseManifest({ bundles: [{ ...RAW_BUNDLE, sha256: 'xyz' }] })).toThrow()
  })

  it('rejects a non-url', () => {
    expect(() => parseManifest({ bundles: [{ ...RAW_BUNDLE, url: 'not a url' }] })).toThrow()
  })

  it('rejects a missing field', () => {
    const incomplete = { ...RAW_BUNDLE } as Partial<typeof RAW_BUNDLE>
    delete incomplete.data_version
    expect(() => parseManifest({ bundles: [incomplete] })).toThrow()
  })
})

function info(over: Partial<BundleInfo>): BundleInfo {
  return {
    id: 'quran-en',
    scripture: 'quran',
    lang: 'en',
    bytes: 1,
    sha256: 'a'.repeat(64),
    dataVersion: 3,
    schemaVersion: 1,
    normalizationVersion: 1,
    ftsTokenizer: 'porter unicode61 remove_diacritics 2',
    installedAt: 0,
    ...over,
  }
}

const manifest = (over: Partial<(typeof RAW_BUNDLE)> = {}): Manifest =>
  parseManifest({ bundles: [{ ...RAW_BUNDLE, ...over }] })

describe('planBundleSync', () => {
  const sel = (...ids: string[]) => new Set(ids)

  it('installs a selected bundle that is not present', () => {
    const plan = planBundleSync([], manifest(), sel('quran-en'))
    expect(plan.toInstall.map((b) => b.id)).toEqual(['quran-en'])
    expect(plan.toUpdate).toEqual([])
    expect(plan.toRemove).toEqual([])
  })

  it('does nothing when the installed bundle matches the remote', () => {
    const plan = planBundleSync([info({})], manifest(), sel('quran-en'))
    expect(plan.toInstall).toEqual([])
    expect(plan.toUpdate).toEqual([])
    expect(plan.toRemove).toEqual([])
  })

  it('updates when data_version bumps', () => {
    const plan = planBundleSync([info({ dataVersion: 2 })], manifest({ data_version: 3 }), sel('quran-en'))
    expect(plan.toUpdate.map((b) => b.id)).toEqual(['quran-en'])
    expect(plan.toInstall).toEqual([])
  })

  it('updates when the checksum differs at the same data_version', () => {
    const plan = planBundleSync([info({ sha256: 'b'.repeat(64) })], manifest(), sel('quran-en'))
    expect(plan.toUpdate.map((b) => b.id)).toEqual(['quran-en'])
  })

  it('removes an installed bundle that is no longer selected', () => {
    const plan = planBundleSync([info({})], manifest(), sel())
    expect(plan.toRemove).toEqual(['quran-en'])
    expect(plan.toInstall).toEqual([])
  })

  it('flags a remote whose schema_version exceeds the client as incompatible', () => {
    const plan = planBundleSync([], manifest({ schema_version: SUPPORTED_SCHEMA_VERSION + 1 }), sel('quran-en'))
    expect(plan.incompatible.map((b) => b.id)).toEqual(['quran-en'])
    expect(plan.toInstall).toEqual([])
  })

  it('flags a normalization_version mismatch as incompatible', () => {
    const plan = planBundleSync([], manifest({ normalization_version: 2 }), sel('quran-en'), {
      clientNormalizationVersion: 1,
    })
    expect(plan.incompatible.map((b) => b.id)).toEqual(['quran-en'])
    expect(plan.toInstall).toEqual([])
  })

  it('ignores a selected id the manifest does not offer', () => {
    const plan = planBundleSync([], manifest(), sel('quran-fr'))
    expect(plan.toInstall).toEqual([])
    expect(plan.incompatible).toEqual([])
  })

  // ── Edge cases ─────────────────────────────────────────────────────────────

  it('leaves an installed+selected bundle the manifest dropped untouched (orphan)', () => {
    // Still selected, so not removed; no longer offered, so cannot update.
    const plan = planBundleSync([info({ id: 'quran-fr', lang: 'fr' })], manifest(), sel('quran-fr'))
    expect(plan.toInstall).toEqual([])
    expect(plan.toUpdate).toEqual([])
    expect(plan.toRemove).toEqual([])
    expect(plan.incompatible).toEqual([])
  })

  it('removes an installed bundle absent from both the manifest and the selection', () => {
    const plan = planBundleSync([info({ id: 'quran-fr', lang: 'fr' })], manifest(), sel())
    expect(plan.toRemove).toEqual(['quran-fr'])
    expect(plan.toInstall).toEqual([])
  })

  it('flags a normalization_version mismatch when the CLIENT is newer than the server', () => {
    // Server bundle norm=1, client norm=2 -> still incompatible (other direction).
    const plan = planBundleSync([], manifest({ normalization_version: 1 }), sel('quran-en'), {
      clientNormalizationVersion: 2,
    })
    expect(plan.incompatible.map((b) => b.id)).toEqual(['quran-en'])
    expect(plan.toInstall).toEqual([])
  })

  it('installs a bundle whose schema_version equals the supported boundary', () => {
    const plan = planBundleSync([], manifest({ schema_version: SUPPORTED_SCHEMA_VERSION }), sel('quran-en'))
    expect(plan.toInstall.map((b) => b.id)).toEqual(['quran-en'])
    expect(plan.incompatible).toEqual([])
  })

  it('handles an empty manifest: removes deselected, cannot install anything', () => {
    const empty = parseManifest({ bundles: [] })
    // quran-en installed but deselected -> removed; quran-ar selected but not offered -> ignored.
    const plan = planBundleSync([info({})], empty, sel('quran-ar'))
    expect(plan.toRemove).toEqual(['quran-en'])
    expect(plan.toInstall).toEqual([])
    expect(plan.incompatible).toEqual([])
  })

  it('resolves install, update, remove, and incompatible in a single mixed pass', () => {
    const multi = parseManifest({
      bundles: [
        { ...RAW_BUNDLE, id: 'quran-en', lang: 'en', data_version: 3 }, // installed at v2 -> update
        { ...RAW_BUNDLE, id: 'quran-ar', lang: 'ar', sha256: 'a'.repeat(64) }, // not installed -> install
        { ...RAW_BUNDLE, id: 'quran-de', lang: 'de', schema_version: SUPPORTED_SCHEMA_VERSION + 1 }, // -> incompatible
      ],
    })
    const installed = [
      info({ id: 'quran-en', lang: 'en', dataVersion: 2 }),
      info({ id: 'quran-fr', lang: 'fr' }), // not selected -> remove
    ]
    const plan = planBundleSync(installed, multi, sel('quran-en', 'quran-ar', 'quran-de'))
    expect(plan.toUpdate.map((b) => b.id)).toEqual(['quran-en'])
    expect(plan.toInstall.map((b) => b.id)).toEqual(['quran-ar'])
    expect(plan.incompatible.map((b) => b.id)).toEqual(['quran-de'])
    expect(plan.toRemove).toEqual(['quran-fr'])
  })
})

describe('sha256', () => {
  it('matches the known digest of "abc"', async () => {
    const bytes = new TextEncoder().encode('abc')
    expect(await sha256Hex(bytes)).toBe(
      'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad',
    )
  })

  it('verifySha256 is case-insensitive on the expected digest', async () => {
    const bytes = new TextEncoder().encode('abc')
    const upper = 'BA7816BF8F01CFEA414140DE5DAE2223B00361A396177A9CB410FF61F20015AD'
    expect(await verifySha256(bytes, upper)).toBe(true)
    expect(await verifySha256(bytes, 'f'.repeat(64))).toBe(false)
  })

  it('hashes empty bytes to the canonical empty-string digest', async () => {
    const empty = new Uint8Array(0)
    expect(await sha256Hex(empty)).toBe(
      'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    )
    expect(
      await verifySha256(empty, 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'),
    ).toBe(true)
  })
})
