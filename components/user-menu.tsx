'use client'

import { signOut } from 'next-auth/react'
import { useUser } from '@/hooks/use-user'
import { useSignInPromptStore } from '@/store/sign-in-prompt'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { LogOut, User } from 'lucide-react'

export function UserMenu() {
  const { user, isAuthenticated, isLoading } = useUser()
  const openSignIn = useSignInPromptStore((s) => s.open)

  if (isLoading) {
    return <div className="w-8 h-8 rounded-full bg-muted animate-pulse" />
  }

  if (!isAuthenticated) {
    return (
      <button
        onClick={openSignIn}
        className="inline-flex items-center h-[34px] px-3 rounded-[2px] transition-colors"
        style={{
          fontFamily: 'var(--font-jetbrains), ui-monospace, monospace',
          fontSize: 10.5,
          letterSpacing: '0.16em',
          textTransform: 'uppercase',
          color: 'var(--ed-fg-muted)',
          border: '1px solid var(--ed-rule)',
          background: 'transparent',
          cursor: 'pointer',
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLButtonElement).style.color = 'var(--ed-fg)'
          ;(e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--ed-fg)'
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.color = 'var(--ed-fg-muted)'
          ;(e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--ed-rule)'
        }}
      >
        Sign in
      </button>
    )
  }

  const initials = user?.name
    ? user.name.slice(0, 2).toUpperCase()
    : (user?.email?.slice(0, 2).toUpperCase() ?? 'WS')

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90 transition-opacity">
          {user?.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={user.image}
              alt={user.name ?? 'avatar'}
              className="w-8 h-8 rounded-full object-cover"
            />
          ) : (
            initials
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <div className="px-2 py-1.5">
          {user?.name && (
            <p className="text-sm font-medium text-foreground truncate">
              {user.name}
            </p>
          )}
          {user?.email && (
            <p className="text-xs text-muted-foreground truncate">
              {user.email}
            </p>
          )}
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <a href="/me" className="flex items-center gap-2">
            <User className="w-4 h-4" />
            Profile
          </a>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => signOut({ callbackUrl: '/' })}
          className="flex items-center gap-2 text-destructive focus:text-destructive"
        >
          <LogOut className="w-4 h-4" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
