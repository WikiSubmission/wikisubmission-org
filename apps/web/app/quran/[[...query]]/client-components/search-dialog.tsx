'use client'

import { useState, useCallback, useRef } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { SearchIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useTranslations } from 'next-intl'

export default function QuranSearchDialog() {
  const t = useTranslations('search')
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const { replace } = useRouter()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const performSearch = useCallback(
    (q: string) => {
      const params = new URLSearchParams(searchParams.toString())
      if (q) {
        params.set('q', decodeURIComponent(q))
      } else {
        params.delete('q')
      }
      replace(`${pathname}?${params.toString()}`)
      setOpen(false)
    },
    [pathname, replace, searchParams]
  )

  function handleOpen() {
    setQuery(searchParams.get('q') ?? '')
    setOpen(true)
  }

  return (
    <>
      <Button
        variant="outline"
        size="icon-sm"
        aria-label="Search Quran"
        className="shrink-0"
        onClick={handleOpen}
      >
        <SearchIcon className="size-4" />
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          className="sm:max-w-lg top-[20%] translate-y-0 data-[state=open]:slide-in-from-top-[10%]"
          onOpenAutoFocus={(e) => {
            e.preventDefault()
            inputRef.current?.focus()
          }}
        >
          <DialogHeader>
            <DialogTitle className="text-sm font-semibold text-muted-foreground">
              {t('placeholder')}
            </DialogTitle>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              performSearch(query)
            }}
            className="relative"
          >
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/60 z-10" />
            <Input
              ref={inputRef}
              type="search"
              placeholder={t('placeholder')}
              className="pl-9 h-11 text-base border-0 bg-secondary focus-visible:ring-0 focus-visible:ring-offset-0 shadow-none rounded-xl"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
