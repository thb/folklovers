import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { Link } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
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
import { admin, type Song } from '@/lib/api'
import { useAuth } from '@/lib/auth'

export const Route = createFileRoute('/admin/songs/')({
  component: AdminSongsPage,
})

type SongFormData = {
  title: string
  original_artist: string
  year: string
  youtube_url: string
  description: string
}

const emptySongForm: SongFormData = {
  title: '',
  original_artist: '',
  year: '',
  youtube_url: '',
  description: '',
}

function AdminSongsPage() {
  const { token, isAdmin } = useAuth()

  const [songs, setSongs] = useState<Song[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [editingSong, setEditingSong] = useState<Song | null>(null)
  const [deletingSong, setDeletingSong] = useState<Song | null>(null)
  const [formData, setFormData] = useState<SongFormData>(emptySongForm)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (token && isAdmin) {
      fetchSongs()
    }
  }, [token, isAdmin])

  async function fetchSongs() {
    if (!token) return
    setIsLoading(true)
    try {
      const data = await admin.songs.list(token, { per_page: 100 })
      setSongs(data.songs)
      setError(null)
    } catch (err) {
      setError('Error loading songs')
    } finally {
      setIsLoading(false)
    }
  }

  function openCreateDialog() {
    setEditingSong(null)
    setFormData(emptySongForm)
    setIsDialogOpen(true)
  }

  function openEditDialog(song: Song) {
    setEditingSong(song)
    setFormData({
      title: song.title,
      original_artist: song.original_artist,
      year: song.year?.toString() || '',
      youtube_url: song.youtube_url || '',
      description: song.description || '',
    })
    setIsDialogOpen(true)
  }

  function openDeleteDialog(song: Song) {
    setDeletingSong(song)
    setIsDeleteDialogOpen(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!token) return

    setIsSaving(true)
    try {
      const data = {
        title: formData.title,
        original_artist: formData.original_artist,
        year: formData.year ? parseInt(formData.year) : null,
        youtube_url: formData.youtube_url || null,
        description: formData.description || null,
      }

      if (editingSong) {
        await admin.songs.update(token, editingSong.id, data)
      } else {
        await admin.songs.create(token, data as any)
      }

      setIsDialogOpen(false)
      fetchSongs()
    } catch (err) {
      setError('Error saving')
    } finally {
      setIsSaving(false)
    }
  }

  async function handleDelete() {
    if (!token || !deletingSong) return

    try {
      await admin.songs.delete(token, deletingSong.id)
      setIsDeleteDialogOpen(false)
      setDeletingSong(null)
      fetchSongs()
    } catch (err) {
      setError('Error deleting')
    }
  }

  return (
    <div className="py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Songs
            </h1>
            <p className="text-muted-foreground">
              Manage the songs collection
            </p>
          </div>
          <Button onClick={openCreateDialog}>
            <Plus className="w-4 h-4 mr-2" />
            New song
          </Button>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-destructive/10 text-destructive rounded-lg">
            {error}
          </div>
        )}

        {/* Table */}
        {isLoading ? (
          <div className="text-center py-12 text-muted-foreground">
            Loading...
          </div>
        ) : (
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Original artist</TableHead>
                  <TableHead>Year</TableHead>
                  <TableHead>Covers</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {songs.map((song) => (
                  <TableRow key={song.id}>
                    <TableCell className="font-medium">
                      <Link
                        to="/admin/songs/$id"
                        params={{ id: song.id.toString() }}
                        className="text-primary hover:underline"
                      >
                        {song.title}
                      </Link>
                    </TableCell>
                    <TableCell>{song.original_artist}</TableCell>
                    <TableCell>{song.year || '-'}</TableCell>
                    <TableCell>
                      <Link
                        to="/admin/covers"
                        search={{ song_id: song.id }}
                        className="text-primary hover:underline"
                      >
                        {song.covers_count}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditDialog(song)}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openDeleteDialog(song)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {songs.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      No songs
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Create/Edit Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>
                {editingSong ? 'Edit song' : 'New song'}
              </DialogTitle>
              <DialogDescription>
                {editingSong
                  ? 'Edit the song information'
                  : 'Add a new song to the collection'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="original_artist">Original artist *</Label>
                  <Input
                    id="original_artist"
                    value={formData.original_artist}
                    onChange={(e) => setFormData({ ...formData, original_artist: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="year">Year</Label>
                  <Input
                    id="year"
                    type="number"
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="youtube_url">URL YouTube</Label>
                  <Input
                    id="youtube_url"
                    type="url"
                    value={formData.youtube_url}
                    onChange={(e) => setFormData({ ...formData, youtube_url: e.target.value })}
                    placeholder="https://www.youtube.com/watch?v=..."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={4}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSaving}>
                  {isSaving ? 'Saving...' : 'Save'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete this song?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. The song "{deletingSong?.title}" and all its
                covers will be deleted.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  )
}
