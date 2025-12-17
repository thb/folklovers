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
            Toutes les chansons
          </h1>
          <p className="text-muted-foreground">
            Explorez notre collection de {pagination.total_count} chansons folk classiques
          </p>
        </div>

        {/* Search */}
        <div className="relative mb-8 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Rechercher une chanson ou un artiste..."
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
            Page {pagination.current_page} sur {pagination.total_pages}
          </div>
        )}
      </div>
    </div>
  )
}
