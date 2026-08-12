/**
 * Markdown-converter stub for @/components/youtube-embed.
 *
 * Unlike the plain-text extraction stub this one is never rendered: the
 * converter reads `videoId` and `title` straight off the element props, so the
 * embed can be emitted as a link (or a shortcode) rather than dropped.
 */
export function YouTubeEmbed({ videoId, title }: { videoId: string; title?: string }) {
  return <span data-youtube={videoId}>{title ?? ''}</span>
}
