import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { Search, Music, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from '@/components/ui/command'
import { songs } from '@/lib/api'
import type { SongSearchResult } from '@/lib/api'

export function HeaderSearch() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SongSearchResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()

  // Keyboard shortcut: Cmd+K or Ctrl+K
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }

    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [])

  // Search songs with debounce
  const searchSongs = useCallback(async (searchQuery: string) => {
    if (searchQuery.length < 2) {
      setResults([])
      return
    }

    setIsLoading(true)
    try {
      const data = await songs.search(searchQuery)
      setResults(data.songs)
    } catch (error) {
      console.error('Search failed:', error)
      setResults([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => {
      searchSongs(query)
    }, 200)

    return () => clearTimeout(timer)
  }, [query, searchSongs])

  const handleSelect = (slug: string) => {
    setOpen(false)
    setQuery('')
    setResults([])
    navigate({ to: '/songs/$slug', params: { slug } })
  }

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen)
    if (!newOpen) {
      setQuery('')
      setResults([])
    }
  }

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className="hidden md:flex items-center gap-2 text-muted-foreground hover:text-foreground w-64 justify-start"
        onClick={() => setOpen(true)}
      >
        <Search className="w-4 h-4" />
        <span className="flex-1 text-left">Search songs...</span>
        <kbd className="pointer-events-none h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 hidden sm:inline-flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      </Button>

      <CommandDialog
        open={open}
        onOpenChange={handleOpenChange}
        title="Search songs"
        description="Search for songs by title or artist"
      >
        <CommandInput
          placeholder="Search songs by title or artist..."
          value={query}
          onValueChange={setQuery}
        />
        <CommandList>
          {isLoading && (
            <div className="flex items-center justify-center py-6">
              <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
            </div>
          )}

          {!isLoading && query.length >= 2 && results.length === 0 && (
            <CommandEmpty>No songs found for "{query}"</CommandEmpty>
          )}

          {!isLoading && query.length < 2 && (
            <div className="py-6 text-center text-sm text-muted-foreground">
              Type at least 2 characters to search...
            </div>
          )}

          {!isLoading && results.length > 0 && (
            <CommandGroup heading="Songs">
              {results.map((song) => (
                <CommandItem
                  key={song.id}
                  value={`${song.title} ${song.original_artist}`}
                  onSelect={() => handleSelect(song.slug)}
                  className="cursor-pointer"
                >
                  <Music className="w-4 h-4 text-muted-foreground" />
                  <div className="flex flex-col">
                    <span className="font-medium">{song.title}</span>
                    <span className="text-xs text-muted-foreground">
                      by {song.original_artist}
                    </span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          )}
        </CommandList>
      </CommandDialog>
    </>
  )
}
