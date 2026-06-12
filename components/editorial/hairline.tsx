interface HairlineProps {
  className?: string
}

export function Hairline({ className = '' }: HairlineProps) {
  return <div className={`h-px w-full bg-[var(--ed-rule)] ${className}`.trim()} aria-hidden />
}
