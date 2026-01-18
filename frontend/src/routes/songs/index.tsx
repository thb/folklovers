import { createFileRoute, useNavigate, Link } from '@tanstack/react-router'
import { Search, Plus, ArrowUpDown, Loader2 } from 'lucide-react'
import { useState, useEffect, useRef, useCallback } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { SongCard } from '@/components/songs/SongCard'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { songs } from '@/lib/api'
import type { Song, Pagination } from '@/lib/api'
import { z } from 'zod'

const sortOptions = [
  { value: 'recent', label: 'Recently added' },
  { value: 'oldest', label: 'Oldest added' },
  { value: 'title_asc', label: 'Title A-Z' },
  { value: 'title_desc', label: 'Title Z-A' },
  { value: 'year_desc', label: 'Year (newest)' },
  { value: 'year_asc', label: 'Year (oldest)' },
] as const

type SortOption = typeof sortOptions[number]['value']

const songsSearchSchema = z.object({
  search: z.string().optional(),
  sort: z.enum(['recent', 'oldest', 'title_asc', 'title_desc', 'year_asc', 'year_desc']).optional(),
})

type SongsSearch = z.infer<typeof songsSearchSchema>

export const Route = createFileRoute('/songs/')({
  component: SongsPage,
  validateSearch: songsSearchSchema,
  loaderDeps: ({ search }) => ({ search: search.search, sort: search.sort }),
  loader: async ({ deps }) => {
    const data = await songs.list({
      per_page: 12,
      page: 1,
      search: deps.search,
      sorted_by: deps.sort,
    })
    return data
  },
})

function SongsPage() {
  const initialData = Route.useLoaderData()
  const { search, sort } = Route.useSearch()
  const navigate = useNavigate({ from: Route.fullPath })

  // State for infinite scroll
  const [allSongs, setAllSongs] = useState<Song[]>(initialData.songs)
  const [pagination, setPagination] = useState<Pagination>(initialData.pagination)
  const [isLoading, setIsLoading] = useState(false)
  const [searchInput, setSearchInput] = useState(search || '')

  // Reset when search/sort changes (new loader data)
  useEffect(() => {
    setAllSongs(initialData.songs)
    setPagination(initialData.pagination)
  }, [initialData])

  // Intersection observer for infinite scroll
  const sentinelRef = useRef<HTMLDivElement>(null)
  const hasMore = pagination.current_page < pagination.total_pages

  const loadMore = useCallback(async () => {
    if (isLoading || !hasMore) return

    setIsLoading(true)
    try {
      const data = await songs.list({
        per_page: 12,
        page: pagination.current_page + 1,
        search: search,
        sorted_by: sort,
      })
      setAllSongs(prev => [...prev, ...data.songs])
      setPagination(data.pagination)
    } catch (error) {
      console.error('Failed to load more songs:', error)
    } finally {
      setIsLoading(false)
    }
  }, [isLoading, hasMore, pagination.current_page, search, sort])

  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoading) {
          loadMore()
        }
      },
      { rootMargin: '200px' }
    )

    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [hasMore, isLoading, loadMore])

  const handleSortChange = (value: SortOption) => {
    navigate({
      search: (prev: SongsSearch) => ({
        ...prev,
        sort: value === 'recent' ? undefined : value,
      }),
    })
  }

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
          }),
        })
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [searchInput, search, navigate])

  return (
    <div className="py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
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
          <Link to="/songs/new">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add a song
            </Button>
          </Link>
        </div>

        {/* Search and Sort */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search for a song or artist..."
              className="pl-10"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
          </div>
          <Select value={sort || 'recent'} onValueChange={handleSortChange}>
            <SelectTrigger className="w-[180px]">
              <ArrowUpDown className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              {sortOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Songs Grid */}
        {allSongs.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {allSongs.map((song: Song) => (
                <SongCard key={song.id} song={song} />
              ))}
            </div>

            {/* Sentinel for infinite scroll */}
            <div ref={sentinelRef} className="h-10 mt-8 flex items-center justify-center">
              {isLoading && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Loading more songs...</span>
                </div>
              )}
              {!hasMore && allSongs.length > 12 && (
                <p className="text-sm text-muted-foreground">
                  You've reached the end! {pagination.total_count} songs total.
                </p>
              )}
            </div>
          </>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            No songs found for "{search}"
          </div>
        )}
      </div>
    </div>
  )
}
