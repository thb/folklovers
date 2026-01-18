import { createFileRoute, redirect } from '@tanstack/react-router'
import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { Play, ThumbsUp, ThumbsDown, Pencil, Trash2, Music, X, Check } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
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
import { userSpace, tags as tagsApi } from '@/lib/api'
import type { CoverWithSong, UserVote, Tag } from '@/lib/api'
import { useAuth } from '@/lib/auth'

export const Route = createFileRoute('/me')({
  component: UserSpacePage,
  beforeLoad: ({ context }) => {
    if (!context.auth?.isAuthenticated) {
      throw redirect({ to: '/login' })
    }
  },
  loader: async ({ context }) => {
    const token = context.auth?.token
    if (!token) return { covers: [], votes: [], tags: [] }

    const [coversData, votesData, tagsData] = await Promise.all([
      userSpace.myCovers(token),
      userSpace.myVotes(token),
      tagsApi.list(),
    ])

    return {
      covers: coversData.covers,
      votes: votesData.votes,
      tags: tagsData.tags,
    }
  },
})

function extractYoutubeId(url: string): string | null {
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&]+)/)
  return match ? match[1] : null
}

function formatRelativeDate(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays} days ago`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`
  return `${Math.floor(diffDays / 365)} years ago`
}

type EditingCover = {
  id: number
  artist: string
  year: string
  description: string
  tag_ids: number[]
}

