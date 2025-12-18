import { createFileRoute, Link } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { Play, Calendar, User, ExternalLink } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { VotingButtons } from '@/components/songs/VotingButtons'
import { songs, covers as coversApi, ApiError } from '@/lib/api'
import { useAuth } from '@/lib/auth'
import { cn } from '@/lib/utils'
import { parseFieldErrors } from '@/lib/form-utils'
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

type CoverFormData = {
  artist: string
  year: string
  youtube_url: string
  description: string
}

type CoverFieldErrors = {
  artist?: string
  year?: string
  youtube_url?: string
  description?: string
  base?: string
}

const emptyForm: CoverFormData = {
  artist: '',
  year: '',
  youtube_url: '',
  description: '',
}

const COVER_FIELD_MATCHERS = {
  artist: ['artist'],
  year: ['year'],
  youtube_url: ['youtube', 'url'],
  description: ['description'],
  base: [],
}

function parseCoverErrors(errors: string[]): CoverFieldErrors {
  return parseFieldErrors<CoverFieldErrors>(errors, COVER_FIELD_MATCHERS)
}

function SongPage() {
  const song = Route.useLoaderData()
  const { token, isAuthenticated, isLoading: authLoading } = useAuth()
  const [coversList, setCoversList] = useState(song.covers)

  // Submit cover form state
  const [formData, setFormData] = useState<CoverFormData>(emptyForm)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<CoverFieldErrors>({})
  const [submitSuccess, setSubmitSuccess] = useState(false)

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

  const handleSubmitCover = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!token) return

    setIsSubmitting(true)
    setFieldErrors({})
    setSubmitSuccess(false)

    try {
      const { cover } = await coversApi.create(
        song.slug,
        {
          artist: formData.artist,
          year: formData.year ? parseInt(formData.year) : undefined,
          youtube_url: formData.youtube_url,
          description: formData.description || undefined,
        },
        token
      )
      setCoversList((prev) => [...prev, cover])
      setFormData(emptyForm)
      setSubmitSuccess(true)
      setTimeout(() => setSubmitSuccess(false), 3000)
    } catch (err) {
      if (err instanceof ApiError) {
        const data = err.data as { errors?: string[]; error?: string }
        if (data.errors) {
          setFieldErrors(parseCoverErrors(data.errors))
        } else if (data.error) {
          setFieldErrors({ base: data.error })
        } else {
          setFieldErrors({ base: 'Failed to submit cover. Please try again.' })
        }
      } else {
        setFieldErrors({ base: 'Network error. Please check your connection.' })
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const hasErrors = Object.keys(fieldErrors).length > 0

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
              Original version
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
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-foreground">
              Covers ({coversList.length})
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
              <p>No covers for this song yet. Be the first to submit one!</p>
            </div>
          )}
        </div>

        {/* Submit Cover Form */}
        <div className="mt-12 pt-8 border-t">
          <h2 className="text-2xl font-bold text-foreground mb-6">
            Submit a cover
          </h2>

          {isAuthenticated ? (
            <Card>
              <CardContent className="pt-6">
                {submitSuccess && (
                  <div className="mb-4 p-3 bg-green-500/10 text-green-600 text-sm rounded-lg">
                    Cover submitted successfully!
                  </div>
                )}

                {fieldErrors.base && (
                  <div className="mb-4 p-3 bg-destructive/10 text-destructive text-sm rounded-lg">
                    {fieldErrors.base}
                  </div>
                )}

                {hasErrors && !fieldErrors.base && (
                  <div className="mb-4 p-3 bg-destructive/10 text-destructive text-sm rounded-lg">
                    Please fix the errors below.
                  </div>
                )}

                <form onSubmit={handleSubmitCover} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="artist" className={cn(fieldErrors.artist && "text-destructive")}>
                        Artist *
                      </Label>
                      <Input
                        id="artist"
                        value={formData.artist}
                        onChange={(e) => {
                          setFormData({ ...formData, artist: e.target.value })
                          if (fieldErrors.artist) setFieldErrors({ ...fieldErrors, artist: undefined })
                        }}
                        placeholder="e.g. Johnny Cash"
                        className={cn(fieldErrors.artist && "border-destructive focus-visible:ring-destructive")}
                        required
                      />
                      {fieldErrors.artist && (
                        <p className="text-sm text-destructive">{fieldErrors.artist}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="year" className={cn(fieldErrors.year && "text-destructive")}>
                        Year
                      </Label>
                      <Input
                        id="year"
                        type="number"
                        value={formData.year}
                        onChange={(e) => {
                          setFormData({ ...formData, year: e.target.value })
                          if (fieldErrors.year) setFieldErrors({ ...fieldErrors, year: undefined })
                        }}
                        placeholder="e.g. 2003"
                        min="1900"
                        max={new Date().getFullYear()}
                        className={cn(fieldErrors.year && "border-destructive focus-visible:ring-destructive")}
                      />
                      {fieldErrors.year && (
                        <p className="text-sm text-destructive">{fieldErrors.year}</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="youtube_url" className={cn(fieldErrors.youtube_url && "text-destructive")}>
                      YouTube URL *
                    </Label>
                    <Input
                      id="youtube_url"
                      type="url"
                      value={formData.youtube_url}
                      onChange={(e) => {
                        setFormData({ ...formData, youtube_url: e.target.value })
                        if (fieldErrors.youtube_url) setFieldErrors({ ...fieldErrors, youtube_url: undefined })
                      }}
                      placeholder="https://www.youtube.com/watch?v=..."
                      className={cn(fieldErrors.youtube_url && "border-destructive focus-visible:ring-destructive")}
                      required
                    />
                    {fieldErrors.youtube_url && (
                      <p className="text-sm text-destructive">{fieldErrors.youtube_url}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description" className={cn(fieldErrors.description && "text-destructive")}>
                      Description
                    </Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => {
                        setFormData({ ...formData, description: e.target.value })
                        if (fieldErrors.description) setFieldErrors({ ...fieldErrors, description: undefined })
                      }}
                      placeholder="Why is this cover special? What makes it unique?"
                      rows={3}
                      className={cn(fieldErrors.description && "border-destructive focus-visible:ring-destructive")}
                    />
                    {fieldErrors.description && (
                      <p className="text-sm text-destructive">{fieldErrors.description}</p>
                    )}
                  </div>

                  <div className="flex justify-end">
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? 'Submitting...' : 'Submit cover'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="py-8 text-center">
                <p className="text-muted-foreground mb-4">
                  Sign in to submit a cover version of this song.
                </p>
                <Link to="/login">
                  <Button>Sign in</Button>
                </Link>
              </CardContent>
            </Card>
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
                      Added by {cover.submitted_by.username}
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
              Watch on YouTube
            </a>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
