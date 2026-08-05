import { NORMALIZATION_VERSION } from '../text-normalization/normalize'
import type { BundleDescriptor, BundleInfo, Manifest } from './types'

/** Highest content-DB schema_version this client understands. A remote bundle
 * with a higher schema_version requires an app update before it can be used. */
export const SUPPORTED_SCHEMA_VERSION = 1

export interface BundlePlan {
  /** Selected, usable, and not yet installed. */
  toInstall: BundleDescriptor[]
  /** Installed but the remote differs (data/schema/normalization version or checksum). */
  toUpdate: BundleDescriptor[]
  /** Installed bundle ids the user no longer wants. */
  toRemove: string[]
  /** Selected but unusable by this client (schema too new, or normalization
   * version mismatch between server and client). Surfaced to the UI, not acted on. */
  incompatible: BundleDescriptor[]
}

interface PlanOpts {
  supportedSchemaVersion?: number
  clientNormalizationVersion?: number
}

/**
 * Decide what to install, update, and remove given the locally installed
 * bundles, the remote manifest, and the set of bundle ids the user has selected
 * for offline use.
 *
 * Usability gate: a bundle is only queryable when its schema_version is
 * supported AND its normalization_version equals the client's — otherwise
 * query-time folding would not match index-time folding and search would be
 * silently wrong. Such bundles are reported as incompatible rather than installed.
 */
export function planBundleSync(
  installed: BundleInfo[],
  manifest: Manifest,
  selectedIds: ReadonlySet<string>,
  opts: PlanOpts = {},
): BundlePlan {
  const supportedSchema = opts.supportedSchemaVersion ?? SUPPORTED_SCHEMA_VERSION
  const clientNorm = opts.clientNormalizationVersion ?? NORMALIZATION_VERSION

  const installedById = new Map(installed.map((b) => [b.id, b]))
  const remoteById = new Map(manifest.bundles.map((b) => [b.id, b]))

  const toInstall: BundleDescriptor[] = []
  const toUpdate: BundleDescriptor[] = []
  const incompatible: BundleDescriptor[] = []

  for (const id of selectedIds) {
    const remote = remoteById.get(id)
    if (!remote) continue // selected but the server no longer offers it; ignore

    if (remote.schemaVersion > supportedSchema || remote.normalizationVersion !== clientNorm) {
      incompatible.push(remote)
      continue
    }

    const current = installedById.get(id)
    if (!current) {
      toInstall.push(remote)
      continue
    }
    if (
      current.dataVersion !== remote.dataVersion ||
      current.schemaVersion !== remote.schemaVersion ||
      current.normalizationVersion !== remote.normalizationVersion ||
      current.sha256 !== remote.sha256
    ) {
      toUpdate.push(remote)
    }
  }

  const toRemove = installed.filter((b) => !selectedIds.has(b.id)).map((b) => b.id)

  return { toInstall, toUpdate, toRemove, incompatible }
}
