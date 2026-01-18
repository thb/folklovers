import { createFileRoute } from '@tanstack/react-router'
import { Link } from '@tanstack/react-router'
import { Trophy, Music, Users, ThumbsUp, Play } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { rankings } from '@/lib/api'
import type { RankedCover, RankedSong, RankedContributor } from '@/lib/api'

export const Route = createFileRoute('/rankings')({
  component: RankingsPage,
  loader: async () => {
    const [coversData, songsData, contributorsData] = await Promise.all([
      rankings.covers(50),
      rankings.songs(50),
      rankings.contributors(50),
    ])
    return {
      covers: coversData.covers,
      songs: songsData.songs,
      contributors: contributorsData.contributors,
    }
  },
})

function extractYoutubeId(url: string): string | null {
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&]+)/)
  return match ? match[1] : null
}

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) {
    return (
      <div className="w-8 h-8 rounded-full bg-yellow-500 text-white flex items-center justify-center font-bold text-sm">
        1
      </div>
    )
  }
  if (rank === 2) {
    return (
      <div className="w-8 h-8 rounded-full bg-gray-400 text-white flex items-center justify-center font-bold text-sm">
        2
      </div>
    )
  }
  if (rank === 3) {
    return (
      <div className="w-8 h-8 rounded-full bg-amber-700 text-white flex items-center justify-center font-bold text-sm">
        3
      </div>
    )
  }
  return (
    <div className="w-8 h-8 rounded-full bg-muted text-muted-foreground flex items-center justify-center font-semibold text-sm">
      {rank}
    </div>
  )
}

function CoversRanking({ covers }: { covers: RankedCover[] }) {
  return (
    <div className="space-y-3">
      {covers.map((cover) => {
        const youtubeId = extractYoutubeId(cover.youtube_url)
        const thumbnailUrl = youtubeId
          ? `https://img.youtube.com/vi/${youtubeId}/mqdefault.jpg`
          : null

        return (
          <div
            key={cover.id}
            className="flex items-center gap-4 p-3 rounded-lg bg-card border hover:shadow-md transition-shadow"
          >
            <RankBadge rank={cover.rank} />

            {/* Thumbnail */}
            <div className="w-24 h-14 rounded overflow-hidden bg-muted flex-shrink-0">
              {thumbnailUrl ? (
                <img
                  src={thumbnailUrl}
                  alt={cover.artist}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Play className="w-6 h-6 text-muted-foreground/30" />
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-foreground truncate">
                {cover.artist}
              </div>
              <Link
                to="/songs/$slug"
                params={{ slug: cover.song.slug }}
                className="text-sm text-muted-foreground hover:text-primary transition-colors truncate block"
              >
                {cover.song.title}
              </Link>
            </div>

            {/* Score */}
            <div className="flex items-center gap-1 text-green-600 font-semibold">
              <ThumbsUp className="w-4 h-4" />
              <span>+{cover.votes_score}</span>
            </div>
          </div>
        )
      })}
    </div>
  )
}

function SongsRanking({ songs }: { songs: RankedSong[] }) {
  return (
    <div className="space-y-3">
      {songs.map((song) => (
        <Link
          key={song.id}
          to="/songs/$slug"
          params={{ slug: song.slug }}
          className="flex items-center gap-4 p-3 rounded-lg bg-card border hover:shadow-md transition-shadow"
        >
          <RankBadge rank={song.rank} />

          {/* Thumbnail */}
          <div className="w-16 h-16 rounded overflow-hidden bg-muted flex-shrink-0">
            {song.thumbnail_url ? (
              <img
                src={song.thumbnail_url}
                alt={song.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Music className="w-6 h-6 text-muted-foreground/30" />
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-foreground truncate">
              {song.title}
            </div>
            <div className="text-sm text-muted-foreground truncate">
              {song.original_artist}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {song.covers_count} cover{song.covers_count !== 1 ? 's' : ''}
            </div>
          </div>

          {/* Score */}
          <div className="flex items-center gap-1 text-green-600 font-semibold">
            <ThumbsUp className="w-4 h-4" />
            <span>+{song.total_score}</span>
          </div>
        </Link>
      ))}
    </div>
  )
}

function ContributorsRanking({ contributors }: { contributors: RankedContributor[] }) {
  return (
    <div className="space-y-3">
      {contributors.map((contributor) => (
        <div
          key={contributor.id}
          className="flex items-center gap-4 p-3 rounded-lg bg-card border hover:shadow-md transition-shadow"
        >
          <RankBadge rank={contributor.rank} />

          {/* Avatar */}
          <div className="w-12 h-12 rounded-full overflow-hidden bg-muted flex-shrink-0">
            {contributor.avatar_url ? (
              <img
                src={contributor.avatar_url}
                alt={contributor.username}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-primary/10">
                <Users className="w-5 h-5 text-primary/50" />
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-foreground truncate">
              {contributor.username}
            </div>
            <div className="text-sm text-muted-foreground">
              {contributor.covers_count} cover{contributor.covers_count !== 1 ? 's' : ''} submitted
            </div>
          </div>

          {/* Score */}
          <div className="flex items-center gap-1 text-green-600 font-semibold">
            <ThumbsUp className="w-4 h-4" />
            <span>+{contributor.total_score}</span>
          </div>
        </div>
      ))}
    </div>
  )
}

function RankingsPage() {
  const { covers, songs, contributors } = Route.useLoaderData()

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
          <Trophy className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Rankings</h1>
          <p className="text-muted-foreground">
            The best of Folk Lovers, ranked by the community
          </p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="covers" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="covers" className="gap-2">
            <Play className="w-4 h-4" />
            <span className="hidden sm:inline">Top Covers</span>
            <span className="sm:hidden">Covers</span>
          </TabsTrigger>
          <TabsTrigger value="songs" className="gap-2">
            <Music className="w-4 h-4" />
            <span className="hidden sm:inline">Top Songs</span>
            <span className="sm:hidden">Songs</span>
          </TabsTrigger>
          <TabsTrigger value="contributors" className="gap-2">
            <Users className="w-4 h-4" />
            <span className="hidden sm:inline">Top Contributors</span>
            <span className="sm:hidden">People</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="covers">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Play className="w-5 h-5 text-primary" />
                Top Covers
              </CardTitle>
            </CardHeader>
            <CardContent>
              {covers.length > 0 ? (
                <CoversRanking covers={covers} />
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  No covers ranked yet. Be the first to submit!
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="songs">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Music className="w-5 h-5 text-primary" />
                Top Songs
              </CardTitle>
            </CardHeader>
            <CardContent>
              {songs.length > 0 ? (
                <SongsRanking songs={songs} />
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  No songs ranked yet. Start exploring!
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contributors">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                Top Contributors
              </CardTitle>
            </CardHeader>
            <CardContent>
              {contributors.length > 0 ? (
                <ContributorsRanking contributors={contributors} />
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  No contributors yet. Be the first!
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
