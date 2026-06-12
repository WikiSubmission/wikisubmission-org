export type Scripture = 'quran' | 'bible'
export type StatsView = 'quran' | 'bible' | 'combined'

export const SCRIPTURE_COLORS: Record<Scripture, string> = {
  quran: 'var(--ed-accent)',
  bible: 'var(--chart-4)',
}

export const SCRIPTURE_LABEL: Record<Scripture, string> = {
  quran: 'Quran',
  bible: 'Bible',
}

export const RULE_COLOR = 'var(--ed-rule)'
export const FG_COLOR = 'var(--ed-fg)'
export const FG_MUTED = 'var(--ed-fg-muted)'

export const AXIS_TICK_LABEL_PROPS = {
  fill: 'var(--ed-fg-muted)',
  fontFamily: 'var(--font-jetbrains)',
  fontSize: 10,
  letterSpacing: '0.06em',
} as const

export const WEEKDAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
