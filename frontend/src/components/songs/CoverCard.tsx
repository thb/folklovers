import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { Play, ThumbsUp, ThumbsDown } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import type { CoverWithSong } from '@/lib/api'

type CoverCardProps = {
  cover: CoverWithSong
}

function extractYoutubeId(url: string): string | null {
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&]+)/)
  return match ? match[1] : null
}

export function CoverCard({ cover }: CoverCardProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const youtubeId = extractYoutubeId(cover.youtube_url)
  const thumbnailUrl = youtubeId
    ? `https://img.youtube.com/vi/${youtubeId}/mqdefault.jpg`
    : null

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 hover:border-primary/30 overflow-hidden h-full">
      {/* Thumbnail / Video */}
      <div className="relative aspect-video bg-muted">
        {isPlaying && youtubeId ? (
          <iframe
            src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1`}
            title={`${cover.artist} cover`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="w-full h-full"
          />
        ) : (
          <button
            onClick={() => setIsPlaying(true)}
            className="w-full h-full relative cursor-pointer"
          >
            {thumbnailUrl ? (
              <img
                src={thumbnailUrl}
                alt={`${cover.artist} cover`}
                width={320}
                height={180}
                loading="lazy"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Play className="w-12 h-12 text-muted-foreground/30" />
              </div>
            )}
            {/* Play overlay */}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <div className="w-14 h-14 rounded-full bg-white/90 flex items-center justify-center">
                <Play className="w-7 h-7 text-primary ml-1" fill="currentColor" />
              </div>
            </div>
          </button>
        )}
      </div>

      <CardContent className="p-4">
        {/* Song info */}
        <Link
          to="/songs/$slug"
          params={{ slug: cover.song.slug }}
          className="text-xs text-muted-foreground hover:text-primary transition-colors"
        >
          {cover.song.title}
        </Link>

        {/* Artist */}
        <h3 className="font-semibold text-foreground mt-1 line-clamp-1">
          {cover.artist}
        </h3>

        {/* Year */}
        {cover.year && (
          <p className="text-xs text-muted-foreground mt-0.5">{cover.year}</p>
        )}

        {/* Score */}
        <div className="flex items-center gap-3 mt-3 pt-3 border-t border-border/50">
          <div className="flex items-center gap-1 text-sm">
            {cover.votes_score >= 0 ? (
              <ThumbsUp className="w-4 h-4 text-green-600" />
            ) : (
              <ThumbsDown className="w-4 h-4 text-red-500" />
            )}
            <span className={cover.votes_score >= 0 ? 'text-green-600' : 'text-red-500'}>
              {cover.votes_score > 0 ? '+' : ''}{cover.votes_score}
            </span>
          </div>
          <span className="text-xs text-muted-foreground">
            {cover.votes_count} vote{cover.votes_count !== 1 ? 's' : ''}
          </span>
        </div>
      </CardContent>
    </Card>
  )
}
