import { useEffect, useRef, useCallback } from 'react'
import { Link } from '@tanstack/react-router'
import { Play, Pause, SkipBack, SkipForward, X, ListMusic } from 'lucide-react'
import { usePlayer } from '@/lib/player-context'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

// Load YouTube IFrame API
let apiLoaded = false
let apiReady = false
const apiReadyCallbacks: (() => void)[] = []

function loadYouTubeAPI(): Promise<void> {
  return new Promise((resolve) => {
    if (apiReady) {
      resolve()
      return
    }

    apiReadyCallbacks.push(resolve)

    if (apiLoaded) return

    apiLoaded = true
    const tag = document.createElement('script')
    tag.src = 'https://www.youtube.com/iframe_api'
    document.head.appendChild(tag)

    window.onYouTubeIframeAPIReady = () => {
      apiReady = true
      apiReadyCallbacks.forEach(cb => cb())
      apiReadyCallbacks.length = 0
    }
  })
}

export function Player() {
  const {
    currentTrack,
    queue,
    isPlaying,
    progress,
    duration,
    isReady,
    toggle,
    next,
    previous,
    seek,
    playerRef,
    setProgress,
    setDuration,
    setIsPlaying,
    setIsReady,
  } = usePlayer()

  const containerRef = useRef<HTMLDivElement>(null)
  const progressInterval = useRef<number | null>(null)

  // Initialize YouTube player when track changes
  useEffect(() => {
    if (!currentTrack) return

    let isMounted = true

    const initPlayer = async () => {
      await loadYouTubeAPI()

      if (!isMounted) return

      // Destroy existing player
      if (playerRef.current) {
        playerRef.current.destroy()
        playerRef.current = null
      }

      // Create new player
      playerRef.current = new window.YT.Player('youtube-player', {
        videoId: currentTrack.youtubeId,
        playerVars: {
          autoplay: 1,
          controls: 0,
          modestbranding: 1,
          rel: 0,
          playsinline: 1,
        },
        events: {
          onReady: () => {
            if (!isMounted) return
            setIsReady(true)
            setDuration(playerRef.current?.getDuration() || 0)
          },
          onStateChange: (event) => {
            if (!isMounted) return
            if (event.data === window.YT.PlayerState.PLAYING) {
              setIsPlaying(true)
            } else if (event.data === window.YT.PlayerState.PAUSED) {
              setIsPlaying(false)
            } else if (event.data === window.YT.PlayerState.ENDED) {
              // Auto-play next in queue
              if (queue.length > 0) {
                next()
              } else {
                setIsPlaying(false)
              }
            }
          },
          onError: (event) => {
            console.error('YouTube player error:', event.data)
          },
        },
      })
    }

    initPlayer()

    return () => {
      isMounted = false
    }
  }, [currentTrack?.youtubeId])

  // Progress tracking
  useEffect(() => {
    if (isPlaying && isReady) {
      progressInterval.current = window.setInterval(() => {
        if (playerRef.current) {
          const currentTime = playerRef.current.getCurrentTime()
          const totalDuration = playerRef.current.getDuration()
          if (totalDuration > 0) {
            setProgress((currentTime / totalDuration) * 100)
            setDuration(totalDuration)
          }
        }
      }, 500)
    } else {
      if (progressInterval.current) {
        clearInterval(progressInterval.current)
        progressInterval.current = null
      }
    }

    return () => {
      if (progressInterval.current) {
        clearInterval(progressInterval.current)
      }
    }
  }, [isPlaying, isReady])

  const handleProgressClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const percent = ((e.clientX - rect.left) / rect.width) * 100
    seek(Math.max(0, Math.min(100, percent)))
  }, [seek])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const currentTime = duration > 0 ? (progress / 100) * duration : 0

  if (!currentTrack) return null

  return (
    <div
      ref={containerRef}
      className="fixed bottom-0 left-0 right-0 bg-card border-t border-border shadow-lg z-50"
    >
      {/* Progress bar (clickable) */}
      <div
        className="h-1 bg-muted cursor-pointer group"
        onClick={handleProgressClick}
      >
        <div
          className="h-full bg-primary transition-all duration-150 group-hover:h-1.5"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="max-w-6xl mx-auto px-4 py-3">
        <div className="flex items-center gap-4">
          {/* Thumbnail & Info */}
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <img
              src={currentTrack.thumbnailUrl}
              alt={currentTrack.title}
              className="w-12 h-12 rounded object-cover"
            />
            <div className="min-w-0">
              <Link
                to="/songs/$slug"
                params={{ slug: currentTrack.songSlug }}
                className="font-medium text-sm truncate block hover:text-primary transition-colors"
              >
                {currentTrack.title}
              </Link>
              <p className="text-xs text-muted-foreground truncate">
                {currentTrack.artist}
              </p>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={previous}
            >
              <SkipBack className="h-4 w-4" />
            </Button>

            <Button
              variant="default"
              size="icon"
              className="h-10 w-10 rounded-full"
              onClick={toggle}
            >
              {isPlaying ? (
                <Pause className="h-5 w-5" />
              ) : (
                <Play className="h-5 w-5 ml-0.5" />
              )}
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={next}
              disabled={queue.length === 0}
            >
              <SkipForward className="h-4 w-4" />
            </Button>
          </div>

          {/* Time & Queue indicator */}
          <div className="hidden sm:flex items-center gap-4 flex-1 justify-end">
            <span className="text-xs text-muted-foreground tabular-nums">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>

            {queue.length > 0 && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <ListMusic className="h-3 w-3" />
                <span>{queue.length}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Hidden YouTube player */}
      <div className="absolute -top-[9999px] -left-[9999px]">
        <div id="youtube-player" />
      </div>
    </div>
  )
}
