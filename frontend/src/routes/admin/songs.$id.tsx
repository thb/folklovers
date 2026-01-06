import { createFileRoute, Link } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { Plus, Pencil, Trash2, ExternalLink, Play, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { admin, type Song, type AdminCover } from '@/lib/api'
import { useAuth } from '@/lib/auth'
import { getYouTubeThumbnail } from '@/lib/youtube'

export const Route = createFileRoute('/admin/songs/$id')({
  component: AdminSongDetailPage,
})

type SongFormData = {
  title: string
  original_artist: string
  year: string
  youtube_url: string
  description: string
}

type CoverFormData = {
  artist: string
  year: string
  youtube_url: string
  description: string
}

const emptyCoverForm: CoverFormData = {
  artist: '',
  year: '',
  youtube_url: '',
  description: '',
}

function AdminSongDetailPage() {
  const { token, isAdmin } = useAuth()
  const { id } = Route.useParams()
  const songId = parseInt(id)

  const [song, setSong] = useState<Song | null>(null)
  const [covers, setCovers] = useState<AdminCover[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Song form state
  const [songFormData, setSongFormData] = useState<SongFormData>({
    title: '',
    original_artist: '',
    year: '',
    youtube_url: '',
    description: '',
  })
  const [isSavingSong, setIsSavingSong] = useState(false)
  const [songSaved, setSongSaved] = useState(false)

  // Cover dialog state
  const [isCoverDialogOpen, setIsCoverDialogOpen] = useState(false)
  const [editingCover, setEditingCover] = useState<AdminCover | null>(null)
  const [coverFormData, setCoverFormData] = useState<CoverFormData>(emptyCoverForm)
  const [isSavingCover, setIsSavingCover] = useState(false)

  // Delete dialog state
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [deletingCover, setDeletingCover] = useState<AdminCover | null>(null)

  useEffect(() => {
    if (token && isAdmin) {
      fetchData()
    }
  }, [token, isAdmin, songId])

  async function fetchData() {
    if (!token) return
    setIsLoading(true)
    try {
      const [songData, coversData] = await Promise.all([
        admin.songs.get(token, songId),
        admin.covers.list(token, { song_id: songId, per_page: 100 }),
      ])
      setSong(songData.song)
      setCovers(coversData.covers)
      setSongFormData({
        title: songData.song.title,
        original_artist: songData.song.original_artist,
        year: songData.song.year?.toString() || '',
        youtube_url: songData.song.youtube_url || '',
        description: songData.song.description || '',
      })
      setError(null)
    } catch (err) {
      setError('Error loading')
    } finally {
      setIsLoading(false)
    }
  }

  async function handleSongSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!token || !song) return

    setIsSavingSong(true)
    setSongSaved(false)
    try {
      const data = {
        title: songFormData.title,
        original_artist: songFormData.original_artist,
        year: songFormData.year ? parseInt(songFormData.year) : null,
        youtube_url: songFormData.youtube_url || null,
        description: songFormData.description || null,
      }
      const result = await admin.songs.update(token, song.id, data)
      setSong(result.song)
      setSongSaved(true)
      setTimeout(() => setSongSaved(false), 2000)
    } catch (err) {
      setError('Error saving song')
    } finally {
      setIsSavingSong(false)
    }
  }

  function openCreateCoverDialog() {
    setEditingCover(null)
    setCoverFormData(emptyCoverForm)
    setIsCoverDialogOpen(true)
  }

  function openEditCoverDialog(cover: AdminCover) {
    setEditingCover(cover)
    setCoverFormData({
      artist: cover.artist,
      year: cover.year?.toString() || '',
      youtube_url: cover.youtube_url,
      description: cover.description || '',
    })
    setIsCoverDialogOpen(true)
  }

  function openDeleteDialog(cover: AdminCover) {
    setDeletingCover(cover)
    setIsDeleteDialogOpen(true)
  }

  async function handleCoverSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!token) return

    setIsSavingCover(true)
    try {
      if (editingCover) {
        await admin.covers.update(token, editingCover.id, {
          artist: coverFormData.artist,
          year: coverFormData.year ? parseInt(coverFormData.year) : undefined,
          youtube_url: coverFormData.youtube_url,
          description: coverFormData.description || undefined,
        })
      } else {
        await admin.covers.create(token, {
          song_id: songId,
          artist: coverFormData.artist,
          year: coverFormData.year ? parseInt(coverFormData.year) : undefined,
          youtube_url: coverFormData.youtube_url,
          description: coverFormData.description || undefined,
        })
      }
      setIsCoverDialogOpen(false)
      fetchData()
    } catch (err) {
      setError('Error saving')
    } finally {
      setIsSavingCover(false)
    }
  }

  async function handleDeleteCover() {
    if (!token || !deletingCover) return

    try {
      await admin.covers.delete(token, deletingCover.id)
      setIsDeleteDialogOpen(false)
      setDeletingCover(null)
      fetchData()
    } catch (err) {
      setError('Error deleting')
    }
  }

  async function handleSetOriginal(cover: AdminCover) {
    if (!token) return

    try {
      await admin.covers.setOriginal(token, cover.id)
      fetchData()
    } catch (err) {
      setError('Error setting original')
    }
  }

  if (isLoading) {
    return (
      <div className="py-12 px-4">
        <div className="max-w-4xl mx-auto text-center text-muted-foreground">
          Loading...
        </div>
      </div>
    )
  }

  if (!song) {
    return (
      <div className="py-12 px-4">
        <div className="max-w-4xl mx-auto text-center text-muted-foreground">
          Song not found
        </div>
      </div>
    )
  }

  return (
    <div className="py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">{song.title}</h1>
            <p className="text-muted-foreground">{song.original_artist}</p>
          </div>
          <Link to="/songs/$slug" params={{ slug: song.slug }}>
            <Button variant="outline" size="sm">
              <ExternalLink className="w-4 h-4 mr-2" />
              View public page
            </Button>
          </Link>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-destructive/10 text-destructive rounded-lg">
            {error}
          </div>
        )}

        {/* Song Form */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Song information</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSongSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={songFormData.title}
                    onChange={(e) => setSongFormData({ ...songFormData, title: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="original_artist">Original artist *</Label>
                  <Input
                    id="original_artist"
                    value={songFormData.original_artist}
                    onChange={(e) => setSongFormData({ ...songFormData, original_artist: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="year">Year</Label>
                  <Input
                    id="year"
                    type="number"
                    value={songFormData.year}
                    onChange={(e) => setSongFormData({ ...songFormData, year: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="youtube_url">URL YouTube</Label>
                  <Input
                    id="youtube_url"
                    type="url"
                    value={songFormData.youtube_url}
                    onChange={(e) => setSongFormData({ ...songFormData, youtube_url: e.target.value })}
                    placeholder="https://www.youtube.com/watch?v=..."
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={songFormData.description}
                    onChange={(e) => setSongFormData({ ...songFormData, description: e.target.value })}
                    rows={3}
                  />
                </div>
              </div>
              <div className="flex justify-end mt-4">
                <Button type="submit" disabled={isSavingSong}>
                  {isSavingSong ? 'Saving...' : songSaved ? 'Saved!' : 'Save'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Covers Section */}
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">
            Covers ({covers.length})
          </h2>
          <Button onClick={openCreateCoverDialog}>
            <Plus className="w-4 h-4 mr-2" />
            Add
          </Button>
        </div>

        {covers.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              No covers for this song
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {covers.map((cover) => {
              const thumbnail = getYouTubeThumbnail(cover.youtube_url)
              return (
                <Card key={cover.id} className={`overflow-hidden ${cover.original ? 'border-amber-500/50 bg-amber-500/5' : ''}`}>
                  <div className="flex">
                    {/* Thumbnail */}
                    <a
                      href={cover.youtube_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="relative flex-shrink-0 w-40 h-24 bg-muted group"
                    >
                      {thumbnail ? (
                        <img
                          src={thumbnail}
                          alt={cover.artist}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                          No thumbnail
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Play className="w-8 h-8 text-white" />
                      </div>
                      {cover.original && (
                        <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-amber-500 text-white flex items-center gap-1 font-semibold text-xs">
                          <Star className="w-3 h-3" fill="currentColor" />
                          Original
                        </div>
                      )}
                    </a>

                    {/* Content */}
                    <div className="flex-1 p-4 flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">{cover.artist}</h3>
                        <p className="text-sm text-muted-foreground">
                          {cover.year || 'Unknown year'}
                          {' · '}
                          <span className={cover.votes_score >= 0 ? 'text-green-600' : 'text-red-500'}>
                            {cover.votes_score > 0 ? '+' : ''}{cover.votes_score} votes
                          </span>
                        </p>
                        {cover.description && (
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
                            {cover.description}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        {!cover.original && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleSetOriginal(cover)}
                            title="Set as original"
                            className="text-amber-500 hover:text-amber-600 hover:bg-amber-500/10"
                          >
                            <Star className="w-4 h-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditCoverDialog(cover)}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openDeleteDialog(cover)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>
        )}

        {/* Cover Create/Edit Dialog */}
        <Dialog open={isCoverDialogOpen} onOpenChange={setIsCoverDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>
                {editingCover ? 'Edit cover' : 'New cover'}
              </DialogTitle>
              <DialogDescription>
                {editingCover
                  ? 'Edit the cover information'
                  : 'Add a new cover'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCoverSubmit}>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="cover_artist">Artist *</Label>
                  <Input
                    id="cover_artist"
                    value={coverFormData.artist}
                    onChange={(e) => setCoverFormData({ ...coverFormData, artist: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cover_year">Year</Label>
                  <Input
                    id="cover_year"
                    type="number"
                    value={coverFormData.year}
                    onChange={(e) => setCoverFormData({ ...coverFormData, year: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cover_youtube_url">URL YouTube *</Label>
                  <Input
                    id="cover_youtube_url"
                    type="url"
                    value={coverFormData.youtube_url}
                    onChange={(e) => setCoverFormData({ ...coverFormData, youtube_url: e.target.value })}
                    placeholder="https://www.youtube.com/watch?v=..."
                    required
                  />
                  {coverFormData.youtube_url && getYouTubeThumbnail(coverFormData.youtube_url) && (
                    <div className="mt-2">
                      <img
                        src={getYouTubeThumbnail(coverFormData.youtube_url)!}
                        alt="Preview"
                        className="w-32 h-auto rounded"
                      />
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cover_description">Description</Label>
                  <Textarea
                    id="cover_description"
                    value={coverFormData.description}
                    onChange={(e) => setCoverFormData({ ...coverFormData, description: e.target.value })}
                    rows={3}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsCoverDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSavingCover}>
                  {isSavingCover ? 'Saving...' : 'Save'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete this cover?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. The cover by "{deletingCover?.artist}"
                will be deleted along with all its votes.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteCover}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  )
}
