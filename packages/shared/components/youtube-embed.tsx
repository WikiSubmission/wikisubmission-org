'use client'
import { useState } from 'react'

interface YouTubeEmbedProps {
  videoId: string
  title?: string
}

export function YouTubeEmbed({ videoId, title }: YouTubeEmbedProps) {
  const [loaded, setLoaded] = useState(false)

  if (!loaded) {
    return (
      <button
        onClick={() => setLoaded(true)}
        className="relative w-full aspect-video rounded-xl overflow-hidden border border-border/40 bg-black group cursor-pointer"
        aria-label={`Play: ${title ?? 'YouTube video'}`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`https://img.youtube.com/vi/${videoId}/hqdefault.jpg`}
          alt={title ?? 'YouTube video'}
          className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="size-16 rounded-full bg-red-600/90 flex items-center justify-center shadow-xl group-hover:scale-105 transition-transform">
            <svg
              className="size-7 text-white ml-1"
              fill="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>
      </button>
    )
  }

  return (
    <div className="relative aspect-video rounded-xl overflow-hidden border border-border/40">
      <iframe
        src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
        title={title ?? 'YouTube video'}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        className="absolute inset-0 w-full h-full"
      />
    </div>
  )
}
