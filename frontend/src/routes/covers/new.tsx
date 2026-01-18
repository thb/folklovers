import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { ArrowLeft, Check, ChevronsUpDown, Music, Plus, Star } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { songs, covers, tags as tagsApi, ApiError, SongSearchResult, Tag } from '@/lib/api'
import { useAuth } from '@/lib/auth'
import { cn } from '@/lib/utils'
import { parseFieldErrors } from '@/lib/form-utils'

export const Route = createFileRoute('/covers/new')({
  component: NewCoverPage,
})

type FieldErrors = {
  song_title?: string
  original_artist?: string
  song_year?: string
  artist?: string
  year?: string
  youtube_url?: string
  description?: string
  base?: string
}

const FIELD_MATCHERS = {
  song_title: ['title', 'song'],
  original_artist: ['original artist', 'original_artist'],
  song_year: ['song year'],
  artist: ['artist'],
  year: ['year'],
  youtube_url: ['youtube', 'url'],
  description: ['description'],
  base: [],
}

function parseErrors(errors: string[]): FieldErrors {
  return parseFieldErrors<FieldErrors>(errors, FIELD_MATCHERS)
}

function NewCoverPage() {
  const navigate = useNavigate()
  const { token, isAuthenticated, isLoading, isAdmin } = useAuth()

  // Song selection state
  const [songSearch, setSongSearch] = useState('')
  const [songOptions, setSongOptions] = useState<SongSearchResult[]>([])
  const [selectedSong, setSelectedSong] = useState<SongSearchResult | null>(null)
  const [isNewSong, setIsNewSong] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const [popoverOpen, setPopoverOpen] = useState(false)

  // New song fields
  const [newSongTitle, setNewSongTitle] = useState('')
  const [originalArtist, setOriginalArtist] = useState('')
  const [songYear, setSongYear] = useState('')

  // Cover fields
  const [coverArtist, setCoverArtist] = useState('')
  const [coverYear, setCoverYear] = useState('')
  const [youtubeUrl, setYoutubeUrl] = useState('')
  const [description, setDescription] = useState('')
  const [isOriginal, setIsOriginal] = useState(false)
  const [selectedTagIds, setSelectedTagIds] = useState<number[]>([])
  const [availableTags, setAvailableTags] = useState<Tag[]>([])

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})

  // Load available tags
  useEffect(() => {
    tagsApi.list().then(({ tags }) => setAvailableTags(tags)).catch(console.error)
  }, [])

  // Debounced search
  useEffect(() => {
    if (songSearch.length < 2) {
      setSongOptions([])
      return
    }

    const timer = setTimeout(async () => {
      setIsSearching(true)
      try {
        const { songs: results } = await songs.search(songSearch)
        setSongOptions(results)
      } catch (e) {
        console.error(e)
        setSongOptions([])
      } finally {
        setIsSearching(false)
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [songSearch])

  const handleSelectSong = (song: SongSearchResult) => {
    setSelectedSong(song)
    setIsNewSong(false)
    setPopoverOpen(false)
    setSongSearch('')
  }

  const handleCreateNewSong = () => {
    setSelectedSong(null)
    setIsNewSong(true)
    setNewSongTitle(songSearch)
    setPopoverOpen(false)
    setSongSearch('')
  }

  const handleClearSong = () => {
    setSelectedSong(null)
    setIsNewSong(false)
    setNewSongTitle('')
    setOriginalArtist('')
    setSongYear('')
    setIsOriginal(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!token) return

    setIsSubmitting(true)
    setFieldErrors({})

    try {
      const payload = selectedSong
        ? {
            song_id: selectedSong.id,
            artist: coverArtist,
            year: coverYear ? parseInt(coverYear) : undefined,
            youtube_url: youtubeUrl,
            description: description || undefined,
            original: isOriginal || undefined,
            tag_ids: selectedTagIds.length > 0 ? selectedTagIds : undefined,
          }
        : {
            song_title: newSongTitle,
            original_artist: originalArtist,
            song_year: songYear ? parseInt(songYear) : undefined,
            artist: coverArtist,
            year: coverYear ? parseInt(coverYear) : undefined,
            youtube_url: youtubeUrl,
            description: description || undefined,
            original: isOriginal || undefined,
            tag_ids: selectedTagIds.length > 0 ? selectedTagIds : undefined,
          }

      const { song } = await covers.createWithSong(payload, token)
      navigate({ to: '/songs/$slug', params: { slug: song.slug } })
    } catch (err) {
      if (err instanceof ApiError) {
        const data = err.data as { errors?: string[]; error?: string }
        if (data.errors) {
          setFieldErrors(parseErrors(data.errors))
        } else if (data.error) {
          setFieldErrors({ base: data.error })
        } else {
          setFieldErrors({ base: 'Failed to add cover. Please try again.' })
        }
      } else {
        setFieldErrors({ base: 'Network error. Please check your connection.' })
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const hasErrors = Object.keys(fieldErrors).length > 0
  const hasSongSelected = selectedSong !== null || isNewSong
  // Show original checkbox: if admin (always), or if new song, or if existing song has no original
  const showOriginalCheckbox = isAdmin || isNewSong || (selectedSong && !selectedSong.has_original)

  if (isLoading) {
    return null
  }

  if (!isAuthenticated) {
    return (
      <div className="py-12 px-4">
        <div className="max-w-lg mx-auto text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Sign in required</h1>
          <p className="text-muted-foreground mb-6">
            You need to be signed in to add a cover.
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
            <CardTitle>Add a cover</CardTitle>
            <CardDescription>
              Share a folk song cover you love. Search for an existing song or add a new one.
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

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Song Selection Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <Music className="w-4 h-4" />
                  Song
                </div>

                {!hasSongSelected ? (
                  <div className="space-y-2">
                    <Label className={cn(fieldErrors.song_title && "text-destructive")}>
                      Search for a song *
                    </Label>
                    <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={popoverOpen}
                          className="w-full justify-between font-normal"
                        >
                          <span className="text-muted-foreground">Type to search...</span>
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                        <Command shouldFilter={false}>
                          <CommandInput
                            placeholder="Search songs..."
                            value={songSearch}
                            onValueChange={setSongSearch}
                          />
                          <CommandList>
                            {isSearching && (
                              <div className="py-6 text-center text-sm text-muted-foreground">
                                Searching...
                              </div>
                            )}
                            {!isSearching && songSearch.length >= 2 && songOptions.length === 0 && (
                              <CommandEmpty>No songs found.</CommandEmpty>
                            )}
                            {songOptions.length > 0 && (
                              <CommandGroup heading="Existing songs">
                                {songOptions.map((song) => (
                                  <CommandItem
                                    key={song.id}
                                    value={song.slug}
                                    onSelect={() => handleSelectSong(song)}
                                    className="cursor-pointer"
                                  >
                                    <Check className="mr-2 h-4 w-4 opacity-0" />
                                    <div>
                                      <div className="font-medium">{song.title}</div>
                                      <div className="text-sm text-muted-foreground">
                                        {song.original_artist}
                                      </div>
                                    </div>
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            )}
                            {songSearch.length >= 2 && (
                              <CommandGroup heading="Or create new">
                                <CommandItem
                                  onSelect={handleCreateNewSong}
                                  className="cursor-pointer"
                                >
                                  <Plus className="mr-2 h-4 w-4" />
                                  Create "{songSearch}"
                                </CommandItem>
                              </CommandGroup>
                            )}
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                    {fieldErrors.song_title && (
                      <p className="text-sm text-destructive">{fieldErrors.song_title}</p>
                    )}
                  </div>
                ) : selectedSong ? (
                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div>
                      <div className="font-medium">{selectedSong.title}</div>
                      <div className="text-sm text-muted-foreground">
                        {selectedSong.original_artist}
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleClearSong}
                    >
                      Change
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">New song</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={handleClearSong}
                      >
                        Cancel
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="song_title" className={cn(fieldErrors.song_title && "text-destructive")}>
                          Song title *
                        </Label>
                        <Input
                          id="song_title"
                          value={newSongTitle}
                          onChange={(e) => {
                            setNewSongTitle(e.target.value)
                            if (fieldErrors.song_title) setFieldErrors({ ...fieldErrors, song_title: undefined })
                          }}
                          placeholder="e.g. Blowin' in the Wind"
                          className={cn(fieldErrors.song_title && "border-destructive focus-visible:ring-destructive")}
                          required={isNewSong}
                        />
                        {fieldErrors.song_title && (
                          <p className="text-sm text-destructive">{fieldErrors.song_title}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="original_artist" className={cn(fieldErrors.original_artist && "text-destructive")}>
                          Original artist *
                        </Label>
                        <Input
                          id="original_artist"
                          value={originalArtist}
                          onChange={(e) => {
                            setOriginalArtist(e.target.value)
                            if (fieldErrors.original_artist) setFieldErrors({ ...fieldErrors, original_artist: undefined })
                          }}
                          placeholder="e.g. Bob Dylan"
                          className={cn(fieldErrors.original_artist && "border-destructive focus-visible:ring-destructive")}
                          required={isNewSong}
                        />
                        {fieldErrors.original_artist && (
                          <p className="text-sm text-destructive">{fieldErrors.original_artist}</p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="song_year" className={cn(fieldErrors.song_year && "text-destructive")}>
                        Year (optional)
                      </Label>
                      <Input
                        id="song_year"
                        type="number"
                        value={songYear}
                        onChange={(e) => {
                          setSongYear(e.target.value)
                          if (fieldErrors.song_year) setFieldErrors({ ...fieldErrors, song_year: undefined })
                        }}
                        placeholder="e.g. 1963"
                        min="1900"
                        max={new Date().getFullYear()}
                        className={cn("max-w-32", fieldErrors.song_year && "border-destructive focus-visible:ring-destructive")}
                      />
                      {fieldErrors.song_year && (
                        <p className="text-sm text-destructive">{fieldErrors.song_year}</p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Cover Section */}
              {hasSongSelected && (
                <div className="space-y-4 pt-4 border-t">
                  <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                    <Music className="w-4 h-4" />
                    Your cover
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="artist" className={cn(fieldErrors.artist && "text-destructive")}>
                        Cover artist *
                      </Label>
                      <Input
                        id="artist"
                        value={coverArtist}
                        onChange={(e) => {
                          setCoverArtist(e.target.value)
                          if (fieldErrors.artist) setFieldErrors({ ...fieldErrors, artist: undefined })
                        }}
                        placeholder="e.g. Stevie Wonder"
                        className={cn(fieldErrors.artist && "border-destructive focus-visible:ring-destructive")}
                        required
                      />
                      {fieldErrors.artist && (
                        <p className="text-sm text-destructive">{fieldErrors.artist}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="year" className={cn(fieldErrors.year && "text-destructive")}>
                        Year (optional)
                      </Label>
                      <Input
                        id="year"
                        type="number"
                        value={coverYear}
                        onChange={(e) => {
                          setCoverYear(e.target.value)
                          if (fieldErrors.year) setFieldErrors({ ...fieldErrors, year: undefined })
                        }}
                        placeholder="e.g. 1966"
                        min="1900"
                        max={new Date().getFullYear()}
                        className={cn(fieldErrors.year && "border-destructive focus-visible:ring-destructive")}
                      />
                      {fieldErrors.year && (
                        <p className="text-sm text-destructive">{fieldErrors.year}</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="youtube_url" className={cn(fieldErrors.youtube_url && "text-destructive")}>
                      YouTube URL *
                    </Label>
                    <Input
                      id="youtube_url"
                      type="url"
                      value={youtubeUrl}
                      onChange={(e) => {
                        setYoutubeUrl(e.target.value)
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

                  <div className="space-y-2">
                    <Label htmlFor="description" className={cn(fieldErrors.description && "text-destructive")}>
                      Description (optional)
                    </Label>
                    <Textarea
                      id="description"
                      value={description}
                      onChange={(e) => {
                        setDescription(e.target.value)
                        if (fieldErrors.description) setFieldErrors({ ...fieldErrors, description: undefined })
                      }}
                      placeholder="Why do you love this cover?"
                      rows={3}
                      className={cn(fieldErrors.description && "border-destructive focus-visible:ring-destructive")}
                    />
                    {fieldErrors.description && (
                      <p className="text-sm text-destructive">{fieldErrors.description}</p>
                    )}
                  </div>

                  {availableTags.length > 0 && (
                    <div className="space-y-2">
                      <Label>Tags (optional)</Label>
                      <div className="flex flex-wrap gap-2">
                        {availableTags.map((tag) => {
                          const isSelected = selectedTagIds.includes(tag.id)
                          return (
                            <button
                              key={tag.id}
                              type="button"
                              onClick={() => {
                                setSelectedTagIds(prev =>
                                  isSelected
                                    ? prev.filter(id => id !== tag.id)
                                    : [...prev, tag.id]
                                )
                              }}
                              className={cn(
                                "px-3 py-1 text-sm rounded-full border transition-colors",
                                isSelected
                                  ? "bg-primary text-primary-foreground border-primary"
                                  : "bg-background text-muted-foreground border-border hover:border-primary hover:text-foreground"
                              )}
                            >
                              {tag.name}
                            </button>
                          )
                        })}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Select tags that describe this cover
                      </p>
                    </div>
                  )}

                  {showOriginalCheckbox && (
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                      <Checkbox
                        id="original"
                        checked={isOriginal}
                        onCheckedChange={setIsOriginal}
                      />
                      <Label htmlFor="original" className="flex items-center gap-2 cursor-pointer font-normal">
                        <Star className="w-4 h-4 text-amber-500" />
                        This is the original recording
                      </Label>
                    </div>
                  )}
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4">
                <Link to="/songs">
                  <Button type="button" variant="outline">
                    Cancel
                  </Button>
                </Link>
                <Button type="submit" disabled={isSubmitting || !hasSongSelected}>
                  {isSubmitting ? 'Adding...' : 'Add cover'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