function MyCoverCard({
  cover,
  allTags,
  onEdit,
  onDelete,
}: {
  cover: CoverWithSong
  allTags: Tag[]
  onEdit: (cover: CoverWithSong, data: { artist: string; year?: number; description: string; tag_ids: number[] }) => Promise<void>
  onDelete: (cover: CoverWithSong) => void
}) {
  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState<EditingCover | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  const youtubeId = extractYoutubeId(cover.youtube_url)
  const thumbnailUrl = youtubeId
    ? `https://img.youtube.com/vi/${youtubeId}/mqdefault.jpg`
    : null

  const startEdit = () => {
    setEditData({
      id: cover.id,
      artist: cover.artist,
      year: cover.year?.toString() || '',
      description: cover.description || '',
      tag_ids: cover.tags?.map(t => t.id) || [],
    })
    setIsEditing(true)
  }

  const cancelEdit = () => {
    setIsEditing(false)
    setEditData(null)
  }

  const saveEdit = async () => {
    if (!editData) return
    setIsSaving(true)
    try {
      await onEdit(cover, {
        artist: editData.artist,
        year: editData.year ? parseInt(editData.year) : undefined,
        description: editData.description,
        tag_ids: editData.tag_ids,
      })
      setIsEditing(false)
      setEditData(null)
    } finally {
      setIsSaving(false)
    }
  }

  const toggleTag = (tagId: number) => {
    if (!editData) return
    if (editData.tag_ids.includes(tagId)) {
      setEditData({ ...editData, tag_ids: editData.tag_ids.filter(id => id !== tagId) })
    } else {
      setEditData({ ...editData, tag_ids: [...editData.tag_ids, tagId] })
    }
  }

  return (
    <div className="flex gap-4 p-4 rounded-lg bg-card border">
      {/* Thumbnail */}
      <div className="w-32 h-20 rounded overflow-hidden bg-muted flex-shrink-0">
        {thumbnailUrl ? (
          <img src={thumbnailUrl} alt={cover.artist} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Play className="w-6 h-6 text-muted-foreground/30" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {isEditing && editData ? (
          <div className="space-y-3">
            <Input
              value={editData.artist}
              onChange={(e) => setEditData({ ...editData, artist: e.target.value })}
              placeholder="Artist name"
              className="h-8"
            />
            <div className="flex gap-2">
              <Input
                value={editData.year}
                onChange={(e) => setEditData({ ...editData, year: e.target.value })}
                placeholder="Year"
                type="number"
                className="h-8 w-24"
              />
            </div>
            <Textarea
              value={editData.description}
              onChange={(e) => setEditData({ ...editData, description: e.target.value })}
              placeholder="Description (optional)"
              className="min-h-[60px]"
            />
            <div className="flex flex-wrap gap-1">
              {allTags.map((tag) => (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => toggleTag(tag.id)}
                  className={`px-2 py-0.5 text-xs rounded-full transition-colors ${
                    editData.tag_ids.includes(tag.id)
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
                >
                  {tag.name}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={saveEdit} disabled={isSaving}>
                <Check className="w-4 h-4 mr-1" />
                Save
              </Button>
              <Button size="sm" variant="outline" onClick={cancelEdit} disabled={isSaving}>
                <X className="w-4 h-4 mr-1" />
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <>
            <div className="font-semibold text-foreground">{cover.artist}</div>
            <Link
              to="/songs/$slug"
              params={{ slug: cover.song.slug }}
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              {cover.song.title}
            </Link>
            {cover.year && (
              <span className="text-xs text-muted-foreground ml-2">({cover.year})</span>
            )}
            {cover.description && (
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{cover.description}</p>
            )}
            {cover.tags && cover.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {cover.tags.map((tag) => (
                  <span key={tag.id} className="px-2 py-0.5 text-xs rounded-full bg-muted text-muted-foreground">
                    {tag.name}
                  </span>
                ))}
              </div>
            )}
            <div className="flex items-center gap-4 mt-2">
              <div className="flex items-center gap-1 text-sm">
                {cover.votes_score >= 0 ? (
                  <ThumbsUp className="w-4 h-4 text-green-600" />
                ) : (
                  <ThumbsDown className="w-4 h-4 text-red-500" />
                )}
                <span className={cover.votes_score >= 0 ? 'text-green-600' : 'text-red-500'}>
                  {cover.votes_score > 0 ? '+' : ''}{cover.votes_score}
                </span>
              </div>
              <span className="text-xs text-muted-foreground">
                {formatRelativeDate(cover.created_at)}
              </span>
            </div>
          </>
        )}
      </div>

      {/* Actions */}
      {!isEditing && (
        <div className="flex flex-col gap-2">
          <Button size="sm" variant="outline" onClick={startEdit}>
            <Pencil className="w-4 h-4" />
          </Button>
          <Button size="sm" variant="outline" onClick={() => onDelete(cover)}>
            <Trash2 className="w-4 h-4 text-destructive" />
          </Button>
        </div>
      )}
    </div>
  )
}

function MyVoteCard({ vote }: { vote: UserVote }) {
  const cover = vote.cover
  const youtubeId = extractYoutubeId(cover.youtube_url)
  const thumbnailUrl = youtubeId
    ? `https://img.youtube.com/vi/${youtubeId}/mqdefault.jpg`
    : null

  return (
    <div className="flex gap-4 p-4 rounded-lg bg-card border">
      {/* Vote indicator */}
      <div className={`w-8 flex-shrink-0 flex items-center justify-center rounded ${
        vote.vote_value === 1 ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-500'
      }`}>
        {vote.vote_value === 1 ? (
          <ThumbsUp className="w-4 h-4" />
        ) : (
          <ThumbsDown className="w-4 h-4" />
        )}
      </div>

      {/* Thumbnail */}
      <div className="w-24 h-14 rounded overflow-hidden bg-muted flex-shrink-0">
        {thumbnailUrl ? (
          <img src={thumbnailUrl} alt={cover.artist} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Play className="w-5 h-5 text-muted-foreground/30" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-foreground">{cover.artist}</div>
        <Link
          to="/songs/$slug"
          params={{ slug: cover.song.slug }}
          className="text-sm text-muted-foreground hover:text-primary transition-colors"
        >
          {cover.song.title}
        </Link>
        <div className="text-xs text-muted-foreground mt-1">
          Voted {formatRelativeDate(vote.voted_at)}
        </div>
      </div>
    </div>
  )
}

function UserSpacePage() {
  const { covers: initialCovers, votes, tags } = Route.useLoaderData()
  const { token, user } = useAuth()
  const [covers, setCovers] = useState(initialCovers)
  const [coverToDelete, setCoverToDelete] = useState<CoverWithSong | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleEditCover = async (
    cover: CoverWithSong,
    data: { artist: string; year?: number; description: string; tag_ids: number[] }
  ) => {
    if (!token) return
    const result = await userSpace.updateCover(cover.id, data, token)
    setCovers(covers.map(c => c.id === cover.id ? result.cover : c))
  }

  const handleDeleteCover = async () => {
    if (!token || !coverToDelete) return
    setIsDeleting(true)
    try {
      await userSpace.deleteCover(coverToDelete.id, token)
      setCovers(covers.filter(c => c.id !== coverToDelete.id))
      setCoverToDelete(null)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
          <Music className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-foreground">My Space</h1>
          <p className="text-muted-foreground">
            Welcome back, {user?.username}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="covers" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="covers" className="gap-2">
            <Play className="w-4 h-4" />
            My Covers ({covers.length})
          </TabsTrigger>
          <TabsTrigger value="votes" className="gap-2">
            <ThumbsUp className="w-4 h-4" />
            My Votes ({votes.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="covers">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Play className="w-5 h-5 text-primary" />
                Covers I've Submitted
              </CardTitle>
            </CardHeader>
            <CardContent>
              {covers.length > 0 ? (
                <div className="space-y-3">
                  {covers.map((cover) => (
                    <MyCoverCard
                      key={cover.id}
                      cover={cover}
                      allTags={tags}
                      onEdit={handleEditCover}
                      onDelete={setCoverToDelete}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">
                    You haven't submitted any covers yet.
                  </p>
                  <Link to="/covers/new">
                    <Button>Submit your first cover</Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="votes">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ThumbsUp className="w-5 h-5 text-primary" />
                Covers I've Voted On
              </CardTitle>
            </CardHeader>
            <CardContent>
              {votes.length > 0 ? (
                <div className="space-y-3">
                  {votes.map((vote) => (
                    <MyVoteCard key={vote.cover.id} vote={vote} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">
                    You haven't voted on any covers yet.
                  </p>
                  <Link to="/songs">
                    <Button>Explore songs</Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Delete confirmation dialog */}
      <AlertDialog open={!!coverToDelete} onOpenChange={(open) => !open && setCoverToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this cover?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete your cover by {coverToDelete?.artist}? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteCover}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
