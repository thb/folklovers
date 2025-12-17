import { Link } from '@tanstack/react-router'
import { Music, Users } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import type { Song } from '@/lib/api'

type SongCardProps = {
  song: Song
}

export function SongCard({ song }: SongCardProps) {
  return (
    <Link to="/songs/$slug" params={{ slug: song.slug }}>
      <Card className="group hover:shadow-lg transition-all duration-300 hover:border-primary/30 cursor-pointer h-full">
        <CardContent className="p-5">
          {/* Icon */}
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
            <Music className="w-6 h-6 text-primary" />
          </div>

          {/* Title */}
          <h3 className="font-semibold text-lg text-foreground mb-1 line-clamp-2 group-hover:text-primary transition-colors">
            {song.title}
          </h3>

          {/* Artist */}
          <p className="text-sm text-muted-foreground mb-3">
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
