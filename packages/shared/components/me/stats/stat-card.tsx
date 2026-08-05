import type { ReactNode } from 'react'

interface StatCardProps {
  label: string
  value: ReactNode
  note?: ReactNode
}

export function StatCard({ label, value, note }: StatCardProps) {
  return (
    <div className="rs-stat">
      <span className="rs-stat-label">{label}</span>
      <span className="rs-stat-value">{value}</span>
      {note ? <span className="rs-stat-note">{note}</span> : null}
    </div>
  )
}
