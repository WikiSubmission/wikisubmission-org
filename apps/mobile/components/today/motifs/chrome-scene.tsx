import styles from '@/components/today/today.module.css'
import { luminaryTop, phaseTint, type MotifSceneProps } from '@/components/today/motif-types'

/**
 * "Monochrome" motif: liquid-chrome blobs that slowly merge and morph under a
 * goo filter, with a metallic sheen and a drifting highlight. Reads as mercury.
 */
export function ChromeScene({ colors, time, mode }: MotifSceneProps) {
  const highlight = mode === 'dark' ? colors.fg : '#ffffff'

  return (
    <div className={styles.layer} style={{ backgroundColor: colors.bg }}>
      <svg
        className={styles.layer}
        viewBox="0 0 100 100"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="chrome-metal" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={colors.fg} stopOpacity="0.55" />
            <stop offset="38%" stopColor={colors.rule} stopOpacity="0.7" />
            <stop offset="62%" stopColor={colors.bg} stopOpacity="0.9" />
            <stop offset="100%" stopColor={colors.fg} stopOpacity="0.5" />
          </linearGradient>
          <filter id="chrome-goo">
            <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur" />
            <feColorMatrix
              in="blur"
              mode="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 22 -10"
              result="goo"
            />
            <feBlend in="SourceGraphic" in2="goo" />
          </filter>
        </defs>

        <g filter="url(#chrome-goo)" opacity={mode === 'dark' ? 0.5 : 0.4}>
          <circle className={styles.morph} cx="30" cy="35" r="16" fill="url(#chrome-metal)" style={{ transformBox: 'fill-box' }} />
          <circle className={styles.morphDelayed} cx="52" cy="44" r="13" fill="url(#chrome-metal)" style={{ transformBox: 'fill-box' }} />
          <circle className={styles.morph} cx="70" cy="68" r="18" fill="url(#chrome-metal)" style={{ transformBox: 'fill-box' }} />
          <circle className={styles.morphDelayed} cx="20" cy="74" r="11" fill="url(#chrome-metal)" style={{ transformBox: 'fill-box' }} />
        </g>

        {/* Sheen streaks */}
        <g className={styles.shimmer}>
          <rect x="24" y="28" width="2" height="14" rx="1" fill={highlight} fillOpacity="0.6" transform="rotate(-30 25 35)" />
        </g>
        <g className={styles.shimmerDelayed}>
          <rect x="66" y="60" width="2" height="16" rx="1" fill={highlight} fillOpacity="0.6" transform="rotate(-30 67 68)" />
        </g>
      </svg>

      {/* Drifting highlight that tracks the time of day */}
      <div
        style={{
          position: 'absolute',
          left: `${time.luminaryX}%`,
          top: luminaryTop(time.luminaryAltitude),
          width: '45vmax',
          height: '45vmax',
          transform: 'translate(-50%, -50%)',
          background: `radial-gradient(circle, ${highlight} 0%, transparent 60%)`,
          opacity: (mode === 'dark' ? 0.18 : 0.28) * (0.5 + time.luminaryAltitude * 0.5),
          filter: 'blur(4px)',
        }}
      />

      {/* Time-of-day mood tint, kept subtle so the metal stays neutral */}
      <div
        style={{ position: 'absolute', inset: 0, backgroundColor: phaseTint(time, mode), opacity: 0.5 }}
      />
    </div>
  )
}
