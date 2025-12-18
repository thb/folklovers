import { Link } from '@tanstack/react-router'
import { Music, Users } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import type { Song } from '@/lib/api'
import { getYouTubeThumbnail } from '@/lib/utils'

type SongCardProps = {
  song: Song
}

export function SongCard({ song }: SongCardProps) {
  const thumbnail = getYouTubeThumbnail(song.youtube_url, 'medium')

  return (
    <Link to="/songs/$slug" params={{ slug: song.slug }}>
      <Card className="group hover:shadow-lg transition-all duration-300 hover:border-primary/30 cursor-pointer h-full overflow-hidden">
        {/* Thumbnail */}
        <div className="aspect-video bg-muted relative overflow-hidden">
          {thumbnail ? (
            <img
              src={thumbnail}
              alt={song.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-primary/10">
              <Music className="w-12 h-12 text-primary/40" />
            </div>
          )}
        </div>

        <CardContent className="p-4">
          {/* Title */}
          <h3 className="font-semibold text-foreground mb-1 line-clamp-2 group-hover:text-primary transition-colors">
            {song.title}
          </h3>

          {/* Artist */}
          <p className="text-sm text-muted-foreground mb-2">
            {song.original_artist}
            {song.year && <span className="text-muted-foreground/60"> ({song.year})</span>}
          </p>

          {/* Covers count */}
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Users className="w-3.5 h-3.5" />
            <span>{song.covers_count} cover{song.covers_count !== 1 ? 's' : ''}</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
