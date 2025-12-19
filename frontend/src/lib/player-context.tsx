import { createContext, useContext, useState, useCallback, useRef, useEffect, type ReactNode } from 'react'

export interface Track {
  id: number
  title: string
  artist: string
  songSlug: string
  youtubeId: string
  thumbnailUrl: string
}

interface PlayerState {
  currentTrack: Track | null
  queue: Track[]
  isPlaying: boolean
  progress: number
  duration: number
  isReady: boolean
}

interface PlayerContextType extends PlayerState {
  play: (track: Track) => void
  pause: () => void
  resume: () => void
  toggle: () => void
  next: () => void
  previous: () => void
  addToQueue: (track: Track) => void
  removeFromQueue: (index: number) => void
  clearQueue: () => void
  seek: (percent: number) => void
  playerRef: React.MutableRefObject<YT.Player | null>
  setProgress: (progress: number) => void
  setDuration: (duration: number) => void
  setIsPlaying: (playing: boolean) => void
  setIsReady: (ready: boolean) => void
}

const PlayerContext = createContext<PlayerContextType | null>(null)

export function PlayerProvider({ children }: { children: ReactNode }) {
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null)
  const [queue, setQueue] = useState<Track[]>([])
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(0)
  const [isReady, setIsReady] = useState(false)
  const playerRef = useRef<YT.Player | null>(null)
  const historyRef = useRef<Track[]>([])

  const play = useCallback((track: Track) => {
    if (currentTrack) {
      historyRef.current.push(currentTrack)
    }
    setCurrentTrack(track)
    setIsPlaying(true)
    setProgress(0)
    setDuration(0)
    setIsReady(false)
  }, [currentTrack])

  const pause = useCallback(() => {
    playerRef.current?.pauseVideo()
    setIsPlaying(false)
  }, [])

  const resume = useCallback(() => {
    playerRef.current?.playVideo()
    setIsPlaying(true)
  }, [])

  const toggle = useCallback(() => {
    if (isPlaying) {
      pause()
    } else {
      resume()
    }
  }, [isPlaying, pause, resume])

  const next = useCallback(() => {
    if (queue.length > 0) {
      const [nextTrack, ...rest] = queue
      if (currentTrack) {
        historyRef.current.push(currentTrack)
      }
      setQueue(rest)
      setCurrentTrack(nextTrack)
      setIsPlaying(true)
      setProgress(0)
      setIsReady(false)
    }
  }, [queue, currentTrack])

  const previous = useCallback(() => {
    if (historyRef.current.length > 0) {
      const prevTrack = historyRef.current.pop()!
      if (currentTrack) {
        setQueue([currentTrack, ...queue])
      }
      setCurrentTrack(prevTrack)
      setIsPlaying(true)
      setProgress(0)
      setIsReady(false)
    }
  }, [currentTrack, queue])

  const addToQueue = useCallback((track: Track) => {
    setQueue(q => [...q, track])
  }, [])

  const removeFromQueue = useCallback((index: number) => {
    setQueue(q => q.filter((_, i) => i !== index))
  }, [])

  const clearQueue = useCallback(() => {
    setQueue([])
  }, [])

  const seek = useCallback((percent: number) => {
    if (playerRef.current && duration > 0) {
      const seekTo = (percent / 100) * duration
      playerRef.current.seekTo(seekTo, true)
      setProgress(percent)
    }
  }, [duration])

  return (
    <PlayerContext.Provider value={{
      currentTrack,
      queue,
      isPlaying,
      progress,
      duration,
      isReady,
      play,
      pause,
      resume,
      toggle,
      next,
      previous,
      addToQueue,
      removeFromQueue,
      clearQueue,
      seek,
      playerRef,
      setProgress,
      setDuration,
      setIsPlaying,
      setIsReady,
    }}>
      {children}
    </PlayerContext.Provider>
  )
}

export function usePlayer() {
  const context = useContext(PlayerContext)
  if (!context) {
    throw new Error('usePlayer must be used within a PlayerProvider')
  }
  return context
}

// Helper to extract YouTube video ID from URL
export function extractYouTubeId(url: string): string | null {
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\s]+)/)
  return match ? match[1] : null
}

// Helper to create a Track from cover data
export function createTrack(cover: {
  id: number
  artist: string
  youtube_url: string
}, song: {
  title: string
  slug: string
}): Track | null {
  const youtubeId = extractYouTubeId(cover.youtube_url)
  if (!youtubeId) return null

  return {
    id: cover.id,
    title: song.title,
    artist: cover.artist,
    songSlug: song.slug,
    youtubeId,
    thumbnailUrl: `https://img.youtube.com/vi/${youtubeId}/mqdefault.jpg`,
  }
}

// YouTube IFrame API types
declare global {
  interface Window {
    YT: typeof YT
    onYouTubeIframeAPIReady: () => void
  }
}
