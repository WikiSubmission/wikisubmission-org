'use client'

import { Flame } from 'lucide-react'
import { useStreak } from '@/hooks/use-reading-streak'

function StreakSection({ scripture, label }: { scripture: string; label: string }) {
  const streak = useStreak(scripture)

  return (
    <section className="flex flex-col gap-4 p-4 rounded-xl border border-border">
      <h2 className="text-xs font-mono uppercase tracking-widest text-muted-foreground">{label}</h2>
      {streak ? (
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-0.5">
            <div className="flex items-center gap-1.5 text-2xl font-bold">
              <Flame className="w-5 h-5 text-orange-500" />
              {streak.current_streak}
            </div>
            <span className="text-xs text-muted-foreground">Current streak (days)</span>
          </div>
          <div className="flex flex-col gap-0.5">
            <div className="text-2xl font-bold">{streak.longest_streak}</div>
            <span className="text-xs text-muted-foreground">Longest streak</span>
          </div>
          <div className="flex flex-col gap-0.5">
            <div className="text-2xl font-bold">{streak.total_verses_read.toLocaleString()}</div>
            <span className="text-xs text-muted-foreground">Total verses read</span>
          </div>
          {streak.last_active_day && (
            <div className="flex flex-col gap-0.5">
              <div className="text-base font-medium">{streak.last_active_day}</div>
              <span className="text-xs text-muted-foreground">Last active</span>
            </div>
          )}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">Start reading to build your streak.</p>
      )}
    </section>
  )
}

export default function StreakPage() {
  return (
    <div className="max-w-lg mx-auto px-4 py-12 flex flex-col gap-6">
      <h1 className="text-xl font-semibold">Reading Streak</h1>
      <StreakSection scripture="quran" label="Quran" />
      <StreakSection scripture="bible" label="Bible" />
    </div>
  )
}
