import { YouTubeEmbed } from '@/components/youtube-embed'

/**
 * The trailing video section of an appendix.
 *
 * Every appendix carries at most one video, and it always sits last. The
 * hardcoded TSX writes it as a small uppercase "Video" heading above a
 * YouTubeEmbed; the editorial store carries it as `video_id` / `video_title`
 * payload metadata rather than as markdown syntax. This component is the one
 * place that presentation lives, so an appendix looks the same whether its
 * prose came from the TSX or from the backfilled markdown body.
 */
export function AppendixVideo({
  videoId,
  videoTitle,
}: {
  videoId?: string
  videoTitle?: string
}) {
  if (!videoId) return null

  return (
    <section className="space-y-3">
      <h2 className="text-muted-foreground text-sm font-semibold tracking-widest uppercase">
        Video
      </h2>
      <YouTubeEmbed videoId={videoId} title={videoTitle} />
    </section>
  )
}
