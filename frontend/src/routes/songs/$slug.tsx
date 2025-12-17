import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { Play, Calendar, User, ExternalLink } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { VotingButtons } from '@/components/songs/VotingButtons'
import { songs, covers as coversApi } from '@/lib/api'
import { useAuth } from '@/lib/auth'
import type { Cover } from '@/lib/api'

export const Route = createFileRoute('/songs/$slug')({
  component: SongPage,
  loader: async ({ params }) => {
    const data = await songs.get(params.slug)
    return data.song
  },
})

function extractYoutubeId(url: string): string | null {
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&]+)/)
  return match ? match[1] : null
}

function YouTubeEmbed({ url, title }: { url: string; title: string }) {
  const videoId = extractYoutubeId(url)
  if (!videoId) return null

  return (
    <div className="aspect-video rounded-lg overflow-hidden bg-black">
      <iframe
        src={`https://www.youtube.com/embed/${videoId}`}
        title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="w-full h-full"
      />
    </div>
  )
}

function SongPage() {
  const song = Route.useLoaderData()
  const { token, isAuthenticated, isLoading: authLoading } = useAuth()
  const [coversList, setCoversList] = useState(song.covers)

  // Refetch covers with user token to get user_vote
  useEffect(() => {
    if (!authLoading && isAuthenticated && token) {
      coversApi.list(song.slug, undefined, token).then(({ covers }) => {
        setCoversList(covers)
      }).catch(console.error)
    }
  }, [authLoading, isAuthenticated, token, song.slug])

  const handleVoteChange = (coverId: number, updatedCover: Cover) => {
    setCoversList((prev) =>
      prev.map((c) => (c.id === coverId ? { ...c, ...updatedCover } : c))
    )
  }

  return (
    <div className="py-12 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Song Header */}
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-foreground mb-2">
            {song.title}
          </h1>
          <div className="flex items-center gap-4 text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <User className="w-4 h-4" />
              {song.original_artist}
            </span>
            {song.year && (
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                {song.year}
              </span>
            )}
          </div>
        </div>

        {/* Original Version */}
        {song.youtube_url && (
          <div className="mb-12">
            <h2 className="text-lg font-semibold text-foreground mb-4">
              Version originale
            </h2>
            <YouTubeEmbed url={song.youtube_url} title={`${song.title} - ${song.original_artist}`} />
            {song.description && (
              <p className="mt-4 text-muted-foreground leading-relaxed">
                {song.description}
              </p>
            )}
          </div>
        )}

        {/* Covers */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-foreground">
              Reprises ({coversList.length})
            </h2>
          </div>

          <div className="space-y-6">
            {coversList.map((cover, index) => (
              <CoverItem
                key={cover.id}
                cover={cover}
                rank={index + 1}
                onVoteChange={(updatedCover) => handleVoteChange(cover.id, updatedCover)}
              />
            ))}
          </div>

          {coversList.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <Play className="w-12 h-12 mx-auto mb-4 opacity-30" />
              <p>Aucune reprise pour cette chanson.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function CoverItem({
  cover,
  rank,
  onVoteChange,
}: {
  cover: Cover
  rank: number
  onVoteChange: (cover: Cover) => void
}) {
  const [isExpanded, setIsExpanded] = useState(false)
  const videoId = extractYoutubeId(cover.youtube_url)
  const thumbnailUrl = videoId
    ? `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`
    : null

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <div className="flex flex-col md:flex-row">
          {/* Thumbnail / Video */}
          <div className="md:w-96 flex-shrink-0">
            {isExpanded ? (
              <div className="aspect-video">
                <iframe
                  src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
                  title={`${cover.artist} cover`}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full"
                />
              </div>
            ) : (
              <button
                onClick={() => setIsExpanded(true)}
                className="relative w-full aspect-video bg-muted group"
              >
                {thumbnailUrl && (
                  <img
                    src={thumbnailUrl}
                    alt={`${cover.artist} cover`}
                    width={320}
                    height={180}
                    loading="lazy"
                    className="w-full h-full object-cover"
                  />
                )}
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center">
                    <Play className="w-8 h-8 text-primary ml-1" fill="currentColor" />
                  </div>
                </div>
                {/* Rank badge */}
                <div className="absolute top-3 left-3 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">
                  {rank}
                </div>
              </button>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-foreground">
                  {cover.artist}
                </h3>
                <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                  {cover.year && (
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {cover.year}
                    </span>
                  )}
                  {cover.submitted_by && (
                    <span className="flex items-center gap-1">
                      <User className="w-3.5 h-3.5" />
                      Ajoute par {cover.submitted_by.username}
                    </span>
                  )}
                </div>
              </div>

              {/* Voting */}
              <VotingButtons cover={cover} onVoteChange={onVoteChange} />
            </div>

            {/* Description */}
            {cover.description && (
              <p className="mt-4 text-muted-foreground leading-relaxed">
                {cover.description}
              </p>
            )}

            {/* YouTube link */}
            <a
              href={cover.youtube_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 mt-4 text-sm text-primary hover:underline"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Voir sur YouTube
            </a>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
