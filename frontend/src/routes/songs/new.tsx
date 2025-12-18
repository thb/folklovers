import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { ArrowLeft } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { songs, ApiError } from '@/lib/api'
import { useAuth } from '@/lib/auth'
import { cn } from '@/lib/utils'
import { parseFieldErrors } from '@/lib/form-utils'

export const Route = createFileRoute('/songs/new')({
  component: NewSongPage,
})

type SongFormData = {
  title: string
  original_artist: string
  year: string
  youtube_url: string
  description: string
}

type FieldErrors = {
  title?: string
  original_artist?: string
  year?: string
  youtube_url?: string
  description?: string
  base?: string
}

const emptyForm: SongFormData = {
  title: '',
  original_artist: '',
  year: '',
  youtube_url: '',
  description: '',
}

const SONG_FIELD_MATCHERS = {
  title: ['title'],
  original_artist: ['original artist', 'artist'],
  year: ['year'],
  youtube_url: ['youtube', 'url'],
  description: ['description'],
  base: [],
}

function parseErrors(errors: string[]): FieldErrors {
  return parseFieldErrors<FieldErrors>(errors, SONG_FIELD_MATCHERS)
}

function NewSongPage() {
  const navigate = useNavigate()
  const { token, isAuthenticated, isLoading } = useAuth()

  const [formData, setFormData] = useState<SongFormData>(emptyForm)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!token) return

    setIsSubmitting(true)
    setFieldErrors({})

    try {
      const { song } = await songs.create(
        {
          title: formData.title,
          original_artist: formData.original_artist,
          year: parseInt(formData.year),
          youtube_url: formData.youtube_url,
          description: formData.description,
        },
        token
      )
      navigate({ to: '/songs/$slug', params: { slug: song.slug } })
    } catch (err) {
      if (err instanceof ApiError) {
        const data = err.data as { errors?: string[]; error?: string }
        if (data.errors) {
          setFieldErrors(parseErrors(data.errors))
        } else if (data.error) {
          setFieldErrors({ base: data.error })
        } else {
          setFieldErrors({ base: 'Failed to add song. Please try again.' })
        }
      } else {
        setFieldErrors({ base: 'Network error. Please check your connection.' })
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const hasErrors = Object.keys(fieldErrors).length > 0

  if (isLoading) {
    return null
  }

  if (!isAuthenticated) {
    return (
      <div className="py-12 px-4">
        <div className="max-w-lg mx-auto text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Sign in required</h1>
          <p className="text-muted-foreground mb-6">
            You need to be signed in to suggest a new song.
          </p>
          <Link to="/login">
            <Button>Sign in</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <Link
          to="/songs"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to songs
        </Link>

        <Card>
          <CardHeader>
            <CardTitle>Suggest a song</CardTitle>
            <CardDescription>
              Add a folk song to our collection. Once added, you and others can submit cover versions.
            </CardDescription>
          </CardHeader>

          <CardContent>
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

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title" className={cn(fieldErrors.title && "text-destructive")}>
                    Song title *
                  </Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => {
                      setFormData({ ...formData, title: e.target.value })
                      if (fieldErrors.title) setFieldErrors({ ...fieldErrors, title: undefined })
                    }}
                    placeholder="e.g. Blowin' in the Wind"
                    className={cn(fieldErrors.title && "border-destructive focus-visible:ring-destructive")}
                    required
                  />
                  {fieldErrors.title && (
                    <p className="text-sm text-destructive">{fieldErrors.title}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="original_artist" className={cn(fieldErrors.original_artist && "text-destructive")}>
                    Original artist *
                  </Label>
                  <Input
                    id="original_artist"
                    value={formData.original_artist}
                    onChange={(e) => {
                      setFormData({ ...formData, original_artist: e.target.value })
                      if (fieldErrors.original_artist) setFieldErrors({ ...fieldErrors, original_artist: undefined })
                    }}
                    placeholder="e.g. Bob Dylan"
                    className={cn(fieldErrors.original_artist && "border-destructive focus-visible:ring-destructive")}
                    required
                  />
                  {fieldErrors.original_artist && (
                    <p className="text-sm text-destructive">{fieldErrors.original_artist}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="year" className={cn(fieldErrors.year && "text-destructive")}>
                    Year *
                  </Label>
                  <Input
                    id="year"
                    type="number"
                    value={formData.year}
                    onChange={(e) => {
                      setFormData({ ...formData, year: e.target.value })
                      if (fieldErrors.year) setFieldErrors({ ...fieldErrors, year: undefined })
                    }}
                    placeholder="e.g. 1963"
                    min="1900"
                    max={new Date().getFullYear()}
                    className={cn(fieldErrors.year && "border-destructive focus-visible:ring-destructive")}
                    required
                  />
                  {fieldErrors.year && (
                    <p className="text-sm text-destructive">{fieldErrors.year}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="youtube_url" className={cn(fieldErrors.youtube_url && "text-destructive")}>
                    YouTube URL (original version) *
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
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className={cn(fieldErrors.description && "text-destructive")}>
                  Description *
                </Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => {
                    setFormData({ ...formData, description: e.target.value })
                    if (fieldErrors.description) setFieldErrors({ ...fieldErrors, description: undefined })
                  }}
                  placeholder="Tell us about this song's history and significance..."
                  rows={4}
                  className={cn(fieldErrors.description && "border-destructive focus-visible:ring-destructive")}
                  required
                />
                {fieldErrors.description && (
                  <p className="text-sm text-destructive">{fieldErrors.description}</p>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Link to="/songs">
                  <Button type="button" variant="outline">
                    Cancel
                  </Button>
                </Link>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Adding...' : 'Add song'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
