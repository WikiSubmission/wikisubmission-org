'use client'

import { useState, useEffect } from 'react'
import { useMusic } from '@/lib/music-context'
import { FeaturedCard } from '@/app/(site)/music/components/featured-card'
import { TrackRow } from '@/app/(site)/music/components/track-row'
import { MusicPlayer } from '@/app/(site)/music/components/now-playing-bar'
import {
  Info,
  Heart,
  Music2,
  Search,
  Clock,
  Repeat,
} from 'lucide-react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { AppPrompt } from '@/app/(site)/music/components/app-prompt'
import { useTranslations } from 'next-intl'
import { cn } from '@/lib/utils'

type Tab = 'all' | 'favorites' | 'recent'

export default function MusicClient() {
  const t = useTranslations('music')
  const {
    allTracks,
    categories,
    isLoading,
    favorites,
    loopMode,
    currentTrack,
    playbackContext,
    playTrack,
  } = useMusic()
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState<Tab>('all')
  const searchParams = useSearchParams()
  const trackId = searchParams.get('track')

  // Update document title and metadata when track changes
  useEffect(() => {
    if (currentTrack) {
      const artistName = currentTrack.artist?.name || 'Unknown Artist'
      const title = `${currentTrack.title} by ${artistName} | Music (Zikr) | WikiSubmission`
      const description = `Listen to ${currentTrack.title} by ${artistName} on WikiSubmission. Glorification and commemoration of God through beautiful recitations and melodies.`

      document.title = title

      const updateMeta = (
        name: string,
        content: string | null | undefined,
        isProperty = false
      ) => {
        if (!content) return
        const attr = isProperty ? 'property' : 'name'
        const el = document.querySelector(`meta[${attr}="${name}"]`)
        if (el) el.setAttribute('content', content)
      }

      updateMeta('description', description)
      updateMeta('og:title', title, true)
      updateMeta('og:description', description, true)
      updateMeta('og:image', currentTrack.artist?.image_url, true)
      updateMeta('twitter:title', title)
      updateMeta('twitter:description', description)
      updateMeta('twitter:image', currentTrack.artist?.image_url)
    } else if (!isLoading) {
      document.title = 'Music (Zikr) | WikiSubmission'
    }
  }, [currentTrack, isLoading])

  // Auto-play or scroll to track if track ID is provided
  useEffect(() => {
    if (trackId && allTracks.length > 0 && !currentTrack) {
      const track = allTracks.find((t) => t.id === trackId)
      if (track) {
        playTrack(track, 'allTracks')
        setTimeout(() => {
          const el = document.getElementById(`track-${track.id}`)
          if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' })
        }, 500)
      }
    }
  }, [trackId, allTracks, currentTrack, playTrack])

  const featuredTracks = allTracks.filter((t) => t.featured)
  const favoriteTracks = allTracks.filter((t) => favorites.includes(t.url))

  const filteredTracks = searchQuery
    ? allTracks.filter(
        (t) =>
          t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          t.artist.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : allTracks

  const recentTracks = [...allTracks]
    .sort((a, b) => b.releaseDate.getTime() - a.releaseDate.getTime())
    .slice(0, 10)

  return (
    <main className="min-h-screen pb-32">
      <AppPrompt trackId={currentTrack?.id || trackId || undefined} />

      {/* Hero */}
      <section className="border-b border-border/40 bg-muted/30">
        <div className="max-w-5xl mx-auto px-6 py-12 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <span className="inline-block px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-bold mb-4">
              Zikr
            </span>
            <h1 className="font-headline text-4xl md:text-5xl font-extrabold tracking-tight mb-2">
              {t('heading')}
            </h1>
            <p className="text-lg text-muted-foreground max-w-md">{t('description')}</p>
          </div>

          {/* Search */}
          <div className="relative w-full max-w-xs shrink-0">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <input
              type="text"
              placeholder={t('searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-12 pl-11 pr-4 rounded-lg bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm placeholder:text-muted-foreground"
            />
          </div>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-6 py-8 space-y-10">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 space-y-4">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-muted-foreground text-sm">{t('loading')}</p>
          </div>
        ) : (
          <>
            {/* Featured */}
            {!searchQuery && featuredTracks.length > 0 && (
              <section>
                <div className="flex items-baseline gap-4 mb-4">
                  <h2 className="font-headline text-xl font-bold flex items-center gap-2 shrink-0">
                    <Music2 className="size-4 text-primary" />
                    {t('featured')}
                  </h2>
                  <div className="h-px grow bg-border/60" />
                </div>
                <div className="w-full overflow-x-auto no-scrollbar">
                  <div className="flex gap-4 pb-2">
                    {featuredTracks.map((track) => (
                      <FeaturedCard key={track.id} track={track} />
                    ))}
                  </div>
                </div>
              </section>
            )}

            {/* Pill tabs */}
            <div className="flex gap-2 border-b border-border/40 pb-4 overflow-x-auto no-scrollbar">
              {([
                { id: 'all', label: t('tabExplore'), icon: null },
                { id: 'favorites', label: t('tabFavorites'), icon: <Heart className="size-3.5" /> },
                { id: 'recent', label: t('tabNew'), icon: <Clock className="size-3.5" /> },
              ] as { id: Tab; label: string; icon: React.ReactNode }[]).map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    'flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold whitespace-nowrap transition-colors',
                    activeTab === tab.id
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                  )}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab content */}
            {activeTab === 'all' && (
              <div className="space-y-8">
                {searchQuery ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {filteredTracks.map((track) => (
                      <TrackRow key={track.id} track={track} context="allTracks" />
                    ))}
                    {filteredTracks.length === 0 && (
                      <div className="col-span-full py-12 text-center text-muted-foreground">
                        {t('noResults', { query: searchQuery })}
                      </div>
                    )}
                  </div>
                ) : (
                  categories.map((category) => {
                    const tracksInCategory = allTracks.filter(
                      (t) => t.category.id === category.id
                    )
                    if (tracksInCategory.length === 0) return null
                    const isLoopingContext =
                      loopMode === 'context' &&
                      playbackContext === 'category' &&
                      currentTrack?.category.id === category.id

                    return (
                      <div key={category.id} className="space-y-3">
                        <div className="flex items-baseline gap-4">
                          <h3 className="font-headline font-bold text-base flex items-center gap-2 shrink-0">
                            {category.name}
                            {isLoopingContext && (
                              <span className="flex items-center gap-1 text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full animate-pulse">
                                <Repeat className="size-3" />
                                {t('looping')}
                              </span>
                            )}
                          </h3>
                          <div className="h-px grow bg-border/40" />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {tracksInCategory.map((track) => (
                            <TrackRow key={track.id} track={track} context="category" />
                          ))}
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            )}

            {activeTab === 'favorites' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {favoriteTracks.length > 0 ? (
                  favoriteTracks.map((track) => (
                    <TrackRow key={track.id} track={track} context="favorites" />
                  ))
                ) : (
                  <div className="col-span-full py-24 text-center space-y-3">
                    <Heart className="size-12 text-muted-foreground/20 mx-auto" />
                    <p className="text-muted-foreground">{t('noFavorites')}</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'recent' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {recentTracks.map((track) => (
                  <TrackRow key={track.id} track={track} context="allTracks" />
                ))}
              </div>
            )}

            {/* Disclaimer */}
            <div className="flex items-start gap-3 p-4 rounded-xl bg-muted/50 border border-border/40">
              <Info className="size-4 text-primary shrink-0 mt-0.5" />
              <p className="text-sm text-muted-foreground leading-relaxed">
                {t('disclaimer')}
              </p>
            </div>
          </>
        )}
      </div>

      <MusicPlayer />
    </main>
  )
}
