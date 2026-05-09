'use client'

import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'
import { Bookmark, StickyNote, Library, Flame, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function MePage() {
  const { data: session } = useSession()
  const user = session?.user

  return (
    <div className="max-w-lg mx-auto px-4 py-12 flex flex-col gap-8">
      <div className="flex flex-col gap-1">
        {user?.name && (
          <h1 className="text-2xl font-semibold">{user.name}</h1>
        )}
        {user?.email && (
          <p className="text-sm text-muted-foreground">{user.email}</p>
        )}
      </div>

      <nav className="flex flex-col gap-1">
        {[
          { href: '/me/bookmarks', icon: Bookmark, label: 'Bookmarks' },
          { href: '/me/notes', icon: StickyNote, label: 'Notes' },
          { href: '/me/collections', icon: Library, label: 'Collections' },
          { href: '/me/streak', icon: Flame, label: 'Reading Streak' },
        ].map(({ href, icon: Icon, label }) => (
          <Link
            key={href}
            href={href}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-accent transition-colors text-sm"
          >
            <Icon className="w-4 h-4 text-muted-foreground" />
            {label}
          </Link>
        ))}
      </nav>

      <div className="pt-4 border-t border-border">
        <Button
          variant="ghost"
          className="text-destructive hover:text-destructive flex items-center gap-2"
          onClick={() => signOut({ callbackUrl: '/' })}
        >
          <LogOut className="w-4 h-4" />
          Sign out
        </Button>
      </div>
    </div>
  )
}
