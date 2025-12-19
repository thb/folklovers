import { Link } from '@tanstack/react-router'
import { Play, Pause, ThumbsUp, ThumbsDown, ListPlus, Star } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { usePlayer, createTrack } from '@/lib/player-context'
import type { CoverWithSong } from '@/lib/api'

type CoverCardProps = {
  cover: CoverWithSong
}

function extractYoutubeId(url: string): string | null {
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&]+)/)
  return match ? match[1] : null
}

export function CoverCard({ cover }: CoverCardProps) {
  const { play, addToQueue, currentTrack, isPlaying, toggle } = usePlayer()
  const youtubeId = extractYoutubeId(cover.youtube_url)
  const thumbnailUrl = youtubeId
    ? `https://img.youtube.com/vi/${youtubeId}/mqdefault.jpg`
    : null

  const isCurrentTrack = currentTrack?.id === cover.id
  const isThisPlaying = isCurrentTrack && isPlaying

  const handlePlay = () => {
    if (isCurrentTrack) {
      toggle()
    } else {
      const track = createTrack(cover, cover.song)
      if (track) play(track)
    }
  }

  const handleAddToQueue = (e: React.MouseEvent) => {
    e.stopPropagation()
    const track = createTrack(cover, cover.song)
    if (track) addToQueue(track)
  }

  return (
    <Card className={`group hover:shadow-lg transition-all duration-300 hover:border-primary/30 overflow-hidden h-full ${isCurrentTrack ? 'ring-2 ring-primary' : ''} ${cover.original ? 'border-amber-500/50 bg-amber-500/5' : ''}`}>
      {/* Thumbnail */}
      <div className="relative aspect-video bg-muted">
        <button
          onClick={handlePlay}
          className="w-full h-full relative cursor-pointer"
        >
          {thumbnailUrl ? (
            <img
              src={thumbnailUrl}
              alt={`${cover.artist} ${cover.original ? 'original' : 'cover'}`}
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
          {/* Play/Pause overlay */}
          <div className={`absolute inset-0 bg-black/40 transition-opacity flex items-center justify-center ${isCurrentTrack ? 'opacity-60' : 'opacity-0 group-hover:opacity-100'}`}>
            <div className="w-14 h-14 rounded-full bg-white/90 flex items-center justify-center">
              {isThisPlaying ? (
                <Pause className="w-7 h-7 text-primary" fill="currentColor" />
              ) : (
                <Play className="w-7 h-7 text-primary ml-1" fill="currentColor" />
              )}
            </div>
          </div>
        </button>

        {/* Original badge */}
        {cover.original && (
          <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-amber-500 text-white flex items-center gap-1 font-semibold text-xs">
            <Star className="w-3 h-3" fill="currentColor" />
            Original
          </div>
        )}

        {/* Add to queue button */}
        <button
          onClick={handleAddToQueue}
          className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/60 hover:bg-black/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          title="Add to queue"
        >
          <ListPlus className="w-4 h-4 text-white" />
        </button>
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
