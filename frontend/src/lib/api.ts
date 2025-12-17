function getApiUrl() {
  // Server-side (SSR): use internal Docker network or localhost
  if (typeof window === 'undefined') {
    return process.env.API_URL_INTERNAL || 'http://localhost:7001'
  }
  // Client-side: use public URL
  return import.meta.env.VITE_API_URL || 'http://localhost:7001'
}

const API_URL = getApiUrl()

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  body?: unknown
  token?: string | null
}

class ApiError extends Error {
  constructor(
    public status: number,
    public data: unknown
  ) {
    super(`API Error: ${status}`)
    this.name = 'ApiError'
  }
}

async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, token } = options

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  })

  const data = await response.json()

  if (!response.ok) {
    throw new ApiError(response.status, data)
  }

  return data
}

// Auth API
export const auth = {
  register: (data: { email: string; username: string; password: string }) =>
    request<{ token: string; user: User }>('/auth/register', { method: 'POST', body: data }),

  login: (data: { email: string; password: string }) =>
    request<{ token: string; user: User }>('/auth/login', { method: 'POST', body: data }),

  google: (data: { credential: string }) =>
    request<{ token: string; user: User }>('/auth/google', { method: 'POST', body: data }),

  me: (token: string) =>
    request<{ user: User }>('/auth/me', { token }),
}

// Songs API
export const songs = {
  list: (params?: { page?: number; per_page?: number; by_artist?: string; search?: string }) => {
    const searchParams = new URLSearchParams()
    if (params?.page) searchParams.set('page', params.page.toString())
    if (params?.per_page) searchParams.set('per_page', params.per_page.toString())
    if (params?.by_artist) searchParams.set('by_artist', params.by_artist)
    if (params?.search) searchParams.set('search', params.search)
    const query = searchParams.toString()
    return request<{ songs: Song[]; pagination: Pagination }>(`/songs${query ? `?${query}` : ''}`)
  },

  top: (limit?: number) =>
    request<{ songs: Song[] }>(`/songs/top${limit ? `?limit=${limit}` : ''}`),

  get: (slug: string, token?: string | null) =>
    request<{ song: SongWithCovers }>(`/songs/${slug}`, { token: token || undefined }),
}

// Covers API
export const covers = {
  list: (songSlug: string, params?: { sorted_by?: 'score' | 'recent' }, token?: string | null) => {
    const searchParams = new URLSearchParams()
    if (params?.sorted_by) searchParams.set('sorted_by', params.sorted_by)
    const query = searchParams.toString()
    return request<{ covers: Cover[] }>(
      `/songs/${songSlug}/covers${query ? `?${query}` : ''}`,
      { token: token || undefined }
    )
  },

  top: (limit?: number) =>
    request<{ covers: CoverWithSong[] }>(`/covers/top${limit ? `?limit=${limit}` : ''}`),
}

// Votes API
export const votes = {
  vote: (coverId: number, value: 1 | -1, token: string) =>
    request<{ message: string; cover: Cover }>(`/covers/${coverId}/vote`, {
      method: 'POST',
      body: { value },
      token,
    }),

  remove: (coverId: number, token: string) =>
    request<{ message: string; cover: Cover }>(`/covers/${coverId}/vote`, {
      method: 'DELETE',
      token,
    }),
}

// Types
export type User = {
  id: number
  email?: string
  username: string
  avatar_url: string | null
  created_at: string
}

export type Song = {
  id: number
  title: string
  original_artist: string
  year: number | null
  youtube_url: string | null
  description: string | null
  slug: string
  covers_count: number
  created_at: string
}

export type SongWithCovers = Song & {
  covers: Cover[]
}

export type Cover = {
  id: number
  artist: string
  year: number | null
  youtube_url: string
  description: string | null
  votes_score: number
  votes_count: number
  user_vote: 1 | -1 | null
  submitted_by: User | null
  created_at: string
}

export type CoverWithSong = Cover & {
  song: {
    title: string
    slug: string
  }
}

export type Pagination = {
  current_page: number
  total_pages: number
  total_count: number
  per_page: number
}

export { ApiError }
