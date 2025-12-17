import { createFileRoute } from '@tanstack/react-router'
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { SongCard } from '@/components/songs/SongCard'
import { songs } from '@/lib/api'
import type { Song } from '@/lib/api'

export const Route = createFileRoute('/songs/')({
  component: SongsPage,
  loader: async () => {
    const data = await songs.list({ per_page: 24 })
    return data
  },
})

function SongsPage() {
  const { songs: songsList, pagination } = Route.useLoaderData()

  return (
    <div className="py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            All songs
          </h1>
          <p className="text-muted-foreground">
            Explore our collection of {pagination.total_count} classic folk songs
          </p>
        </div>

        {/* Search */}
        <div className="relative mb-8 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search for a song or artist..."
            className="pl-10"
          />
        </div>

        {/* Songs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {songsList.map((song: Song) => (
            <SongCard key={song.id} song={song} />
          ))}
        </div>

        {/* Pagination info */}
        {pagination.total_pages > 1 && (
          <div className="mt-8 text-center text-sm text-muted-foreground">
            Page {pagination.current_page} of {pagination.total_pages}
          </div>
        )}
      </div>
    </div>
  )
}
