export const DEFAULT_VELOCITY = 220
export const GAP_VELOCITY = 260

export interface Anchor {
  p: number
  v: number
}

export interface SceneProfile {
  id: string
  anchors: Anchor[]
  gapVelocityAfter: number
}

export interface Zone {
  startY: number
  endY: number
  sample: (y: number) => number
}

export interface TriggerLike {
  id?: string
  start: number
  end: number
}

export const SCENE_PROFILES: SceneProfile[] = [
  {
    id: 'hero',
    anchors: [
      { p: 0, v: 140 },
      { p: 0.5, v: 140 },
      { p: 1, v: 200 },
    ],
    gapVelocityAfter: GAP_VELOCITY,
  },
  {
    id: 'bismillah',
    anchors: [
      { p: 0, v: 55 },
      { p: 0.7, v: 55 },
      { p: 0.85, v: 130 },
      { p: 1, v: 200 },
    ],
    gapVelocityAfter: GAP_VELOCITY,
  },
  {
    id: 'chapters',
    anchors: [
      { p: 0, v: 60 },
      { p: 0.75, v: 60 },
      { p: 1, v: 200 },
    ],
    gapVelocityAfter: GAP_VELOCITY,
  },
  {
    id: 'revelation',
    anchors: [
      { p: 0, v: 60 },
      { p: 0.75, v: 60 },
      { p: 1, v: 200 },
    ],
    gapVelocityAfter: GAP_VELOCITY,
  },
  {
    id: 'god',
    anchors: [
      { p: 0, v: 60 },
      { p: 0.7, v: 60 },
      { p: 0.85, v: 140 },
      { p: 1, v: 200 },
    ],
    gapVelocityAfter: GAP_VELOCITY,
  },
  {
    id: 'verse',
    anchors: [
      { p: 0, v: 65 },
      { p: 0.85, v: 65 },
      { p: 1, v: 200 },
    ],
    gapVelocityAfter: GAP_VELOCITY,
  },
  {
    id: 'discovery',
    anchors: [
      { p: 0, v: 65 },
      { p: 0.7, v: 65 },
      { p: 0.85, v: 140 },
      { p: 1, v: 200 },
    ],
    gapVelocityAfter: GAP_VELOCITY,
  },
  {
    id: 'finale',
    anchors: [
      { p: 0, v: 75 },
      { p: 0.6, v: 75 },
      { p: 1, v: 160 },
    ],
    gapVelocityAfter: GAP_VELOCITY,
  },
]

function interpolate(anchors: Anchor[], p: number): number {
  if (anchors.length === 0) return DEFAULT_VELOCITY
  if (p <= anchors[0].p) return anchors[0].v
  const last = anchors[anchors.length - 1]
  if (p >= last.p) return last.v
  for (let i = 1; i < anchors.length; i++) {
    const a = anchors[i - 1]
    const b = anchors[i]
    if (p >= a.p && p <= b.p) {
      const span = b.p - a.p
      if (span <= 0) return b.v
      const t = (p - a.p) / span
      return a.v + (b.v - a.v) * t
    }
  }
  return last.v
}

export function buildVelocityZones(
  triggers: TriggerLike[],
  profiles: SceneProfile[],
): Zone[] {
  const byId = new Map(triggers.filter((t) => t.id).map((t) => [t.id!, t]))
  const ordered: { profile: SceneProfile; start: number; end: number }[] = []
  for (const profile of profiles) {
    const trig = byId.get(profile.id)
    if (!trig) continue
    ordered.push({ profile, start: trig.start, end: trig.end })
  }
  ordered.sort((a, b) => a.start - b.start)

  const zones: Zone[] = []
  for (let i = 0; i < ordered.length; i++) {
    const { profile, start, end } = ordered[i]
    const span = Math.max(end - start, 1)
    zones.push({
      startY: start,
      endY: end,
      sample: (y: number) => {
        const p = Math.max(0, Math.min(1, (y - start) / span))
        return interpolate(profile.anchors, p)
      },
    })

    const next = ordered[i + 1]
    if (next && next.start > end) {
      const gapVelocity = profile.gapVelocityAfter
      zones.push({
        startY: end,
        endY: next.start,
        sample: () => gapVelocity,
      })
    }
  }
  return zones
}

export function sampleVelocityAt(
  scrollY: number,
  zones: Zone[],
  fallback: number = DEFAULT_VELOCITY,
): number {
  if (zones.length === 0) return fallback
  let lo = 0
  let hi = zones.length - 1
  while (lo <= hi) {
    const mid = (lo + hi) >> 1
    const z = zones[mid]
    if (scrollY < z.startY) {
      hi = mid - 1
    } else if (scrollY >= z.endY) {
      lo = mid + 1
    } else {
      return z.sample(scrollY)
    }
  }
  return fallback
}
