import Link from 'next/link'

interface VerseRefPillProps {
  /** Verse key, e.g. "36:69" */
  verseKey: string
  /** Scripture scope — defaults to quran for the reader path. */
  scripture?: 'quran' | 'bible'
  className?: string
}

export function VerseRefPill({ verseKey, scripture = 'quran', className = '' }: VerseRefPillProps) {
  const [chapter, verse] = verseKey.split(':')
  const href = scripture === 'quran' ? `/quran/${chapter}?verse=${verse}` : `/bible/${verseKey}`
  return (
    <Link href={href} className={`ref ${className}`.trim()}>
      § {verseKey}
    </Link>
  )
}
