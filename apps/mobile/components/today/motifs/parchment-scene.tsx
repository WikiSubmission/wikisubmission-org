import styles from '@/components/today/today.module.css'
import { luminaryTop, phaseTint, type MotifSceneProps } from '@/components/today/motif-types'

/**
 * "Ink on Parchment" motif: warm paper, faint ruled lines, soft sunlight that
 * tracks the time of day, and slow drifting ink washes.
 */
export function ParchmentScene({ colors, time, mode }: MotifSceneProps) {
  const lightOpacity = time.isDay ? 0.18 + time.luminaryAltitude * 0.32 : 0.08

  return (
    <div className={styles.layer} style={{ backgroundColor: colors.bg }}>
      {/* Sunlight / moonlight glow tracking across the page */}
      <div
        className={styles.drift}
        style={{
          position: 'absolute',
          left: `${time.luminaryX}%`,
          top: luminaryTop(time.luminaryAltitude),
          width: '60vmax',
          height: '60vmax',
          transform: 'translate(-50%, -50%)',
          background: `radial-gradient(circle, ${colors.accent} 0%, transparent 65%)`,
          opacity: lightOpacity,
          filter: 'blur(8px)',
        }}
      />

      {/* Drifting ink washes */}
      <div
        className={styles.driftSlow}
        style={{
          position: 'absolute',
          left: '12%',
          bottom: '-10%',
          width: '50vmax',
          height: '50vmax',
          background: `radial-gradient(circle, ${colors.accent} 0%, transparent 60%)`,
          opacity: mode === 'dark' ? 0.16 : 0.1,
        }}
      />

      {/* Faint ruled lines, like aged lined paper */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `repeating-linear-gradient(to bottom, transparent 0, transparent 31px, ${colors.rule} 31px, ${colors.rule} 32px)`,
          opacity: mode === 'dark' ? 0.12 : 0.2,
        }}
      />

      {/* Paper grain */}
      <svg className={styles.layer} aria-hidden="true">
        <filter id="parchment-grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#parchment-grain)" opacity={mode === 'dark' ? 0.05 : 0.04} />
      </svg>

      {/* Time-of-day mood tint */}
      <div style={{ position: 'absolute', inset: 0, backgroundColor: phaseTint(time, mode) }} />
    </div>
  )
}
