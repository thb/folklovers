import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { Search, ChevronLeft, ChevronRight } from 'lucide-react'
import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { SongCard } from '@/components/songs/SongCard'
import { songs } from '@/lib/api'
import type { Song } from '@/lib/api'
import { z } from 'zod'

const songsSearchSchema = z.object({
  page: z.number().optional().default(1),
  search: z.string().optional(),
})

type SongsSearch = z.infer<typeof songsSearchSchema>

export const Route = createFileRoute('/songs/')({
  component: SongsPage,
  validateSearch: songsSearchSchema,
  loaderDeps: ({ search }) => ({ page: search.page, search: search.search }),
  loader: async ({ deps }) => {
    const data = await songs.list({
      per_page: 12,
      page: deps.page,
      search: deps.search
    })
    return data
  },
})

function SongsPage() {
  const { songs: songsList, pagination } = Route.useLoaderData()
  const { page, search } = Route.useSearch()
  const navigate = useNavigate({ from: Route.fullPath })

  const [searchInput, setSearchInput] = useState(search || '')

  // Sync search input with URL param
  useEffect(() => {
    setSearchInput(search || '')
  }, [search])

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput !== (search || '')) {
        navigate({
          search: (prev: SongsSearch) => ({
            ...prev,
            search: searchInput || undefined,
            page: 1, // Reset to first page on new search
          }),
        })
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [searchInput, search, navigate])

  const goToPage = (newPage: number) => {
    navigate({
      search: (prev: SongsSearch) => ({
        ...prev,
        page: newPage,
      }),
    })
  }

  return (
    <div className="py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            All songs
          </h1>
          <p className="text-muted-foreground">
            {search
              ? `${pagination.total_count} results for "${search}"`
              : `Explore our collection of ${pagination.total_count} classic folk songs`
            }
          </p>
        </div>

        {/* Search */}
        <div className="relative mb-8 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search for a song or artist..."
            className="pl-10"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
        </div>

        {/* Songs Grid */}
        {songsList.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {songsList.map((song: Song) => (
              <SongCard key={song.id} song={song} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            No songs found for "{search}"
          </div>
        )}

        {/* Pagination */}
        {pagination.total_pages > 1 && (
          <div className="mt-8 flex items-center justify-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => goToPage(page - 1)}
              disabled={page <= 1}
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Previous
            </Button>

            <div className="flex items-center gap-2">
              {/* Page numbers */}
              {Array.from({ length: pagination.total_pages }, (_, i) => i + 1)
                .filter(p => {
                  // Show first, last, and pages around current
                  return p === 1 ||
                         p === pagination.total_pages ||
                         Math.abs(p - page) <= 1
                })
                .map((p, i, arr) => {
                  // Add ellipsis if there's a gap
                  const showEllipsisBefore = i > 0 && p - arr[i - 1] > 1
                  return (
                    <span key={p} className="flex items-center gap-2">
                      {showEllipsisBefore && (
                        <span className="text-muted-foreground px-1">...</span>
                      )}
                      <Button
                        variant={p === page ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => goToPage(p)}
                        className="min-w-[2.5rem]"
                      >
                        {p}
                      </Button>
                    </span>
                  )
                })}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => goToPage(page + 1)}
              disabled={page >= pagination.total_pages}
            >
              Next
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
