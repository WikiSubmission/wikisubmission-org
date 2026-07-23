/**
 * Library content registry: lazy per-appendix loaders so importing this index
 * never pulls the whole ~11k-line appendix corpus into one chunk. Consumers
 * await the loader in a server component (web) or static-export page (mobile).
 */
import type { ComponentType } from 'react'

type ContentModule = { AppendixContent: ComponentType }

const appendixLoaders: Record<number, () => Promise<ContentModule>> = {
  1: () => import('./appendices/appendix-1'),
  2: () => import('./appendices/appendix-2'),
  3: () => import('./appendices/appendix-3'),
  4: () => import('./appendices/appendix-4'),
  5: () => import('./appendices/appendix-5'),
  6: () => import('./appendices/appendix-6'),
  7: () => import('./appendices/appendix-7'),
  8: () => import('./appendices/appendix-8'),
  9: () => import('./appendices/appendix-9'),
  10: () => import('./appendices/appendix-10'),
  11: () => import('./appendices/appendix-11'),
  12: () => import('./appendices/appendix-12'),
  13: () => import('./appendices/appendix-13'),
  14: () => import('./appendices/appendix-14'),
  15: () => import('./appendices/appendix-15'),
  16: () => import('./appendices/appendix-16'),
  17: () => import('./appendices/appendix-17'),
  18: () => import('./appendices/appendix-18'),
  19: () => import('./appendices/appendix-19'),
  20: () => import('./appendices/appendix-20'),
  21: () => import('./appendices/appendix-21'),
  22: () => import('./appendices/appendix-22'),
  23: () => import('./appendices/appendix-23'),
  24: () => import('./appendices/appendix-24'),
  25: () => import('./appendices/appendix-25'),
  26: () => import('./appendices/appendix-26'),
  27: () => import('./appendices/appendix-27'),
  28: () => import('./appendices/appendix-28'),
  29: () => import('./appendices/appendix-29'),
  30: () => import('./appendices/appendix-30'),
  31: () => import('./appendices/appendix-31'),
  32: () => import('./appendices/appendix-32'),
  33: () => import('./appendices/appendix-33'),
  34: () => import('./appendices/appendix-34'),
  35: () => import('./appendices/appendix-35'),
  36: () => import('./appendices/appendix-36'),
  37: () => import('./appendices/appendix-37'),
  38: () => import('./appendices/appendix-38'),
}

/** Resolve the content component for an appendix number, or null when absent. */
export async function getAppendixContent(n: number): Promise<ComponentType | null> {
  const loader = appendixLoaders[n]
  if (!loader) return null
  try {
    const mod = await loader()
    return mod.AppendixContent ?? null
  } catch {
    return null
  }
}
