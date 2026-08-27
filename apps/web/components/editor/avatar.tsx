/**
 * The editor's account avatar. Deliberately the same object as the one in the
 * site nav (components/user-menu.tsx): a round frame holding the provider photo
 * when there is one, and two-letter initials on the primary fill when there is
 * not. Keeping the two identical means an editor recognises themselves as the
 * same account across the two surfaces.
 *
 * No 'use client': it renders in the server-rendered TopBar and inside the
 * client sidebar menu alike.
 */
import { cn } from '@/lib/utils'

export function editorInitials(name: string, email?: string | null): string {
  const source = name.trim() || email?.trim() || ''
  return source ? source.slice(0, 2).toUpperCase() : 'WS'
}

interface EditorAvatarProps {
  name: string
  email?: string | null
  image?: string | null
  size?: number
  className?: string
}

export function EditorAvatar({
  name,
  email,
  image,
  size = 30,
  className,
}: EditorAvatarProps) {
  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary text-primary-foreground font-semibold',
        className
      )}
      style={{ width: size, height: size, fontSize: Math.round(size * 0.4) }}
    >
      {image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={image}
          alt={name || 'avatar'}
          width={size}
          height={size}
          className="h-full w-full rounded-full object-cover"
        />
      ) : (
        editorInitials(name, email)
      )}
    </span>
  )
}
