'use client'

import { Input } from '@/components/ui/input'
import { SearchIcon } from 'lucide-react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'

export default function QuranSearchbar() {
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const { replace } = useRouter()
  const [searchQuery, setSearchQuery] = useState(
    searchParams.get('q')?.toString() || ''
  )
  const prevUrlQueryRef = useRef(searchParams.get('q')?.toString() || '')

  // Sync state with URL params when they change externally (e.g., clicking a link)
  useEffect(() => {
    const urlQuery = searchParams.get('q')?.toString() || ''
    if (prevUrlQueryRef.current !== urlQuery) {
      prevUrlQueryRef.current = urlQuery
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSearchQuery(urlQuery)
    }
  }, [searchParams])

  const performSearch = useCallback(
    (queryToSearch: string) => {
      const params = new URLSearchParams(searchParams.toString())
      if (queryToSearch) {
        params.set('q', decodeURIComponent(queryToSearch))
      } else {
        params.delete('q')
      }
      replace(`${pathname}?${params.toString()}`)
    },
    [pathname, replace, searchParams]
  )

  return (
    <form
      className="relative w-full"
      onSubmit={(e) => {
        e.preventDefault()
        performSearch(searchQuery)
      }}
    >
      <SearchIcon className="absolute left-2 top-2.5 size-3.5 text-muted-foreground/60 z-10" />
      <Input
        type="search"
        placeholder="Search Quran"
        className={cn(
          'pl-7 h-8 text-sm border-0 bg-secondary focus-visible:ring-0 focus-visible:ring-offset-0 shadow-none transition-all duration-200'
        )}
        value={searchQuery}
        onChange={(e) => {
          setSearchQuery(e.target.value)
        }}
      />
    </form>
  )
}
