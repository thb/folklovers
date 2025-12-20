import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState, useEffect, useMemo } from 'react'
import { Plus, Pencil, Trash2, X, ExternalLink } from 'lucide-react'
import { Link } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { SortableTableHead, useSorting, sortData } from '@/components/ui/sortable-table'
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
import { admin, type AdminCover, type Song } from '@/lib/api'
import { useAuth } from '@/lib/auth'

type SearchParams = {
  song_id?: number
}

export const Route = createFileRoute('/admin/covers')({
  component: AdminCoversPage,
  validateSearch: (search: Record<string, unknown>): SearchParams => {
    return {
      song_id: search.song_id ? Number(search.song_id) : undefined,
    }
  },
})

type CoverFormData = {
  song_id: string
  artist: string
  year: string
  youtube_url: string
  description: string
}

const emptyCoverForm: CoverFormData = {
  song_id: '',
  artist: '',
  year: '',
  youtube_url: '',
  description: '',
}

type CoverSortColumn = 'artist' | 'song' | 'year' | 'votes_score'

function AdminCoversPage() {
  const { token, isAdmin } = useAuth()
  const { song_id: filterSongId } = Route.useSearch()
  const navigate = useNavigate()

  const [covers, setCovers] = useState<AdminCover[]>([])
  const [songs, setSongs] = useState<Song[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { sort, handleSort } = useSorting<CoverSortColumn>('artist')

  const sortedCovers = useMemo(() => {
    return sortData(covers, sort, {
      artist: (c) => c.artist.toLowerCase(),
      song: (c) => c.song.title.toLowerCase(),
      year: (c) => c.year,
      votes_score: (c) => c.votes_score,
    })
  }, [covers, sort])

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [editingCover, setEditingCover] = useState<AdminCover | null>(null)
  const [deletingCover, setDeletingCover] = useState<AdminCover | null>(null)
  const [formData, setFormData] = useState<CoverFormData>(emptyCoverForm)
  const [isSaving, setIsSaving] = useState(false)

  const selectedSong = songs.find(s => s.id === filterSongId)

  useEffect(() => {
    if (token && isAdmin) {
      fetchSongs()
    }
  }, [token, isAdmin])

  // Fetch covers when filter changes
  useEffect(() => {
    if (token && isAdmin) {
      fetchCovers()
    }
  }, [token, isAdmin, filterSongId])

  async function fetchSongs() {
    if (!token) return
    try {
      const songsData = await admin.songs.list(token, { per_page: 100 })
      setSongs(songsData.songs)
    } catch (err) {
      setError('Error loading songs')
    }
  }

  async function fetchCovers() {
    if (!token) return
    setIsLoading(true)
    try {
      const data = await admin.covers.list(token, {
        per_page: 100,
        song_id: filterSongId,
      })
      setCovers(data.covers)
      setError(null)
    } catch (err) {
      setError('Error loading covers')
    } finally {
      setIsLoading(false)
    }
  }

  function handleFilterChange(value: string) {
    if (value === 'all') {
      navigate({ to: '/admin/covers', search: {} })
    } else {
      navigate({ to: '/admin/covers', search: { song_id: Number(value) } })
    }
  }

  function clearFilter() {
    navigate({ to: '/admin/covers', search: {} })
  }

  function openCreateDialog() {
    setEditingCover(null)
    setFormData({
      ...emptyCoverForm,
      song_id: filterSongId ? filterSongId.toString() : '',
    })
    setIsDialogOpen(true)
  }

  function openEditDialog(cover: AdminCover) {
    setEditingCover(cover)
    setFormData({
      song_id: cover.song.id.toString(),
      artist: cover.artist,
      year: cover.year?.toString() || '',
      youtube_url: cover.youtube_url,
      description: cover.description || '',
    })
    setIsDialogOpen(true)
  }

  function openDeleteDialog(cover: AdminCover) {
    setDeletingCover(cover)
    setIsDeleteDialogOpen(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!token) return

    setIsSaving(true)
    try {
      if (editingCover) {
        await admin.covers.update(token, editingCover.id, {
          artist: formData.artist,
          year: formData.year ? parseInt(formData.year) : undefined,
          youtube_url: formData.youtube_url,
          description: formData.description || undefined,
        })
      } else {
        await admin.covers.create(token, {
          song_id: parseInt(formData.song_id),
          artist: formData.artist,
          year: formData.year ? parseInt(formData.year) : undefined,
          youtube_url: formData.youtube_url,
          description: formData.description || undefined,
        })
      }

      setIsDialogOpen(false)
      fetchCovers()
    } catch (err) {
      setError('Error saving')
    } finally {
      setIsSaving(false)
    }
  }

  async function handleDelete() {
    if (!token || !deletingCover) return

    try {
      await admin.covers.delete(token, deletingCover.id)
      setIsDeleteDialogOpen(false)
      setDeletingCover(null)
      fetchCovers()
    } catch (err) {
      setError('Error deleting')
    }
  }

  return (
    <div className="py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Covers
            </h1>
            <p className="text-muted-foreground">
              Manage covers and interpretations
            </p>
          </div>
          <Button onClick={openCreateDialog}>
            <Plus className="w-4 h-4 mr-2" />
            New cover
          </Button>
        </div>

        {/* Filter bar */}
        <div className="flex items-center gap-4 mb-6">
          <div className="flex items-center gap-2">
            <Label htmlFor="song-filter" className="text-sm text-muted-foreground">
              Filter by song:
            </Label>
            <Select
              value={filterSongId?.toString() || 'all'}
              onValueChange={handleFilterChange}
            >
              <SelectTrigger className="w-[300px]">
                <SelectValue placeholder="All songs" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All songs</SelectItem>
                {songs.map((song) => (
                  <SelectItem key={song.id} value={song.id.toString()}>
                    {song.title} - {song.original_artist}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Active filter banner */}
        {selectedSong && (
          <div className="flex items-center gap-3 mb-6 p-4 bg-primary/5 border border-primary/20 rounded-lg">
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">
                Covers of
              </p>
              <p className="font-semibold text-foreground">
                {selectedSong.title} - {selectedSong.original_artist}
              </p>
            </div>
            <Link
              to="/songs/$slug"
              params={{ slug: selectedSong.slug }}
              className="text-sm text-primary hover:underline flex items-center gap-1"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              View public page
            </Link>
            <Button variant="ghost" size="sm" onClick={clearFilter}>
              <X className="w-4 h-4 mr-1" />
              Clear filter
            </Button>
          </div>
        )}

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
                  <SortableTableHead column="artist" currentSort={sort} onSort={handleSort}>
                    Artist
                  </SortableTableHead>
                  {!filterSongId && (
                    <SortableTableHead column="song" currentSort={sort} onSort={handleSort}>
                      Song
                    </SortableTableHead>
                  )}
                  <SortableTableHead column="year" currentSort={sort} onSort={handleSort}>
                    Year
                  </SortableTableHead>
                  <SortableTableHead column="votes_score" currentSort={sort} onSort={handleSort}>
                    Score
                  </SortableTableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedCovers.map((cover) => (
                  <TableRow key={cover.id}>
                    <TableCell className="font-medium">{cover.artist}</TableCell>
                    {!filterSongId && (
                      <TableCell>
                        <Link
                          to="/admin/covers"
                          search={{ song_id: cover.song.id }}
                          className="text-primary hover:underline"
                        >
                          {cover.song.title}
                        </Link>
                      </TableCell>
                    )}
                    <TableCell>{cover.year || '-'}</TableCell>
                    <TableCell>
                      <span className={cover.votes_score >= 0 ? 'text-green-600' : 'text-red-500'}>
                        {cover.votes_score > 0 ? '+' : ''}{cover.votes_score}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditDialog(cover)}
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
                    </TableCell>
                  </TableRow>
                ))}
                {sortedCovers.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={filterSongId ? 4 : 5} className="text-center py-8 text-muted-foreground">
                      No covers
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
                {editingCover ? 'Edit cover' : 'New cover'}
              </DialogTitle>
              <DialogDescription>
                {editingCover
                  ? 'Edit the cover information'
                  : 'Add a new cover'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="song_id">Song *</Label>
                  <Select
                    value={formData.song_id}
                    onValueChange={(value) => setFormData({ ...formData, song_id: value })}
                    disabled={!!editingCover}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a song" />
                    </SelectTrigger>
                    <SelectContent>
                      {songs.map((song) => (
                        <SelectItem key={song.id} value={song.id.toString()}>
                          {song.title} - {song.original_artist}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="artist">Artist *</Label>
                  <Input
                    id="artist"
                    value={formData.artist}
                    onChange={(e) => setFormData({ ...formData, artist: e.target.value })}
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
                  <Label htmlFor="youtube_url">URL YouTube *</Label>
                  <Input
                    id="youtube_url"
                    type="url"
                    value={formData.youtube_url}
                    onChange={(e) => setFormData({ ...formData, youtube_url: e.target.value })}
                    placeholder="https://www.youtube.com/watch?v=..."
                    required
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
              <AlertDialogTitle>Delete this cover?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. The cover by "{deletingCover?.artist}"
                will be deleted along with all its votes.
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
