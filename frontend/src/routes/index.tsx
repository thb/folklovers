import { createFileRoute } from '@tanstack/react-router'
import { Link } from '@tanstack/react-router'
import { Music, ArrowRight, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SongCard } from '@/components/songs/SongCard'
import { CoverCard } from '@/components/songs/CoverCard'
import { songs, covers } from '@/lib/api'
import type { Song, CoverWithSong } from '@/lib/api'

export const Route = createFileRoute('/')({
  component: HomePage,
  loader: async () => {
    const [songsData, coversData] = await Promise.all([
      songs.top(6),
      covers.top(6),
    ])
    return {
      topSongs: songsData.songs,
      topCovers: coversData.covers,
    }
  },
})

function HomePage() {
  const { topSongs, topCovers } = Route.useLoaderData()

  return (
    <div>
      {/* Hero Section */}
      <section className="relative py-20 px-4 overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>

        <div className="relative max-w-4xl mx-auto text-center">
          {/* Logo */}
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary mb-6">
            <Music className="w-10 h-10 text-primary-foreground" />
          </div>

          {/* Title */}
          <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-4">
            Folk Lovers
          </h1>

          {/* Tagline */}
          <p className="text-xl md:text-2xl text-muted-foreground mb-2 font-serif italic">
            "Where every song finds its voice"
          </p>

          {/* Description */}
          <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
            Discover the best folk song covers.
            Vote for your favorite interpretations and share your passion for folk music.
          </p>

          {/* CTA */}
          <div className="flex items-center justify-center gap-4">
            <Link to="/songs">
              <Button size="lg" className="gap-2">
                Explore songs
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link to="/songs/new">
              <Button size="lg" variant="outline" className="gap-2">
                <Plus className="w-4 h-4" />
                Suggest a song
              </Button>
            </Link>
          </div>

          {/* Vintage badge */}
          <p className="mt-8 text-sm text-muted-foreground font-mono">
            Inspired by the coffeehouses of Greenwich Village, circa 1961
          </p>
        </div>
      </section>

      {/* Top Songs Section */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-foreground">
                Popular songs
              </h2>
              <p className="text-muted-foreground mt-1">
                The most beloved folk classics
              </p>
            </div>
            <Link to="/songs">
              <Button variant="outline" className="gap-2">
                View all
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {topSongs.map((song: Song) => (
              <SongCard key={song.id} song={song} />
            ))}
          </div>
        </div>
      </section>

      {/* Top Covers Section */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-foreground">
                Top covers
              </h2>
              <p className="text-muted-foreground mt-1">
                The highest-rated interpretations by the community
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {topCovers.map((cover: CoverWithSong) => (
              <CoverCard key={cover.id} cover={cover} />
            ))}
          </div>
        </div>
      </section>

      {/* Quote Section */}
      <section className="py-16 px-4 bg-primary/5 border-y border-border">
        <div className="max-w-3xl mx-auto text-center">
          <blockquote className="text-2xl md:text-3xl font-serif italic text-foreground mb-4">
            "Come gather 'round people, wherever you roam..."
          </blockquote>
          <cite className="text-muted-foreground not-italic">
            — Bob Dylan, The Times They Are A-Changin' (1964)
          </cite>
        </div>
      </section>
    </div>
  )
}
