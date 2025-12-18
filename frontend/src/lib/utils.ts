import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getYouTubeVideoId(url: string | null): string | null {
  if (!url) return null

  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\s?]+)/,
    /^([a-zA-Z0-9_-]{11})$/
  ]

  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match) return match[1]
  }

  return null
}

export function getYouTubeThumbnail(
  url: string | null,
  size: 'default' | 'medium' | 'high' | 'maxres' = 'medium'
): string | null {
  const videoId = getYouTubeVideoId(url)
  if (!videoId) return null

  const sizeMap = {
    default: 'default',
    medium: 'mqdefault',
    high: 'hqdefault',
    maxres: 'maxresdefault'
  }

  return `https://i.ytimg.com/vi/${videoId}/${sizeMap[size]}.jpg`
}
