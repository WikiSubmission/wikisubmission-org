import styles from '@/components/today/today.module.css'
import { luminaryTop, phaseTint, type MotifSceneProps } from '@/components/today/motif-types'

/**
 * "Sharpened Violet" motif: floating faceted crystals with prismatic gradients
 * and slow shimmering glints, lit by a soft orb that tracks the time of day.
 */
export function CrystalScene({ colors, time, mode }: MotifSceneProps) {
  const orbOpacity = (mode === 'dark' ? 0.4 : 0.25) * (0.4 + time.luminaryAltitude * 0.6)

  return (
    <div className={styles.layer} style={{ backgroundColor: colors.bg }}>
      {/* Luminary orb */}
      <div
        style={{
          position: 'absolute',
          left: `${time.luminaryX}%`,
          top: luminaryTop(time.luminaryAltitude),
          width: '55vmax',
          height: '55vmax',
          transform: 'translate(-50%, -50%)',
          background: `radial-gradient(circle, ${colors.accent} 0%, transparent 60%)`,
          opacity: orbOpacity,
          filter: 'blur(6px)',
        }}
      />

      <svg
        className={styles.layer}
        viewBox="0 0 100 100"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="crystal-face-a" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={colors.accent} stopOpacity="0.55" />
            <stop offset="100%" stopColor={colors.fg} stopOpacity="0.08" />
          </linearGradient>
          <linearGradient id="crystal-face-b" x1="1" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={colors.fg} stopOpacity="0.3" />
            <stop offset="100%" stopColor={colors.accent} stopOpacity="0.25" />
          </linearGradient>
        </defs>

        {/* Crystal cluster, upper right */}
        <g className={styles.float} style={{ transformBox: 'fill-box' }}>
          <polygon points="72,8 86,20 80,40 66,34 62,18" fill="url(#crystal-face-a)" />
          <polygon points="80,40 86,20 96,30 92,52 78,46" fill="url(#crystal-face-b)" />
          <polygon points="66,34 80,40 78,46 64,52 58,38" fill="url(#crystal-face-a)" />
        </g>

        {/* Crystal cluster, lower left */}
        <g className={styles.floatDelayed} style={{ transformBox: 'fill-box' }}>
          <polygon points="10,62 26,56 32,74 18,86 6,78" fill="url(#crystal-face-b)" />
          <polygon points="26,56 40,64 38,82 32,74" fill="url(#crystal-face-a)" />
          <polygon points="6,78 18,86 12,98 2,92" fill="url(#crystal-face-b)" />
        </g>

        {/* Glints */}
        <g className={styles.shimmer}>
          <polygon points="74,12 78,16 74,22 71,16" fill={colors.fg} fillOpacity="0.8" />
        </g>
        <g className={styles.shimmerDelayed}>
          <polygon points="20,64 23,67 20,72 17,67" fill={colors.fg} fillOpacity="0.8" />
        </g>
      </svg>

      {/* Time-of-day mood tint */}
      <div style={{ position: 'absolute', inset: 0, backgroundColor: phaseTint(time, mode) }} />
    </div>
  )
}
